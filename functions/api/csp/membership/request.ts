import { CspEnv, json, readCustomerSession } from '../_auth';

export async function onRequestPost({ request, env }: { request: Request; env: CspEnv }): Promise<Response> {
  if (!env.DB || !env.CSP_SESSION_SECRET) return json({ success: false, error: 'Membership request service is not configured.' }, 503);
  const session = await readCustomerSession(request, env.CSP_SESSION_SECRET);
  if (!session) return json({ success: false, error: 'Please verify your Gmail before requesting a membership.' }, 401);
  const body = await request.json().catch(() => ({})) as { planCode?: string };
  const planCode = String(body.planCode || '').toLowerCase();
  if (!['basic', 'advanced', 'premium'].includes(planCode)) return json({ success: false, error: 'Choose a valid membership plan.' }, 400);
  try {
    const customer = await env.DB.prepare("SELECT id FROM csp_customers WHERE id = ? AND status = 'active'").bind(session.id).first();
    if (!customer) return json({ success: false, error: 'Customer account is unavailable.' }, 403);
    const plan = await env.DB.prepare('SELECT amount_inr FROM csp_plan_prices WHERE plan_code = ? AND is_active = 1').bind(planCode).first();
    if (!plan) return json({ success: false, error: 'This membership plan is currently unavailable.' }, 404);
    const pending = await env.DB.prepare("SELECT id FROM csp_payments WHERE customer_id = ? AND status = 'pending' AND reference = ? AND created_at >= datetime('now', '-30 minutes') ORDER BY created_at DESC LIMIT 1").bind(customer.id, 'Membership request: ' + planCode).first();
    if (pending) return json({ success: true, requestId: pending.id, message: 'Your membership request is already waiting for admin review.' });
    const id = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO csp_payments (id, customer_id, amount_inr, payment_method, reference, status, notes) VALUES (?, ?, ?, 'manual', ?, 'pending', ?)").bind(id, customer.id, Number(plan.amount_inr), 'Membership request: ' + planCode, 'Customer requested plan; awaiting payment instructions and manual verification.').run();
    return json({ success: true, requestId: id, message: 'Membership request sent. Admin can now see your selected plan and will share payment instructions. Access unlocks only after payment is verified.' });
  } catch {
    return json({ success: false, error: 'Could not submit the membership request. Please try again later.' }, 500);
  }
}
