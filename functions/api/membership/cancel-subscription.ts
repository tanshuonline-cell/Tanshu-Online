interface Env {
  DB: any;
  CASHFREE_APP_ID: string;
  CASHFREE_SECRET_KEY: string;
  CASHFREE_ENVIRONMENT: string;
  MEMBERSHIP_SESSION_SECRET: string;
  APP_BASE_URL: string;
}
const HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: HEADERS });

async function getCustomer(request: Request, env: Env) {
  const raw = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith('tanshu_membership_session='));
  if (!raw) return null;
  const token = raw.slice(raw.indexOf('=') + 1);
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.MEMBERSHIP_SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(parts[0])));
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  const expected = btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  if (expected.length !== parts[1].length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ parts[1].charCodeAt(i);
  if (diff !== 0) return null;
  try {
    const normalized = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
    const session = JSON.parse(new TextDecoder().decode(Uint8Array.from(decoded, c => c.charCodeAt(0))));
    if (!session.sub || !session.exp || session.exp <= Math.floor(Date.now() / 1000)) return null;
    return await env.DB.prepare("SELECT id FROM membership_customers WHERE id=? AND account_status='active' AND email_verified=1").bind(session.sub).first();
  } catch { return null; }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    if (!env.DB || !env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY || !env.MEMBERSHIP_SESSION_SECRET ||
        String(env.CASHFREE_ENVIRONMENT).toUpperCase() !== 'SANDBOX') {
      return json({ success: false, error: 'Preview cancellation service is unavailable.' }, 503);
    }
    const customer = await getCustomer(request, env);
    if (!customer) return json({ success: false, error: 'Please sign in first.' }, 401);

    const local = await env.DB.prepare(
      "SELECT id,gateway_subscription_id,status,current_period_end,cancel_at_period_end FROM membership_subscriptions WHERE customer_id=? AND gateway='cashfree' AND status IN ('pending','active','payment_failed','suspended') ORDER BY created_at DESC LIMIT 1"
    ).bind(customer.id).first();
    if (!local) return json({ success: false, error: 'No cancellable membership was found.' }, 404);
    if (local.cancel_at_period_end) return json({ success: true, alreadyScheduled: true, message: 'Cancellation is already scheduled.' });

    const subscriptionId = String(local.gateway_subscription_id || '');
    if (!/^[A-Za-z0-9_.-]{1,250}$/.test(subscriptionId)) {
      return json({ success: false, error: 'The subscription reference is invalid.' }, 409);
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-version': '2026-01-01',
      'x-client-id': env.CASHFREE_APP_ID,
      'x-client-secret': env.CASHFREE_SECRET_KEY,
      'x-idempotency-key': crypto.randomUUID(),
    };
    const manageResponse = await fetch('https://sandbox.cashfree.com/pg/subscriptions/' + encodeURIComponent(subscriptionId) + '/manage', {
      method: 'POST',
      headers,
      body: JSON.stringify({ subscription_id: subscriptionId, action: 'CANCEL' }),
    });
    const manageData: any = await manageResponse.json().catch(() => ({}));
    if (!manageResponse.ok) {
      return json({ success: false, error: manageData.message || 'Cashfree could not confirm the cancellation request.' }, 502);
    }

    const verifyResponse = await fetch('https://sandbox.cashfree.com/pg/subscriptions/' + encodeURIComponent(subscriptionId), {
      headers: {
        'Accept': 'application/json',
        'x-api-version': '2026-01-01',
        'x-client-id': env.CASHFREE_APP_ID,
        'x-client-secret': env.CASHFREE_SECRET_KEY,
      },
    });
    const verified: any = await verifyResponse.json().catch(() => ({}));
    if (!verifyResponse.ok) return json({ success: false, error: 'Cancellation was requested but Cashfree status could not be verified. Please refresh status before retrying.' }, 502);

    const remoteStatus = String(verified.subscription_status || '').toUpperCase();
    if (!['CANCELLED', 'CUSTOMER_CANCELLED'].includes(remoteStatus)) {
      return json({ success: false, error: 'Cashfree has not yet confirmed cancellation. Current status: ' + (remoteStatus || 'UNKNOWN') }, 409);
    }

    const periodEnd = local.current_period_end ? new Date(local.current_period_end) : null;
    const keepPaidAccess = local.status === 'active' && periodEnd && !Number.isNaN(periodEnd.getTime()) && periodEnd.getTime() > Date.now();
    if (keepPaidAccess) {
      await env.DB.prepare(
        "UPDATE membership_subscriptions SET cancel_at_period_end=1,cancelled_at=COALESCE(cancelled_at,CURRENT_TIMESTAMP),updated_at=CURRENT_TIMESTAMP WHERE id=? AND customer_id=?"
      ).bind(local.id, customer.id).run();
      return json({ success: true, cancellationScheduled: true, accessUntil: periodEnd!.toISOString(), message: 'Auto-renewal is cancelled. Membership remains available until the already-paid period ends.' });
    }

    await env.DB.prepare(
      "UPDATE membership_subscriptions SET status='cancelled',cancel_at_period_end=1,cancelled_at=COALESCE(cancelled_at,CURRENT_TIMESTAMP),updated_at=CURRENT_TIMESTAMP WHERE id=? AND customer_id=?"
    ).bind(local.id, customer.id).run();
    return json({ success: true, cancellationScheduled: true, accessUntil: null, message: 'Subscription cancelled. No future recurring charges should be initiated.' });
  } catch (error) {
    console.error('Preview membership cancellation failed:', error);
    return json({ success: false, error: 'Cancellation could not be verified. Please check membership status before retrying.' }, 503);
  }
}
