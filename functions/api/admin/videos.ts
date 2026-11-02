// Cloudflare Pages Function: /api/admin/videos
// Purpose: Secure admin CRUD management for video catalog (free & premium)

interface Env {
  DB?: any;
  ADMIN_SECRET_TOKEN?: string;
  [key: string]: any;
}

async function createHmac(payload: string, secret: string): Promise<string> {
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

async function verifyAdmin(request: Request, env: Env): Promise<boolean> {
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
    const expected = await createHmac(b64, signingKey);
    if (expected === sig) {
      const payload = JSON.parse(atob(b64));
      return payload.role === 'superadmin' && typeof payload.u === 'string' && payload.u.length > 0 && Number.isFinite(payload.exp) && payload.exp > Date.now();
    }
  } catch {
    return false;
  }
  return false;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
  'Content-Type': 'application/json',
};

// GET: Retrieve all videos with access metrics for admin dashboard
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const isAuth = await verifyAdmin(request, env);
  if (!isAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized admin access.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: 'D1_BINDING_MISSING: Video database is not connected.' }), {
      status: 503,
      headers: corsHeaders,
    });
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT v.*, 
       (SELECT COUNT(*) FROM customer_video_access a WHERE a.video_id = v.id AND a.is_revoked = 0) as active_subscribers_count
       FROM videos v ORDER BY created_at DESC`
    ).all();

    return new Response(JSON.stringify({ success: true, videos: results }), {
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

// POST: Create or Update a video
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const isAuth = await verifyAdmin(request, env);
  if (!isAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized admin access.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: 'D1_BINDING_MISSING: Video database is not connected.' }), {
      status: 503,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const {
      id,
      title,
      duration,
      category,
      instructor,
      description,
      topics,
      accessType,
      isPremium,
      price,
      currency,
      streamVideoId,
      youtubeUrl,
      level,
      thumbnailUrl,
      isActive,
    } = body as any;

    if (!title || !category || !instructor) {
      return new Response(
        JSON.stringify({ success: false, error: 'Title, category and instructor are required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const videoId = id || `vid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    // This website is paid-video-only. Ignore client attempts to save a free listing.
    const finalAccessType = 'premium';
    const finalIsPremium = 1;
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return new Response(JSON.stringify({ success: false, error: 'Paid video price must be greater than ₹0.' }), { status: 400, headers: corsHeaders });
    }
    const finalPrice = Math.floor(parsedPrice);
    if (finalPrice <= 0) {
      return new Response(JSON.stringify({ success: false, error: 'Paid video price must be at least ₹1.' }), { status: 400, headers: corsHeaders });
    }
    const topicsJson = JSON.stringify(Array.isArray(topics) ? topics : []);
    const isAct = isActive === false ? 0 : 1;

    // Active paid videos may use a genuine Cloudflare Stream UID or a valid YouTube URL.
    let normalizedYoutubeUrl: string | null = null;
    const rawYoutubeUrl = typeof youtubeUrl === 'string' ? youtubeUrl.trim() : '';
    if (rawYoutubeUrl) {
      try {
        const parsedUrl = new URL(rawYoutubeUrl);
        const host = parsedUrl.hostname.replace(/^www\\./, '').toLowerCase();
        let candidate = '';
        if (host === 'youtu.be') candidate = parsedUrl.pathname.split('/').filter(Boolean)[0] || '';
        else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
          const parts = parsedUrl.pathname.split('/').filter(Boolean);
          candidate = parsedUrl.searchParams.get('v') || (['embed', 'shorts'].includes(parts[0]) ? parts[1] : '');
        }
        if (!['youtu.be', 'youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host) || !/^[A-Za-z0-9_-]{11}$/.test(candidate)) {
          throw new Error('Invalid YouTube URL');
        }
        normalizedYoutubeUrl = `https://www.youtube.com/watch?v=${candidate}`;
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'Valid YouTube video URL required (youtu.be, youtube.com/watch, /embed or /shorts).' }), { status: 400, headers: corsHeaders });
      }
    }

    if (finalIsPremium === 1 && isAct === 1) {
      const cleanStreamId = typeof streamVideoId === 'string' ? streamVideoId.trim() : '';
      const validStreamId = !!cleanStreamId && !cleanStreamId.startsWith('cf_stream_') && !cleanStreamId.startsWith('mock_') && !cleanStreamId.startsWith('stream-');
      if (!normalizedYoutubeUrl && !validStreamId) {
        return new Response(JSON.stringify({ success: false, error: 'Active paid video ke liye valid YouTube URL ya genuine Cloudflare Stream UID zaroori hai.' }), { status: 400, headers: corsHeaders });
      }
    }

    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO videos (
           id, title, duration, category, instructor, description, topics_json,
           access_type, is_premium, price, currency, stream_video_id, youtube_url,
           level, thumbnail_url, is_active, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           duration = excluded.duration,
           category = excluded.category,
           instructor = excluded.instructor,
           description = excluded.description,
           topics_json = excluded.topics_json,
           access_type = excluded.access_type,
           is_premium = excluded.is_premium,
           price = excluded.price,
           currency = excluded.currency,
           stream_video_id = excluded.stream_video_id,
           youtube_url = excluded.youtube_url,
           level = excluded.level,
           thumbnail_url = excluded.thumbnail_url,
           is_active = excluded.is_active,
           updated_at = CURRENT_TIMESTAMP`
      )
        .bind(
          videoId,
          title,
          duration || '10 min',
          category,
          instructor,
          description || '',
          topicsJson,
          finalAccessType,
          finalIsPremium,
          finalPrice,
          currency || 'INR',
          streamVideoId || null,
          normalizedYoutubeUrl,
          level || 'Beginner',
          thumbnailUrl || null,
          isActive === false ? 0 : 1
        )
        .run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        message: 'Video saved successfully in catalog.',
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

// DELETE: Deactivate video
export async function onRequestDelete(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const isAuth = await verifyAdmin(request, env);
  if (!isAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized admin access.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: 'D1_BINDING_MISSING: Video database is not connected.' }), {
      status: 503,
      headers: corsHeaders,
    });
  }

  const url = new URL(request.url);
  const videoId = url.searchParams.get('id');

  if (!videoId) {
    return new Response(JSON.stringify({ error: 'Video ID parameter is required.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (env.DB) {
    try {
      await env.DB.prepare('UPDATE videos SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(videoId)
        .run();
    } catch (err: any) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }

  return new Response(
    JSON.stringify({ success: true, message: `Video ${videoId} deactivated successfully.` }),
    { status: 200, headers: corsHeaders }
  );
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
    },
  });
}
