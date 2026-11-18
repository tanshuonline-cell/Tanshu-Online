import { CspEnv, safeEqual } from './_auth';

export interface CashfreeEnv extends CspEnv {
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_WEBHOOK_SECRET?: string;
  CASHFREE_ENVIRONMENT?: string;
  CF_PAGES_BRANCH?: string;
}

export function cashfreeConfigured(env: CashfreeEnv): boolean {
  return Boolean(env.CASHFREE_APP_ID && env.CASHFREE_SECRET_KEY)
    && String(env.CF_PAGES_BRANCH || '').toLowerCase() !== 'main'
    && String(env.CASHFREE_ENVIRONMENT || 'SANDBOX').toUpperCase() !== 'PRODUCTION';
}
export const CASHFREE_API = 'https://sandbox.cashfree.com/pg';
const API_VERSION = '2022-09-01';

export async function cashfreeFetch(env: CashfreeEnv, path: string, init: RequestInit = {}): Promise<any> {
  if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) throw new Error('Cashfree Preview credentials are not configured.');
  const response = await fetch(CASHFREE_API + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': env.CASHFREE_APP_ID,
      'x-client-secret': env.CASHFREE_SECRET_KEY,
      'x-api-version': API_VERSION,
      ...(init.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(String(data.message || data.type || 'Cashfree API request failed.'));
  return data;
}

export function cashfreeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export async function verifyCashfreeWebhook(rawBody: string, signature: string, timestamp: string, secret: string): Promise<boolean> {
  // Verify the exact timestamp + raw body signature. Do not impose a short
  // freshness window: Cashfree may retry legitimate webhook deliveries later.
  // Duplicate delivery is made safe by the event/order/subscription idempotency checks.
  if (!rawBody || !signature || !timestamp || timestamp.length > 40 || !secret) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(timestamp + rawBody));
  return safeEqual(signature, cashfreeBase64(new Uint8Array(signed)));
}

export async function verifyAndActivateCashfreeOrder(env: CashfreeEnv, orderId: string): Promise<{ paid: boolean; status: string }> {
  if (!env.DB) throw new Error('Preview database is not configured.');
  const local = await env.DB.prepare(
    `SELECT o.*, p.status AS payment_status, c.email
     FROM csp_cashfree_orders o
     JOIN csp_payments p ON p.id = o.payment_id
     JOIN csp_customers c ON c.id = o.customer_id
     WHERE o.order_id = ? LIMIT 1`
  ).bind(orderId).first();
  if (!local) return { paid: false, status: 'NOT_FOUND' };
  if (local.status === 'PAID' || local.payment_status === 'verified') return { paid: true, status: 'PAID' };

  const [order, payments] = await Promise.all([
    cashfreeFetch(env, '/orders/' + encodeURIComponent(orderId)),
    cashfreeFetch(env, '/orders/' + encodeURIComponent(orderId) + '/payments')
  ]);
  if (String(order.order_id || '') !== orderId) throw new Error('Cashfree order ID mismatch.');
  if (String(order.order_currency || '').toUpperCase() !== 'INR'
      || Math.round(Number(order.order_amount) * 100) !== Number(local.amount_inr) * 100
      || String(order.customer_details?.customer_email || '').toLowerCase() !== String(local.email).toLowerCase()
      || String(order.customer_details?.customer_phone || '') !== String(local.customer_phone)) {
    throw new Error('Cashfree order details do not match the local membership request.');
  }
  const attempts = Array.isArray(payments) ? payments : [];
  const successful = attempts.find((p: any) => String(p.payment_status || '').toUpperCase() === 'SUCCESS'
    && Math.round(Number(p.payment_amount) * 100) === Number(local.amount_inr) * 100
    && String(p.payment_currency || 'INR').toUpperCase() === 'INR');
  if (!successful || String(order.order_status || '').toUpperCase() !== 'PAID') {
    const status = attempts.some((p: any) => ['FAILED','USER_DROPPED'].includes(String(p.payment_status || '').toUpperCase())) ? 'FAILED' : 'PENDING';
    if (status === 'FAILED') {
      await env.DB.batch([
        env.DB.prepare("UPDATE csp_cashfree_orders SET status = 'FAILED', updated_at = CURRENT_TIMESTAMP WHERE order_id = ? AND status = 'PENDING'").bind(orderId),
        env.DB.prepare("UPDATE csp_payments SET status = 'rejected', notes = 'Cashfree reported an unsuccessful payment attempt.' WHERE id = ? AND status = 'pending'").bind(local.payment_id)
      ]);
    }
    return { paid: false, status };
  }

  const paymentRef = String(successful.cf_payment_id || '');
  const subscriptionId = crypto.randomUUID();
  const auditId = crypto.randomUUID();
  const startsAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const subscriptionNote = 'Cashfree order ' + orderId;
  const auditDetails = JSON.stringify({ orderId, cfPaymentId: paymentRef, planCode: local.plan_code, amount: local.amount_inr });
  const results = await env.DB.batch([
    env.DB.prepare("UPDATE csp_payments SET status = 'verified', payment_method = 'cashfree', reference = ?, verified_by = 'Cashfree', verified_at = CURRENT_TIMESTAMP, notes = 'Server-side Cashfree payment verification successful.' WHERE id = ? AND status = 'pending'").bind(paymentRef || orderId, local.payment_id),
    env.DB.prepare("UPDATE csp_cashfree_orders SET status = 'PAID', cf_payment_id = ?, paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE order_id = ? AND status = 'PENDING'").bind(paymentRef || null, orderId),
    env.DB.prepare("INSERT INTO csp_subscriptions (id, customer_id, plan_code, amount_inr, starts_at, expires_at, status, activated_by, notes) SELECT ?, ?, ?, ?, ?, ?, 'active', 'cashfree', ? WHERE EXISTS (SELECT 1 FROM csp_payments WHERE id = ? AND status = 'verified') AND EXISTS (SELECT 1 FROM csp_cashfree_orders WHERE order_id = ? AND status = 'PAID') AND NOT EXISTS (SELECT 1 FROM csp_subscriptions WHERE notes = ?)").bind(subscriptionId, local.customer_id, local.plan_code, local.amount_inr, startsAt, expiresAt, subscriptionNote, local.payment_id, orderId, subscriptionNote),
    env.DB.prepare("UPDATE csp_subscriptions SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE customer_id = ? AND status = 'active' AND id <> ? AND EXISTS (SELECT 1 FROM csp_subscriptions WHERE id = ?)").bind(local.customer_id, subscriptionId, subscriptionId),
    env.DB.prepare("INSERT INTO csp_admin_audit (id, admin_username, action, customer_id, details_json) SELECT ?, 'cashfree', 'cashfree_membership_activated', ?, ? WHERE EXISTS (SELECT 1 FROM csp_subscriptions WHERE id = ?) AND NOT EXISTS (SELECT 1 FROM csp_admin_audit WHERE action = 'cashfree_membership_activated' AND details_json = ?)").bind(auditId, local.customer_id, auditDetails, subscriptionId, auditDetails)
  ]);
  if (Number(results?.[0]?.meta?.changes || 0) !== 1) {
    const check = await env.DB.prepare("SELECT status FROM csp_payments WHERE id = ?").bind(local.payment_id).first();
    if (check?.status !== 'verified') throw new Error('Payment could not be marked verified.');
  }
  return { paid: true, status: 'PAID' };
}
