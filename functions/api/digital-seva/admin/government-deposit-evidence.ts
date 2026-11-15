import { createPrivateDocumentUrl, deletePrivateDocument, uploadPrivateDocument } from '../_storage';

interface Env {
  DIGITAL_SEVA_DB?: any;
  ADMIN_SECRET_TOKEN?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  DIGITAL_SEVA_STORAGE_BUCKET?: string;
  CF_PAGES_BRANCH?: string;
}
const responseHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: responseHeaders }); }
async function hmac(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
function equal(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
async function adminUser(request: Request, env: Env): Promise<string | null> {
  const secret = env.ADMIN_SECRET_TOKEN || '';
  if (secret.length < 32 || secret.includes('YOUR_')) return null;
  const cookie = request.headers.get('Cookie') || '';
  const token = cookie.match(/(?:^|;\s*)tanshu_admin_session=([^;]+)/)?.[1];
  if (!token || token.length > 4096) return null;
  try {
    const [payload, signature, extra] = token.split('.');
    if (!payload || !signature || extra || !equal(await hmac(payload, secret), signature)) return null;
    const decoded = JSON.parse(atob(payload));
    if (decoded.role !== 'superadmin' || !decoded.exp || decoded.exp < Date.now()) return null;
    return String(decoded.u || 'superadmin');
  } catch { return null; }
}
function validOrigin(request: Request) {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}
function safeName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 100) || 'government-receipt';
}
async function sha256(bytes: ArrayBuffer) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  const actor = await adminUser(request, env);
  if (!actor) return json({ success: false, error: 'Admin login required.' }, 401);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'Preview D1 is not connected.' }, 503);
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > 6 * 1024 * 1024) return json({ success: false, error: 'Receipt upload is too large (maximum 5 MB).' }, 413);
  let form: FormData;
  try { form = await request.formData(); } catch { return json({ success: false, error: 'Invalid receipt upload.' }, 400); }
  const bookingId = String(form.get('bookingId') || '');
  const reference = String(form.get('governmentPaymentReference') || '').trim().slice(0, 120);
  const file = form.get('receipt');
  if (!bookingId || bookingId.length > 64 || reference.length < 6) return json({ success: false, error: 'Enter the official receipt/reference (at least 6 characters).' }, 400);
  if (!(file instanceof File) || file.size < 1 || file.size > 5 * 1024 * 1024) return json({ success: false, error: 'Attach a PDF, JPG or PNG receipt up to 5 MB.' }, 400);
  const allowed = new Set(['application/pdf', 'image/jpeg', 'image/png']);
  if (!allowed.has(file.type)) return json({ success: false, error: 'Only PDF, JPG and PNG receipts are accepted.' }, 415);
  const bytes = await file.arrayBuffer();
  const signature = new Uint8Array(bytes.slice(0, 8));
  const validMagic = file.type === 'application/pdf'
    ? signature[0] === 0x25 && signature[1] === 0x50 && signature[2] === 0x44 && signature[3] === 0x46
    : file.type === 'image/jpeg'
      ? signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff
      : signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4e && signature[3] === 0x47;
  if (!validMagic) return json({ success: false, error: 'The file contents do not match the selected receipt type.' }, 415);
  const booking = await env.DIGITAL_SEVA_DB.prepare(
    `SELECT b.id, b.government_fee, b.government_payment_status, b.checkout_order_id,
      (SELECT o.status FROM digital_seva_checkout_orders o WHERE o.order_id = b.checkout_order_id) AS checkout_status,
      (SELECT p.status FROM digital_seva_payments p WHERE p.booking_id = b.id ORDER BY p.created_at DESC LIMIT 1) AS link_status
     FROM digital_seva_bookings b WHERE b.id = ?`
  ).bind(bookingId).first();
  if (!booking) return json({ success: false, error: 'Booking not found.' }, 404);
  if (Number(booking.government_fee || 0) <= 0) return json({ success: false, error: 'This booking has no government fee.' }, 409);
  if (booking.checkout_status !== 'CLAIMED' && booking.link_status !== 'PAID') return json({ success: false, error: 'Customer payment must be confirmed before recording the government deposit.' }, 409);
  const id = crypto.randomUUID();
  const objectKey = `government-deposits/${bookingId}/${id}-${safeName(file.name)}`;
  const digest = await sha256(bytes);
  try {
    await uploadPrivateDocument(env, objectKey, bytes, file.type);
    try {
      await env.DIGITAL_SEVA_DB.batch([
        env.DIGITAL_SEVA_DB.prepare(
          `INSERT INTO digital_seva_government_deposit_evidence
           (id, booking_id, government_payment_reference, object_key, original_file_name, content_type, size_bytes, sha256, uploaded_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(id, bookingId, reference, objectKey, safeName(file.name), file.type, file.size, digest, actor),
        env.DIGITAL_SEVA_DB.prepare(
          `UPDATE digital_seva_bookings SET government_payment_status = 'PAID',
           government_payment_reference = ?, government_paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND government_payment_status IN ('PENDING','UNVERIFIED','PAID')`
        ).bind(reference, bookingId)
      ]);
    } catch (error) {
      await deletePrivateDocument(env, objectKey).catch(() => {});
      throw error;
    }
    return json({ success: true, bookingId, evidenceId: id, governmentPaymentStatus: 'PAID', sha256: digest });
  } catch (error) {
    console.error('Government deposit evidence upload failed:', error);
    return json({ success: false, error: 'Could not securely store the government receipt. Confirm Preview migration 0013 and private storage configuration.' }, 503);
  }
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  const actor = await adminUser(request, env);
  if (!actor) return json({ success: false, error: 'Admin login required.' }, 401);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'Preview D1 is not connected.' }, 503);
  const bookingId = new URL(request.url).searchParams.get('bookingId') || '';
  if (!bookingId || bookingId.length > 64) return json({ success: false, error: 'Invalid booking.' }, 400);
  try {
    const evidence = await env.DIGITAL_SEVA_DB.prepare(
      `SELECT object_key, original_file_name, content_type, size_bytes, government_payment_reference, created_at
       FROM digital_seva_government_deposit_evidence WHERE booking_id = ?
       ORDER BY created_at DESC LIMIT 1`
    ).bind(bookingId).first();
    if (!evidence) return json({ success: false, error: 'No government deposit receipt is attached to this booking.' }, 404);
    const url = await createPrivateDocumentUrl(env, String(evidence.object_key), 60, String(evidence.original_file_name));
    return json({ success: true, url, fileName: evidence.original_file_name, contentType: evidence.content_type, sizeBytes: evidence.size_bytes, reference: evidence.government_payment_reference, createdAt: evidence.created_at, expiresIn: 60 });
  } catch (error) {
    console.error('Government deposit evidence retrieval failed:', error);
    return json({ success: false, error: 'Could not open the stored government receipt.' }, 503);
  }
}
