// Public, reference-only Digital Seva status lookup. Never returns customer PII or uploaded documents.
interface Env { DIGITAL_SEVA_DB?: any; }
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const attempts = new Map<string, { count: number; resetAt: number }>();
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers }); }
function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'Status tracking is not enabled yet.' }, 503);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const current = attempts.get(ip);
  if (attempts.size > 1000) for (const [key, value] of attempts) if (value.resetAt <= now) attempts.delete(key);
  if (current && current.resetAt > now && current.count >= 12) return json({ success: false, error: 'Too many status checks. Please wait a few minutes and try again.' }, 429);
  if (!current || current.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
  else attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });
  const raw = await request.text();
  if (raw.length > 1024) return json({ success: false, error: 'The tracking request is too large.' }, 413);
  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ success: false, error: 'Enter a valid booking reference.' }, 400); }
  const reference = String(body?.bookingReference || '').trim().toUpperCase();
  if (!/^DS-\\d{8}-[0-9A-F]{10}$/.test(reference)) return json({ success: false, error: 'Enter the complete booking reference printed on your receipt.' }, 400);
  try {
    const booking = await env.DIGITAL_SEVA_DB.prepare(
      'SELECT id, booking_reference, service_id, status, created_at, updated_at, estimated_completion_at FROM digital_seva_bookings WHERE booking_reference = ?'
    ).bind(reference).first();
    if (!booking) return json({ success: false, error: 'No request was found for this booking reference. Please check the number and try again.' }, 404);
    const eventResult = await env.DIGITAL_SEVA_DB.prepare(
      'SELECT old_status, new_status, note, created_at FROM digital_seva_booking_events WHERE booking_id = ? ORDER BY created_at ASC'
    ).bind(booking.id).all();
    return json({
      success: true,
      booking: {
        bookingReference: booking.booking_reference,
        serviceId: booking.service_id,
        status: booking.status,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
        estimatedCompletionAt: booking.estimated_completion_at || null,
        events: (eventResult.results || []).map((event: any) => ({
          oldStatus: event.old_status,
          status: event.new_status,
          note: event.note || '',
          createdAt: event.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Digital Seva status lookup failed:', error);
    return json({ success: false, error: 'Could not load this request status. Please try again later.' }, 503);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
