import { json } from '../_auth';
import { CashfreeEnv, cashfreeConfigured, verifyCashfreeWebhook, verifyAndActivateCashfreeOrder } from '../_cashfree';
type Env = CashfreeEnv;
export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!env.DB || !cashfreeConfigured(env)) return json({ success: false }, 503);
  const signature = request.headers.get('x-webhook-signature') || '';
  const timestamp = request.headers.get('x-webhook-timestamp') || '';
  const rawBody = await request.text();
  if (rawBody.length > 65536) return json({ success: false }, 413);
  if (!await verifyCashfreeWebhook(rawBody, signature, timestamp, env.CASHFREE_WEBHOOK_SECRET || env.CASHFREE_SECRET_KEY || '')) return json({ success: false, error: 'Invalid Cashfree webhook signature.' }, 401);
  try {
    const event = JSON.parse(rawBody) as any;
    const orderId = String(event?.data?.order?.order_id || event?.data?.order_id || event?.data?.payment?.order_id || '');
    if (!/^csp_[a-z0-9_]{8,60}$/i.test(orderId)) return json({ success: true, ignored: true });
    const local = await env.DB.prepare('SELECT order_id, status FROM csp_cashfree_orders WHERE order_id = ?').bind(orderId).first();
    if (!local) return json({ success: true, ignored: true });
    const payment = event?.data?.payment || {};
    const paymentStatus = String(payment.payment_status || event?.type || 'UNKNOWN').toUpperCase().slice(0,80);
    const cfPaymentId = payment.cf_payment_id == null ? '' : String(payment.cf_payment_id);
    const eventKey = [orderId, cfPaymentId || timestamp, paymentStatus, String(event?.type || '')].join(':').slice(0,240);
    await env.DB.prepare('INSERT OR IGNORE INTO csp_cashfree_events (event_key, order_id, event_type, payment_status, cf_payment_id, payment_amount, payment_currency) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(eventKey, orderId, String(event?.type || 'UNKNOWN').slice(0,100), paymentStatus, cfPaymentId || null, Number.isFinite(Number(payment.payment_amount)) ? Number(payment.payment_amount) : null, String(payment.payment_currency || 'INR')).run();
    const result = await verifyAndActivateCashfreeOrder(env, orderId);
    return json({ success: true, paid: result.paid, status: result.status });
  } catch {
    return json({ success: false, error: 'Cashfree webhook processing failed.' }, 500);
  }
}
