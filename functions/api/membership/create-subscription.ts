interface Env {
  DB: any;
  CASHFREE_APP_ID: string;
  CASHFREE_SECRET_KEY: string;
  CASHFREE_ENVIRONMENT: string;
  MEMBERSHIP_SESSION_SECRET: string;
  APP_BASE_URL: string;
}

const HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: HEADERS });

function readCookie(request: Request, name: string): string | null {
  const part = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(name + '='));
  return part ? part.slice(name.length + 1) : null;
}

async function getCustomer(request: Request, env: Env) {
  const token = readCookie(request, 'tanshu_membership_session');
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.MEMBERSHIP_SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(parts[0])));
  let binary = '';
  sig.forEach(b => binary += String.fromCharCode(b));
  const expected = btoa(binary).replace(/=/g, '').replace(/\\+/g, '-').replace(/\\//g, '_');
  if (expected.length !== parts[1].length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ parts[1].charCodeAt(i);
  if (diff !== 0) return null;
  try {
    const normalized = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
    const session = JSON.parse(new TextDecoder().decode(Uint8Array.from(raw, c => c.charCodeAt(0))));
    if (!session.sub || !session.exp || session.exp <= Math.floor(Date.now() / 1000)) return null;
    return await env.DB.prepare("SELECT id,email,display_name FROM membership_customers WHERE id=? AND account_status='active' AND email_verified=1").bind(session.sub).first();
  } catch { return null; }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  let localId = '';
  try {
    if (!env.DB || !env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY || !env.MEMBERSHIP_SESSION_SECRET || !env.APP_BASE_URL ||
        String(env.CASHFREE_ENVIRONMENT).toUpperCase() !== 'SANDBOX') {
      return json({ success: false, error: 'Preview checkout is not configured.' }, 503);
    }
    const customer = await getCustomer(request, env);
    if (!customer) return json({ success: false, error: 'Please sign in with Google first.' }, 401);

    const body: any = await request.json().catch(() => ({}));
    const phone = String(body.phone || '').replace(/\\D/g, '');
    const consent = body.recurringConsent === true;
    if (!/^[6-9]\\d{9}$/.test(phone)) return json({ success: false, error: 'Enter a valid 10-digit Indian mobile number.' }, 400);
    if (!consent) return json({ success: false, error: 'Please confirm the monthly recurring payment consent.' }, 400);

    const base = new URL(env.APP_BASE_URL);
    if (base.protocol !== 'https:' || !base.hostname.endsWith('.tanshu-online.pages.dev') || base.hostname === 'tanshu-online.pages.dev' || base.pathname !== '/' || base.search || base.hash || base.origin !== env.APP_BASE_URL.replace(/\\/$/, '')) {
      return json({ success: false, error: 'Preview APP_BASE_URL must be an HTTPS origin.' }, 503);
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-version': '2025-01-01',
      'x-client-id': env.CASHFREE_APP_ID,
      'x-client-secret': env.CASHFREE_SECRET_KEY,
    };
    const planResponse = await fetch('https://sandbox.cashfree.com/pg/plans/TANSUBASIC49', { headers });
    const plan: any = await planResponse.json().catch(() => ({}));
    if (!planResponse.ok ||
        Number(plan.plan_recurring_amount) !== 49 ||
        String(plan.plan_currency).toUpperCase() !== 'INR' ||
        String(plan.plan_type).toUpperCase() !== 'PERIODIC' ||
        Number(plan.plan_intervals) !== 1 ||
        String(plan.plan_interval_type).toUpperCase() !== 'MONTH' ||
        String(plan.plan_status).toUpperCase() !== 'ACTIVE') {
      return json({ success: false, error: 'Cashfree Basic ₹49 monthly plan could not be verified as active.' }, 409);
    }

    const existing = await env.DB.prepare(
      "SELECT id,status FROM membership_subscriptions WHERE customer_id=? AND status IN ('pending','active','payment_failed','suspended') LIMIT 1"
    ).bind(customer.id).first();
    if (existing) return json({ success: false, error: 'An existing membership is already pending or active. Check its status before starting another.' }, 409);

    const subscriptionId = 'TANSHU_BASIC_' + Date.now() + '_' + crypto.randomUUID().slice(0, 8);
    localId = 'ms_' + crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO membership_subscriptions (id,customer_id,plan_id,gateway,gateway_subscription_id,status,created_at,updated_at) VALUES (?,?,'plan_basic','cashfree',?,'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)"
    ).bind(localId, customer.id, subscriptionId).run();
    await env.DB.prepare(
      "INSERT INTO membership_subscription_contacts (subscription_id,customer_phone) VALUES (?,?)"
    ).bind(localId, phone).run();

    const payload = {
      subscription_id: subscriptionId,
      customer_details: {
        customer_name: customer.display_name,
        customer_email: customer.email,
        customer_phone: phone,
      },
      plan_details: {
        plan_id: 'TANSUBASIC49',
        plan_name: String(plan.plan_name || 'TANSHU BASIC ₹49'),
        plan_type: 'PERIODIC',
      },
      subscription_meta: {
        return_url: base.origin + '/api/membership/return?subscription_id=' + encodeURIComponent(subscriptionId),
      },
      subscription_tags: {
        product: 'TANSHU_ONLINE_MEMBERSHIP',
        tier: 'BASIC',
        customer_id: customer.id,
      },
    };

    const response = await fetch('https://sandbox.cashfree.com/pg/subscriptions', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const result: any = await response.json().catch(() => ({}));
    if (!response.ok || !result.subscription_session_id) {
      await env.DB.prepare("UPDATE membership_subscriptions SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'").bind(localId).run();
      localId = '';
      return json({ success: false, error: result.message || result.error || 'Cashfree could not create the subscription checkout session.' }, 502);
    }

    return json({
      success: true,
      subscriptionId,
      subscriptionSessionId: result.subscription_session_id,
      environment: 'sandbox',
    });
  } catch (error) {
    console.error('Preview membership checkout session creation failed:', error);
    if (localId && env.DB) {
      // Keep uncertain upstream outcomes pending for reconciliation; never create a second mandate automatically.
      await env.DB.prepare("UPDATE membership_subscriptions SET updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='pending'").bind(localId).run().catch(() => {});
    }
    return json({ success: false, error: 'Checkout session could not be confirmed. Please check status before retrying.' }, 503);
  }
}
