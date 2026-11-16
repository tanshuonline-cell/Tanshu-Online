export async function onRequestGet({ env }: { env: { DB?: any } }): Promise<Response> {
  if (!env.DB) return new Response(JSON.stringify({ success: false, tools: [] }), { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  try {
    const result = await env.DB.prepare('SELECT tool_id, title, access_type, enabled FROM csp_tool_settings').all();
    return new Response(JSON.stringify({ success: true, tools: result.results || [] }), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch { return new Response(JSON.stringify({ success: false, tools: [] }), { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }); }
}
