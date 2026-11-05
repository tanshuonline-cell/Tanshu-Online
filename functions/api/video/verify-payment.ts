// Cloudflare Pages Function: /api/video/verify-payment
// Purpose: Server-side verification of payment with Cashfree API and customer entitlement granting with secure session token & cookies

interface Env {
  DB?: any;
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_ENVIRONMENT?: string; // 'SANDBOX' or 'PRODUCTION'
  ADMIN_SECRET_TOKEN?: string;
  [key: string]: any;
}

// Simple Web Crypto HMAC-SHA256 signature
async function createSignature(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json().catch(() => ({}));
    const { orderId, customerPhone, customerEmail, videoId } = body as {
      orderId?: string;
      customerPhone?: string;
      customerEmail?: string;
      videoId?: string;
    };

    if (!orderId || !customerPhone || !videoId) {
      return new Response(
        JSON.stringify({
          success: false,
          isPaid: false,
          error: 'Missing required parameters: orderId, customerPhone, and videoId are required.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const sanitizedPhone = customerPhone.replace(/\D/g, '').slice(-10);
    if (sanitizedPhone.length !== 10) {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Invalid customer mobile number.' }), { status: 400, headers: corsHeaders });
    }

    // Never verify or grant access without a recorded order and a private server signing key.
    if (!env.DB) {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Secure payment verification is temporarily unavailable.' }), { status: 503, headers: corsHeaders });
    }
    const signingKey = env.ADMIN_SECRET_TOKEN;
    if (!signingKey || signingKey.includes('YOUR_')) {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Secure customer sessions are not configured on the server.' }), { status: 503, headers: corsHeaders });
    }

    let orderRecord: any;
    try {
      orderRecord = await env.DB.prepare(
        'SELECT video_id, customer_phone, order_amount, order_status FROM payment_orders WHERE order_id = ?'
      ).bind(orderId).first();
    } catch (dbErr) {
      console.error('D1 order validation failed:', dbErr);
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Could not verify the payment order.' }), { status: 503, headers: corsHeaders });
    }
    if (!orderRecord || orderRecord.video_id !== videoId || orderRecord.customer_phone !== sanitizedPhone) {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Order validation failed. This order does not belong to this video and customer.' }), { status: 403, headers: corsHeaders });
    }

    const appId = env.CASHFREE_APP_ID;
    const secretKey = env.CASHFREE_SECRET_KEY;
    const isProd = env.CASHFREE_ENVIRONMENT === 'PRODUCTION';
    const cashfreeBaseUrl = isProd
      ? `https://api.cashfree.com/pg/orders/${orderId}`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    let isPaid = false;
    let cfPaymentId: string | undefined;
    let paymentMethod: string | undefined;
    let rawVerification: any = null;

    if (!appId || !secretKey || appId.includes('YOUR_')) {
      return new Response(
        JSON.stringify({
          success: false,
          isPaid: false,
          error: 'Cashfree API credentials are not configured or invalid on the server. Payment verification failed closed.',
        }),
        { status: 503, headers: corsHeaders }
      );
    }

    // Query Cashfree Server-to-Server API
    const cfResponse = await fetch(cashfreeBaseUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
    });

    const cfData = await cfResponse.json();
    rawVerification = cfData;

    if (!cfResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          isPaid: false,
          error: cfData.message || 'Could not query Cashfree order status from payment gateway.',
        }),
        { status: cfResponse.status, headers: corsHeaders }
      );
    }

    const verifiedAmount = Number(cfData.order_amount);
    const recordedAmount = Number(orderRecord.order_amount);
    if (!Number.isFinite(verifiedAmount) || !Number.isFinite(recordedAmount) || Math.abs(verifiedAmount - recordedAmount) > 0.01 || String(cfData.order_currency || 'INR').toUpperCase() !== 'INR') {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Payment amount or currency does not match the recorded order.' }), { status: 400, headers: corsHeaders });
    }

    if (cfData.order_status === 'PAID') {
      isPaid = true;
      cfPaymentId = cfData.cf_payment_id ? String(cfData.cf_payment_id) : undefined;
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          isPaid: false,
          orderStatus: cfData.order_status,
          message: `Order status is currently ${cfData.order_status}. Video remains locked until payment is confirmed.`,
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (!isPaid) {
      return new Response(
        JSON.stringify({
          success: true,
          isPaid: false,
          error: 'Payment verification failed: Order is not marked as PAID.',
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Persist and grant access in D1 database
    const accessId = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    try {
      // Persist verified payment and grant video access. Any D1 failure blocks session issuance.
      await env.DB.prepare(
        `UPDATE payment_orders
         SET order_status = 'PAID',
             cf_payment_id = ?,
             payment_method = ?,
             raw_verification_json = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE order_id = ?`
      ).bind(
        cfPaymentId || null,
        paymentMethod || 'UPI/Card/Netbanking',
        JSON.stringify(rawVerification),
        orderId
      ).run();

      await env.DB.prepare(
        `INSERT INTO customer_video_access (id, customer_phone, customer_email, video_id, order_id, is_revoked)
         VALUES (?, ?, ?, ?, ?, 0)
         ON CONFLICT(customer_phone, video_id) DO UPDATE SET
           order_id = excluded.order_id,
           is_revoked = 0,
           updated_at = CURRENT_TIMESTAMP`
      ).bind(accessId, sanitizedPhone, customerEmail || null, videoId, orderId).run();
    } catch (dbErr) {
      console.error('D1 payment entitlement write failed:', dbErr);
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Payment was verified, but access could not be saved. Please contact support with your order ID.' }), { status: 503, headers: corsHeaders });
    }

    // Generate secure customer session token specifically for this (phone, videoId)
    const payloadStr = JSON.stringify({
      p: sanitizedPhone,
      v: videoId,
      o: orderId,
      t: Date.now(),
      exp: Date.now() + 30 * 24 * 3600 * 1000, // 30 days
    });
    const b64Payload = btoa(payloadStr);
    const signature = await createSignature(b64Payload, signingKey);
    const sessionToken = `${b64Payload}.${signature}`;

    // Set secure HTTP-only cookie for stream token requests
    corsHeaders['Set-Cookie'] = `tanshu_video_${videoId}_access=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;

    return new Response(
      JSON.stringify({
        success: true,
        isPaid: true,
        orderId,
        videoId,
        customerPhone: sanitizedPhone,
        sessionToken,
        message: 'Payment verified and video unlocked successfully.',
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        isPaid: false,
        error: err.message || 'Internal server error while verifying payment',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
