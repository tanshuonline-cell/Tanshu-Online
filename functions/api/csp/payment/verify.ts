import { CspEnv, json, readCustomerSession } from '../_auth';

interface CashfreePayment { cf_payment_id?: number | string; payment_status?: string; payment_amount?: number; payment_currency?: string; }
const API_VERSION = '2025-01-01';
const cashfreeBase = (environment: string) => environment === 'SANDBOX' ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

async function fetchOrderPayments(orderId: string, env: CspEnv & { CASHFREE_APP_ID?: string; CASHFREE_SECRET_KEY?: string; CASHFREE_ENVIRONMENT?: string }): Promise<CashfreePayment[]> {
  if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY || String(env.CASHFREE_ENVIRONMENT || '').toUpperCase() !== 'SANDBOX') throw new Error('Cashfree Sandbox credentials are unavailable.');
  const response = await fetch(cashfreeBase(String(env.CASHFREE_ENVIRONMENT || '').toUpperCase()) + '/orders/' + encodeURIComponent(orderId) + '/payments', {
    headers: { 'x-client-id': env.CASHFREE_APP_ID, 'x-client-secret': env.CASHFREE_SECRET_KEY, 'x-api-version': API_VERSION }
  });
  if (!response.ok) throw new Error('Cashfree payment status could not be verified.');
  const payments = await response.json().catch(() => []);
  if (!Array.isArray(payments)) throw new Error('Cashfree returned an invalid payment status.');
  return payments as CashfreePayment[];
}

export async function activateVerifiedOrder(orderId: string, payment: CashfreePayment, env: CspEnv): Promise<{ activated: boolean; alreadyProcessed: boolean }> {
  if (!env.DB) throw new Error('Database unavailable.');
  const row = await env.DB.prepare(
    "SELECT p.id, p.customer_id, p.amount_inr, p.status, p.gateway_payment_id, p.reference, p.plan_duration_days, c.status AS customer_status FROM csp_payments p JOIN csp_customers c ON c.id = p.customer_id WHERE p.gateway_order_id = ? AND p.payment_method = 'cashfree'"
  ).bind(orderId).first();
  if (!row || row.customer_status !== 'active') throw new Error('Cashfree order does not match an active membership customer.');
  const planCode = String(row.reference).replace('Cashfree membership: ', '');
  if (!['basic', 'advanced', 'premium'].includes(planCode) || Number(payment.payment_amount) !== Number(row.amount_inr) || (payment.payment_currency && payment.payment_currency !== 'INR')) {
    throw new Error('Cashfree payment amount or plan does not match the membership order.');
  }
  if (row.status === 'verified') return { activated: false, alreadyProcessed: true };

  const subscriptionId = crypto.randomUUID();
  const auditId = crypto.randomUUID();
  const now = new Date();
  const durationDays = Math.min(3650, Math.max(1, Math.floor(Number(row.plan_duration_days) || 30)));
  const expiresAt = new Date(now.getTime());
  expiresAt.setUTCDate(expiresAt.getUTCDate() + durationDays);
  const paymentId = String(payment.cf_payment_id || '');
  if (!paymentId) throw new Error('Cashfree did not provide a payment transaction ID.');
  const results = await env.DB.batch([
    env.DB.prepare(
      "UPDATE csp_payments SET subscription_id = ?, gateway_payment_id = ?, gateway_payment_status = 'SUCCESS', status = 'verified', verified_by = 'cashfree_webhook_or_verify', verified_at = CURRENT_TIMESTAMP, notes = 'Cashfree payment independently verified through Payments API.' WHERE gateway_order_id = ? AND payment_method = 'cashfree' AND status = 'pending' AND amount_inr = ?"
    ).bind(subscriptionId, paymentId, orderId, Number(row.amount_inr)),
    env.DB.prepare(
      "UPDATE csp_subscriptions SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE customer_id = ? AND status = 'active' AND EXISTS (SELECT 1 FROM csp_payments WHERE gateway_order_id = ? AND status = 'verified' AND subscription_id = ?)"
    ).bind(row.customer_id, orderId, subscriptionId),
    env.DB.prepare(
      "INSERT INTO csp_subscriptions (id, customer_id, plan_code, amount_inr, starts_at, expires_at, status, activated_by, notes) SELECT ?, ?, ?, ?, ?, ?, 'active', 'cashfree', 'Activated after Cashfree server-side SUCCESS verification.' WHERE EXISTS (SELECT 1 FROM csp_payments WHERE gateway_order_id = ? AND status = 'verified' AND subscription_id = ?)"
    ).bind(subscriptionId, row.customer_id, planCode, Number(row.amount_inr), now.toISOString(), expiresAt.toISOString(), orderId, subscriptionId),
    env.DB.prepare(
      "INSERT INTO csp_admin_audit (id, admin_username, action, customer_id, details_json) SELECT ?, 'cashfree', 'cashfree_membership_activation', ?, ? WHERE EXISTS (SELECT 1 FROM csp_payments WHERE gateway_order_id = ? AND status = 'verified' AND subscription_id = ?)"
    ).bind(auditId, row.customer_id, JSON.stringify({ orderId, paymentId, planCode, amount: Number(row.amount_inr) }), orderId, subscriptionId)
  ]);
  if (Number(results?.[0]?.meta?.changes) === 1 && Number(results?.[2]?.meta?.changes) === 1) return { activated: true, alreadyProcessed: false };
  const current = await env.DB.prepare("SELECT status FROM csp_payments WHERE gateway_order_id = ?").bind(orderId).first();
  if (current?.status === 'verified') return { activated: false, alreadyProcessed: true };
  throw new Error('Cashfree payment was not activated. No success response was recorded.');
}

export async function onRequestPost({ request, env }: { request: Request; env: CspEnv & { CASHFREE_APP_ID?: string; CASHFREE_SECRET_KEY?: string; CASHFREE_ENVIRONMENT?: string } }): Promise<Response> {
  if (!env.DB || !env.CSP_SESSION_SECRET) return json({ success: false, error: 'Payment verification is unavailable.' }, 503);
  const session = await readCustomerSession(request, env.CSP_SESSION_SECRET);
  if (!session) return json({ success: false, error: 'Please sign in again to verify your payment.' }, 401);
  const body = await request.json().catch(() => ({})) as { orderId?: string };
  const orderId = String(body.orderId || '').trim();
  if (!/^csp_[a-f0-9]{24}$/.test(orderId)) return json({ success: false, error: 'Invalid Cashfree order ID.' }, 400);
  try {
    const owned = await env.DB.prepare("SELECT id FROM csp_payments WHERE gateway_order_id = ? AND customer_id = ? AND payment_method = 'cashfree'").bind(orderId, session.id).first();
    if (!owned) return json({ success: false, error: 'This payment order does not belong to the signed-in customer.' }, 404);
    const payments = await fetchOrderPayments(orderId, env);
    const payment = payments.find(item => item.payment_status === 'SUCCESS');
    if (!payment) {
      const latestStatus = String(payments[0]?.payment_status || 'PENDING').toUpperCase();
      await env.DB.prepare("UPDATE csp_payments SET gateway_payment_status = ? WHERE gateway_order_id = ? AND status = 'pending'").bind(latestStatus, orderId).run();
      return json({ success: true, paid: false, status: latestStatus, message: latestStatus === 'FAILED' || latestStatus === 'USER_DROPPED' || latestStatus === 'CANCELLED' ? 'Cashfree reports that this payment attempt did not complete. You may retry checkout; membership remains locked.' : 'Cashfree has not confirmed a successful payment yet. If money was deducted, do not pay again until the order is checked.' });
    }
    const result = await activateVerifiedOrder(orderId, payment, env);
    return json({ success: true, paid: true, activated: result.activated, alreadyProcessed: result.alreadyProcessed, message: 'Payment verified by Cashfree. Membership is active.' });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : 'Payment verification failed.' }, 502);
  }
}
