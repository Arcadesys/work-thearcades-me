import type { Metadata } from 'next';
import type { BlogPost } from './blog';
import type { CaseStudy } from './content';

export const SITE_URL = 'https://work.thearcades.me';

export const homepageMetadata: Metadata = {
  title: 'AI Engineering & Enablement | Austen Tucker-Crowder',
  description: 'Austen Tucker-Crowder builds practical AI systems, prototypes, and workflows, then helps teams understand and own what ships.',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/', types: { 'application/rss+xml': '/feed.xml' } },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'AI Engineering & Enablement | Austen Tucker-Crowder',
    description: 'Austen Tucker-Crowder builds practical AI systems, prototypes, and workflows, then helps teams understand and own what ships.',
    siteName: 'Austen Tucker-Crowder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Engineering & Enablement | Austen Tucker-Crowder',
    description: 'Austen Tucker-Crowder builds practical AI systems, prototypes, and workflows, then helps teams understand and own what ships.',
  },
};

export function blogPostMetadata(post: BlogPost): Metadata {
  const title = `${post.seo?.title ?? post.title} — Austen Tucker-Crowder`;
  const description = post.seo?.description ?? post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}`, types: { 'application/rss+xml': '/feed.xml' } },
    // The co-located PNG response is deliberately the share image for every article.
    // Display heroes may be SVGs, while social services consistently accept this raster card.
    openGraph: { type: 'article', url: `/blog/${post.slug}`, title, description, publishedTime: post.publishDate },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export function caseStudyMetadata(study: CaseStudy, siteName: string): Metadata {
  const title = `${study.title} — ${siteName}`;
  return {
    title,
    description: study.body,
    alternates: { canonical: `/work/${study.slug}` },
    openGraph: { type: 'article', url: `/work/${study.slug}`, title, description: study.body },
    twitter: { card: 'summary_large_image', title, description: study.body },
  };
}
