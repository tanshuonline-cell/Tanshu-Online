// Cloudflare Pages Function: /api/video/stream-token
// Purpose: Verifies customer access and generates a secure Cloudflare Stream playback token

interface Env {
  DB?: any;
  CLOUDFLARE_STREAM_ACCOUNT_ID?: string;
  CLOUDFLARE_STREAM_API_TOKEN?: string;
  ADMIN_SECRET_TOKEN?: string;
  [key: string]: any;
}

// Simple Web Crypto HMAC-SHA256 signature verification
async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expectedSigBytes = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const expectedSig = Array.from(new Uint8Array(expectedSigBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return expectedSig === signature;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json().catch(() => ({}));
    const { videoId, customerPhone, sessionToken } = body as {
      videoId?: string;
      customerPhone?: string;
      sessionToken?: string;
    };

    if (!videoId) {
      return new Response(
        JSON.stringify({
          authorized: false,
          error: 'videoId is required.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Step 1: Check if the video is Free or Premium
    let isPremium = true;
    let streamVideoId = '';
    let youtubeUrl: string | undefined;

    if (env.DB) {
      try {
        const videoRecord = await env.DB.prepare(
          'SELECT access_type, is_premium, stream_video_id, youtube_url FROM videos WHERE id = ?'
        )
          .bind(videoId)
          .first();

        if (videoRecord) {
          isPremium = videoRecord.access_type === 'premium' || Boolean(videoRecord.is_premium);
          streamVideoId = videoRecord.stream_video_id || '';
          youtubeUrl = videoRecord.youtube_url;
        }
      } catch (dbErr) {
        console.warn('D1 video lookup warning:', dbErr);
      }
    }

    // If video is free, allow playback
    if (!isPremium) {
      return new Response(
        JSON.stringify({
          authorized: true,
          accessType: 'free',
          videoId,
          youtubeUrl,
          message: 'Free video access authorized',
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Step 2: For premium video, verify phone and cryptographic session token
    if (!customerPhone) {
      return new Response(
        JSON.stringify({
          authorized: false,
          error: 'Please provide your registered phone number to verify video access.',
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    const sanitizedPhone = customerPhone.replace(/\D/g, '').slice(-10);

    // Extract session token from Authorization header, body, or HttpOnly cookie
    const authHeader = request.headers.get('Authorization') || '';
    const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookieMatch = cookieHeader.match(new RegExp(`tanshu_video_${videoId}_access=([^;]+)`));
    const tokenToValidate = bearerToken || sessionToken || (cookieMatch ? cookieMatch[1] : undefined);

    if (!tokenToValidate || !tokenToValidate.includes('.')) {
      return new Response(
        JSON.stringify({
          authorized: false,
          error: 'Access denied: Valid authenticated purchase session token required. Phone-number-only access is strictly disabled for security.',
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    let isSessionValid = false;
    try {
      const [b64Payload, sig] = tokenToValidate.split('.');
      const signingKey = env.ADMIN_SECRET_TOKEN || 'tanshu_secure_session_secret_2025';
      const isValidSig = await verifySignature(b64Payload, sig, signingKey);

      if (!isValidSig) {
        return new Response(
          JSON.stringify({
            authorized: false,
            error: 'Session signature verification failed. Invalid or tampered token.',
          }),
          { status: 403, headers: corsHeaders }
        );
      }

      const parsed = JSON.parse(atob(b64Payload));
      // Cross-video & identity check: Token must match this specific video and customer phone
      if (parsed.v !== videoId) {
        return new Response(
          JSON.stringify({
            authorized: false,
            error: 'Cross-video access denied: Session token was issued for a different video.',
          }),
          { status: 403, headers: corsHeaders }
        );
      }

      if (parsed.p !== sanitizedPhone) {
        return new Response(
          JSON.stringify({
            authorized: false,
            error: 'Access denied: Customer phone mismatch with session credentials.',
          }),
          { status: 403, headers: corsHeaders }
        );
      }

      if (parsed.exp && parsed.exp < Date.now()) {
        return new Response(
          JSON.stringify({
            authorized: false,
            error: 'Session has expired. Please verify your payment to renew your access.',
          }),
          { status: 401, headers: corsHeaders }
        );
      }

      isSessionValid = true;
    } catch (e: any) {
      return new Response(
        JSON.stringify({
          authorized: false,
          error: 'Malformed session token format: ' + (e.message || 'Decode error'),
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!isSessionValid) {
      return new Response(
        JSON.stringify({
          authorized: false,
          error: 'Access denied: Invalid session.',
        }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Step 2b: If D1 Database is available, verify unrevoked database entitlement
    if (env.DB) {
      try {
        const accessRecord = await env.DB.prepare(
          `SELECT id, is_revoked FROM customer_video_access
           WHERE customer_phone = ? AND video_id = ? AND is_revoked = 0`
        )
          .bind(sanitizedPhone, videoId)
          .first();

        if (!accessRecord) {
          return new Response(
            JSON.stringify({
              authorized: false,
              error: 'Access denied. You have not purchased this premium video, or your access was revoked.',
            }),
            { status: 403, headers: corsHeaders }
          );
        }
      } catch (dbErr) {
        console.warn('D1 access check warning:', dbErr);
      }
    }

    // YouTube Unlisted playback is gated by the same verified purchase/session checks above.
    // Note: Unlisted YouTube URLs can still be shared outside this website.
    if (youtubeUrl) {
      return new Response(JSON.stringify({
        authorized: true,
        accessType: 'premium',
        videoId,
        youtubeUrl,
      }), { status: 200, headers: corsHeaders });
    }

    // Step 3: Video is verified! Validate Cloudflare Stream credentials & video asset
    const accountId = env.CLOUDFLARE_STREAM_ACCOUNT_ID;
    const apiToken = env.CLOUDFLARE_STREAM_API_TOKEN;

    if (!accountId || !apiToken || accountId.includes('YOUR_') || apiToken.includes('YOUR_')) {
      return new Response(
        JSON.stringify({
          authorized: false,
          error: 'Cloudflare Stream credentials (CLOUDFLARE_STREAM_ACCOUNT_ID and CLOUDFLARE_STREAM_API_TOKEN) are not configured on the server. Secure playback tokens cannot be generated.',
        }),
        { status: 503, headers: corsHeaders }
      );
    }

    // Check if this video is a sample catalog entry without an uploaded stream UID
    if (!streamVideoId || streamVideoId.startsWith('mock_') || streamVideoId.startsWith('cf_stream_') || streamVideoId.startsWith('stream-')) {
      return new Response(
        JSON.stringify({
          authorized: false,
          error: 'This premium masterclass is a sample catalog entry without an active Cloudflare Stream UID. Please upload the video media in Cloudflare Stream dashboard and update streamVideoId.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Request genuine signed playback token directly from Cloudflare Stream API
    const cfStreamResp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${streamVideoId}/token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
          downloadable: false,
        }),
      }
    );

    if (!cfStreamResp.ok) {
      const errData = await cfStreamResp.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          authorized: false,
          error: `Failed to generate Cloudflare Stream signed token from Cloudflare API: ${errData.errors?.[0]?.message || cfStreamResp.statusText}`,
        }),
        { status: 502, headers: corsHeaders }
      );
    }

    const tokenData = await cfStreamResp.json();
    const signedToken = tokenData.result?.token;

    if (!signedToken) {
      return new Response(
        JSON.stringify({
          authorized: false,
          error: 'Cloudflare Stream API response did not include a valid playback token.',
        }),
        { status: 502, headers: corsHeaders }
      );
    }

    const playbackUrl = `https://customer-${accountId}.cloudflarestream.com/${signedToken}/manifest/video.m3u8`;

    return new Response(
      JSON.stringify({
        authorized: true,
        accessType: 'premium',
        videoId,
        streamVideoId,
        playbackToken: signedToken,
        playbackUrl,
        expiresInSeconds: 3600,
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        authorized: false,
        error: err.message || 'Internal server error while verifying stream authorization',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
