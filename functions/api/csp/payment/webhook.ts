import { CspEnv, hmac, safeEqual, json } from '../_auth';
import { activateVerifiedOrder } from './verify';

interface CashfreeWebhookEnv extends CspEnv {
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_WEBHOOK_SECRET?: string;
  CASHFREE_ENVIRONMENT?: string;
}
const API_VERSION = '2025-01-01';
const cashfreeBase = (environment: string) => environment === 'SANDBOX' ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

export async function onRequestPost({ request, env }: { request: Request; env: CashfreeWebhookEnv }): Promise<Response> {
  if (!env.DB || env.CASHFREE_ENVIRONMENT !== 'SANDBOX' || !env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) return json({ success: false }, 503);
  const rawBody = await request.text();
  const signature = request.headers.get('x-webhook-signature') || '';
  const timestamp = request.headers.get('x-webhook-timestamp') || '';
  const webhookSecret = env.CASHFREE_WEBHOOK_SECRET || env.CASHFREE_SECRET_KEY;
  if (!signature || !timestamp || !webhookSecret) return json({ success: false, error: 'Missing webhook signature.' }, 401);
  const expected = await hmac(timestamp + rawBody, webhookSecret);
  const expectedBytes = expected.match(/.{2}/g)?.map(value => parseInt(value, 16)) || [];
  const expectedBase64 = btoa(String.fromCharCode(...expectedBytes));
  if (!safeEqual(signature, expectedBase64)) return json({ success: false, error: 'Invalid webhook signature.' }, 401);

  try {
    const event = JSON.parse(rawBody) as { type?: string; data?: { order?: { order_id?: string }; payment?: { cf_payment_id?: number | string; payment_status?: string } } };
    const orderId = String(event.data?.order?.order_id || '');
    if (!/^csp_[a-f0-9]{24}$/.test(orderId)) return json({ success: true, ignored: true });
    // Never trust webhook status/amount alone. Fetch the order's payments from
    // Cashfree over the authenticated server API and activate only a SUCCESS row.
    const response = await fetch(cashfreeBase(env.CASHFREE_ENVIRONMENT) + '/orders/' + encodeURIComponent(orderId) + '/payments', {
      headers: { 'x-client-id': env.CASHFREE_APP_ID, 'x-client-secret': env.CASHFREE_SECRET_KEY, 'x-api-version': API_VERSION }
    });
    if (!response.ok) return json({ success: false, error: 'Could not verify payment with Cashfree.' }, 502);
    const payments = await response.json().catch(() => []);
    if (!Array.isArray(payments)) return json({ success: false }, 502);
    const payment = payments.find((item: any) => item.payment_status === 'SUCCESS');
    if (!payment) return json({ success: true, paid: false });
    const result = await activateVerifiedOrder(orderId, payment, env);
    return json({ success: true, activated: result.activated, alreadyProcessed: result.alreadyProcessed });
  } catch {
    return json({ success: false, error: 'Webhook processing failed.' }, 500);
  }
}
