import { getAutoPaymentQuote } from '../../../src/features/digital-seva/autoPaymentPricing';
import { cashfreeApiBase } from './_cashfree';

interface Env {
  DIGITAL_SEVA_DB?: any;
  CASHFREE_APP_ID?: string;
  CASHFREE_SECRET_KEY?: string;
  CASHFREE_ENVIRONMENT?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  DIGITAL_SEVA_STORAGE_BUCI?: string;
  DIGITAL_SEVA_STORAGE_BUCKET?: string;
  DIGITAL_SEVA_PII_SECRET?: string;
  ADMIN_SECRET_TOKEN?: string;
  CF_PAGES_BRANCH?: string;
}

const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const attempts = new Map<string, { count: number; resetAt: number }>();
const PREVIEW_BUCKET = 'digital-seva-preview-docs';
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers }); }
function validOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return Boolean(origin) && origin === new URL(request.url).origin;
}
function storageConfig(env: Env) {
  const base = String(env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = String(env.SUPABASE_SECRET_KEY || '');
  const bucket = String(env.DIGITAL_SEVA_STORAGE_BUCI || env.DIGITAL_SEVA_STORAGE_BUCKET || '').trim()
    || (String(env.CF_PAGES_BRANCH || '').toLowerCase() === 'main' ? '' : PREVIEW_BUCKET);
  if (!base || !key || !bucket) throw new Error('Private draft storage is not configured.');
  const parsed = new URL(base);
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co')) throw new Error('Private draft storage URL is invalid.');
  const auth = { apikey: key, ...(key.startsWith('eyJ') && key.split('.').length === 3 ? { Authorization: `Bearer ${key}` } : {}) };
  return { base, bucket, auth };
}
function objectUrl(base: string, bucket: string, key: string) {
  return `${base}/storage/v1/object/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
}
async function readObject(env: Env, key: string): Promise<any | null> {
  const cfg = storageConfig(env);
  const response = await fetch(objectUrl(cfg.base, cfg.bucket, key), { headers: { ...cfg.auth, 'Cache-Control': 'no-store' } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Could not read the private recovery draft.');
  return response.json();
}
async function writeObject(env: Env, key: string, value: unknown): Promise<void> {
  const cfg = storageConfig(env);
  const response = await fetch(objectUrl(cfg.base, cfg.bucket, key), {
    method: 'POST',
    headers: { ...cfg.auth, 'Content-Type': 'application/json', 'x-upsert': 'true', 'Cache-Control': 'no-store' },
    body: JSON.stringify(value)
  });
  if (!response.ok) {
    console.error('Digital Seva draft storage failed:', response.status);
    throw new Error('Could not securely save the recovery draft.');
  }
}
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}
async function encryptionKey(env: Env): Promise<CryptoKey> {
  const secret = String(env.DIGITAL_SEVA_PII_SECRET || env.ADMIN_SECRET_TOKEN || '');
  if (secret.length < 32) throw new Error('Secure application draft encryption is not configured.');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`TANSHU-ONLINE-DIGITAL-SEVA-DRAFT-v1:${secret}`));
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}
async function seal(env: Env, value: unknown): Promise<any> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await encryptionKey(env), new TextEncoder().encode(JSON.stringify(value)));
  return { version: 1, iv: toBase64(iv), data: toBase64(new Uint8Array(encrypted)) };
}
async function unseal(env: Env, value: any): Promise<any> {
  if (value?.version !== 1 || typeof value.iv !== 'string' || typeof value.data !== 'string') throw new Error('The saved recovery draft is invalid.');
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(value.iv) }, await encryptionKey(env), fromBase64(value.data));
  return JSON.parse(new TextDecoder().decode(plain));
}
async function identityKey(phone: string, name: string, email: string): Promise<string> {
  const normalized = [phone.replace(/\D/g, ''), name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-IN'), email.trim().toLowerCase()].join('|');
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized)));
  return Array.from(digest).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
function rateLimit(request: Request, action: string): boolean {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const current = attempts.get(ip);
  if (attempts.size > 1000) for (const [key, value] of attempts) if (value.resetAt <= now) attempts.delete(key);
  const limit = action === 'save' ? 180 : 8;\n  if (current && current.resetAt > now && current.count >= limit) return false;
  if (!current || current.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
  else attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt });
  return true;
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
  if (!rateLimit(request)) return json({ success: false, error: 'Too many recovery attempts. Please wait a few minutes.' }, 429);
  const raw = await request.text();
  if (raw.length > 48 * 1024) return json({ success: false, error: 'The recovery draft is too large.' }, 413);
  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ success: false, error: 'The recovery request is invalid.' }, 400); }
  const action = String(body?.action || '');
  try {
    if (action === 'save') {
      const orderId = String(body.orderId || '');
      const draft = body.draft;
      if (!/^ds_[0-9a-f]{32}$/i.test(orderId) || !draft || typeof draft !== 'object' || Array.isArray(draft)) return json({ success: false, error: 'The recovery draft details are invalid.' }, 400);
      const serviceId = String(draft.serviceId || '');
      const applicant = draft.applicant && typeof draft.applicant === 'object' ? draft.applicant : {};
      const phone = String(applicant.phone || '').replace(/\D/g, '');
      const name = String(applicant.name || '').trim().replace(/\s+/g, ' ');
      const email = String(applicant.email || '').trim().toLowerCase();
      if (!/^\d{10}$/.test(phone) || name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return json({ success: false, error: 'Complete applicant mobile, name and email before enabling online recovery.' }, 400);
      }
      const verified = await verifiedPaidOrder(env, orderId, serviceId);
      if (!verified) return json({ success: false, error: 'Only a verified paid request can be saved for recovery. Do not pay again; check the existing payment.' }, 409);
      const identity = await identityKey(phone, name, email);
      const objectKey = `digital-seva-drafts/${identity}.json`;
      const existingRaw = await readObject(env, objectKey);
      let records: any[] = [];
      if (existingRaw) {
        const existing = await unseal(env, existingRaw);
        records = Array.isArray(existing.records) ? existing.records : [];
      }
      const savedAt = Date.now();
      const record = { orderId, serviceId, applicant: { name, phone, email }, draft: { ...draft, documentFiles: undefined }, savedAt };
      const next = [...records.filter((item) => item.orderId !== orderId), record].sort((a, b) => Number(b.savedAt) - Number(a.savedAt)).slice(0, 10);
      await writeObject(env, objectKey, await seal(env, { records: next }));
      return json({ success: true, savedAt });
    }
    if (action === 'recover') {
      const phone = String(body.phone || '').replace(/\D/g, '');
      const name = String(body.name || '').trim().replace(/\s+/g, ' ');
      const email = String(body.email || '').trim().toLowerCase();
      if (!/^\d{10}$/.test(phone) || name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        return json({ success: false, error: 'Enter the same mobile, full name and email used in the application.' }, 400);
      }
      const identity = await identityKey(phone, name, email);
      const encrypted = await readObject(env, `digital-seva-drafts/${identity}.json`);
      if (!encrypted) return json({ success: true, drafts: [] });
      const stored = await unseal(env, encrypted);
      const records = Array.isArray(stored.records) ? stored.records : [];
      const drafts = [];
      for (const record of records) {
        const verified = await verifiedPaidOrder(env, String(record.orderId || ''), String(record.serviceId || ''));
        if (!verified || record.applicant?.phone !== phone || record.applicant?.email !== email || record.applicant?.name?.toLocaleLowerCase('en-IN') !== name.toLocaleLowerCase('en-IN')) continue;
        drafts.push({
          orderId: record.orderId,
          serviceId: record.serviceId,
          amount: verified.quote.totalAmount,
          customerName: String(verified.order.customer_details?.customer_name || record.applicant.name),
          customerPhone: String(verified.order.customer_details?.customer_phone || record.applicant.phone),
          customerEmail: String(verified.order.customer_details?.customer_email || record.applicant.email),
          savedAt: record.savedAt,
          draft: record.draft
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
