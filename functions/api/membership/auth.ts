// Cloudflare Pages Function: /api/membership/auth
// Google OAuth 2.0 authorization-code flow for Membership customers.
// Fail-closed: requires Preview Pages secrets and the Preview D1 binding.
// No client-supplied identity is trusted. Session cookie is HttpOnly/Secure.

interface Env {
  DB?: any;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  MEMBERSHIP_SESSION_SECRET?: string;
  APP_BASE_URL?: string;
}

const COOKIE = 'tanshu_membership_session';
const STATE_COOKIE = 'tanshu_membership_oauth_state';
const COOKIE_BASE = 'Path=/; HttpOnly; Secure; SameSite=Lax';
const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}
function b64url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function fromB64url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  return atob(normalized + '='.repeat((4 - (normalized.length % 4)) % 4));
}
async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return b64url(String.fromCharCode(...new Uint8Array(sig)));
}
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function cookie(request: Request, name: string): string | null {
  const raw = request.headers.get('Cookie') || '';
  const item = raw.split(';').map((part) => part.trim()).find((part) => part.startsWith(name + '='));
  return item ? item.slice(name.length + 1) : null;
}
function clearCookie(name: string): string {
  return name + '=; ' + COOKIE_BASE + '; Max-Age=0';
}
function configured(env: Env): boolean {
  return Boolean(env.DB && env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET &&
    env.MEMBERSHIP_SESSION_SECRET && env.MEMBERSHIP_SESSION_SECRET.length >= 32 && env.APP_BASE_URL);
}
function baseUrl(env: Env): string {
  const url = new URL(env.APP_BASE_URL!);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new Error('APP_BASE_URL must use HTTPS.');
  return url.origin;
}
async function issueSession(customer: any, secret: string): Promise<string> {
  const payload = b64url(JSON.stringify({
    sub: customer.id,
    email: customer.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  }));
  return payload + '.' + await sign(payload, secret);
}
async function readSession(request: Request, secret: string): Promise<any | null> {
  const token = cookie(request, COOKIE);
  if (!token) return null;
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra || !safeEqual(signature, await sign(payload, secret))) return null;
  try {
    const data = JSON.parse(fromB64url(payload));
    if (!data.sub || !data.exp || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch { return null; }
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'me';

  if (!configured(env)) return json({ success: false, error: 'Membership Google Login is not configured on this Preview deployment. Set the required Cloudflare Preview secrets and D1 binding first.' }, 503);

  let origin: string;
  try { origin = baseUrl(env); } catch { return json({ success: false, error: 'Membership APP_BASE_URL configuration is invalid.' }, 503); }

  if (action === 'start') {
    const state = b64url(crypto.randomUUID() + ':' + crypto.randomUUID());
    const stateSignature = await sign(state, env.MEMBERSHIP_SESSION_SECRET!);
    const signedState = state + '.' + stateSignature;
    const redirectUri = origin + '/api/membership/auth?action=callback';
    const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID!);
    googleUrl.searchParams.set('redirect_uri', redirectUri);
    googleUrl.searchParams.set('response_type', 'code');
    googleUrl.searchParams.set('scope', 'openid email profile');
    googleUrl.searchParams.set('state', state);
    googleUrl.searchParams.set('prompt', 'select_account');
    return new Response(null, { status: 302, headers: {
      Location: googleUrl.toString(),
      'Cache-Control': 'no-store',
      'Set-Cookie': STATE_COOKIE + '=' + signedState + '; ' + COOKIE_BASE + '; Max-Age=600',
    }});
  }

  if (action === 'callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state') || '';
    const stateCookie = cookie(request, STATE_COOKIE) || '';
    const [savedState, savedSignature, extra] = stateCookie.split('.');
    if (!code || !state || extra || !savedState || state !== savedState ||
        !safeEqual(savedSignature || '', await sign(savedState, env.MEMBERSHIP_SESSION_SECRET!))) {
      return new Response('Google sign-in could not be verified. Please try again.', { status: 400, headers: { 'Content-Type': 'text/plain', 'Set-Cookie': clearCookie(STATE_COOKIE) } });
    }

    const redirectUri = origin + '/api/membership/auth?action=callback';
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri, grant_type: 'authorization_code',
      }),
    });
    if (!tokenResponse.ok) return new Response('Google token exchange failed. Please try again.', { status: 502, headers: { 'Content-Type': 'text/plain', 'Set-Cookie': clearCookie(STATE_COOKIE) } });
    const tokenData: any = await tokenResponse.json();
    if (!tokenData.id_token) return new Response('Google did not return a verified identity token.', { status: 502, headers: { 'Content-Type': 'text/plain', 'Set-Cookie': clearCookie(STATE_COOKIE) } });

    const verifyResponse = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(tokenData.id_token));
    if (!verifyResponse.ok) return new Response('Google identity verification failed.', { status: 401, headers: { 'Content-Type': 'text/plain', 'Set-Cookie': clearCookie(STATE_COOKIE) } });
    const identity: any = await verifyResponse.json();
    const now = Math.floor(Date.now() / 1000);
    if (identity.aud !== env.GOOGLE_CLIENT_ID || !['accounts.google.com', 'https://accounts.google.com'].includes(identity.iss) ||
        Number(identity.exp) <= now || identity.email_verified !== 'true' || !identity.sub || !identity.email) {
      return new Response('Google account is not eligible for Membership sign-in.', { status: 403, headers: { 'Content-Type': 'text/plain', 'Set-Cookie': clearCookie(STATE_COOKIE) } });
    }

    const customerId = 'cus_' + crypto.randomUUID();
    const displayName = String(identity.name || identity.email).slice(0, 160);
    const avatar = typeof identity.picture === 'string' && identity.picture.startsWith('https://') ? identity.picture.slice(0, 1000) : null;
    await env.DB.prepare(`
      INSERT INTO membership_customers
        (id, google_subject, email, display_name, profile_image_url, email_verified, account_status, created_at, updated_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(google_subject) DO UPDATE SET
        email = excluded.email,
        display_name = excluded.display_name,
        profile_image_url = excluded.profile_image_url,
        email_verified = 1,
        updated_at = CURRENT_TIMESTAMP,
        last_login_at = CURRENT_TIMESTAMP
    `).bind(customerId, String(identity.sub), String(identity.email).toLowerCase(), displayName, avatar).run();

    const customer = await env.DB.prepare(
      "SELECT id, email, display_name, profile_image_url, account_status FROM membership_customers WHERE google_subject = ?"
    ).bind(String(identity.sub)).first();
    if (!customer || customer.account_status !== 'active') return new Response('This Membership account is unavailable.', { status: 403, headers: { 'Content-Type': 'text/plain', 'Set-Cookie': clearCookie(STATE_COOKIE) } });

    const session = await issueSession(customer, env.MEMBERSHIP_SESSION_SECRET!);
    return new Response(null, { status: 302, headers: {
      Location: origin + '/?membership_login=success',
      'Cache-Control': 'no-store',
      'Set-Cookie': [
        COOKIE + '=' + session + '; ' + COOKIE_BASE + '; Max-Age=604800',
        clearCookie(STATE_COOKIE),
      ].join(', '),
    }});
  }

  if (action === 'me') {
    const session = await readSession(request, env.MEMBERSHIP_SESSION_SECRET!);
    if (!session) return json({ authenticated: false }, 401);
    const customer = await env.DB.prepare(
      "SELECT id, email, display_name, profile_image_url, account_status FROM membership_customers WHERE id = ?"
    ).bind(session.sub).first();
    if (!customer || customer.account_status !== 'active') return json({ authenticated: false }, 401);
    return json({ authenticated: true, customer });
  }

  return json({ success: false, error: 'Unsupported membership auth action.' }, 404);
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context;
  if (new URL(context.request.url).searchParams.get('action') !== 'logout') return json({ success: false, error: 'Unsupported action.' }, 404);
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...JSON_HEADERS, 'Set-Cookie': clearCookie(COOKIE) + ', ' + clearCookie(STATE_COOKIE) },
  });
}
