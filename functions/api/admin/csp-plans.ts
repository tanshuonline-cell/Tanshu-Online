interface Env { DB?: any; ADMIN_SECRET_TOKEN?: string; }
async function signature(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
async function adminName(request: Request, env: Env): Promise<string | null> {
  if (!env.ADMIN_SECRET_TOKEN) return null;
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)tanshu_admin_session=([^;]+)/);
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim() || (match ? decodeURIComponent(match[1]) : '');
  const [payload, sig] = token.split('.');
  if (!payload || !sig || await signature(payload, env.ADMIN_SECRET_TOKEN) !== sig) return null;
  try { const data = JSON.parse(atob(payload)); return data.exp > Date.now() ? String(data.u || 'admin') : null; } catch { return null; }
}
const respond = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const admin = await adminName(request, env);
  if (!admin) return respond({ success: false, error: 'Unauthorized admin access.' }, 401);
  if (!env.DB) return respond({ success: false, error: 'Database unavailable.' }, 503);
  const body = await request.json().catch(() => ({})) as { planCode?: string; isActive?: boolean };
  const code = String(body.planCode || '');
  if (!['basic','advanced','premium'].includes(code) || typeof body.isActive !== 'boolean') return respond({ success: false, error: 'Invalid plan availability setting.' }, 400);
  try {
    const result = await env.DB.prepare('UPDATE csp_plan_prices SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE plan_code = ?').bind(body.isActive ? 1 : 0, code).run();
    if (Number(result?.meta?.changes || 0) !== 1) return respond({ success: false, error: 'Membership plan was not found.' }, 404);
    await env.DB.prepare('INSERT INTO csp_admin_audit (id, admin_username, action, details_json) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), admin, 'update_csp_plan_availability', JSON.stringify({ planCode: code, isActive: body.isActive })).run();
    return respond({ success: true, message: 'Membership plan availability updated.' });
  } catch { return respond({ success: false, error: 'Could not update plan availability. Check migration 0012.' }, 500); }
}
