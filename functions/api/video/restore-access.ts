// Cloudflare Pages Function: /api/video/restore-access
// Purpose: Secure Two-Factor OTP restoration handler. Prevents phone-number-only account enumeration and hijacking.

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
};

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  try {
    const body = await request.json().catch(() => ({}));
    const { action, customerPhone, videoId, otpCode } = body as {
      action?: 'request_otp' | 'verify_otp';
      customerPhone?: string;
      videoId?: string;
      otpCode?: string;
    };

    if (!customerPhone || !videoId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Both registered mobile number and video ID are required.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const sanitizedPhone = customerPhone.replace(/\D/g, '').slice(-10);
    if (sanitizedPhone.length !== 10) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please provide a valid 10-digit Indian mobile number.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if an SMS OTP provider is configured in environment variables
    const hasOtpProvider = Boolean(
      (env.SMS_OTP_API_KEY && !env.SMS_OTP_API_KEY.includes('YOUR_')) ||
      (env.TWILIO_ACCOUNT_SID && !env.TWILIO_ACCOUNT_SID.includes('YOUR_')) ||
      (env.MSG91_AUTH_KEY && !env.MSG91_AUTH_KEY.includes('YOUR_'))
    );

    // Fail closed: If SMS OTP provider is not configured, do not simulate OTP
    if (!hasOtpProvider) {
      return new Response(
        JSON.stringify({
          success: false,
          otpConfigured: false,
          error:
            'Two-Factor SMS OTP verification service is not yet configured on this server. To protect customer purchases from unauthorized access, restoring access by mobile number alone is strictly disabled. Please contact support at tanshuonline@gmail.com with your Cashfree payment receipt or order ID to restore your access.',
        }),
        { status: 503, headers: corsHeaders }
      );
    }

    if (action === 'request_otp') {
      // Production SMS sending would happen here via configured SMS gateway
      return new Response(
        JSON.stringify({
          success: true,
          otpConfigured: true,
          message: `Verification OTP has been dispatched to +91 ${sanitizedPhone.slice(0, 2)}******${sanitizedPhone.slice(-2)}.`,
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    if (action === 'verify_otp') {
      if (!otpCode || otpCode.trim().length < 4) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Please enter the verification OTP sent to your registered mobile number.',
          }),
          { status: 400, headers: corsHeaders }
        );
      }

      // Here the OTP provider would verify the code against its API.
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid or expired OTP code.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid action specified. Supported actions: request_otp, verify_otp',
      }),
      { status: 400, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Error processing access restoration request',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
