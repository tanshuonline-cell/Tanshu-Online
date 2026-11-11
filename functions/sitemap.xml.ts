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
  <url>
    <loc>https://tanshu-online.pages.dev/privacy-policy</loc>
  </url>
  <url>
    <loc>https://tanshu-online.pages.dev/terms-and-conditions</loc>
  </url>
  <url>
    <loc>https://tanshu-online.pages.dev/disclaimer</loc>
  </url>
  <url>
    <loc>https://tanshu-online.pages.dev/refund-policy</loc>
  </url>
  <url>
    <loc>https://tanshu-online.pages.dev/copyright</loc>
  </url>
  <url>
    <loc>https://tanshu-online.pages.dev/contact</loc>
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
