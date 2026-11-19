export async function onRequestGet({ env }: { env: { DB?: any } }): Promise<Response> {
  if (!env.DB) return new Response(JSON.stringify({ success: false, error: 'Database unavailable.' }), { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  try {
    const result = await env.DB.prepare('SELECT plan_code FROM csp_plan_prices WHERE is_active = 1').all();
    const fixedPlans: Record<string, { amount_inr: number; duration_days: number }> = {
      basic: { amount_inr: 99, duration_days: 30 },
      advanced: { amount_inr: 199, duration_days: 30 },
      premium: { amount_inr: 299, duration_days: 30 }
    };
    const plans = (result.results || []).flatMap((row: { plan_code: string }) => fixedPlans[row.plan_code] ? [{ plan_code: row.plan_code, ...fixedPlans[row.plan_code] }] : []);
    plans.sort((a: { amount_inr: number }, b: { amount_inr: number }) => a.amount_inr - b.amount_inr);
    return new Response(JSON.stringify({ success: true, plans }), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Membership plans are not configured.' }), { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
}
