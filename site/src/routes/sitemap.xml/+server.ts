import { pages, site } from '../../lib/site.ts';

export const prerender = true;

export function GET() {
  const urls = pages.map((p) => `  <url><loc>${site}${p}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { 'content-type': 'application/xml' } });
}
