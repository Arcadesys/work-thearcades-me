import type { MetadataRoute } from 'next';
import { publicPosts } from '@/lib/blog';
import { caseStudies, site } from '@/lib/content';

const BASE_URL = 'https://work.thearcades.me';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = publicPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}${site.resumeUrl}`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/work-with-me`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/layoff-triage`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedDate ?? post.publishDate),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const workRoutes: MetadataRoute.Sitemap = caseStudies.map((study) => ({
    url: `${BASE_URL}/work/${study.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // /journeys is intentionally excluded: it's noindex (app/journeys/page.tsx).
  return [...staticRoutes, ...postRoutes, ...workRoutes];
}
