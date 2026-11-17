import { CspEnv, json, readCustomerSession } from '../_auth';

interface CashfreeOrder {
  order_id?: string;
  payment_session_id?: string;
  order_status?: string;
  order_amount?: number;
}
const API_VERSION = '2025-01-01';
const cashfreeBase = (environment: string) => environment === 'SANDBOX' ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

export async function onRequestPost({ request, env }: { request: Request; env: CspEnv & { CASHFREE_APP_ID?: string; CASHFREE_SECRET_KEY?: string; CASHFREE_ENVIRONMENT?: string; APP_BASE_URL?: string } }): Promise<Response> {
  if (!env.DB || !env.CSP_SESSION_SECRET) return json({ success: false, error: 'Membership payment service is not configured.' }, 503);
  const session = await readCustomerSession(request, env.CSP_SESSION_SECRET);
  if (!session) return json({ success: false, error: 'Please verify your Gmail before paying.' }, 401);
  if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY || env.CASHFREE_ENVIRONMENT !== 'SANDBOX') {
    return json({ success: false, error: 'Cashfree Preview Sandbox is not configured correctly. No payment was created.' }, 503);
  }
  const body = await request.json().catch(() => ({})) as { planCode?: string; customerPhone?: string };
  const planCode = String(body.planCode || '').toLowerCase();
  const phone = String(body.customerPhone || '').replace(/\D/g, '');
  if (!['basic', 'advanced', 'premium'].includes(planCode)) return json({ success: false, error: 'Choose a valid membership plan.' }, 400);
  if (!/^\\d{10}$/.test(phone)) return json({ success: false, error: 'Enter a valid 10-digit mobile number for Cashfree checkout.' }, 400);
  try {
    const customer = await env.DB.prepare("SELECT id, email FROM csp_customers WHERE id = ? AND status = 'active'").bind(session.id).first();
    if (!customer) return json({ success: false, error: 'Customer account is unavailable.' }, 403);
    const plan = await env.DB.prepare('SELECT amount_inr, duration_days FROM csp_plan_prices WHERE plan_code = ? AND is_active = 1').bind(planCode).first();
    const amount = Number(plan?.amount_inr);
    if (!plan || !Number.isSafeInteger(amount) || amount < 1) return json({ success: false, error: 'This membership plan is unavailable.' }, 404);

    // Reuse a recent open checkout for this customer and exact plan. This prevents
    // duplicate pending orders when the customer clicks Pay more than once.
    const existing = await env.DB.prepare(
      "SELECT gateway_order_id, gateway_payment_session_id, amount_inr FROM csp_payments WHERE customer_id = ? AND payment_method = 'cashfree' AND status = 'pending' AND reference = ? AND created_at >= datetime('now', '-15 minutes') ORDER BY created_at DESC LIMIT 1"
    ).bind(customer.id, 'Cashfree membership: ' + planCode).first();
    if (existing?.gateway_order_id && existing?.gateway_payment_session_id && Number(existing.amount_inr) === amount) {
      return json({ success: true, orderId: existing.gateway_order_id, paymentSessionId: existing.gateway_payment_session_id, environment: 'sandbox', reused: true });
    }

    const origin = new URL(request.url).origin;
    const orderId = 'csp_' + crypto.randomUUID().replace(/-/g, '').slice(0, 24);
    const response = await fetch(cashfreeBase(env.CASHFREE_ENVIRONMENT) + '/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': env.CASHFREE_APP_ID,
        'x-client-secret': env.CASHFREE_SECRET_KEY,
        'x-api-version': API_VERSION,
        'x-idempotency-key': crypto.randomUUID()
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: { customer_id: customer.id, customer_email: customer.email, customer_phone: phone },
        order_meta: {
          return_url: origin + '/?csp_order_id={order_id}',
          notify_url: origin + '/api/csp/payment/webhook'
        },
        order_note: 'TANSHU ONLINE ' + planCode.toUpperCase() + ' membership'
      })
    });
    const cashfree = await response.json().catch(() => ({})) as CashfreeOrder & { message?: string; type?: string };
    if (!response.ok || !cashfree.payment_session_id || cashfree.order_id !== orderId) {
      return json({ success: false, error: cashfree.message || 'Cashfree could not create the Sandbox order. Please try again.' }, 502);
    }
    await env.DB.prepare(
      "INSERT INTO csp_payments (id, customer_id, amount_inr, payment_method, reference, status, notes, gateway_order_id, gateway_payment_session_id, gateway_payment_status, customer_phone) VALUES (?, ?, ?, 'cashfree', ?, 'pending', ?, ?, ?, 'ACTIVE', ?)"
    ).bind(crypto.randomUUID(), customer.id, amount, 'Cashfree membership: ' + planCode, 'Cashfree Sandbox order created; awaiting server-side payment verification.', orderId, cashfree.payment_session_id, phone).run();
    return json({ success: true, orderId, paymentSessionId: cashfree.payment_session_id, environment: 'sandbox', reused: false });
  } catch {
    return json({ success: false, error: 'Unable to start Cashfree Sandbox checkout. No membership has been activated.' }, 500);
  }
}
