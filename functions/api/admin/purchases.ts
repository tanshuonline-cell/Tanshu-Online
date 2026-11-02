// Cloudflare Pages Function: /api/admin/purchases
// Purpose: Secure purchase history retrieval for Admin Dashboard with masked customer identifiers

interface Env {
  DB?: any;
  ADMIN_SECRET_TOKEN?: string;
  [key: string]: any;
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
      return payload.role === 'superadmin' &&
        typeof payload.u === 'string' && payload.u.length > 0 &&
        Number.isFinite(payload.exp) && payload.exp > Date.now();
    }
  } catch {
    return false;
  }
  return false;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized admin access.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  if (!env.DB) {
    return new Response(
      JSON.stringify({
        success: false,
        purchases: [],
        error: 'D1 database binding is unavailable. Purchase history cannot be verified.',
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM (
         SELECT a.id, a.customer_phone, a.customer_email, a.video_id,
                v.title as video_title, a.order_id,
                COALESCE(o.order_amount, 0) as amount_paid,
                COALESCE(o.order_status, 'UNKNOWN') as payment_status,
                a.granted_at, a.is_revoked, 'PURCHASE' as access_source
         FROM customer_video_access a
         LEFT JOIN videos v ON a.video_id = v.id
         LEFT JOIN payment_orders o ON a.order_id = o.order_id
         UNION ALL
         SELECT g.id, g.customer_phone, NULL as customer_email, g.video_id,
                v.title as video_title, NULL as order_id,
                0 as amount_paid, 'COMPLIMENTARY' as payment_status,
                g.granted_at, g.is_revoked, 'ADMIN_GRANT' as access_source
         FROM admin_video_access_grants g
         LEFT JOIN videos v ON g.video_id = v.id
       )
       ORDER BY granted_at DESC`
    ).all();

    // Mask customer identifiers for privacy compliance
    const sanitized = (results || []).map((row: any) => {
      const phone = String(row.customer_phone || '');
      const maskedPhone =
        phone.length >= 10
          ? `+91 ${phone.slice(0, 2)}****${phone.slice(-4)}`
          : phone;

      return {
        id: row.id,
        customerPhone: maskedPhone,
        videoId: row.video_id,
        videoTitle: row.video_title || row.video_id,
        orderId: row.order_id,
        amountPaid: Number(row.amount_paid) || 0,
        paymentStatus: row.payment_status,
        accessSource: row.access_source,
        grantedAt: row.granted_at,
        isRevoked: Boolean(row.is_revoked),
      };
    });

    return new Response(JSON.stringify({ success: true, purchases: sanitized }), {
      status: 200,
      headers: corsHeaders,
    });
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
