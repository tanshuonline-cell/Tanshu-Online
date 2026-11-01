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

    // Security check 1: Check if the order was originally registered for this specific video and phone
    if (env.DB) {
      try {
        const orderRecord = await env.DB.prepare(
          'SELECT video_id, customer_phone, order_status FROM payment_orders WHERE order_id = ?'
        )
          .bind(orderId)
          .first();

        if (orderRecord) {
          if (orderRecord.video_id !== videoId) {
            return new Response(
              JSON.stringify({
                success: false,
                isPaid: false,
                error: 'Order validation error: This payment was not initiated for this video.',
              }),
              { status: 400, headers: corsHeaders }
            );
          }
          if (orderRecord.customer_phone !== sanitizedPhone) {
            return new Response(
              JSON.stringify({
                success: false,
                isPaid: false,
                error: 'Order validation error: Customer phone mismatch.',
              }),
              { status: 400, headers: corsHeaders }
            );
          }
        }
      } catch (dbErr) {
        console.warn('D1 order pre-check warning:', dbErr);
      }
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

    if (env.DB) {
      try {
        // Update payment order status to PAID
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
            cfPaymentId || null,
            paymentMethod || 'UPI/Card/Netbanking',
            JSON.stringify(rawVerification),
            orderId
          )
          .run();

        // Idempotent access grant: Insert or update
        await env.DB.prepare(
          `INSERT INTO customer_video_access (id, customer_phone, customer_email, video_id, order_id, granted_at, expires_at, is_revoked)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, datetime('now', '+30 days'), 0)
           ON CONFLICT(customer_phone, video_id) DO UPDATE SET
             order_id = excluded.order_id,
             granted_at = CURRENT_TIMESTAMP,
             expires_at = datetime('now', '+30 days'),
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
      } catch (dbErr) {
        console.warn('D1 verification update warning:', dbErr);
      }
    }

    // Generate secure customer session token specifically for this (phone, videoId)
    const signingKey = env.ADMIN_SECRET_TOKEN || 'tanshu_secure_session_secret_2025';
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
