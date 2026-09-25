import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Working brief with unresolved status notes. The route returns 404;
        // this rule also avoids unnecessary crawler requests.
        disallow: ['/journeys', '/jobs'],
      },
      ...['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'].map(userAgent => ({
        userAgent,
        allow: '/',
        disallow: ['/journeys', '/jobs'],
      })),
    ],
    sitemap: 'https://work.thearcades.me/sitemap.xml',
  };
}
