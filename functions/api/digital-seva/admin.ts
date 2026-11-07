// Cloudflare Pages Function: /api/digital-seva/admin
// Admin-only booking list and status updates. Uses the existing signed superadmin session cookie.
interface Env { DIGITAL_SEVA_DB?: any; ADMIN_SECRET_TOKEN?: string; }
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const ALLOWED_STATUSES = new Set(['RECEIVED', 'IN_REVIEW', 'WAITING_FOR_CUSTOMER', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);

function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers }); }

async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function adminUser(request: Request, env: Env): Promise<string | null> {
  const secret = env.ADMIN_SECRET_TOKEN;
  if (!secret || secret.includes('YOUR_')) return null;
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)tanshu_admin_session=([^;]+)/);
  const token = match?.[1];
  if (!token || token.length > 4096) return null;
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature || !constantTimeEqual(await hmac(payload, secret), signature)) return null;
    const decoded = JSON.parse(atob(payload));
    if (decoded.role !== 'superadmin' || !decoded.exp || decoded.exp < Date.now()) return null;
    return String(decoded.u || 'superadmin');
  } catch { return null; }
}

function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const actor = await adminUser(request, env);
  if (!actor) return json({ success: false, error: 'Admin login required.' }, 401);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'The dedicated Digital Seva Preview database is not connected.' }, 503);
  try {
    const result = await env.DIGITAL_SEVA_DB.prepare(
      `SELECT id, booking_reference, service_id, customer_name, customer_phone, customer_email, requester_type, application_for, operator_name, operator_phone, operator_email, centre_name, centre_address, agency_name, agency_address, application_details_json, status, terms_accepted_at, terms_policy_version, refund_policy_accepted_at, refund_policy_version, created_at, updated_at
       FROM digital_seva_bookings ORDER BY created_at DESC LIMIT 200`
    ).all();
    return json({ success: true, bookings: result.results || [] });
  } catch (error) {
    console.error('Digital Seva admin list failed:', error);
    return json({ success: false, error: 'Could not load booking records. Confirm the Preview migration has been applied.' }, 503);
  }
}

export async function onRequestPatch({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  const actor = await adminUser(request, env);
  if (!actor) return json({ success: false, error: 'Admin login required.' }, 401);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'The dedicated Digital Seva Preview database is not connected.' }, 503);
  const rawBody = await request.text();
  if (rawBody.length > 4096) return json({ success: false, error: 'The status update is too large.' }, 413);
  const body = (() => { try { return JSON.parse(rawBody); } catch { return null; } })() as any;
  const id = String(body?.bookingId || '');
  const nextStatus = String(body?.status || '');
  const note = String(body?.note || '').trim().slice(0, 500);
  if (!id || id.length > 64 || !ALLOWED_STATUSES.has(nextStatus)) return json({ success: false, error: 'Invalid booking or status.' }, 400);
  try {
    const current = await env.DIGITAL_SEVA_DB.prepare('SELECT status FROM digital_seva_bookings WHERE id = ?').bind(id).first();
    if (!current) return json({ success: false, error: 'Booking not found.' }, 404);
    if (current.status === nextStatus) return json({ success: true, unchanged: true });
    await env.DIGITAL_SEVA_DB.batch([
      env.DIGITAL_SEVA_DB.prepare('UPDATE digital_seva_bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(nextStatus, id),
      env.DIGITAL_SEVA_DB.prepare(
        'INSERT INTO digital_seva_booking_events (id, booking_id, old_status, new_status, actor, note) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(crypto.randomUUID(), id, current.status, nextStatus, actor, note || null),
    ]);
    return json({ success: true, bookingId: id, status: nextStatus });
  } catch (error) {
    console.error('Digital Seva status update failed:', error);
    return json({ success: false, error: 'Could not update this booking. Please retry.' }, 503);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
