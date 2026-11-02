// Admin-only endpoint to grant or revoke complimentary access without creating a fake payment.
interface Env { DB?: any; ADMIN_SECRET_TOKEN?: string; [key: string]: any; }
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
async function validAdmin(request: Request, env: Env): Promise<boolean> {
  const secret = env.ADMIN_SECRET_TOKEN;
  if (!secret || secret.includes('YOUR_')) return false;
  const auth = request.headers.get('Authorization') || '';
  const bearer = auth.replace(/^Bearer\s+/i, '').trim();
  const cookie = (request.headers.get('Cookie') || '').match(/tanshu_admin_session=([^;]+)/)?.[1];
  const token = bearer || cookie;
  if (!token || !token.includes('.')) return false;
  try {
    const [payload, signature] = token.split('.');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const expected = Array.from(new Uint8Array(signed)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (expected !== signature) return false;
    const data = JSON.parse(atob(payload));
    return Boolean(data.role === 'superadmin' && typeof data.u === 'string' && data.u.length > 0 && data.exp && data.exp > Date.now());
  } catch { return false; }
}
export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!(await validAdmin(request, env))) return Response.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401, headers });
  if (!env.DB) return Response.json({ success: false, error: 'Database unavailable.' }, { status: 503, headers });
  try {
    const body = await request.json() as { phone?: string; customerPhone?: string; videoId?: string; note?: string };
    const phone = String(body.customerPhone || body.phone || '').replace(/\D/g, '').slice(-10);
    const videoId = String(body.videoId || '').trim();
    const note = String(body.note || '').trim().slice(0, 300);
    if (!/^\d{10}$/.test(phone) || !videoId) return Response.json({ success: false, error: 'Valid 10-digit mobile number and video are required.' }, { status: 400, headers });
    const video = await env.DB.prepare("SELECT id FROM videos WHERE id = ? AND is_active = 1 AND access_type = 'premium' AND is_premium = 1").bind(videoId).first();
    if (!video) return Response.json({ success: false, error: 'Active paid video not found.' }, { status: 404, headers });
    const id = 'mgr_' + crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO admin_video_access_grants (id, customer_phone, video_id, note, granted_by, is_revoked)
      VALUES (?, ?, ?, ?, 'admin', 0)
      ON CONFLICT(customer_phone, video_id) DO UPDATE SET note = excluded.note, is_revoked = 0, updated_at = CURRENT_TIMESTAMP`)
      .bind(id, phone, videoId, note || null).run();
    const record = await env.DB.prepare('SELECT id FROM admin_video_access_grants WHERE customer_phone = ? AND video_id = ?').bind(phone, videoId).first();
    return Response.json({ success: true, grantId: record?.id, message: 'Complimentary access granted. No payment record was created.' }, { headers });
  } catch (error) {
    console.error('Manual grant failed:', error);
    return Response.json({ success: false, error: 'Could not save manual access grant.' }, { status: 500, headers });
  }
}
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
}
