import { cashfreeApiBase } from './_cashfree';
// Cloudflare Pages Function: POST /api/digital-seva/checkout
// Creates a Cashfree Sandbox order for the approved fixed-price Digital Seva services.
// A booking is NOT written until the customer has paid and /bookings verifies this order.
import { getAutoPaymentQuote } from '../../../src/features/digital-seva/autoPaymentPricing';

interface Env {
  DIGITAL_SEVA_DB?: any;
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_ENVIRONMENT?: string;
}
const TERMS_POLICY_VERSION = 'terms-2026-11-07-v1';
const REFUND_POLICY_VERSION = 'refund-2026-11-07-v2';
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}
function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}
function normalizePhone(value: unknown): string {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) {
    return json({ success: false, error: 'A JSON checkout request is required.' }, 415);
  }
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'The dedicated Digital Seva Preview database is not connected.' }, 503);
  if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) return json({ success: false, error: 'Cashfree credentials are not configured for this environment.' }, 503);

  let body: any;
  try {
    const raw = await request.text();
    if (raw.length > 8192) return json({ success: false, error: 'The checkout request is too large.' }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ success: false, error: 'The checkout request is invalid.' }, 400);
  }

  const serviceId = String(body?.serviceId || '');
  const quote = getAutoPaymentQuote(serviceId);
  const customerName = String(body?.customerName || '').trim().replace(/\s+/g, ' ');
  const customerPhone = normalizePhone(body?.customerPhone);
  const customerEmail = String(body?.customerEmail || '').trim();
  const idempotencyKey = String(body?.idempotencyKey || '');
  if (!quote) return json({ success: false, error: 'Automatic payment is not enabled for this service yet. Please use the payment-link request option.' }, 400);
  if (customerName.length < 2 || customerName.length > 100 || !/^[\p{L}\p{M} .'-]+$/u.test(customerName)) return json({ success: false, error: 'Enter a valid customer name.' }, 400);
  if (!/^\d{10}$/.test(customerPhone)) return json({ success: false, error: 'Enter a valid 10-digit Indian mobile number.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) || customerEmail.length > 120) return json({ success: false, error: 'Enter a valid email address.' }, 400);
  if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) return json({ success: false, error: 'The checkout session expired. Please try again.' }, 400);
  if (body?.consent !== true || body?.termsAccepted !== true || body?.termsPolicyVersion !== TERMS_POLICY_VERSION ||
      body?.refundPolicyAccepted !== true || body?.refundPolicyVersion !== REFUND_POLICY_VERSION) {
    return json({ success: false, error: 'Please accept the current contact consent, Terms & Conditions and Refund Policy before payment.' }, 400);
  }

  try {
    const prior = await env.DIGITAL_SEVA_DB.prepare(
      'SELECT order_id, payment_session_id, amount, status FROM digital_seva_checkout_orders WHERE idempotency_key = ?'
    ).bind(idempotencyKey).first();
    if (prior) {
      if (prior.status === 'PENDING' || prior.status === 'PAID') {
        return json({ success: true, orderId: prior.order_id, paymentSessionId: prior.payment_session_id, amount: prior.amount, status: prior.status, reused: true });
      }
      return json({ success: false, error: 'This checkout attempt has already been used. Please start a fresh payment attempt.' }, 409);
    }

    const orderId = `ds_${idempotencyKey.replace(/-/g, '')}`;
    const origin = new URL(request.url).origin;
    const cashfreeResponse = await fetch(`${cashfreeApiBase(env)}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': env.CASHFREE_APP_ID,
        'x-client-secret': env.CASHFREE_SECRET_KEY,
        'x-api-version': '2022-09-01',
        'x-idempotency-key': idempotencyKey
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: quote.totalAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: `ds_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone
        },
        order_meta: {
          return_url: `${origin}/digital-seva?cashfree_order_id={order_id}&service=${encodeURIComponent(serviceId)}`,
          notify_url: `${origin}/api/digital-seva/cashfree-order-webhook`
        },
        order_note: `TANSHU ONLINE Digital Seva - ${serviceId}`.slice(0, 250),
        order_tags: { service_id: serviceId, pricing_version: 'digital-seva-initial-2026-11-08' }
      })
    });
    const result = await cashfreeResponse.json().catch(() => ({})) as any;
    if (!cashfreeResponse.ok || !result.payment_session_id || String(result.order_id || '') !== orderId) {
      console.error('Cashfree order creation failed:', cashfreeResponse.status, result);
      return json({ success: false, error: 'Cashfree could not start the secure checkout. Please try again later.' }, 502);
    }

    await env.DIGITAL_SEVA_DB.prepare(
      `INSERT INTO digital_seva_checkout_orders
       (id, order_id, idempotency_key, service_id, customer_phone, amount, currency, payment_session_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'INR', ?, 'PENDING')`
    ).bind(crypto.randomUUID(), orderId, idempotencyKey, serviceId, customerPhone, quote.totalAmount, String(result.payment_session_id)).run();

    return json({
      success: true,
      orderId,
      paymentSessionId: String(result.payment_session_id),
      amount: quote.totalAmount,
      currency: 'INR',
      status: 'PENDING',
      quote: { governmentFee: quote.governmentFee, tanshuFee: quote.tanshuFee, routeLabel: quote.routeLabel, note: quote.note }
    }, 201);
  } catch (error) {
    console.error('Digital Seva Cashfree checkout creation failed:', error);
    return json({ success: false, error: 'Could not prepare secure checkout. Please retry once.' }, 503);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
