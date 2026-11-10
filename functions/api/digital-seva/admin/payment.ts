import { cashfreeApiBase } from '../_cashfree';
// Cloudflare Pages Function: POST /api/digital-seva/admin/payment
// Admin-only creation of one-time Cashfree Payment Links for manually priced requests.
interface Env {
  DIGITAL_SEVA_DB?: any;
  ADMIN_SECRET_TOKEN?: string;
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_ENVIRONMENT?: string;
}
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const TERMS_POLICY_VERSION = 'terms-2026-11-07-v1';
const REFUND_POLICY_VERSION = 'refund-2026-11-07-v2';
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers }); }
async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
async function adminUser(request: Request, env: Env): Promise<string | null> {
  const secret = env.ADMIN_SECRET_TOKEN;
  if (!secret || secret.includes('YOUR_')) return null;
  const match = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)tanshu_admin_session=([^;]+)/);
  const token = match?.[1];
  if (!token || token.length > 4096) return null;
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature || !constantTimeEqual(await hmac(payload, secret), signature)) return null;
    const decoded = JSON.parse(atob(payload));
    if (decoded.role !== 'superadmin' || !decoded.exp || decoded.exp < Date.now()) return null;
    return String(decoded.u || 'superadmin');
  } catch { return null; }
}
function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}
async function cancelCashfreeLink(linkId: string, appId: string, secret: string, env: Env): Promise<boolean> {
  try {
    const response = await fetch(`${cashfreeApiBase(env)}/links/${encodeURIComponent(linkId)}/cancel`, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secret,
        'x-api-version': '2022-09-01',
        'x-request-id': crypto.randomUUID()
      }
    });
    if (response.ok) return true;
    // A previous retry may already have cancelled this link. Confirm the remote state
    // rather than treating every non-2xx cancellation response as an active link.
    const statusResponse = await fetch(`${cashfreeApiBase(env)}/links/${encodeURIComponent(linkId)}`, {
      headers: { 'x-client-id': appId, 'x-client-secret': secret, 'x-api-version': '2022-09-01' }
    });
    if (!statusResponse.ok) return false;
    const status = await statusResponse.json().catch(() => ({})) as any;
    return ['CANCELLED', 'EXPIRED'].includes(String(status.link_status || '').toUpperCase());
  } catch {
    return false;
  }
}
export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  const actor = await adminUser(request, env);
  if (!actor) return json({ success: false, error: 'Admin login required.' }, 401);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'The dedicated Digital Seva Preview database is not connected.' }, 503);
  const appId = env.CASHFREE_APP_ID;
  const secret = env.CASHFREE_SECRET_KEY;
  if (!appId || !secret) return json({ success: false, error: 'Cashfree credentials are not configured for this environment.' }, 503);
  const rawBody = await request.text();
  if (rawBody.length > 4096) return json({ success: false, error: 'The payment request is too large.' }, 413);
  const body = (() => { try { return JSON.parse(rawBody); } catch { return null; } })() as any;
  const bookingId = String(body?.bookingId || '');
  const amount = Number(body?.amount);
  if (!bookingId || bookingId.length > 64 || !Number.isFinite(amount) || amount < 1 || amount > 100000 || Math.round(amount * 100) !== amount * 100) {
    return json({ success: false, error: 'Enter a valid service fee between ₹1 and ₹1,00,000 (up to 2 decimal places).' }, 400);
  }

  let createdCashfreeLinkId = '';
  try {
    const booking = await env.DIGITAL_SEVA_DB.prepare(
      `SELECT id, booking_reference, service_id, customer_name, customer_phone, customer_email,
              consent_at, terms_accepted_at, terms_policy_version, refund_policy_accepted_at, refund_policy_version
       FROM digital_seva_bookings WHERE id = ?`
    ).bind(bookingId).first();
    if (!booking) return json({ success: false, error: 'Booking not found.' }, 404);
    if (!booking.consent_at || !booking.terms_accepted_at || booking.terms_policy_version !== TERMS_POLICY_VERSION ||
        !booking.refund_policy_accepted_at || booking.refund_policy_version !== REFUND_POLICY_VERSION) {
      return json({ success: false, error: 'A payment link cannot be created until the customer has recorded contact consent and accepted the current Terms & Conditions and Refund Policy.' }, 409);
    }
    const alreadyPaid = await env.DIGITAL_SEVA_DB.prepare(
      "SELECT id FROM digital_seva_payments WHERE booking_id = ? AND status = 'PAID' LIMIT 1"
    ).bind(bookingId).first();
    if (alreadyPaid) return json({ success: false, error: 'This booking is already marked PAID. Do not create another payment link.' }, 409);

    // Cancel every older pending Cashfree link first. A database-only SUPERSEDED flag
    // does not deactivate the hosted Cashfree URL.
    const olderLinks = await env.DIGITAL_SEVA_DB.prepare(
      "SELECT id, cashfree_link_id FROM digital_seva_payments WHERE booking_id = ? AND status = 'PENDING'"
    ).bind(bookingId).all();
    const cancelledRows: any[] = [];
    const failedLinkIds: string[] = [];
    for (const oldLink of olderLinks.results || []) {
      const oldLinkId = String(oldLink.cashfree_link_id);
      if (await cancelCashfreeLink(oldLinkId, appId, secret, env)) cancelledRows.push(oldLink);
      else failedLinkIds.push(oldLinkId);
    }
    if (cancelledRows.length) {
      await env.DIGITAL_SEVA_DB.batch(cancelledRows.map((oldLink) =>
        env.DIGITAL_SEVA_DB.prepare(
          "UPDATE digital_seva_payments SET status = 'CANCELLED', cashfree_link_status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'PENDING'"
        ).bind(oldLink.id)
      ));
    }
    if (failedLinkIds.length) {
      console.error('Could not cancel every older Cashfree payment link; no replacement was created:', failedLinkIds);
      return json({ success: false, error: 'An earlier payment link could not be safely cancelled. No new link was created. Refresh the booking and contact support if it remains pending.' }, 502);
    }

    const linkId = `ds_${String(booking.booking_reference).replace(/[^A-Za-z0-9_-]/g, '').toLowerCase()}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`.slice(0, 50);
    const origin = new URL(request.url).origin;
    const cashfreeResponse = await fetch(`${cashfreeApiBase(env)}/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secret,
        'x-api-version': '2022-09-01',
        'x-request-id': crypto.randomUUID()
      },
      body: JSON.stringify({
        link_id: linkId,
        link_amount: amount,
        link_currency: 'INR',
        link_purpose: `TANSHU ONLINE service fee - ${booking.booking_reference} - ${booking.service_id}`.slice(0, 240),
        link_partial_payments: false,
        link_auto_reminders: false,
        customer_details: {
          customer_name: String(booking.customer_name).slice(0, 100),
          customer_phone: String(booking.customer_phone),
          ...(booking.customer_email ? { customer_email: String(booking.customer_email).slice(0, 120) } : {})
        },
        link_notify: { send_sms: false, send_email: false },
        link_meta: {
          notify_url: `${origin}/api/digital-seva/cashfree-webhook`,
          return_url: `${origin}/digital-seva?payment=returned`
        },
        link_notes: { booking_reference: String(booking.booking_reference), booking_id: String(booking.id) }
      })
    });
    const result = await cashfreeResponse.json().catch(() => ({})) as any;
    if (!cashfreeResponse.ok || !result.link_url || !result.link_id) {
      console.error('Cashfree link creation failed:', cashfreeResponse.status, result);
      return json({ success: false, error: 'Cashfree could not create the payment link. Check the configured Cashfree credentials and API access.' }, 502);
    }
    createdCashfreeLinkId = String(result.link_id);
    const paymentId = crypto.randomUUID();
    await env.DIGITAL_SEVA_DB.prepare(
      `INSERT INTO digital_seva_payments
       (id, booking_id, amount, currency, cashfree_link_id, link_url, status, cashfree_link_status, created_by)
       VALUES (?, ?, ?, 'INR', ?, ?, 'PENDING', ?, ?)`
    ).bind(paymentId, bookingId, amount, createdCashfreeLinkId, String(result.link_url), String(result.link_status || 'ACTIVE'), actor).run();
    return json({ success: true, paymentId, amount, status: 'PENDING', linkId: createdCashfreeLinkId, linkUrl: result.link_url });
  } catch (error) {
    if (createdCashfreeLinkId) {
      try { await cancelCashfreeLink(createdCashfreeLinkId, appId, secret, env); }
      catch (cancelError) { console.error('Could not cancel an unrecorded Cashfree link:', cancelError); }
    }
    console.error('Digital Seva Cashfree link creation failed:', error);
    return json({ success: false, error: 'Could not create and save the payment link. Please retry after checking the Admin Panel.' }, 503);
  }
}
