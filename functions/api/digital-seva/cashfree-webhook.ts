import { cashfreeApiBase } from './_cashfree';
// Cloudflare Pages Function: POST /api/digital-seva/cashfree-webhook
// Public Cashfree callback. Verifies the signed raw payload, fetches the link from Cashfree,
// and updates only the matching, current PENDING payment for the exact INR amount.
interface Env { DIGITAL_SEVA_DB?: any; CASHFREE_APP_ID?: string; CASHFREE_SECRET_KEY?: string; CASHFREE_ENVIRONMENT?: string; }
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function toPaise(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : -1;
}
export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!env.DIGITAL_SEVA_DB || !env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) return json({ success: false }, 503);
  const signature = request.headers.get('x-webhook-signature') || '';
  const timestamp = request.headers.get('x-webhook-timestamp') || '';
  if (!signature || !timestamp || timestamp.length > 40) return json({ success: false, error: 'Missing webhook signature.' }, 400);
  const rawBody = await request.text();
  if (rawBody.length > 65536) return json({ success: false }, 413);
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.CASHFREE_SECRET_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(timestamp + rawBody));
    const expected = toBase64(new Uint8Array(signed));
    if (!constantTimeEqual(signature, expected)) return json({ success: false, error: 'Invalid webhook signature.' }, 401);
    const event = JSON.parse(rawBody) as any;
    const linkId = String(event?.data?.link_id || event?.data?.link?.link_id || event?.data?.payment_link?.link_id || '');
    if (!linkId || linkId.length > 100) return json({ success: true, ignored: true });

    const payment = await env.DIGITAL_SEVA_DB.prepare(
      'SELECT id, amount, status FROM digital_seva_payments WHERE cashfree_link_id = ?'
    ).bind(linkId).first();
    if (!payment) return json({ success: true, ignored: true });
    if (payment.status === 'PAID') return json({ success: true, duplicate: true });
    if (payment.status !== 'PENDING') {
      console.error('Cashfree payment event received for a non-current payment link:', linkId, payment.status);
      return json({ success: true, ignored: true });
    }

    const apiBase = cashfreeApiBase(env);
    const verifyResponse = await fetch(`${apiBase}/links/${encodeURIComponent(linkId)}`, {
      headers: { 'x-client-id': env.CASHFREE_APP_ID, 'x-client-secret': env.CASHFREE_SECRET_KEY, 'x-api-version': '2022-09-01' }
    });
    const verified = await verifyResponse.json().catch(() => ({})) as any;
    if (!verifyResponse.ok) return json({ success: false, error: 'Could not verify the payment link with Cashfree.' }, 502);
    if (String(verified.link_id || '') !== linkId) return json({ success: false, error: 'Cashfree returned a different payment link.' }, 502);

    const linkStatus = String(verified.link_status || '').toUpperCase();
    const paidAmount = Number(verified.link_amount_paid || 0);
    const expectedPaise = toPaise(payment.amount);
    const linkPaise = toPaise(verified.link_amount);
    const paidPaise = toPaise(paidAmount);
    const currency = String(verified.link_currency || '').toUpperCase();

    if (linkStatus === 'PAID') {
      if (currency !== 'INR' || expectedPaise <= 0 || linkPaise !== expectedPaise || paidPaise !== expectedPaise) {
        console.error('Cashfree payment amount/currency mismatch; payment was not marked PAID:', {
          linkId, currency, expectedPaise, linkPaise, paidPaise
        });
        return json({ success: true, ignored: true, reason: 'amount_or_currency_mismatch' });
      }
      await env.DIGITAL_SEVA_DB.prepare(
        `UPDATE digital_seva_payments
         SET status = 'PAID', cashfree_link_status = ?, cashfree_link_paid_amount = ?,
             paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND status = 'PENDING'`
      ).bind(linkStatus, paidAmount, payment.id).run();
      return json({ success: true });
    }

    if (['EXPIRED', 'CANCELLED'].includes(linkStatus)) {
      await env.DIGITAL_SEVA_DB.prepare(
        `UPDATE digital_seva_payments
         SET status = 'CANCELLED', cashfree_link_status = ?, cashfree_link_paid_amount = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND status = 'PENDING'`
      ).bind(linkStatus, paidAmount, payment.id).run();
    } else {
      await env.DIGITAL_SEVA_DB.prepare(
        'UPDATE digital_seva_payments SET cashfree_link_status = ?, cashfree_link_paid_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = ?'
      ).bind(linkStatus, paidAmount, payment.id, 'PENDING').run();
    }
    return json({ success: true });
  } catch (error) {
    console.error('Cashfree webhook processing failed:', error);
    return json({ success: false, error: 'Webhook processing failed.' }, 500);
  }
}
