import { CspEnv, json, readCustomerSession } from '../_auth';
import { cashfreeConfigured, cashfreeFetch } from '../_cashfree';

interface Env extends CspEnv {
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_WEBHOOK_SECRET?: string;
  CASHFREE_ENVIRONMENT?: string;
  CF_PAGES_BRANCH?: string;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!env.DB || !env.CSP_SESSION_SECRET) return json({ success: false, error: 'Membership payment is not configured.' }, 503);
  if (!cashfreeConfigured(env)) return json({ success: false, error: 'Cashfree Sandbox is not configured for this Preview deployment.' }, 503);
  const session = await readCustomerSession(request, env.CSP_SESSION_SECRET);
  if (!session) return json({ success: false, error: 'Please verify your Gmail first.' }, 401);
  const body = await request.json().catch(() => ({})) as { planCode?: string; phone?: string; returnPath?: string };
  const planCode = String(body.planCode || '').toLowerCase();
  const phone = String(body.phone || '').replace(/\D/g, '');
  if (!['basic','advanced','premium'].includes(planCode)) return json({ success: false, error: 'Choose a valid membership plan.' }, 400);
  if (!/^[6-9]\d{9}$/.test(phone)) return json({ success: false, error: 'Enter a valid 10-digit Indian mobile number for Cashfree payment.' }, 400);
  try {
    const customer = await env.DB.prepare("SELECT id, email FROM csp_customers WHERE id = ? AND status = 'active'").bind(session.id).first();
    const plan = await env.DB.prepare('SELECT amount_inr FROM csp_plan_prices WHERE plan_code = ? AND is_active = 1').bind(planCode).first();
    if (!customer || !plan) return json({ success: false, error: 'Customer or selected plan is unavailable.' }, 404);
    const amount = Number(plan.amount_inr);
    if (![99,199,299].includes(amount)) return json({ success: false, error: 'This plan price is not configured for Cashfree checkout.' }, 409);

    const url = new URL(request.url);
    const returnPath = String(body.returnPath || '/');
    const safePath = returnPath.startsWith('/') && !returnPath.startsWith('//') ? returnPath.split('#')[0].split('?')[0] : '/';
    const orderId = 'csp_' + Date.now().toString(36) + '_' + crypto.randomUUID().replace(/-/g,'').slice(0,12);
    const returnUrl = url.origin + safePath + '?csp_payment_order_id={order_id}';
    const payment = await cashfreeFetch(env, '/orders', {
      method: 'POST',
      headers: { 'x-idempotency-key': crypto.randomUUID() },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: { customer_id: String(customer.id).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,50), customer_email: customer.email, customer_phone: phone },
        order_meta: { return_url: returnUrl },
        order_note: 'TANSHU ONLINE ' + planCode.toUpperCase() + ' membership - 30 days'
      })
    });
    if (!payment.payment_session_id || String(payment.order_id) !== orderId) throw new Error('Cashfree did not return a valid payment session.');
    const paymentId = crypto.randomUUID();
    const orderRowId = crypto.randomUUID();
    await env.DB.batch([
      env.DB.prepare("INSERT INTO csp_payments (id, customer_id, amount_inr, payment_method, reference, status, notes) VALUES (?, ?, ?, 'cashfree', ?, 'pending', ?)").bind(paymentId, customer.id, amount, orderId, 'Cashfree Sandbox checkout created; awaiting verified payment.'),
      env.DB.prepare("INSERT INTO csp_cashfree_orders (id, order_id, payment_id, customer_id, plan_code, amount_inr, customer_phone, payment_session_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(orderRowId, orderId, paymentId, customer.id, planCode, amount, phone, payment.payment_session_id)
    ]);
    return json({ success: true, orderId, paymentSessionId: payment.payment_session_id, environment: 'sandbox', amount, planCode });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : 'Could not create Cashfree payment.' }, 502);
  }
}
