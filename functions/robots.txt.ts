export async function onRequestGet(): Promise<Response> {
  const robotsTxt = `# Robots.txt for TANSHU ONLINE
# Domain: https://tansu-online.pages.dev

User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://tansu-online.pages.dev/sitemap.xml
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
