// Cloudflare Pages Function: /api/video/create-order
// Purpose: Securely initiates a Cashfree payment order for a premium video

interface Env {
  DB?: any;
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_ENVIRONMENT?: string; // 'SANDBOX' or 'PRODUCTION'
  [key: string]: any;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json().catch(() => ({}));
    const { videoId, customerPhone, customerEmail, customerName } = body as {
      videoId?: string;
      customerPhone?: string;
      customerEmail?: string;
      customerName?: string;
    };

    if (!videoId || !customerPhone) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: videoId and customerPhone are required.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Format and sanitize phone number (10 digits standard Indian mobile)
    const sanitizedPhone = customerPhone.replace(/\D/g, '').slice(-10);
    if (sanitizedPhone.length !== 10) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please enter a valid 10-digit mobile number.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Payment creation must use the live catalog and entitlement database.
    if (!env.DB) {
      return new Response(JSON.stringify({ success: false, error: 'Video database is unavailable. Payment cannot be initiated.' }), { status: 503, headers: corsHeaders });
    }

    // Check if customer already has unrevoked access in D1
    {
      try {
        const existingAccess = await env.DB.prepare(
          'SELECT id FROM customer_video_access WHERE customer_phone = ? AND video_id = ? AND is_revoked = 0'
        )
          .bind(sanitizedPhone, videoId)
          .first();

        if (existingAccess) {
          return new Response(
            JSON.stringify({
              success: true,
              alreadyPurchased: true,
              message: 'You already have active access to this premium video.',
              videoId,
            }),
            { status: 200, headers: corsHeaders }
          );
        }
      } catch (dbErr) {
        console.warn('D1 lookup warning:', dbErr);
      }
    }

    // Resolve video price (lookup in D1 or standard catalog fallback)
    let videoPrice = 0;
    let videoTitle = '';

    try {
      const videoRecord = await env.DB.prepare(
        'SELECT title, price, is_premium, access_type FROM videos WHERE id = ? AND is_active = 1'
      ).bind(videoId).first();
      if (!videoRecord || !(videoRecord.access_type === 'premium' || Boolean(videoRecord.is_premium))) {
        return new Response(JSON.stringify({ success: false, error: 'This paid video is unavailable or not active.' }), { status: 404, headers: corsHeaders });
      }
      videoPrice = Number(videoRecord.price);
      videoTitle = videoRecord.title || '';
      if (!Number.isFinite(videoPrice) || videoPrice <= 0 || !videoTitle) {
        return new Response(JSON.stringify({ success: false, error: 'The video price or title is invalid. Please contact support.' }), { status: 400, headers: corsHeaders });
      }
    } catch (dbErr) {
      console.error('D1 video lookup failed:', dbErr);
      return new Response(JSON.stringify({ success: false, error: 'Could not validate video details. Payment cannot be initiated.' }), { status: 503, headers: corsHeaders });
    }

    // Generate unique order ID
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `TANSHU_${timestamp}_${randomSuffix}`;

    const appId = env.CASHFREE_APP_ID;
    const secretKey = env.CASHFREE_SECRET_KEY;
    const isProd = env.CASHFREE_ENVIRONMENT === 'PRODUCTION';
    const cashfreeBaseUrl = isProd
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';

    let paymentSessionId = '';
    let cfOrderId = '';

    if (appId && secretKey) {
      // Call live Cashfree PG Orders API
      const cfPayload = {
        order_id: orderId,
        order_amount: videoPrice,
        order_currency: 'INR',
        customer_details: {
          customer_id: `cust_${sanitizedPhone}`,
          customer_phone: sanitizedPhone,
          customer_email: customerEmail || `customer_${sanitizedPhone}@tanshuonline.com`,
          customer_name: customerName || 'Tanshu Customer',
        },
        order_meta: {
          return_url: `${new URL(request.url).origin}/?order_id={order_id}&video_id=${videoId}&payment_status=check`,
          notify_url: `${new URL(request.url).origin}/api/video/webhook`,
        },
        order_note: `Purchase of ${videoTitle} on Tanshu Online`,
      };

      const cfResponse = await fetch(cashfreeBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
          'x-client-id': appId,
          'x-client-secret': secretKey,
        },
        body: JSON.stringify(cfPayload),
      });

      const cfData = await cfResponse.json();

      if (!cfResponse.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            error: cfData.message || 'Failed to initiate Cashfree order',
            details: cfData,
          }),
          { status: cfResponse.status, headers: corsHeaders }
        );
      }

      paymentSessionId = cfData.payment_session_id;
      cfOrderId = cfData.cf_order_id ? String(cfData.cf_order_id) : '';
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Cashfree credentials are not configured. Payment cannot be initiated.' }), { status: 503, headers: corsHeaders });
    }

    // Persist pending order in D1 if available
    if (env.DB) {
      try {
        await env.DB.prepare(
          `INSERT INTO payment_orders (order_id, cf_order_id, video_id, order_amount, order_currency, customer_phone, customer_email, payment_session_id, order_status)
           VALUES (?, ?, ?, ?, 'INR', ?, ?, ?, 'PENDING')`
        )
          .bind(
            orderId,
            cfOrderId,
            videoId,
            videoPrice,
            sanitizedPhone,
            customerEmail || null,
            paymentSessionId
          )
          .run();
      } catch (dbErr) {
        console.warn('D1 insert order warning:', dbErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId,
        paymentSessionId,
        orderAmount: videoPrice,
        orderCurrency: 'INR',
        videoTitle,
        environment: isProd ? 'PRODUCTION' : 'SANDBOX',
        gatewayConfigured: Boolean(appId && secretKey),
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Internal server error while creating payment order',
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
