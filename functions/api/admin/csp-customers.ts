interface Env { DB?: any; ADMIN_SECRET_TOKEN?: string; }
async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
}
async function isAdmin(request: Request, env: Env): Promise<string | null> {
  if (!env.ADMIN_SECRET_TOKEN) return null;
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)tanshu_admin_session=([^;]+)/);
  const bearer = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  const token = bearer || (match ? decodeURIComponent(match[1]) : '');
  const [payload, signature] = token.split('.');
  if (!payload || !signature || await hmac(payload, env.ADMIN_SECRET_TOKEN) !== signature) return null;
  try {
    const data = JSON.parse(atob(payload));
    return data.exp > Date.now() && data.role ? String(data.u || 'admin') : null;
  } catch { return null; }
}
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const admin = await isAdmin(request, env);
  if (!admin) return json({ success: false, error: 'Unauthorized admin access.' }, 401);
  if (!env.DB) return json({ success: false, error: 'D1 database binding is missing.' }, 503);
  try {
    const { results } = await env.DB.prepare(
      "SELECT c.id, c.email, c.status, c.email_verified_at, c.created_at, s.plan_code, s.amount_inr, s.starts_at, s.expires_at, s.status AS subscription_status, (SELECT COUNT(*) FROM csp_payments p WHERE p.customer_id = c.id) AS payment_count FROM csp_customers c LEFT JOIN csp_subscriptions s ON s.id = (SELECT s2.id FROM csp_subscriptions s2 WHERE s2.customer_id = c.id ORDER BY s2.created_at DESC LIMIT 1) ORDER BY c.created_at DESC"
    ).all();
    const payments = await env.DB.prepare(
      "SELECT p.id, c.email, p.amount_inr, p.payment_method, p.reference, p.status, p.verified_by, p.verified_at, p.created_at FROM csp_payments p JOIN csp_customers c ON c.id = p.customer_id ORDER BY p.created_at DESC LIMIT 200"
    ).all();
    const plans = await env.DB.prepare('SELECT plan_code, amount_inr, duration_days, is_active FROM csp_plan_prices ORDER BY amount_inr ASC').all();
    return json({ success: true, customers: results || [], payments: payments.results || [], plans: plans.results || [] });
  } catch { return json({ success: false, error: 'CSP membership tables are not installed. Apply migration 0012 first.' }, 503); }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const admin = await isAdmin(request, env);
  if (!admin) return json({ success: false, error: 'Unauthorized admin access.' }, 401);
  if (!env.DB) return json({ success: false, error: 'D1 database binding is missing.' }, 503);
  const body = await request.json().catch(() => ({})) as { action?: string; customerId?: string; planCode?: string; reference?: string; notes?: string };
  const customerId = String(body.customerId || '');
  if (!customerId) return json({ success: false, error: 'Customer ID is required.' }, 400);
  try {
    const customer = await env.DB.prepare('SELECT id FROM csp_customers WHERE id = ?').bind(customerId).first();
    if (!customer) return json({ success: false, error: 'Customer not found.' }, 404);
    const now = new Date();
    if (body.action === 'activate') {
      const planCode = String(body.planCode || '');
      const plan = await env.DB.prepare('SELECT amount_inr, duration_days, is_active FROM csp_plan_prices WHERE plan_code = ?').bind(planCode).first();
      const amount = Number(plan?.amount_inr);
      const durationDays = Math.min(3650, Math.max(1, Math.floor(Number(plan?.duration_days) || 1)));
      if (!plan || Number(plan.is_active) !== 1 || !Number.isFinite(amount) || amount < 0) return json({ success: false, error: 'Choose an active membership plan.' }, 400);
      const id = crypto.randomUUID();
      const startsAt = now.toISOString();
      const expiresAt = new Date(now.getTime());
      expiresAt.setUTCDate(expiresAt.getUTCDate() + durationDays);
      await env.DB.prepare("UPDATE csp_subscriptions SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE customer_id = ? AND status = 'active'").bind(customerId).run();
      await env.DB.prepare("INSERT INTO csp_subscriptions (id, customer_id, plan_code, amount_inr, starts_at, expires_at, status, activated_by, notes) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)").bind(id, customerId, planCode, amount, startsAt, expiresAt.toISOString(), admin, body.notes || null).run();
      const pendingPayment = await env.DB.prepare("SELECT id FROM csp_payments WHERE customer_id = ? AND status = 'pending' AND reference = ? ORDER BY created_at DESC LIMIT 1").bind(customerId, 'Membership request: ' + planCode).first();
      if (pendingPayment?.id) {
        await env.DB.prepare("UPDATE csp_payments SET subscription_id = ?, amount_inr = ?, reference = ?, status = 'verified', verified_by = ?, verified_at = CURRENT_TIMESTAMP, notes = ? WHERE id = ? AND status = 'pending'").bind(id, amount, body.reference || null, admin, body.notes || 'Manually verified by admin', pendingPayment.id).run();
      } else {
        await env.DB.prepare("INSERT INTO csp_payments (id, customer_id, subscription_id, amount_inr, payment_method, reference, status, verified_by, verified_at, notes) VALUES (?, ?, ?, ?, 'manual', ?, 'verified', ?, CURRENT_TIMESTAMP, ?)").bind(crypto.randomUUID(), customerId, id, amount, body.reference || null, admin, body.notes || 'Manually verified by admin').run();
      }
      await env.DB.prepare("INSERT INTO csp_admin_audit (id, admin_username, action, customer_id, details_json) VALUES (?, ?, 'activate_membership', ?, ?)").bind(crypto.randomUUID(), admin, customerId, JSON.stringify({ planCode, durationDays, amount })).run();
      return json({ success: true, message: 'Membership activated.', subscriptionId: id, expiresAt: expiresAt.toISOString() });
    }
    if (body.action === 'suspend') {
      await env.DB.prepare("UPDATE csp_customers SET status = 'suspended', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(customerId).run();
    } else if (body.action === 'restore') {
      await env.DB.prepare("UPDATE csp_customers SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(customerId).run();
    } else if (body.action === 'expire') {
      await env.DB.prepare("UPDATE csp_subscriptions SET status = 'expired', expires_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ? AND status = 'active'").bind(customerId).run();
    } else {
      return json({ success: false, error: 'Unsupported admin action.' }, 400);
    }
    await env.DB.prepare('INSERT INTO csp_admin_audit (id, admin_username, action, customer_id, details_json) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(), admin, String(body.action), customerId, JSON.stringify({ notes: body.notes || '' })).run();
    return json({ success: true, message: 'Customer membership updated.' });
  } catch {
    return json({ success: false, error: 'Unable to update customer membership. Confirm migration 0012 is applied.' }, 500);
  }
}
