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
      return !payload.exp || payload.exp > Date.now();
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
    return new Response(
      JSON.stringify({
        success: true,
        videos: [],
        message: 'D1 database binding not active; returning empty admin list.',
      }),
      { status: 200, headers: corsHeaders }
    );
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT v.*,
       (SELECT COUNT(*) FROM customer_video_access a WHERE a.video_id = v.id AND a.is_revoked = 0) as active_subscribers_count
       FROM videos v ORDER BY created_at DESC`
    ).all();

    return new Response(JSON.stringify({
      success: true,
      videos: results.map((row: any) => {
        let topics: string[] = [];
        try {
          const parsed = typeof row.topics_json === 'string' ? JSON.parse(row.topics_json) : row.topics_json;
          topics = Array.isArray(parsed) ? parsed : [];
        } catch {
          topics = [];
        }

        const youtubeUrl = row.youtube_url ?? undefined;
        const youtubeId = typeof youtubeUrl === 'string'
          ? (youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/)?.[1] ?? '')
          : '';

        return {
          id: String(row.id),
          title: row.title ?? '',
          duration: row.duration ?? '',
          category: row.category ?? '',
          instructor: row.instructor ?? '',
          description: row.description ?? '',
          topics,
          videoId: youtubeId,
          thumbnailUrl: row.thumbnail_url ?? undefined,
          accessType: row.access_type ?? 'free',
          isPremium: Number(row.is_premium) === 1,
          price: Number(row.price) || 0,
          currency: row.currency ?? 'INR',
          streamVideoId: row.stream_video_id ?? undefined,
          youtubeUrl,
          level: row.level ?? 'Beginner',
          isActive: Number(row.is_active) === 1,
          homepageOrder: row.homepage_order == null ? null : Number(row.homepage_order),
          activeSubscribersCount: Number(row.active_subscribers_count) || 0,
          createdAt: row.created_at ?? undefined,
          updatedAt: row.updated_at ?? undefined,
        };
      })
    }), {
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
    return new Response(JSON.stringify({ success: false, error: 'D1 database binding is not active. Video was not saved. Check the Preview DB binding.' }), {
      status: 503,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json().catch(() => ({}));

    // Dedicated, price-independent Homepage placement update.
    if ((body as any).homepageOrderOnly === true) {
      const videoId = String((body as any).id || '');
      const rawOrder = (body as any).homepageOrder;
      const homepageOrder = rawOrder === null || rawOrder === 0 || rawOrder === '' ? null : Number(rawOrder);
      if (!videoId || (homepageOrder !== null && (!Number.isInteger(homepageOrder) || homepageOrder < 1 || homepageOrder > 4))) {
        return new Response(JSON.stringify({ success: false, error: 'Choose Homepage position 1–4 or Not on Homepage.' }), { status: 400, headers: corsHeaders });
      }
      try {
        if (homepageOrder !== null) {
          await env.DB.prepare('UPDATE videos SET homepage_order = NULL WHERE homepage_order = ?').bind(homepageOrder).run();
        }
        const result = await env.DB.prepare('UPDATE videos SET homepage_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(homepageOrder, videoId).run();
        if (!result.meta?.changes) {
          return new Response(JSON.stringify({ success: false, error: 'Video record was not found.' }), { status: 404, headers: corsHeaders });
        }
        return new Response(JSON.stringify({ success: true, message: 'Homepage selection saved.' }), { status: 200, headers: corsHeaders });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: 'Homepage selection needs the Preview database migration first. ' + err.message }), { status: 503, headers: corsHeaders });
      }
    }

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
    const finalAccessType = accessType || (isPremium ? 'premium' : 'free');
    const finalIsPremium = finalAccessType === 'premium' ? 1 : 0;
    const finalPrice = finalIsPremium ? Math.max(0, Math.floor(Number(price) || 0)) : 0;
    const topicsJson = JSON.stringify(Array.isArray(topics) ? topics : []);
    const isAct = isActive === false ? 0 : 1;

    // Security & Validation Rule: Active premium videos must have one valid media source.
    if (finalIsPremium === 1 && isAct === 1) {
      const hasYoutubeSource = typeof youtubeUrl === 'string' && youtubeUrl.trim().length > 0;
      const hasStreamSource = typeof streamVideoId === 'string' && streamVideoId.trim().length > 0 && !streamVideoId.startsWith('cf_stream_') && !streamVideoId.startsWith('mock_') && !streamVideoId.startsWith('stream-');
      if (hasYoutubeSource === hasStreamSource) {
        return new Response(JSON.stringify({ success: false, error: 'Choose exactly one valid source: YouTube Unlisted URL or Cloudflare Stream Video UID.' }), { status: 400, headers: corsHeaders });
      }
      if (hasYoutubeSource) {
        try {
          const parsed = new URL(youtubeUrl.trim());
          const validHost = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'].includes(parsed.hostname);
          if (!validHost || !(parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).length)) throw new Error('invalid');
        } catch {
          return new Response(JSON.stringify({ success: false, error: 'Enter a valid YouTube video URL.' }), { status: 400, headers: corsHeaders });
        }
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
          youtubeUrl || null,
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
    return new Response(JSON.stringify({ success: false, error: 'D1 database binding is not active. No video was changed.' }), {
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
