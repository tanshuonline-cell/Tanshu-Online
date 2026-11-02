// Cloudflare Pages Function: /api/admin/revoke-access
// Purpose: Allows authenticated admin to revoke or restore customer video access without deleting financial payment records

interface Env {
  DB?: any;
  ADMIN_SECRET_TOKEN?: string;
  [key: string]: any;
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
  'Content-Type': 'application/json',
};

async function verifyHmac(payload: string, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return expected === signature;
}

async function verifyAdminAuth(request: Request, env: Env): Promise<boolean> {
  const signingKey = env.ADMIN_SECRET_TOKEN;
  if (!signingKey || signingKey.includes('YOUR_')) return false;

  const authHeader = request.headers.get('Authorization') || '';
  const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookieMatch = cookieHeader.match(/tanshu_admin_session=([^;]+)/);
  const token = bearerToken || (cookieMatch ? cookieMatch[1] : undefined);

  if (!token || !token.includes('.')) return false;

  try {
    const [b64, sig] = token.split('.');
    const isValid = await verifyHmac(b64, sig, signingKey);
    if (isValid) {
      const payload = JSON.parse(atob(b64));
      return payload.role === 'superadmin' && typeof payload.u === 'string' && payload.u.length > 0 && Number.isFinite(payload.exp) && payload.exp > Date.now();
    }
  } catch {
    return false;
  }
  return false;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized admin access.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: 'Database unavailable. No access changes were made.' }), { status: 503, headers: corsHeaders });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { accessId, revoke } = body as { accessId?: string; revoke?: boolean };

    if (!accessId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Access record ID is required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const newRevokeVal = revoke === false ? 0 : 1;

    const purchaseResult = await env.DB.prepare(
      'UPDATE customer_video_access SET is_revoked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newRevokeVal, accessId).run();
    const grantResult = await env.DB.prepare(
      'UPDATE admin_video_access_grants SET is_revoked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(newRevokeVal, accessId).run();
    const changed = Number(purchaseResult?.meta?.changes || 0) + Number(grantResult?.meta?.changes || 0);
    if (!changed) {
      return new Response(JSON.stringify({ success: false, error: 'No matching purchase or complimentary grant was found.' }), { status: 404, headers: corsHeaders });
    }

    return new Response(
      JSON.stringify({
        success: true,
        accessId,
        isRevoked: Boolean(newRevokeVal),
        message: newRevokeVal === 1 ? 'Customer video access revoked successfully.' : 'Customer video access restored.',
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
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
