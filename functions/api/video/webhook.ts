// Cloudflare Pages Function: /api/video/webhook
// Purpose: Handles asynchronous Cashfree payment notification webhooks

interface Env {
  DB?: any;
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_WEBHOOK_SECRET?: string;
  [key: string]: any;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  try {
    const rawBody = await request.text();
    let eventData: any = {};
    try {
      eventData = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify webhook payload structure
    const orderData = eventData.data?.order;
    const paymentData = eventData.data?.payment;

    if (!orderData || !orderData.order_id) {
      return new Response(JSON.stringify({ status: 'IGNORED', message: 'No order data present' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const orderId = String(orderData.order_id);
    const orderStatus = orderData.order_status;
    const customerPhone = orderData.customer_details?.customer_phone;
    const customerEmail = orderData.customer_details?.customer_email;

    if (orderStatus === 'PAID' && env.DB) {
      try {
        // Find corresponding video_id from existing order
        const existingOrder = await env.DB.prepare(
          'SELECT video_id FROM payment_orders WHERE order_id = ?'
        )
          .bind(orderId)
          .first();

        const videoId = existingOrder ? existingOrder.video_id : null;

        // Update payment_orders status
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
            paymentData?.payment_group || 'WEBHOOK_PROCESSED',
            JSON.stringify(eventData),
            orderId
          )
          .run();

        // If videoId and customer phone are known, grant customer access
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
        console.error('Webhook D1 update error:', dbErr);
      }
    }

    return new Response(JSON.stringify({ status: 'SUCCESS', orderId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Webhook error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
