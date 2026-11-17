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
  const body = await request.json().catch(() => ({})) as { planCode?: string; amountInr?: number; durationDays?: number; isActive?: boolean };
  const code = String(body.planCode || '');
  const amount = Math.floor(Number(body.amountInr));
  const durationDays = Math.floor(Number(body.durationDays));
  const active = body.isActive === true;
  if (!['basic','advanced','premium'].includes(code) || !Number.isFinite(amount) || amount < 0 || amount > 100000 || !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 3650 || (active && amount <= 0)) return respond({ success: false, error: 'Enter a valid price and duration. Active plans must have a price greater than zero.' }, 400);
  try {
    await env.DB.prepare('UPDATE csp_plan_prices SET amount_inr = ?, duration_days = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE plan_code = ?').bind(amount, durationDays, active ? 1 : 0, code).run();
    await env.DB.prepare('INSERT INTO csp_admin_audit (id, admin_username, action, details_json) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), admin, 'update_csp_plan_price', JSON.stringify({ planCode: code, amountInr: amount, durationDays, isActive: active })).run();
    return respond({ success: true, message: 'Membership price updated.' });
  } catch { return respond({ success: false, error: 'Could not update membership price. Apply migration 0012 first.' }, 500); }
}
