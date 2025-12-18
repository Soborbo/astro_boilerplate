import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site.config';

export const GET: APIRoute = () => {
  const siteUrl = siteConfig.url;
  
  const robotsTxt = `# Robots.txt - ${siteConfig.name}
# Generated automatically

User-agent: *
Allow: /

# Disallow admin/private pages
Disallow: /api/
Disallow: /admin/
Disallow: /_astro/
Disallow: /koszonjuk
Disallow: /thank-you

# Sitemap location
Sitemap: ${siteUrl}/sitemap-index.xml

# LLMs.txt for AI crawlers
# See: ${siteUrl}/llms.txt
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
