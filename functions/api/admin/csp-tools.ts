interface Env { DB?: any; ADMIN_SECRET_TOKEN?: string; }
async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
async function getAdmin(request: Request, env: Env): Promise<string | null> {
  if (!env.ADMIN_SECRET_TOKEN) return null;
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)tanshu_admin_session=([^;]+)/);
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim() || (match ? decodeURIComponent(match[1]) : '');
  const [payload, signature] = token.split('.');
  if (!payload || !signature || await sign(payload, env.ADMIN_SECRET_TOKEN) !== signature) return null;
  try { const data = JSON.parse(atob(payload)); return data.exp > Date.now() ? String(data.u || 'admin') : null; } catch { return null; }
}
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!await getAdmin(request, env)) return response({ success: false, error: 'Unauthorized admin access.' }, 401);
  if (!env.DB) return response({ success: false, error: 'Database unavailable.' }, 503);
  try {
    const result = await env.DB.prepare('SELECT tool_id, title, access_type, enabled FROM csp_tool_settings ORDER BY access_type, title').all();
    return response({ success: true, tools: result.results || [] });
  } catch { return response({ success: false, error: 'Apply migration 0012 before managing tools.' }, 503); }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const admin = await getAdmin(request, env);
  if (!admin) return response({ success: false, error: 'Unauthorized admin access.' }, 401);
  if (!env.DB) return response({ success: false, error: 'Database unavailable.' }, 503);
  const body = await request.json().catch(() => ({})) as { toolId?: string; enabled?: boolean };
  if (!body.toolId || typeof body.enabled !== 'boolean') return response({ success: false, error: 'Tool ID and enabled state are required.' }, 400);
  try {
    const result = await env.DB.prepare('UPDATE csp_tool_settings SET enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE tool_id = ?').bind(body.enabled ? 1 : 0, body.toolId).run();
    if (!result?.meta?.changes) return response({ success: false, error: 'Unknown CSP tool.' }, 404);
    await env.DB.prepare('INSERT INTO csp_admin_audit (id, admin_username, action, details_json) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), admin, 'update_csp_tool_setting', JSON.stringify({ toolId: body.toolId, enabled: body.enabled })).run();
    return response({ success: true, message: 'Tool availability updated.' });
  } catch { return response({ success: false, error: 'Could not update tool setting.' }, 500); }
}
