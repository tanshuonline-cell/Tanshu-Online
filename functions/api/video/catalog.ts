// Cloudflare Pages Function: /api/video/catalog
// Purpose: Public endpoint returning active video courses and tutorials for customers

interface Env {
  DB?: any;
  [key: string]: any;
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { env } = context;

  if (env.DB) {
    try {
      const { results } = await env.DB.prepare(
        'SELECT * FROM videos WHERE is_active = 1 ORDER BY CASE WHEN homepage_order BETWEEN 1 AND 4 THEN 0 ELSE 1 END, homepage_order ASC, created_at DESC'
      ).all();

      if (results && results.length > 0) {
        const formatted = results.map((row: any) => ({
          id: row.id,
          title: row.title,
          duration: row.duration,
          category: row.category,
          instructor: row.instructor,
          description: row.description,
          topics: (() => {
            try {
              return JSON.parse(row.topics_json);
            } catch {
              return [];
            }
          })(),
          videoId: row.id,
          accessType: row.access_type,
          isPremium: Boolean(row.is_premium),
          price: Number(row.price) || 0,
          currency: row.currency || 'INR',
          streamVideoId: row.stream_video_id || '',
          youtubeUrl: row.youtube_url || undefined,
          level: row.level || 'Beginner',
          thumbnailUrl: row.thumbnail_url || undefined,
          isActive: Boolean(row.is_active),
          homepageOrder: row.homepage_order == null ? null : Number(row.homepage_order),
        }));

        return new Response(JSON.stringify({ success: true, videos: formatted }), {
          status: 200,
          headers: corsHeaders,
        });
      }
    } catch (err: any) {
      console.warn('D1 catalog fetch error:', err);
    }
  }

  // Fallback: Return empty or dynamic message if DB is unpopulated
  return new Response(JSON.stringify({ success: true, videos: [] }), {
    status: 200,
    headers: corsHeaders,
  });
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
