export interface CspEnv {
  DB?: any;
  BREVO_API_KEY?: string;
  CSP_MAILER_URL?: string;
  CSP_MAILER_SECRET?: string;
  CSP_SENDER_EMAIL?: string;
  CSP_SENDER_NAME?: string;
  CSP_OTP_SECRET?: string;
  CSP_SESSION_SECRET?: string;
  ADMIN_SECRET_TOKEN?: string;
}

export const jsonHeaders = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}

export function normalizeGmail(value: unknown): string | null {
  const email = String(value || '').trim().toLowerCase();
  return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/.test(email) && email.length <= 254 ? email : null;
}

export async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('');
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function issueCustomerSession(customer: { id: string; email: string }, secret: string): Promise<string> {
  const payload = btoa(JSON.stringify({ sub: customer.id, email: customer.email, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }));
  return payload + '.' + await hmac(payload, secret);
}

export async function readCustomerSession(request: Request, secret: string): Promise<{ id: string; email: string } | null> {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)csp_customer_session=([^;]+)/);
  if (!match) return null;
  const token = decodeURIComponent(match[1]);
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(await hmac(payload, secret), signature)) return null;
  try {
    const data = JSON.parse(atob(payload));
    if (!data.sub || !data.email || !data.exp || data.exp < Date.now()) return null;
    return { id: String(data.sub), email: String(data.email) };
  } catch { return null; }
}

export function customerCookie(token: string): string {
  return 'csp_customer_session=' + encodeURIComponent(token) + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000';
}
