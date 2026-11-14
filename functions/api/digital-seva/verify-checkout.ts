import { cashfreeApiBase } from './_cashfree';
import { getAutoPaymentQuote } from '../../../src/features/digital-seva/autoPaymentPricing';

interface Env {
  DIGITAL_SEVA_DB?: any;
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_ENVIRONMENT?: string;
  CF_PAGES_BRANCH?: string;
}
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers }); }
function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}
function toPaise(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : -1;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!env.DIGITAL_SEVA_DB || !env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) return json({ success: false, error: 'Payment verification is not configured for this environment.' }, 503);
  let body: any;
  try {
    const raw = await request.text();
    if (raw.length > 4096) return json({ success: false, error: 'The verification request is too large.' }, 413);
    body = JSON.parse(raw);
  } catch { return json({ success: false, error: 'The verification request is invalid.' }, 400); }
  const orderId = String(body?.orderId || '');
  if (!/^ds_[0-9a-f]{32}$/i.test(orderId)) return json({ success: false, error: 'A valid payment reference is required.' }, 400);
  try {
    const local = await env.DIGITAL_SEVA_DB.prepare(
      'SELECT order_id, service_id, amount, currency, status FROM digital_seva_checkout_orders WHERE order_id = ?'
    ).bind(orderId).first();
    if (!local) return json({ success: false, error: 'Payment reference was not found.' }, 404);
    if (local.status === 'CLAIMED') return json({ success: false, error: 'This payment is already attached to an application.' }, 409);
    if (!['PENDING', 'PAID'].includes(String(local.status))) return json({ success: false, error: 'This payment attempt is no longer active.' }, 409);
    const quote = getAutoPaymentQuote(String(local.service_id || ''));
    if (!quote || String(local.currency).toUpperCase() !== 'INR' || toPaise(local.amount) !== toPaise(quote.totalAmount)) {
      return json({ success: false, error: 'The saved payment amount does not match the approved service price.' }, 409);
    }
    const response = await fetch(`${cashfreeApiBase(env)}/orders/${encodeURIComponent(orderId)}`, {
      headers: { 'x-client-id': env.CASHFREE_APP_ID, 'x-client-secret': env.CASHFREE_SECRET_KEY, 'x-api-version': '2022-09-01' }
    });
    const verified = await response.json().catch(() => ({})) as any;
    if (!response.ok || String(verified.order_id || '') !== orderId) return json({ success: false, error: 'Cashfree could not verify this payment yet.' }, 502);
    if (String(verified.order_status || '').toUpperCase() !== 'PAID') return json({ success: false, paid: false, status: String(verified.order_status || 'PENDING'), error: 'Payment is not confirmed yet. Do not pay again; check again shortly.' }, 402);
    if (String(verified.order_currency || '').toUpperCase() !== 'INR' || toPaise(verified.order_amount) !== toPaise(quote.totalAmount)) {
      console.error('Digital Seva verify-checkout amount mismatch:', { orderId, expected: quote.totalAmount, actual: verified.order_amount, currency: verified.order_currency });
      return json({ success: false, error: 'The verified payment amount does not match the approved service fee.' }, 409);
    }
    await env.DIGITAL_SEVA_DB.prepare(
      "UPDATE digital_seva_checkout_orders SET status = 'PAID', paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE order_id = ? AND status = 'PENDING'"
    ).bind(orderId).run();
    return json({ success: true, paid: true, orderId, serviceId: String(local.service_id), amount: quote.totalAmount, currency: 'INR' });
  } catch (error) {
    console.error('Digital Seva verify-checkout failed:', error);
    return json({ success: false, error: 'Payment verification could not be completed. Do not pay again; retry verification shortly.' }, 503);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
