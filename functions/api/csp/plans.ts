export async function onRequestGet({ env }: { env: { DB?: any } }): Promise<Response> {
  if (!env.DB) return new Response(JSON.stringify({ success: false, error: 'Database unavailable.' }), { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  try {
    const result = await env.DB.prepare('SELECT plan_code, amount_inr, duration_days FROM csp_plan_prices WHERE is_active = 1 AND amount_inr > 0 AND duration_days > 0 ORDER BY amount_inr ASC').all();
    return new Response(JSON.stringify({ success: true, plans: result.results || [] }), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Membership plans are not configured.' }), { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
}
