// Cloudflare Pages Function: /api/video/restore-access
// Fail closed until a real SMS provider is fully integrated and OTP lifecycle is implemented.
interface Env {
  DB?: any;
  SMS_OTP_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  MSG91_AUTH_KEY?: string;
  ADMIN_SECRET_TOKEN?: string;
  [key: string]: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

export async function onRequestPost(context: { request: Request }): Promise<Response> {
  // Environment-variable presence alone does not prove that SMS delivery and OTP
  // verification are implemented. Never claim an OTP was sent or accept a guessed code.
  try {
    await context.request.json().catch(() => ({}));
  } catch {
    // The same fail-closed response is returned for malformed input.
  }
  return new Response(
    JSON.stringify({
      success: false,
      otpConfigured: false,
      error: 'Secure SMS OTP restoration is not available yet. No OTP was sent and no access was changed. Please contact support with your payment receipt or Cashfree order ID for manual verification.',
    }),
    { status: 503, headers: corsHeaders }
  );
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: corsHeaders });
}
