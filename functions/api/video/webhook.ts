// Cloudflare Pages Function: /api/video/webhook
// Cashfree signs the exact raw request body with HMAC-SHA256(timestamp + body).
interface Env {
  DB?: any;
  CASHFREE_SECRET_KEY?: string;
  [key: string]: any;
}

async function verifyCashfreeSignature(rawBody: string, timestamp: string, signature: string, secret: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(timestamp + rawBody));
    const bytes = new Uint8Array(signed);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary) === signature;
  } catch {
    return false;
  }
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const jsonHeaders = { 'Content-Type': 'application/json' };

  try {
    const secret = env.CASHFREE_SECRET_KEY;
    const signature = request.headers.get('x-webhook-signature') || '';
    const timestamp = request.headers.get('x-webhook-timestamp') || '';
    if (!secret || !signature || !timestamp) {
      return new Response(JSON.stringify({ error: 'Webhook authentication is not configured or signature headers are missing.' }), { status: 401, headers: jsonHeaders });
    }

    const rawBody = await request.text();
    const valid = await verifyCashfreeSignature(rawBody, timestamp, signature, secret);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Invalid Cashfree webhook signature.' }), { status: 401, headers: jsonHeaders });
    }

    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Payment database is unavailable.' }), { status: 503, headers: jsonHeaders });
    }

    let eventData: any;
    try {
      eventData = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), { status: 400, headers: jsonHeaders });
    }

    const orderData = eventData.data?.order;
    const paymentData = eventData.data?.payment;
    if (!orderData?.order_id) {
      return new Response(JSON.stringify({ status: 'IGNORED', message: 'No order data present.' }), { status: 200, headers: jsonHeaders });
    }

    const orderId = String(orderData.order_id);
    const existingOrder = await env.DB.prepare(
      'SELECT video_id, customer_phone, order_amount, order_currency FROM payment_orders WHERE order_id = ?'
    ).bind(orderId).first();

    // Ignore unknown orders; never create an entitlement from webhook-supplied identity data.
    if (!existingOrder) {
      return new Response(JSON.stringify({ error: 'Unknown order.' }), { status: 404, headers: jsonHeaders });
    }

    if (orderData.order_status !== 'PAID') {
      return new Response(JSON.stringify({ status: 'IGNORED', orderId, orderStatus: orderData.order_status || 'UNKNOWN' }), { status: 200, headers: jsonHeaders });
    }

    const amount = Number(orderData.order_amount);
    const savedAmount = Number(existingOrder.order_amount);
    const currency = orderData.order_currency || existingOrder.order_currency;
    const webhookPhone = String(orderData.customer_details?.customer_phone || '').replace(/\\D/g, '').slice(-10);
    if (!Number.isFinite(amount) || amount !== savedAmount || currency !== 'INR' ||
        existingOrder.order_currency !== 'INR' || webhookPhone !== existingOrder.customer_phone) {
      return new Response(JSON.stringify({ error: 'Webhook order details do not match the saved order.' }), { status: 403, headers: jsonHeaders });
    }

    const accessId = `acc_wh_${orderId}`;
    await env.DB.prepare(
      `UPDATE payment_orders
       SET order_status = 'PAID', cf_payment_id = ?, payment_method = ?,
           raw_verification_json = ?, updated_at = CURRENT_TIMESTAMP
       WHERE order_id = ?`
    ).bind(
      paymentData?.cf_payment_id ? String(paymentData.cf_payment_id) : null,
      paymentData?.payment_group || 'WEBHOOK',
      rawBody,
      orderId
    ).run();

    await env.DB.prepare(
      `INSERT INTO customer_video_access (id, customer_phone, customer_email, video_id, order_id, is_revoked)
       VALUES (?, ?, ?, ?, ?, 0)
       ON CONFLICT(customer_phone, video_id) DO UPDATE SET
         order_id = excluded.order_id, is_revoked = 0, updated_at = CURRENT_TIMESTAMP`
    ).bind(
      accessId,
      existingOrder.customer_phone,
      orderData.customer_details?.customer_email || null,
      existingOrder.video_id,
      orderId
    ).run();

    return new Response(JSON.stringify({ status: 'SUCCESS', orderId }), { status: 200, headers: jsonHeaders });
  } catch (err: any) {
    console.error('Cashfree webhook processing failed:', err);
    return new Response(JSON.stringify({ error: 'Webhook processing failed.' }), { status: 500, headers: jsonHeaders });
  }
}
