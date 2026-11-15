import { CspEnv, customerCookie, hmac, json, normalizeGmail, issueCustomerSession, safeEqual } from '../_auth';

export async function onRequestPost({ request, env }: { request: Request; env: CspEnv }): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { email?: string; otp?: string };
  const email = normalizeGmail(body.email);
  const otp = String(body.otp || '').replace(/\s/g, '');
  if (!email || !/^\d{6}$/.test(otp)) return json({ success: false, error: 'Enter your Gmail address and the 6-digit OTP.' }, 400);
  if (!env.DB || !env.CSP_OTP_SECRET || !env.CSP_SESSION_SECRET) {
    return json({ success: false, code: 'CSP_AUTH_NOT_CONFIGURED', error: 'Customer authentication is not configured yet.' }, 503);
  }

  try {
    const record = await env.DB.prepare(
      "SELECT id, otp_hash, expires_at, attempts FROM csp_email_otps WHERE email = ? AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1"
    ).bind(email).first();
    if (!record) return json({ success: false, error: 'No active OTP found. Request a new code.' }, 400);
    if (new Date(record.expires_at).getTime() <= Date.now()) {
      await env.DB.prepare('UPDATE csp_email_otps SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?').bind(record.id).run();
      return json({ success: false, error: 'OTP expired. Request a new code.' }, 400);
    }
    if (Number(record.attempts) >= 5) return json({ success: false, error: 'Too many incorrect attempts. Request a new OTP.' }, 429);

    const suppliedHash = await hmac(email + ':' + otp, env.CSP_OTP_SECRET);
    if (!safeEqual(String(record.otp_hash), suppliedHash)) {
      await env.DB.prepare('UPDATE csp_email_otps SET attempts = attempts + 1 WHERE id = ?').bind(record.id).run();
      return json({ success: false, error: 'Incorrect OTP. Please check the code and try again.' }, 400);
    }

    await env.DB.prepare('UPDATE csp_email_otps SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?').bind(record.id).run();
    const customerId = crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO csp_customers (id, email, email_verified_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(email) DO UPDATE SET email_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP"
    ).bind(customerId, email).run();
    const customer = await env.DB.prepare('SELECT id, email, status FROM csp_customers WHERE email = ?').bind(email).first();
    if (!customer || customer.status !== 'active') return json({ success: false, error: 'This customer account is suspended. Please contact support.' }, 403);

    const token = await issueCustomerSession({ id: customer.id, email: customer.email }, env.CSP_SESSION_SECRET);
    return new Response(JSON.stringify({ success: true, customer: { id: customer.id, email: customer.email }, message: 'Gmail verified successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Set-Cookie': customerCookie(token) }
    });
  } catch {
    return json({ success: false, error: 'Unable to verify OTP right now.' }, 500);
  }
}
