import { getAutoPaymentQuote } from '../../../src/features/digital-seva/autoPaymentPricing';
import { cashfreeApiBase } from './_cashfree';

interface Env {
  DIGITAL_SEVA_DB?: any;
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_ENVIRONMENT?: string;
  DIGITAL_SEVA_PII_SECRET?: string;
  ADMIN_SECRET_TOKEN?: string;
}

const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const attempts = new Map<string, { count: number; resetAt: number }>();
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers }); }
function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}
function normalizePhone(value: unknown): string {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
}
function rateLimit(request: Request, action: string): boolean {
  const key = `${request.headers.get('cf-connecting-ip') || 'unknown'}:${action}`;
  const now = Date.now();
  const current = attempts.get(key);
  if (attempts.size > 1000) for (const [entry, value] of attempts) if (value.resetAt <= now) attempts.delete(entry);
  const limit = action === 'save' ? 180 : action === 'status' ? 60 : 8;
  if (current && current.resetAt > now && current.count >= limit) return false;
  if (!current || current.resetAt <= now) attempts.set(key, { count: 1, resetAt: now + 10 * 60 * 1000 });
  else attempts.set(key, { count: current.count + 1, resetAt: current.resetAt });
  return true;
}
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
async function encryptionKey(env: Env): Promise<CryptoKey> {
  const secret = String(env.DIGITAL_SEVA_PII_SECRET || env.ADMIN_SECRET_TOKEN || '');
  if (secret.length < 32) throw new Error('Secure application draft encryption is not configured.');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`TANSHU-ONLINE-DIGITAL-SEVA-DRAFT-v2:${secret}`));
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}
async function seal(env: Env, value: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await encryptionKey(env), new TextEncoder().encode(JSON.stringify(value)));
  return JSON.stringify({ version: 2, iv: toBase64(iv), data: toBase64(new Uint8Array(encrypted)) });
}
async function unseal(env: Env, value: string): Promise<any> {
  const record = JSON.parse(value);
  if (record?.version !== 2 || typeof record.iv !== 'string' || typeof record.data !== 'string') throw new Error('The saved recovery draft is invalid.');
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(record.iv) }, await encryptionKey(env), fromBase64(record.data));
  return JSON.parse(new TextDecoder().decode(plain));
}
async function identityKey(phone: string, name: string, email: string): Promise<string> {
  const normalized = [normalizePhone(phone), name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-IN'), email.trim().toLowerCase()].join('|');
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized)));
  return Array.from(digest).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
async function verifiedPaidOrder(env: Env, orderId: string, serviceId?: string) {
  if (!env.DIGITAL_SEVA_DB || !env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) throw new Error('Payment recovery is not configured.');
  const local = await env.DIGITAL_SEVA_DB.prepare(
    'SELECT order_id, service_id, customer_phone, amount, currency, status FROM digital_seva_checkout_orders WHERE order_id = ?'
  ).bind(orderId).first();
  if (!local || !['PENDING', 'PAID'].includes(String(local.status))) return null;
  if (serviceId && local.service_id !== serviceId) return null;
  const quote = getAutoPaymentQuote(String(local.service_id || ''));
  if (!quote || String(local.currency).toUpperCase() !== 'INR' || Math.round(Number(local.amount) * 100) !== Math.round(quote.totalAmount * 100)) return null;
  const response = await fetch(`${cashfreeApiBase(env)}/orders/${encodeURIComponent(orderId)}`, {
    headers: { 'x-client-id': env.CASHFREE_APP_ID, 'x-client-secret': env.CASHFREE_SECRET_KEY, 'x-api-version': '2022-09-01' }
  });
  const order = await response.json().catch(() => ({})) as any;
  if (!response.ok || String(order.order_id || '') !== orderId || String(order.order_status || '').toUpperCase() !== 'PAID' ||
      String(order.order_currency || '').toUpperCase() !== 'INR' || Math.round(Number(order.order_amount) * 100) !== Math.round(quote.totalAmount * 100)) return null;
  return { local, order, quote };
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  if (!validOrigin(request)) return json({ success: false, error: 'Request origin was not accepted.' }, 403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().includes('application/json')) return json({ success: false, error: 'A JSON request is required.' }, 415);
  if (!env.DIGITAL_SEVA_DB) return json({ success: false, error: 'Digital Seva database is unavailable.' }, 503);
  const raw = await request.text();
  if (raw.length > 48 * 1024) return json({ success: false, error: 'The recovery draft is too large.' }, 413);
  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ success: false, error: 'The recovery request is invalid.' }, 400); }
  const action = String(body?.action || '');
  if (!rateLimit(request, action)) return json({ success: false, error: 'Too many recovery attempts. Please wait a few minutes.' }, 429);

  try {
    if (action === 'status') {
      const orderId = String(body.orderId || '');
      if (!/^ds_[0-9a-f]{32}$/i.test(orderId)) return json({ success: false, error: 'Invalid payment reference.' }, 400);
      const local = await env.DIGITAL_SEVA_DB.prepare(
        'SELECT order_id, service_id, status, booking_id FROM digital_seva_checkout_orders WHERE order_id = ?'
      ).bind(orderId).first();
      if (!local) return json({ success: true, state: 'CLOSED' });
      const linkedBooking = await env.DIGITAL_SEVA_DB.prepare(
        'SELECT booking_reference FROM digital_seva_bookings WHERE checkout_order_id = ? LIMIT 1'
      ).bind(orderId).first();
      if (String(local.status) === 'CLAIMED' || local.booking_id || linkedBooking?.booking_reference) {
        return json({ success: true, state: 'SUBMITTED' });
      }
      if (!['PENDING', 'PAID'].includes(String(local.status))) {
        return json({ success: true, state: 'CLOSED' });
      }
      const verified = await verifiedPaidOrder(env, orderId, String(local.service_id || ''));
      if (verified) return json({ success: true, state: 'PAID' });
      return json({ success: true, state: String(local.status) === 'PAID' ? 'VERIFYING' : 'PENDING' });
    }

    if (action === 'save') {
      const orderId = String(body.orderId || '');
      const draft = body.draft;
      if (!/^ds_[0-9a-f]{32}$/i.test(orderId) || !draft || typeof draft !== 'object' || Array.isArray(draft)) return json({ success: false, error: 'The recovery draft details are invalid.' }, 400);
      const serviceId = String(draft.serviceId || '');
      const applicant = draft.applicant && typeof draft.applicant === 'object' ? draft.applicant : {};
      const phone = normalizePhone(applicant.phone);
      const name = String(applicant.name || '').trim().replace(/\s+/g, ' ');
      const email = String(applicant.email || '').trim().toLowerCase();
      if (!/^\d{10}$/.test(phone) || name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return json({ success: false, error: 'Complete applicant mobile, name and email before enabling online recovery.' }, 400);
      }
      const verified = await verifiedPaidOrder(env, orderId, serviceId);
      const paymentContactPhone = normalizePhone(draft.paymentContactPhone || applicant.phone);
      if (!verified || !/^\d{10}$/.test(paymentContactPhone) || normalizePhone(verified.local.customer_phone) !== paymentContactPhone) {
        return json({ success: false, error: 'This paid request does not match the verified payer contact. Do not pay again; check the existing payment.' }, 409);
      }
      const identity = await identityKey(phone, name, email);
      const encrypted = await seal(env, { ...draft, documentFiles: undefined });
      await env.DIGITAL_SEVA_DB.prepare(
        `INSERT INTO digital_seva_paid_drafts (id, order_id, identity_key, service_id, encrypted_draft_json, saved_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(order_id) DO UPDATE SET identity_key = excluded.identity_key, service_id = excluded.service_id,
           encrypted_draft_json = excluded.encrypted_draft_json, saved_at = excluded.saved_at, updated_at = CURRENT_TIMESTAMP`
      ).bind(crypto.randomUUID(), orderId, identity, serviceId, encrypted, Date.now()).run();
      await env.DIGITAL_SEVA_DB.prepare(
        `DELETE FROM digital_seva_paid_drafts WHERE order_id IN (
          SELECT order_id FROM (
            SELECT order_id, ROW_NUMBER() OVER (ORDER BY saved_at DESC) AS row_num
            FROM digital_seva_paid_drafts WHERE identity_key = ?
          ) WHERE row_num > 10
        )`
      ).bind(identity).run();
      return json({ success: true, savedAt: Date.now() });
    }

    if (action === 'recover') {
      const phone = normalizePhone(body.phone);
      const name = String(body.name || '').trim().replace(/\s+/g, ' ');
      const email = String(body.email || '').trim().toLowerCase();
      if (!/^\d{10}$/.test(phone) || name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return json({ success: false, error: 'Enter the same mobile, full name and email used in the application.' }, 400);
      }
      const identity = await identityKey(phone, name, email);
      const { results } = await env.DIGITAL_SEVA_DB.prepare(
        'SELECT order_id, service_id, encrypted_draft_json, saved_at FROM digital_seva_paid_drafts WHERE identity_key = ? ORDER BY saved_at DESC LIMIT 10'
      ).bind(identity).all();
      const drafts = [];
      for (const record of results || []) {
        const verified = await verifiedPaidOrder(env, String(record.order_id || ''), String(record.service_id || ''));
        if (!verified) continue;
        const draft = await unseal(env, String(record.encrypted_draft_json || ''));
        const applicant = draft?.applicant && typeof draft.applicant === 'object' ? draft.applicant : {};
        if (normalizePhone(applicant.phone) !== phone ||
            String(applicant.email || '').trim().toLowerCase() !== email ||
            String(applicant.name || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-IN') !== name.toLocaleLowerCase('en-IN')) continue;
        drafts.push({
          orderId: record.order_id,
          serviceId: record.service_id,
          amount: verified.quote.totalAmount,
          customerName: String(verified.order.customer_details?.customer_name || applicant.name),
          customerPhone: String(verified.order.customer_details?.customer_phone || applicant.phone),
          customerEmail: String(verified.order.customer_details?.customer_email || applicant.email),
          savedAt: Number(record.saved_at),
          draft
        });
      }
      return json({ success: true, drafts });
    }
    return json({ success: false, error: 'Unknown recovery action.' }, 400);
  } catch (error) {
    console.error('Digital Seva request draft operation failed:', error);
    return json({ success: false, error: 'Secure request recovery is temporarily unavailable. Your payment is not affected; do not pay again.' }, 503);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}