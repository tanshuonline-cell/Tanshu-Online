// Cloudflare Pages Function: /api/digital-seva/admin
// Admin-only booking and private document operations. Uses the existing signed superadmin session cookie.
import { createPrivateDocumentUrl, deletePrivateDocument } from './_storage';
interface Env { DIGITAL_SEVA_DB?: any; ADMIN_SECRET_TOKEN?: string; DIGITAL_SEVA_PII_SECRET?: string; SUPABASE_URL?: string; SUPABASE_SECRET_KEY?: string; }
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


function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function revealApplicationDetails(raw: string | null, secret: string): Promise<string | null> {
  if (!raw) return raw;
  let details: any;
  try { details = JSON.parse(raw); } catch { return raw; }
  if (!details || typeof details !== 'object' || Array.isArray(details)) return raw;
  const sensitiveKey = /^(aadhaarnumber|hofaadhaarnumber|aadhaarno|existingpannumber|pannumber)$/i;
  const encryptedValues = [details.fieldValues, details.serviceOptions].some((collection) =>
    collection && typeof collection === 'object' && Object.entries(collection).some(([key, value]) => sensitiveKey.test(key) && typeof value === 'string' && value.startsWith('enc:v1:'))
  );
  if (!encryptedValues) return raw;
  if (secret.length < 32) throw new Error('Digital Seva PII decryption secret is missing or too short.');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`TANSHU-ONLINE-DIGITAL-SEVA-PII-v1:${secret}`));
  const key = await crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['decrypt']);
  for (const collection of [details.fieldValues, details.serviceOptions]) {
    if (!collection || typeof collection !== 'object') continue;
    for (const [field, value] of Object.entries(collection)) {
      if (!sensitiveKey.test(field) || typeof value !== 'string' || !value.startsWith('enc:v1:')) continue;
      const parts = value.split(':');
      if (parts.length !== 4 || parts[1] !== 'v1') throw new Error('Encrypted Digital Seva identifier has an invalid format.');
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(parts[2]) }, key, fromBase64(parts[3]));
      collection[field] = new TextDecoder().decode(decrypted);
    }
  }
  return JSON.stringify(details);
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
      `SELECT id, booking_reference, service_id, customer_name, customer_phone, customer_email, requester_type, application_for, operator_name, operator_phone, operator_email, centre_name, centre_address, agency_name, agency_address, application_details_json, status, estimated_completion_at, consent_at, terms_accepted_at, terms_policy_version, refund_policy_accepted_at, refund_policy_version, created_at, updated_at
       FROM digital_seva_bookings ORDER BY created_at DESC LIMIT 200`
    ).all();
    const documentResult = await env.DIGITAL_SEVA_DB.prepare(
      `SELECT id, booking_id, document_type, original_file_name, content_type, size_bytes, created_at
       FROM digital_seva_documents ORDER BY created_at DESC`
    ).all();
    const grouped = new Map<string, any[]>();
    for (const doc of documentResult.results || []) {
      const list = grouped.get(doc.booking_id) || [];
      list.push({ id: doc.id, documentType: doc.document_type, fileName: doc.original_file_name, contentType: doc.content_type, sizeBytes: doc.size_bytes, createdAt: doc.created_at });
      grouped.set(doc.booking_id, list);
    }
    const bookings = await Promise.all((result.results || []).map(async (booking: any) => ({
      ...booking,
      application_details_json: await revealApplicationDetails(booking.application_details_json, env.DIGITAL_SEVA_PII_SECRET || env.ADMIN_SECRET_TOKEN || ''),
      documents: grouped.get(booking.id) || []
    })));
    return json({ success: true, bookings });
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
  const estimateInput = String(body?.estimatedCompletionAt || '').trim();
  let estimatedCompletionAt: string | null = null;
  if (estimateInput) {
    const estimateDate = new Date(estimateInput);
    if (!Number.isFinite(estimateDate.getTime())) return json({ success: false, error: 'Enter a valid estimated completion time.' }, 400);
    estimatedCompletionAt = estimateDate.toISOString();
  }
  if (!id || id.length > 64 || !ALLOWED_STATUSES.has(nextStatus)) {
    return json({ success: false, error: 'Invalid booking or status.' }, 400);
  }
  try {
    const current = await env.DIGITAL_SEVA_DB.prepare('SELECT status, estimated_completion_at FROM digital_seva_bookings WHERE id = ?').bind(id).first();
    if (!current) return json({ success: false, error: 'Booking not found.' }, 404);
    if (current.status === nextStatus && (current.estimated_completion_at || null) === estimatedCompletionAt && !note) return json({ success: true, unchanged: true });
    await env.DIGITAL_SEVA_DB.batch([
      env.DIGITAL_SEVA_DB.prepare('UPDATE digital_seva_bookings SET status = ?, estimated_completion_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(nextStatus, estimatedCompletionAt, id),
      env.DIGITAL_SEVA_DB.prepare(
        'INSERT INTO digital_seva_booking_events (id, booking_id, old_status, new_status, actor, note) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(crypto.randomUUID(), id, current.status, nextStatus, actor, note || null),
    ]);
    return json({ success: true, bookingId: id, status: nextStatus, estimatedCompletionAt });
  } catch (error) {
    console.error('Digital Seva status update failed:', error);
    return json({ success: false, error: 'Could not update this booking. Confirm migration 0007 is applied, then retry.' }, 503);
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  const actor = await adminUser(request, env);
  if (!actor) return json({ success: false, error: 'Admin login required.' }, 401);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'The dedicated Digital Seva Preview database is not connected.' }, 503);
  const rawBody = await request.text();
  if (rawBody.length > 2048) return json({ success: false, error: 'The document request is too large.' }, 413);
  const body = (() => { try { return JSON.parse(rawBody); } catch { return null; } })() as any;
  const documentId = String(body?.documentId || '');
  if (!documentId || documentId.length > 64) return json({ success: false, error: 'Invalid document.' }, 400);
  try {
    const doc = await env.DIGITAL_SEVA_DB.prepare('SELECT object_key FROM digital_seva_documents WHERE id = ?').bind(documentId).first();
    if (!doc?.object_key) return json({ success: false, error: 'Document not found.' }, 404);
    const downloadName = typeof body?.download === 'string' ? body.download.slice(0, 120) : undefined;
    const url = await createPrivateDocumentUrl(env, String(doc.object_key), 60, downloadName);
    return json({ success: true, url, expiresIn: 60 });
  } catch (error) {
    console.error('Digital Seva secure document link failed:', error);
    return json({ success: false, error: 'Could not create a secure document link.' }, 503);
  }
}

export async function onRequestDelete({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  const actor = await adminUser(request, env);
  if (!actor) return json({ success: false, error: 'Admin login required.' }, 401);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'The dedicated Digital Seva Preview database is not connected.' }, 503);
  const rawBody = await request.text();
  if (rawBody.length > 2048) return json({ success: false, error: 'The document request is too large.' }, 413);
  const body = (() => { try { return JSON.parse(rawBody); } catch { return null; } })() as any;
  const documentId = String(body?.documentId || '');
  if (!documentId || documentId.length > 64) return json({ success: false, error: 'Invalid document.' }, 400);
  try {
    const doc = await env.DIGITAL_SEVA_DB.prepare('SELECT object_key FROM digital_seva_documents WHERE id = ?').bind(documentId).first();
    if (!doc?.object_key) return json({ success: false, error: 'Document not found.' }, 404);
    await deletePrivateDocument(env, String(doc.object_key));
    await env.DIGITAL_SEVA_DB.prepare('DELETE FROM digital_seva_documents WHERE id = ?').bind(documentId).run();
    return json({ success: true, documentId });
  } catch (error) {
    console.error('Digital Seva document deletion failed:', error);
    return json({ success: false, error: 'Could not delete this document. Please retry.' }, 503);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'GET, PATCH, POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
