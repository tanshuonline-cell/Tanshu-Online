interface Env { DB: any; MEMBERSHIP_SESSION_SECRET: string; }
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });

async function customerFromSession(request: Request, env: Env) {
  const item = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith('tanshu_membership_session='));
  if (!item) return null;
  const token = item.slice(item.indexOf('=') + 1);
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
    return await env.DB.prepare("SELECT id,email,display_name,profile_image_url FROM membership_customers WHERE id=? AND account_status='active' AND email_verified=1").bind(session.sub).first();
  } catch { return null; }
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  try {
    if (!env.DB || !env.MEMBERSHIP_SESSION_SECRET) return json({ success: false, error: 'Membership account service is not configured.' }, 503);
    const customer = await customerFromSession(request, env);
    if (!customer) return json({ success: false, authenticated: false, error: 'Please sign in first.' }, 401);
    const subscription = await env.DB.prepare(
      "SELECT s.id,s.gateway_subscription_id,s.status,s.current_period_start,s.current_period_end,s.cancel_at_period_end,s.cancelled_at,p.display_name AS plan_name,p.monthly_amount_paise FROM membership_subscriptions s JOIN membership_plans p ON p.id=s.plan_id WHERE s.customer_id=? ORDER BY s.created_at DESC LIMIT 1"
    ).bind(customer.id).first();
    const latestPayment = subscription ? await env.DB.prepare(
      "SELECT status,amount_paise,currency,paid_at,created_at FROM membership_payments WHERE subscription_id=? ORDER BY created_at DESC LIMIT 1"
    ).bind(subscription.id).first() : null;
    return json({ success: true, authenticated: true, customer, subscription: subscription || null, latestPayment: latestPayment || null });
  } catch (error) {
    console.error('Membership account read failed:', error);
    return json({ success: false, error: 'Membership account could not be loaded.' }, 503);
  }
}
