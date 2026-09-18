import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Working brief with unresolved status notes, not a public page. Also noindex'd in app/journeys/page.tsx.
      disallow: '/journeys',
    },
    sitemap: 'https://work.thearcades.me/sitemap.xml',
  };
}
