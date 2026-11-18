import { CspEnv, json, readCustomerSession } from '../_auth';

export async function onRequestGet({ request, env }: { request: Request; env: CspEnv }): Promise<Response> {
  if (!env.DB || !env.CSP_SESSION_SECRET) return json({ success: false, authenticated: false }, 503);
  const session = await readCustomerSession(request, env.CSP_SESSION_SECRET);
  if (!session) return json({ success: true, authenticated: false });
  const customer = await env.DB.prepare('SELECT id, email, status FROM csp_customers WHERE id = ?').bind(session.id).first();
  if (!customer || customer.status !== 'active') return json({ success: true, authenticated: false });
  const subscription = await env.DB.prepare(
    "SELECT plan_code, amount_inr, starts_at, expires_at FROM csp_subscriptions WHERE customer_id = ? AND status = 'active' AND datetime(starts_at) <= CURRENT_TIMESTAMP AND datetime(expires_at) > CURRENT_TIMESTAMP ORDER BY CASE plan_code WHEN 'premium' THEN 3 WHEN 'advanced' THEN 2 ELSE 1 END DESC, expires_at DESC LIMIT 1"
  ).bind(customer.id).first();
  const latestPayment = await env.DB.prepare(
    'SELECT amount_inr, status, notes, reference, created_at FROM csp_payments WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1'
  ).bind(customer.id).first();
  // Each membership tier grants only its explicitly assigned tools.
  // Basic: Passport Studio; Advanced: WhatsApp Selfie + PVC Card Maker;
  // Premium: Instant Multi Customer Photo Maker (future premium tools can be added here).
  const paidTools = subscription?.plan_code === 'premium'
    ? ['instant-multi-customer-photo-maker']
    : subscription?.plan_code === 'advanced'
      ? ['whatsapp-selfie-to-passport-photo', 'pdf-to-pvc-card-auto-cropper']
      : subscription?.plan_code === 'basic' ? ['advanced-passport-photo-studio'] : [];
  const settings = await env.DB.prepare('SELECT tool_id FROM csp_tool_settings WHERE enabled = 1').all();
  const enabledToolIds = new Set((settings.results || []).map((row: { tool_id: string }) => row.tool_id));
  return json({
    success: true,
    authenticated: true,
    customer: { id: customer.id, email: customer.email },
    subscription: subscription || null,
    latestPayment: latestPayment || null,
    allowedTools: paidTools.filter(toolId => enabledToolIds.has(toolId))
  });
}

export async function onRequestPost({ request }: { request: Request }): Promise<Response> {
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Set-Cookie': 'csp_customer_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' };
  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}
