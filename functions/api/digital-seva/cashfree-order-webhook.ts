import { cashfreeApiBase, cashfreeWebhookSecret } from './_cashfree';
// Cloudflare Pages Function: POST /api/digital-seva/cashfree-order-webhook
// Cashfree order/payment webhook. Verify signature, then independently fetch the order before marking it paid.
interface Env { DIGITAL_SEVA_DB?: any; CASHFREE_APP_ID?: string; CASHFREE_SECRET_KEY?: string; CASHFREE_ENVIRONMENT?: string; CASHFREE_WEBHOOK_SECRET?: string; }
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function toPaise(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : -1;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!env.DIGITAL_SEVA_DB || !env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY || !cashfreeWebhookSecret(env)) return json({ success: false }, 503);
  const signature = request.headers.get('x-webhook-signature') || '';
  const timestamp = request.headers.get('x-webhook-timestamp') || '';
  if (!signature || !timestamp || timestamp.length > 40) return json({ success: false, error: 'Missing webhook signature.' }, 400);
  const rawBody = await request.text();
  if (rawBody.length > 65536) return json({ success: false }, 413);

  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(cashfreeWebhookSecret(env)), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(timestamp + rawBody));
    if (!constantTimeEqual(signature, toBase64(new Uint8Array(signed)))) return json({ success: false, error: 'Invalid webhook signature.' }, 401);

    const event = JSON.parse(rawBody) as any;
    const orderId = String(event?.data?.order?.order_id || event?.data?.order_id || event?.data?.payment?.order_id || '');
    if (!orderId || orderId.length > 50) return json({ success: true, ignored: true });

    const local = await env.DIGITAL_SEVA_DB.prepare(
      'SELECT id, amount, status FROM digital_seva_checkout_orders WHERE order_id = ?'
    ).bind(orderId).first();
    if (!local) return json({ success: true, ignored: true });
    const payment = event?.data?.payment && typeof event.data.payment === 'object' ? event.data.payment : {};
    const eventType = String(event?.type || 'CASHFREE_ORDER_EVENT').slice(0, 100);
    const eventStatusFallback = eventType.includes('FAILED') ? 'FAILED' : eventType.includes('SUCCESS') ? 'SUCCESS' : eventType.includes('USER_DROPPED') ? 'USER_DROPPED' : 'UNKNOWN';
    const paymentStatus = String(payment.payment_status || event?.data?.order?.order_status || eventStatusFallback).toUpperCase().slice(0, 60);
    const cfPaymentId = payment.cf_payment_id == null ? '' : String(payment.cf_payment_id).slice(0, 100);
    const paymentMessage = String(payment.payment_message || payment.payment_status || '').slice(0, 500);
    const paymentAmount = Number(payment.payment_amount ?? event?.data?.order?.order_amount);
    const paymentCurrency = String(payment.payment_currency || event?.data?.order?.order_currency || 'INR').slice(0, 8);
    const eventTime = String(payment.payment_time || event?.data?.payment?.payment_time || '').slice(0, 80) || null;
    const eventKey = `${orderId}:${cfPaymentId || timestamp}:${paymentStatus}:${eventType}`.slice(0, 240);

    const response = await fetch(`${cashfreeApiBase(env)}/orders/${encodeURIComponent(orderId)}`, {
      headers: { 'x-client-id': env.CASHFREE_APP_ID, 'x-client-secret': env.CASHFREE_SECRET_KEY, 'x-api-version': '2022-09-01' }
    });
    const verified = await response.json().catch(() => ({})) as any;
    if (!response.ok) return json({ success: false, error: 'Could not verify the Cashfree order.' }, 502);
    if (String(verified.order_id || '') !== orderId) return json({ success: false, error: 'Cashfree returned a different order.' }, 502);

    await env.DIGITAL_SEVA_DB.prepare(
      `INSERT OR IGNORE INTO digital_seva_checkout_payment_events
       (event_key, order_id, event_type, payment_status, cf_payment_id, payment_message, payment_amount, payment_currency, event_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      eventKey, orderId, eventType, paymentStatus, cfPaymentId || null, paymentMessage || null,
      Number.isFinite(paymentAmount) ? paymentAmount : null, paymentCurrency, eventTime
    ).run();

    if (local.status === 'CLAIMED' || local.status === 'PAID') return json({ success: true, duplicate: true, historyRecorded: true });

    const status = String(verified.order_status || '').toUpperCase();
    if (status === 'PAID') {
      if (String(verified.order_currency || '').toUpperCase() !== 'INR' || toPaise(verified.order_amount) !== toPaise(local.amount)) {
        console.error('Cashfree direct checkout amount/currency mismatch:', { orderId, expected: local.amount, actual: verified.order_amount, currency: verified.order_currency });
        return json({ success: true, ignored: true, reason: 'amount_or_currency_mismatch' });
      }
      await env.DIGITAL_SEVA_DB.prepare(
        `UPDATE digital_seva_checkout_orders
         SET status = 'PAID', paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
         WHERE order_id = ? AND status = 'PENDING'`
      ).bind(orderId).run();
    } else if (['EXPIRED', 'TERMINATED'].includes(status)) {
      await env.DIGITAL_SEVA_DB.prepare(
        `UPDATE digital_seva_checkout_orders SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
         WHERE order_id = ? AND status = 'PENDING'`
      ).bind(orderId).run();
    }
    return json({ success: true });
  } catch (error) {
    console.error('Cashfree direct checkout webhook failed:', error);
    return json({ success: false, error: 'Webhook processing failed.' }, 500);
  }
}
