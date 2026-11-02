// Cloudflare Pages Function: /api/video/webhook
// Purpose: Secure, idempotent Cashfree payment notification webhook handler with official HMAC-SHA256 signature verification

interface Env {
  DB?: any;
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_WEBHOOK_SECRET?: string;
  [key: string]: any;
}

// Compute Cashfree Webhook HMAC-SHA256 signature in Base64
async function computeCashfreeSignature(timestamp: string, rawBody: string, secretKey: string): Promise<string> {
  const enc = new TextEncoder();
  const dataToSign = `${timestamp}${rawBody}`;
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', key, enc.encode(dataToSign));
  const bytes = new Uint8Array(signatureBytes);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Timing-safe string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const jsonHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const rawBody = await request.text();
    const timestamp = request.headers.get('x-webhook-timestamp') || '';
    const signature = request.headers.get('x-webhook-signature') || '';

    const webhookSecret = env.CASHFREE_WEBHOOK_SECRET || env.CASHFREE_SECRET_KEY;

    // Fail closed: Webhook secret must be configured to process incoming webhooks
    if (!webhookSecret || webhookSecret.includes('YOUR_')) {
      return new Response(
        JSON.stringify({
          error: 'Webhook verification secret (CASHFREE_WEBHOOK_SECRET or CASHFREE_SECRET_KEY) is not configured on the server.',
        }),
        { status: 503, headers: jsonHeaders }
      );
    }

    // 1. Mandatory Signature & Timestamp Validation
    if (!timestamp || !signature) {
      return new Response(
        JSON.stringify({
          error: 'Missing required webhook verification headers (x-webhook-timestamp, x-webhook-signature).',
        }),
        { status: 401, headers: jsonHeaders }
      );
    }

    // 2. Anti-replay timestamp check (within 10 minutes)
    const tsNum = Number(timestamp);
    if (isNaN(tsNum)) {
      return new Response(
        JSON.stringify({ error: 'Invalid x-webhook-timestamp header value.' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const now = Date.now();
    const tsMillis = tsNum > 1e11 ? tsNum : tsNum * 1000;
    if (Math.abs(now - tsMillis) > 10 * 60 * 1000) {
      return new Response(
        JSON.stringify({ error: 'Webhook timestamp expired or outside acceptable verification window.' }),
        { status: 401, headers: jsonHeaders }
      );
    }

    // 3. Cryptographic Signature Verification
    const expectedSignature = await computeCashfreeSignature(timestamp, rawBody, webhookSecret);
    const isValidSignature = timingSafeEqual(expectedSignature, signature);

    if (!isValidSignature) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature. Access denied.' }),
        { status: 401, headers: jsonHeaders }
      );
    }

    // 4. Parse verified webhook payload
    let eventData: any = {};
    try {
      eventData = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload in body.' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const eventType = eventData.type || '';
    const orderData = eventData.data?.order;
    const paymentData = eventData.data?.payment;

    if (!orderData || !orderData.order_id) {
      return new Response(
        JSON.stringify({ status: 'IGNORED', message: 'No valid order payload present in webhook.' }),
        { status: 200, headers: jsonHeaders }
      );
    }

    const orderId = String(orderData.order_id);
    const orderStatus = String(orderData.order_status || '').toUpperCase();
    const paymentStatus = String(paymentData?.payment_status || '').toUpperCase();
    const orderAmount = Number(orderData.order_amount);
    const customerPhone = orderData.customer_details?.customer_phone;
    const customerEmail = orderData.customer_details?.customer_email;

    // Handle failed / dropped payments
    if (
      eventType.includes('FAILED') ||
      orderStatus === 'FAILED' ||
      orderStatus === 'USER_DROPPED' ||
      paymentStatus === 'FAILED' ||
      paymentStatus === 'CANCELLED'
    ) {
      if (env.DB) {
        try {
          await env.DB.prepare(
            `UPDATE payment_orders
             SET order_status = 'FAILED',
                 raw_verification_json = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE order_id = ?`
          )
            .bind(JSON.stringify(eventData), orderId)
            .run();
        } catch (dbErr) {
          console.warn('D1 failed order update notice:', dbErr);
        }
      }
      return new Response(
        JSON.stringify({ status: 'RECORDED_PAYMENT_FAILED', orderId }),
        { status: 200, headers: jsonHeaders }
      );
    }

    // Strictly enforce: Only unlock when status is genuinely PAID and SUCCESS
    const isGenuinelyPaid =
      orderStatus === 'PAID' &&
      (paymentStatus === 'SUCCESS' || eventType === 'PAYMENT_SUCCESS_WEBHOOK');

    if (!isGenuinelyPaid) {
      return new Response(
        JSON.stringify({
          status: 'IGNORED_NON_FINAL_STATE',
          orderStatus,
          paymentStatus,
          message: 'Payment is not in confirmed PAID/SUCCESS state.',
        }),
        { status: 200, headers: jsonHeaders }
      );
    }

    // 5. Database lookup & Idempotent Entitlement Grant
    if (env.DB) {
      try {
        const existingOrder = await env.DB.prepare(
          'SELECT video_id, order_amount, order_status FROM payment_orders WHERE order_id = ?'
        )
          .bind(orderId)
          .first();

        if (existingOrder) {
          // Amount tamper verification
          if (
            !isNaN(orderAmount) &&
            existingOrder.order_amount &&
            Math.abs(orderAmount - Number(existingOrder.order_amount)) > 0.01
          ) {
            console.error('Webhook amount mismatch warning for order:', orderId);
            return new Response(
              JSON.stringify({ error: 'Order amount mismatch between webhook and recorded order.' }),
              { status: 400, headers: jsonHeaders }
            );
          }
        }

        const videoId = existingOrder ? existingOrder.video_id : null;

        // Update payment_orders to PAID
        await env.DB.prepare(
          `UPDATE payment_orders
           SET order_status = 'PAID',
               cf_payment_id = ?,
               payment_method = ?,
               raw_verification_json = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE order_id = ?`
        )
          .bind(
            paymentData?.cf_payment_id ? String(paymentData.cf_payment_id) : null,
            paymentData?.payment_group || 'CASHFREE_WEBHOOK',
            JSON.stringify(eventData),
            orderId
          )
          .run();

        // Grant customer video access idempotently
        if (videoId && customerPhone) {
          const sanitizedPhone = String(customerPhone).replace(/\D/g, '').slice(-10);
          const accessId = `acc_wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

          await env.DB.prepare(
            `INSERT INTO customer_video_access (id, customer_phone, customer_email, video_id, order_id, is_revoked)
             VALUES (?, ?, ?, ?, ?, 0)
             ON CONFLICT(customer_phone, video_id) DO UPDATE SET
               order_id = excluded.order_id,
               is_revoked = 0,
               updated_at = CURRENT_TIMESTAMP`
          )
            .bind(
              accessId,
              sanitizedPhone,
              customerEmail || null,
              videoId,
              orderId
            )
            .run();
        }
      } catch (dbErr) {
        console.error('Webhook database processing error:', dbErr);
        return new Response(
          JSON.stringify({ error: 'Database processing error during webhook entitlement.' }),
          { status: 500, headers: jsonHeaders }
        );
      }
    }

    return new Response(
      JSON.stringify({
        status: 'SUCCESS',
        orderId,
        message: 'Cashfree webhook verified and processed successfully.',
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Unhandled error processing webhook' }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
