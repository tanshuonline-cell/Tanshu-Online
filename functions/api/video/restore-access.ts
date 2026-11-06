// Cloudflare Pages Function: /api/video/restore-access
// Re-issues a premium-video session only after Cashfree confirms a matching paid order.
interface Env { DB?: any; CASHFREE_APP_ID?: string; CASHFREE_SECRET_KEY?: string; CASHFREE_ENVIRONMENT?: string; ADMIN_SECRET_TOKEN?: string; [key: string]: any; }
async function createSignature(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Content-Type': 'application/json' };
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  try {
    const body = await request.json().catch(() => ({})) as { action?: string; orderId?: string; customerPhone?: string; videoId?: string };
    const orderId = String(body.orderId || '').trim();
    const phone = String(body.customerPhone || '').replace(/\D/g, '').slice(-10);
    const videoId = String(body.videoId || '').trim();
    if (body.action !== 'restore_by_order' || !orderId || orderId.length > 64 || phone.length !== 10 || !videoId) {
      return new Response(JSON.stringify({ success: false, authorized: false, error: 'Enter the Cashfree order reference and the registered 10-digit mobile number.' }), { status: 400, headers });
    }
    if (!env.DB || !env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY || !env.ADMIN_SECRET_TOKEN || env.CASHFREE_APP_ID.includes('YOUR_') || env.ADMIN_SECRET_TOKEN.includes('YOUR_')) {
      return new Response(JSON.stringify({ success: false, authorized: false, error: 'Secure access restoration is not configured. Please contact support with your Cashfree receipt.' }), { status: 503, headers });
    }
    const order = await env.DB.prepare('SELECT video_id, customer_phone, customer_email, order_amount, order_currency FROM payment_orders WHERE order_id = ?').bind(orderId).first();
    if (!order || String(order.video_id) !== videoId || String(order.customer_phone || '').replace(/\D/g, '').slice(-10) !== phone) {
      return new Response(JSON.stringify({ success: false, authorized: false, error: 'Order reference, registered mobile number, or video does not match our records.' }), { status: 403, headers });
    }
    const base = env.CASHFREE_ENVIRONMENT === 'PRODUCTION' ? 'https://api.cashfree.com/pg/orders/' : 'https://sandbox.cashfree.com/pg/orders/';
    const cfResponse = await fetch(base + encodeURIComponent(orderId), { headers: { 'x-api-version': '2023-08-01', 'x-client-id': env.CASHFREE_APP_ID, 'x-client-secret': env.CASHFREE_SECRET_KEY } });
    const cfData = await cfResponse.json().catch(() => ({})) as any;
    if (!cfResponse.ok) return new Response(JSON.stringify({ success: false, authorized: false, error: 'Cashfree could not verify this order right now. Please try again later.' }), { status: 502, headers });
    if (String(cfData.order_id || '') !== orderId || cfData.order_status !== 'PAID' ||
        !Number.isFinite(Number(cfData.order_amount)) || Math.abs(Number(cfData.order_amount) - Number(order.order_amount)) > 0.01 ||
        String(cfData.order_currency || '').toUpperCase() !== String(order.order_currency || 'INR').toUpperCase() ||
        String(order.order_currency || 'INR').toUpperCase() !== 'INR') {
      return new Response(JSON.stringify({ success: false, authorized: false, error: 'Cashfree has not confirmed a matching paid order. No access was restored.' }), { status: 409, headers });
    }
    const accessId = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await env.DB.prepare("UPDATE payment_orders SET order_status = 'PAID', cf_payment_id = ?, payment_method = 'Cashfree Checkout', raw_verification_json = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?").bind(cfData.cf_payment_id ? String(cfData.cf_payment_id) : null, JSON.stringify(cfData), orderId).run();
    await env.DB.prepare(`INSERT INTO customer_video_access (id, customer_phone, customer_email, video_id, order_id, is_revoked) VALUES (?, ?, ?, ?, ?, 0) ON CONFLICT(customer_phone, video_id) DO UPDATE SET order_id = excluded.order_id, is_revoked = 0, updated_at = CURRENT_TIMESTAMP`).bind(accessId, phone, order.customer_email || null, videoId, orderId).run();
    const payload = btoa(JSON.stringify({ p: phone, v: videoId, o: orderId, t: Date.now(), exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }));
    const token = payload + '.' + await createSignature(payload, env.ADMIN_SECRET_TOKEN);
    const responseHeaders = new Headers(headers);
    responseHeaders.set('Set-Cookie', `tanshu_video_${videoId}_access=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
    return new Response(JSON.stringify({ success: true, authorized: true, videoId, customerPhone: phone, sessionToken: token, message: 'Cashfree payment re-verified. Your video access has been restored.' }), { status: 200, headers: responseHeaders });
  } catch (error: any) {
    console.error('Video access restoration failed:', error);
    return new Response(JSON.stringify({ success: false, authorized: false, error: 'Could not restore access right now. Please contact support with your Cashfree order reference.' }), { status: 500, headers });
  }
}
export async function onRequestOptions(): Promise<Response> { return new Response(null, { status: 204, headers }); }
