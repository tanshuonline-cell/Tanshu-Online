// Cloudflare Pages Function: POST /api/digital-seva/cashfree-webhook
// Public Cashfree callback. Verifies the signed raw payload and then confirms the link
// independently with Cashfree before marking a Digital Seva request as paid.
interface Env { DIGITAL_SEVA_DB?: any; CASHFREE_APP_ID?: string; CASHFREE_SECRET_KEY?: string; CASHFREE_ENV?: string; }
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
export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!env.DIGITAL_SEVA_DB || !env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) return json({ success: false }, 503);
  const signature = request.headers.get('x-webhook-signature') || '';
  const timestamp = request.headers.get('x-webhook-timestamp') || '';
  if (!signature || !timestamp || timestamp.length > 40) return json({ success: false, error: 'Missing webhook signature.' }, 400);
  const rawBody = await request.text();
  if (rawBody.length > 65536) return json({ success: false }, 413);
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.CASHFREE_SECRET_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(timestamp + rawBody));
    const expected = toBase64(new Uint8Array(signed));
    if (!constantTimeEqual(signature, expected)) return json({ success: false, error: 'Invalid webhook signature.' }, 401);
    const event = JSON.parse(rawBody) as any;
    const linkId = String(event?.data?.link_id || event?.data?.link?.link_id || event?.data?.payment_link?.link_id || '');
    if (!linkId || linkId.length > 100) return json({ success: true, ignored: true });
    const sandbox = (env.CASHFREE_ENV || 'SANDBOX').toUpperCase() !== 'PRODUCTION';
    const apiBase = sandbox ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';
    const verifyResponse = await fetch(`${apiBase}/links/${encodeURIComponent(linkId)}`, {
      headers: { 'x-client-id': env.CASHFREE_APP_ID, 'x-client-secret': env.CASHFREE_SECRET_KEY, 'x-api-version': '2022-09-01' }
    });
    const verified = await verifyResponse.json().catch(() => ({})) as any;
    if (!verifyResponse.ok) return json({ success: false, error: 'Could not verify the payment link with Cashfree.' }, 502);
    const paidAmount = Number(verified.link_amount_paid || 0);
    const totalAmount = Number(verified.link_amount || 0);
    const isPaid = String(verified.link_status || '').toUpperCase() === 'PAID' || (totalAmount > 0 && paidAmount >= totalAmount);
    const isFailed = ['EXPIRED', 'CANCELLED'].includes(String(verified.link_status || '').toUpperCase());
    if (isPaid || isFailed) {
      await env.DIGITAL_SEVA_DB.prepare(
        `UPDATE digital_seva_payments
         SET status = CASE WHEN ? = 1 THEN 'PAID' ELSE 'CANCELLED' END,
             cashfree_link_status = ?, cashfree_link_paid_amount = ?,
             paid_at = CASE WHEN ? = 1 THEN COALESCE(paid_at, CURRENT_TIMESTAMP) ELSE paid_at END,
             updated_at = CURRENT_TIMESTAMP
         WHERE cashfree_link_id = ? AND status != 'PAID'`
      ).bind(isPaid ? 1 : 0, String(verified.link_status || ''), paidAmount, isPaid ? 1 : 0, linkId).run();
    } else {
      await env.DIGITAL_SEVA_DB.prepare(
        'UPDATE digital_seva_payments SET cashfree_link_status = ?, cashfree_link_paid_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE cashfree_link_id = ?'
      ).bind(String(verified.link_status || ''), paidAmount, linkId).run();
    }
    return json({ success: true });
  } catch (error) {
    console.error('Cashfree webhook processing failed:', error);
    return json({ success: false, error: 'Webhook processing failed.' }, 500);
  }
}
