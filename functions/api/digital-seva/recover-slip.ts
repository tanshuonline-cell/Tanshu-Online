import { normalizeIndianMobile } from '../../../src/features/digital-seva/smartValidation';
import { getAutoPaymentQuote } from '../../../src/features/digital-seva/autoPaymentPricing';

interface Env { DIGITAL_SEVA_DB?: any; DIGITAL_SEVA_PII_SECRET?: string; ADMIN_SECRET_TOKEN?: string; }
const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const attempts = new Map<string, { count: number; resetAt: number }>();
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers }); }
function fromBase64(value: string): ArrayBuffer {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer as ArrayBuffer;
}

async function decryptIdentifier(value: string, secrets: string[]): Promise<string> {
  const parts = value.split(':');
  if (parts.length !== 4 || parts[0] !== 'enc' || parts[1] !== 'v1') throw new Error('Encrypted identifier format is invalid.');
  for (const secret of secrets) {
    if (secret.length < 32) continue;
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`TANSHU-ONLINE-DIGITAL-SEVA-PII-v1:${secret}`));
      const key = await crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['decrypt']);
      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(parts[2]) }, key, fromBase64(parts[3]));
      return new TextDecoder().decode(decrypted);
    } catch { /* Try the legacy configured key, if present. */ }
  }
  throw new Error('Could not decrypt the saved application details.');
}

async function revealApplicationDetails(raw: string | null, secrets: string[]): Promise<any> {
  let details: any = {};
  try { details = JSON.parse(String(raw || '{}')); } catch { return {}; }
  if (!details || typeof details !== 'object' || Array.isArray(details)) return {};
  const sensitiveKey = /^(aadhaarnumber|hofaadhaarnumber|aadhaarno|existingpannumber|pannumber)$/i;
  for (const collection of [details.fieldValues, details.serviceOptions]) {
    if (!collection || typeof collection !== 'object') continue;
    for (const [field, value] of Object.entries(collection)) {
      if (sensitiveKey.test(field) && typeof value === 'string' && value.startsWith('enc:v1:')) {
        collection[field] = await decryptIdentifier(value, secrets);
      }
    }
  }
  return details;
}

function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'Slip recovery is not enabled.' }, 503);

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const current = attempts.get(ip);
  if (attempts.size > 1000) for (const [key, value] of attempts) if (value.resetAt <= now) attempts.delete(key);
  if (current && current.resetAt > now && current.count >= 5) return json({ success: false, error: 'Too many attempts. Please wait a few minutes and try again.' }, 429);
  if (!current || current.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
  else attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });

  const raw = await request.text();
  if (raw.length > 2048) return json({ success: false, error: 'The recovery request is too large.' }, 413);
  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ success: false, error: 'Enter your submitted details and try again.' }, 400); }

  const phone = normalizeIndianMobile(body?.phone);
  const name = String(body?.name || '').trim().replace(/\s+/g, ' ');
  const email = String(body?.email || '').trim().toLowerCase();
  if (!/^\d{10}$/.test(phone) || name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ success: false, error: 'Enter the same mobile number, applicant name and email used in your application.' }, 400);
  }

  try {
    const result = await env.DIGITAL_SEVA_DB.prepare(
      `SELECT id, booking_reference, service_id, customer_name, customer_phone, customer_email,
              application_details_json, status, created_at, updated_at, estimated_completion_at,
              terms_accepted_at, terms_policy_version, refund_policy_accepted_at, refund_policy_version
       FROM digital_seva_bookings
       WHERE customer_phone = ?
         AND lower(trim(customer_name)) = lower(trim(?))
         AND lower(trim(COALESCE(customer_email, ''))) = lower(trim(?))
       ORDER BY created_at DESC LIMIT 5`
    ).bind(phone, name, email).all();

    const bookings = await Promise.all((result.results || []).map(async (row: any) => {
      const details = await revealApplicationDetails(row.application_details_json, [env.DIGITAL_SEVA_PII_SECRET || '', env.ADMIN_SECRET_TOKEN || ''].filter((secret, index, all) => Boolean(secret) && all.indexOf(secret) === index));
      const quote = getAutoPaymentQuote(String(row.service_id || ''));
      return {
        bookingReference: row.booking_reference,
        serviceId: row.service_id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        customerEmail: row.customer_email || '',
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        estimatedCompletionAt: row.estimated_completion_at || null,
        termsAcceptedAt: row.terms_accepted_at || null,
        termsPolicyVersion: row.terms_policy_version || null,
        refundAcceptedAt: row.refund_policy_accepted_at || null,
        refundPolicyVersion: row.refund_policy_version || null,
        fieldValues: details.fieldValues && typeof details.fieldValues === 'object' ? details.fieldValues : {},
        serviceOptions: details.serviceOptions && typeof details.serviceOptions === 'object' ? details.serviceOptions : {},
        corrections: Array.isArray(details.corrections) ? details.corrections : [],
        selectedDocuments: Array.isArray(details.selectedDocuments) ? details.selectedDocuments : [],
        otherDocumentName: String(details.otherDocumentName || ''),
        taskDetails: String(details.taskDetails || ''),
        feeBreakdown: quote ? {
          governmentFee: quote.governmentFee,
          tanshuFee: quote.tanshuFee,
          totalAmount: quote.totalAmount,
          paymentStatus: 'PAID / भुगतान सफल'
        } : null
      };
    }));

    if (!bookings.length) return json({ success: false, error: 'No matching application was found. Check that all three details exactly match your submitted application.' }, 404);
    return json({ success: true, bookings });
  } catch (error) {
    console.error('Digital Seva customer slip recovery failed:', error);
    return json({ success: false, error: 'Could not recover the application slip right now. Please try again later.' }, 503);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
