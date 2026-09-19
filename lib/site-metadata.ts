import type { Metadata } from 'next';
import type { BlogPost } from './blog';
import type { CaseStudy } from './content';

export const SITE_URL = 'https://work.thearcades.me';
export const PERSON_NAME = 'Austen Tucker-Crowder';
export const PERSON_ID = `${SITE_URL}/#person`;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON_NAME,
    url: SITE_URL,
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: PERSON_NAME,
    url: SITE_URL,
    publisher: { '@id': PERSON_ID },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPostJsonLd(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const description = post.seo?.description ?? post.excerpt;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(description ? { description } : {}),
    url,
    mainEntityOfPage: url,
    datePublished: post.publishDate,
    ...(post.updatedDate ? { dateModified: post.updatedDate } : {}),
    author: personJsonLd(),
    ...(post.hero ? { image: absoluteUrl(post.hero.src) } : {}),
  };
}

export function caseStudyJsonLd(study: CaseStudy) {
  const url = absoluteUrl(`/work/${study.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: study.title,
    description: study.body,
    url,
    mainEntityOfPage: url,
    author: personJsonLd(),
    ...(study.image ? { image: absoluteUrl(study.image.src) } : {}),
  };
}

export function guideJsonLd(guide: { title: string; description: string; path: string }) {
  const url = absoluteUrl(guide.path);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    url,
    mainEntityOfPage: url,
    author: personJsonLd(),
  };
}

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

export const blogIndexMetadata: Metadata = {
  title: 'AI Engineering Build Logs & Essays',
  description: 'Build logs and essays about AI, engineering, and making useful things.',
  alternates: { canonical: '/blog', types: { 'application/rss+xml': '/feed.xml' } },
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
  const socialTitle = `${study.title} — ${siteName}`;
  const title = study.seoTitle ?? socialTitle;
  return {
    title,
    description: study.body,
    alternates: { canonical: `/work/${study.slug}` },
    openGraph: { type: 'article', url: `/work/${study.slug}`, title: socialTitle, description: study.body },
    twitter: { card: 'summary_large_image', title: socialTitle, description: study.body },
  };
}
