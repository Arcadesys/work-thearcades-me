import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Public work is intentionally open to search engines, AI search,
        // answer engines, and other standards-respecting crawlers. Keep the
        // small private working surfaces out of discovery.
        userAgent: '*',
        allow: '/',
        disallow: ['/journeys', '/jobs'],
      },
    ],
    sitemap: 'https://work.thearcades.me/sitemap.xml',
  };
}
