export async function onRequestGet(): Promise<Response> {
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tanshu-online.pages.dev/</loc>
  </url>
  <url>
    <loc>https://tanshu-online.pages.dev/videos</loc>
  </url>
  <url>
    <loc>https://tanshu-online.pages.dev/digital-seva</loc>
  </url>
  <url>
    <loc>https://tanshu-online.pages.dev/advanced-photo-studio-preview</loc>
  </url>
</urlset>`;

  return new Response(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
