import { CspEnv, hmac, json, normalizeGmail } from '../_auth';

export async function onRequestPost({ request, env }: { request: Request; env: CspEnv }): Promise<Response> {
  const body = await request.json().catch(() => ({})) as { email?: string; purpose?: string };
  const email = normalizeGmail(body.email);
  const purpose = body.purpose === 'signup' ? 'signup' : 'login';
  if (!email) return json({ success: false, error: 'Please enter a valid @gmail.com address.' }, 400);
  if (!env.DB || !env.BREVO_API_KEY || !env.CSP_SENDER_EMAIL || !env.CSP_OTP_SECRET) {
    return json({ success: false, code: 'CSP_EMAIL_NOT_CONFIGURED', error: 'Gmail OTP is not activated yet. The free email provider and database setup must be completed first.' }, 503);
  }

  try {
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) AS total FROM csp_email_otps WHERE email = ? AND created_at >= datetime('now', '-15 minutes')"
    ).bind(email).first();
    if (Number(recent?.total || 0) >= 3) return json({ success: false, error: 'OTP limit reached. Please try again after 15 minutes.' }, 429);
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const ipHash = await hmac('ip:' + ip, env.CSP_OTP_SECRET);
    const ipRecent = await env.DB.prepare(
      "SELECT COUNT(*) AS total FROM csp_email_otps WHERE client_ip_hash = ? AND created_at >= datetime('now', '-15 minutes')"
    ).bind(ipHash).first();
    if (Number(ipRecent?.total || 0) >= 10) return json({ success: false, error: 'Too many OTP requests from this network. Please wait 15 minutes.' }, 429);

    const otpBytes = new Uint32Array(1);
    crypto.getRandomValues(otpBytes);
    const otp = String(100000 + (otpBytes[0] % 900000));
    const otpHash = await hmac(email + ':' + otp, env.CSP_OTP_SECRET);
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await env.DB.prepare(
      'INSERT INTO csp_email_otps (id, email, otp_hash, client_ip_hash, purpose, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, email, otpHash, ipHash, purpose, expiresAt).run();

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { email: env.CSP_SENDER_EMAIL, name: env.CSP_SENDER_NAME || 'TANSHU ONLINE' },
        to: [{ email }],
        subject: 'Your TANSHU ONLINE verification code',
        textContent: 'Your TANSHU ONLINE verification code is ' + otp + '. It expires in 10 minutes. Do not share this code with anyone.',
        htmlContent: '<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#172033"><h2>TANSHU ONLINE</h2><p>Your email verification code is:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:16px;background:#f1f5f9;border-radius:10px;text-align:center">' + otp + '</div><p>This code expires in 10 minutes. Never share it with anyone.</p></div>'
      })
    });
    if (!response.ok) {
      await env.DB.prepare('DELETE FROM csp_email_otps WHERE id = ?').bind(id).run();
      return json({ success: false, error: 'The free email provider could not send the OTP. Please try again later.' }, 502);
    }
    return json({ success: true, message: 'Verification code sent to your Gmail address.', expiresInSeconds: 600 });
  } catch {
    return json({ success: false, error: 'Unable to send verification code right now.' }, 500);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': 'https://tanshu-online.pages.dev', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}
