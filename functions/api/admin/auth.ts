// Cloudflare Pages Function: /api/admin/auth
// Purpose: Strict server-side admin authentication. Rejects all logins if Cloudflare environment variables are missing. Zero hardcoded fallback credentials.

interface Env {
  DB?: any;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SECRET_TOKEN?: string;
  [key: string]: any;
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Rate limiter tracking (per worker isolate instance)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

async function createHmacSignature(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyHmacSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const expected = await createHmacSignature(payload, secret);
  return expected === signature;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'login';

  // Logout action (always permissible to terminate any session)
  if (action === 'logout') {
    const headers = {
      ...corsHeaders,
      'Set-Cookie': 'tanshu_admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
    };
    return new Response(JSON.stringify({ success: true, message: 'Logged out successfully.' }), {
      status: 200,
      headers,
    });
  }

  // 1. Strict Configuration Validation: Zero Fallback Credentials Allowed
  const adminUser = env.ADMIN_USERNAME;
  const adminPass = env.ADMIN_PASSWORD;
  const signingKey = env.ADMIN_SECRET_TOKEN;

  const isConfigured = Boolean(
    adminUser &&
    adminPass &&
    signingKey &&
    adminUser.trim().length > 0 &&
    adminPass.trim().length > 0 &&
    signingKey.trim().length > 0 &&
    !adminUser.includes('YOUR_') &&
    !adminPass.includes('YOUR_') &&
    !signingKey.includes('YOUR_')
  );

  if (!isConfigured) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          'Admin authentication is unavailable because server credentials (ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_SECRET_TOKEN) are not configured in Cloudflare Pages environment variables / secrets.',
      }),
      { status: 503, headers: corsHeaders }
    );
  }

  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 2. Rate Limiting Check
  const now = Date.now();
  const attempt = loginAttempts.get(clientIp);
  if (attempt && attempt.lockedUntil > now) {
    const remainingSeconds = Math.ceil((attempt.lockedUntil - now) / 1000);
    return new Response(
      JSON.stringify({
        success: false,
        error: `Too many failed login attempts. Please wait ${remainingSeconds} seconds before trying again.`,
      }),
      { status: 429, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { username, password } = body as { username?: string; password?: string };

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Both username and password are required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Exact credential comparison against configured environment secrets
    const isUserMatch = username.trim() === adminUser;
    const isPassMatch = password === adminPass;

    if (!isUserMatch || !isPassMatch) {
      const currentCount = (attempt?.count || 0) + 1;
      let lockedUntil = 0;
      if (currentCount >= 5) {
        lockedUntil = now + 15 * 60 * 1000; // 15 minutes lockout
      }
      loginAttempts.set(clientIp, { count: currentCount, lockedUntil });

      return new Response(
        JSON.stringify({
          success: false,
          error:
            currentCount >= 5
              ? 'Account locked for 15 minutes due to multiple failed login attempts.'
              : `Invalid username or password. (${5 - currentCount} attempts remaining)`,
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Success: reset attempts for this IP
    loginAttempts.delete(clientIp);

    // Create cryptographically signed session token using separate ADMIN_SECRET_TOKEN
    const sessionPayload = JSON.stringify({
      u: adminUser,
      role: 'superadmin',
      iat: now,
      exp: now + 24 * 3600 * 1000, // 24 hours
    });
    const b64 = btoa(sessionPayload);
    const sig = await createHmacSignature(b64, signingKey as string);
    const sessionToken = `${b64}.${sig}`;

    const headers = {
      ...corsHeaders,
      'Set-Cookie': `tanshu_admin_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
    };

    return new Response(
      JSON.stringify({
        success: true,
        token: sessionToken,
        user: {
          username: adminUser,
          role: 'superadmin',
          lastLogin: new Date().toISOString(),
        },
        message: 'Admin authentication successful.',
      }),
      { status: 200, headers }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const signingKey = env.ADMIN_SECRET_TOKEN;

  if (!signingKey || signingKey.includes('YOUR_')) {
    return new Response(
      JSON.stringify({ authenticated: false, error: 'ADMIN_SECRET_TOKEN is not configured.' }),
      { status: 401, headers: corsHeaders }
    );
  }

  const authHeader = request.headers.get('Authorization') || '';
  const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookieMatch = cookieHeader.match(/tanshu_admin_session=([^;]+)/);
  const token = bearerToken || (cookieMatch ? cookieMatch[1] : undefined);

  if (!token || !token.includes('.')) {
    return new Response(JSON.stringify({ authenticated: false, error: 'No active admin session.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const [b64, sig] = token.split('.');
    const isValid = await verifyHmacSignature(b64, sig, signingKey);
    if (!isValid) {
      return new Response(JSON.stringify({ authenticated: false, error: 'Invalid admin session signature.' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const payload = JSON.parse(atob(b64));
    if (payload.exp && payload.exp < Date.now()) {
      return new Response(JSON.stringify({ authenticated: false, error: 'Admin session has expired.' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          username: payload.u,
          role: payload.role || 'superadmin',
        },
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch {
    return new Response(JSON.stringify({ authenticated: false, error: 'Corrupt admin session token.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
