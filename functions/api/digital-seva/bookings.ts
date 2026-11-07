// Cloudflare Pages Function: POST /api/digital-seva/bookings
// Stores only a minimal booking request. Customer documents and payments are deliberately out of scope.
interface Env { DIGITAL_SEVA_DB?: any; }

const ALLOWED_SERVICE_IDS = new Set(["pan-new","pan-correction","aadhaar-address-doc","aadhaar-address-hof","aadhaar-co","aadhaar-mobile","aadhaar-email","aadhaar-lost","aadhaar-download","certificate-income","certificate-caste","certificate-residence","certificate-correction","voter-new","voter-correction","ration-new","ration-update","scheme-check","online-form","pdf-compress","pdf-merge","pdf-split","pdf-jpg","pdf-word","pdf-edit","image-compress","signature-resize","scan-clean","typing-format"]);
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const attempts = new Map<string, { count: number; resetAt: number }>();

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}

function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}

function normalizePhone(value: unknown): string {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

function makeReference(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `DS-${date}-${suffix}`;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'Digital Seva booking is not enabled yet. The dedicated Preview database must be connected first.' }, 503);

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const current = attempts.get(ip);
  if (attempts.size > 1000) {
    for (const [key, value] of attempts) if (value.resetAt <= now) attempts.delete(key);
  }
  if (current && current.resetAt > now && current.count >= 5) {
    return json({ success: false, error: 'Too many requests. Please wait a few minutes and try again.' }, 429);
  }
  if (!current || current.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
  else attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });

  const rawBody = await request.text();
  if (rawBody.length > 8192) return json({ success: false, error: 'The booking request is too large.' }, 413);
  const body = (() => { try { return JSON.parse(rawBody); } catch { return null; } })() as any;
  if (!body || body.consent !== true) return json({ success: false, error: 'Please confirm the contact consent to continue.' }, 400);
  const serviceId = String(body.serviceId || '');
  const name = String(body.customerName || '').trim().replace(/\s+/g, ' ');
  const phone = normalizePhone(body.customerPhone);
  const email = body.customerEmail == null ? '' : String(body.customerEmail).trim();
  const termsAccepted = body.termsAccepted === true;
  const termsPolicyVersion = String(body.termsPolicyVersion || '');
  const refundPolicyAccepted = body.refundPolicyAccepted === true;
  const refundPolicyVersion = String(body.refundPolicyVersion || '');
  const key = String(body.idempotencyKey || '');
  if (!ALLOWED_SERVICE_IDS.has(serviceId)) return json({ success: false, error: 'Please select a valid service.' }, 400);
  if (name.length < 2 || name.length > 80) return json({ success: false, error: 'Please enter a name between 2 and 80 characters.' }, 400);
  if (!/^\d{10}$/.test(phone)) return json({ success: false, error: 'Please enter a valid 10-digit mobile number.' }, 400);
  if (email && (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return json({ success: false, error: 'Please enter a valid email address.' }, 400);
  if (!/^[0-9a-f-]{36}$/i.test(key)) return json({ success: false, error: 'The booking session expired. Please reopen the form.' }, 400);

  try {
    const prior = await env.DIGITAL_SEVA_DB.prepare(
      'SELECT booking_reference FROM digital_seva_bookings WHERE idempotency_key = ?'
    ).bind(key).first();
    if (prior?.booking_reference) return json({ success: true, bookingReference: prior.booking_reference, existing: true });

    const bookingId = crypto.randomUUID();
    const bookingReference = makeReference();
    await env.DIGITAL_SEVA_DB.batch([
      env.DIGITAL_SEVA_DB.prepare(
        `INSERT INTO digital_seva_bookings
         (id, booking_reference, idempotency_key, service_id, customer_name, customer_phone, customer_email, status, consent_at, terms_accepted_at, terms_policy_version, refund_policy_accepted_at, refund_policy_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'RECEIVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, ?)`
      ).bind(bookingId, bookingReference, key, serviceId, name, phone, email, termsPolicyVersion, refundPolicyVersion),
      env.DIGITAL_SEVA_DB.prepare(
        `INSERT INTO digital_seva_booking_events (id, booking_id, old_status, new_status, actor, note)
         VALUES (?, ?, NULL, 'RECEIVED', 'customer', 'Booking request submitted')`
      ).bind(crypto.randomUUID(), bookingId),
    ]);
    return json({ success: true, bookingReference, status: 'RECEIVED' }, 201);
  } catch (error) {
    console.error('Digital Seva booking save failed:', error);
    return json({ success: false, error: 'We could not save this request securely. Please try again later.' }, 503);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
