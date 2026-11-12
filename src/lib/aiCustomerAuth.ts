const SESSION_KEY = 'tanshu.ai.customer.session.v1';
const VERIFIER_KEY = 'tanshu.ai.customer.pkce.v1';

export interface AiCustomerSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  token_type?: string;
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> };
}

function config() {
  const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env || {};
  const url = (env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !key) throw new Error('Google sign-in is not configured yet. Add the Supabase URL and publishable key to the Preview environment.');
  return { url, key };
}

function base64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function createPkcePair() {
  const random = crypto.getRandomValues(new Uint8Array(48));
  const verifier = base64Url(random);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: base64Url(new Uint8Array(digest)) };
}

export function getAiCustomerSession(): AiCustomerSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AiCustomerSession;
    if (!session.access_token || !session.refresh_token || !session.user?.id) return null;
    return session;
  } catch {
    return null;
  }
}

function saveSession(session: AiCustomerSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function beginGoogleAiSignIn() {
  const { url, key } = config();
  const { verifier, challenge } = await createPkcePair();
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  const redirectTo = new URL(window.location.pathname, window.location.origin);
  redirectTo.searchParams.set('ai_auth', 'callback');
  const authorize = new URL(`${url}/auth/v1/authorize`);
  authorize.searchParams.set('provider', 'google');
  authorize.searchParams.set('redirect_to', redirectTo.toString());
  authorize.searchParams.set('code_challenge', challenge);
  authorize.searchParams.set('code_challenge_method', 's256');
  authorize.searchParams.set('apikey', key);
  window.location.assign(authorize.toString());
}

export async function completeGoogleAiSignIn(): Promise<AiCustomerSession | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code || params.get('ai_auth') !== 'callback') return null;
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  if (!verifier) throw new Error('Sign-in session expired. Please try Google sign-in again.');
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/token?grant_type=pkce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key },
    body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token || !data.user?.id) {
    throw new Error(data.msg || data.message || 'Google sign-in could not be completed.');
  }
  const session = saveSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    token_type: data.token_type,
    user: data.user,
  });
  window.history.replaceState({}, document.title, window.location.pathname);
  return session;
}

export async function refreshAiCustomerSession(): Promise<AiCustomerSession | null> {
  const current = getAiCustomerSession();
  if (!current) return null;
  if (!current.expires_at || current.expires_at * 1000 > Date.now() + 60_000) return current;
  const { url, key } = config();
  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key },
    body: JSON.stringify({ refresh_token: current.refresh_token }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token || !data.user?.id) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  return saveSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    token_type: data.token_type,
    user: data.user,
  });
}

export function signOutAiCustomer() {
  const current = getAiCustomerSession();
  localStorage.removeItem(SESSION_KEY);
  if (!current) return;
  const { url, key } = config();
  void fetch(`${url}/auth/v1/logout`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${current.access_token}` },
  }).catch(() => undefined);
}

export async function consumeFreeAiPhotoCredit(): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const session = await refreshAiCustomerSession();
  if (!session) throw new Error('Please sign in with Gmail to use your free AI photo credits.');
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/rpc/consume_ai_photo_credit`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || 'Could not verify your free AI photo credits.');
  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    used: Number(row?.used ?? 0),
    remaining: Number(row?.remaining ?? 0),
  };
}
