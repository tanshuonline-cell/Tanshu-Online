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

    if (!customerPhone || !videoId) {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'customerPhone and videoId are required.' }), { status: 400, headers: corsHeaders });
    }

    const sanitizedPhone = customerPhone.replace(/\D/g, '').slice(-10);
    if (!/^\d{10}$/.test(sanitizedPhone)) {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'A valid 10-digit mobile number is required.' }), { status: 400, headers: corsHeaders });
    }

    // Complimentary admin grants are verified separately; no payment order is fabricated.
    if (!orderId) {
      if (!env.DB) return new Response(JSON.stringify({ success: false, accessGranted: false, error: 'Access database is unavailable.' }), { status: 503, headers: corsHeaders });
      try {
        const grant = await env.DB.prepare(
          `SELECT g.id FROM admin_video_access_grants g
           INNER JOIN videos v ON v.id = g.video_id
           WHERE g.customer_phone = ? AND g.video_id = ? AND g.is_revoked = 0
             AND v.is_active = 1 AND v.access_type = 'premium' AND v.is_premium = 1
           LIMIT 1`
        ).bind(sanitizedPhone, videoId).first();
        if (!grant) return new Response(JSON.stringify({ success: false, accessGranted: false, error: 'No active admin-granted access was found for this mobile number and video.' }), { status: 403, headers: corsHeaders });
        const signingKey = env.ADMIN_SECRET_TOKEN;
        if (!signingKey || signingKey.includes('YOUR_')) return new Response(JSON.stringify({ success: false, accessGranted: false, error: 'Secure access signing is not configured.' }), { status: 503, headers: corsHeaders });
        const payloadStr = JSON.stringify({ p: sanitizedPhone, v: videoId, g: grant.id, t: Date.now(), exp: Date.now() + 30 * 24 * 3600 * 1000 });
        const b64Payload = btoa(payloadStr);
        const signature = await createSignature(b64Payload, signingKey);
        const sessionToken = `${b64Payload}.${signature}`;
        corsHeaders['Set-Cookie'] = `tanshu_video_${videoId}_access=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
        return new Response(JSON.stringify({ success: true, isPaid: false, accessGranted: true, accessType: 'complimentary', videoId, customerPhone: sanitizedPhone, sessionToken, message: 'Complimentary access verified.' }), { status: 200, headers: corsHeaders });
      } catch (dbErr) {
        console.error('Complimentary access lookup failed:', dbErr);
        return new Response(JSON.stringify({ success: false, accessGranted: false, error: 'Could not verify complimentary access.' }), { status: 503, headers: corsHeaders });
      }
    }

    // Fail closed: every payment must match an order stored before checkout.
    if (!env.DB) {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Payment database is unavailable. Access remains locked.' }), { status: 503, headers: corsHeaders });
    }
    let orderRecord: any;
    try {
      orderRecord = await env.DB.prepare(
        'SELECT video_id, customer_phone, order_status, order_amount FROM payment_orders WHERE order_id = ?'
      ).bind(orderId).first();
    } catch (dbErr) {
      console.error('D1 order pre-check failed:', dbErr);
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Could not validate the payment order. Access remains locked.' }), { status: 503, headers: corsHeaders });
    }
    if (!orderRecord || orderRecord.video_id !== videoId || orderRecord.customer_phone !== sanitizedPhone) {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Order, video, or customer details do not match. Access denied.' }), { status: 403, headers: corsHeaders });
    }

    // A customer-side payment recheck must never undo an administrator's explicit revocation.
    let existingEntitlement: any;
    try {
      existingEntitlement = await env.DB.prepare(
        'SELECT id, is_revoked FROM customer_video_access WHERE customer_phone = ? AND video_id = ? AND order_id = ? LIMIT 1'
      ).bind(sanitizedPhone, videoId, orderId).first();
    } catch (dbErr) {
      console.error('D1 entitlement pre-check failed:', dbErr);
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Could not validate the existing access record. Access remains locked.' }), { status: 503, headers: corsHeaders });
    }
    if (existingEntitlement && Number(existingEntitlement.is_revoked) === 1) {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'This access was revoked by an administrator. Please contact support.' }), { status: 403, headers: corsHeaders });
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

    if (cfData.order_id !== orderId) {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Cashfree returned a different order ID. Access denied.' }), { status: 403, headers: corsHeaders });
    }

    const gatewayAmount = Number(cfData.order_amount);
    const storedAmount = Number(orderRecord.order_amount);
    if (!Number.isFinite(gatewayAmount) || !Number.isFinite(storedAmount) || gatewayAmount !== storedAmount || cfData.order_currency !== 'INR') {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Payment amount or currency does not match the saved order. Access denied.' }), { status: 403, headers: corsHeaders });
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
    } catch (dbErr) {
        console.error('D1 verification update failed:', dbErr);
        return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Payment was confirmed, but access could not be saved. Please contact support; the video remains locked.' }), { status: 503, headers: corsHeaders });
    }

    // Generate secure customer session token only from the configured server secret.
    const signingKey = env.ADMIN_SECRET_TOKEN;
    if (!signingKey || signingKey.includes('YOUR_')) {
      return new Response(JSON.stringify({ success: false, isPaid: false, error: 'Secure access signing is not configured. Access remains locked.' }), { status: 503, headers: corsHeaders });
    }
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
