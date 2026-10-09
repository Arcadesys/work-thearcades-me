import type { Metadata } from 'next';
import type { BlogPost } from './blog';
import { site, type CaseStudy } from './content';
import { originalEditionUrl } from './original-edition';

export const SITE_URL = 'https://work.thearcades.me';
export const PERSON_NAME = 'Austen Tucker-Crowder';
export const PERSON_ID = `${SITE_URL}/#person`;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** The single image id that per-post and per-study cards publish under. */
export const SOCIAL_CARD_ID = 'card';

/** Absolute URL of a dynamic route's raster social card (opengraph-image.tsx + generateImageMetadata). */
export function socialCardUrl(pagePath: string): string {
  return absoluteUrl(`${pagePath}/opengraph-image/${SOCIAL_CARD_ID}`);
}

/** Card alt text that names the piece, e.g. "Blog post: When in crisis, make tea. — Austen Tucker-Crowder". */
export function socialCardAlt(kind: string, title: string): string {
  return `${kind}: ${title} — ${PERSON_NAME}`;
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON_NAME,
    url: SITE_URL,
    jobTitle: 'Hands-On AI Builder',
    description: 'Hands-on AI builder and product-minded program owner who turns ambiguous problems into working systems, with a focus on accessibility, legibility, handoff, and participation.',
    knowsAbout: [
      'AI engineering',
      'Agentic AI',
      'AI enablement',
      'Human-in-the-loop systems',
      'Accessibility',
      'Product development',
      'Program leadership',
      'Rapid prototyping',
    ],
    sameAs: [site.linkedinUrl, site.githubUrl, site.creativeUrl, site.publishingUrl],
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
  // A copy of a thearcades.me original takes the original's document identity.
  const url = originalEditionUrl(post.slug) ?? absoluteUrl(`/blog/${post.slug}`);
  const description = post.seo?.description ?? post.excerpt;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(description ? { description } : {}),
    url,
    mainEntityOfPage: url,
    datePublished: post.publishDate,
    dateModified: post.updatedDate ?? post.publishDate,
    author: personJsonLd(),
    // Same raster card as og:image; display heroes may be SVG.
    image: socialCardUrl(`/blog/${post.slug}`),
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
    image: socialCardUrl(`/work/${study.slug}`),
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

/**
 * Root-layout defaults. Every route inherits these, so they must never name a
 * page: no canonical and no og:url. A route that forgets its own canonical then
 * emits none, rather than silently claiming to be the homepage.
 */
export const siteDefaultMetadata: Metadata = {
  title: 'Hands-On AI Builder | Austen Tucker-Crowder',
  description: 'Austen Tucker-Crowder builds useful AI systems, from prototype to working product, backed by program leadership, product judgment, and measurable AI-adoption experience.',
  metadataBase: new URL(SITE_URL),
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
  openGraph: { type: 'website', siteName: PERSON_NAME },
  twitter: { card: 'summary_large_image' },
};

export const homepageMetadata: Metadata = {
  title: 'Hands-On AI Builder | Austen Tucker-Crowder',
  description: 'Austen Tucker-Crowder builds useful AI systems, from prototype to working product, backed by program leadership, product judgment, and measurable AI-adoption experience.',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/', types: { 'application/rss+xml': '/feed.xml' } },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Hands-On AI Builder | Austen Tucker-Crowder',
    description: 'Austen Tucker-Crowder builds useful AI systems, from prototype to working product, backed by program leadership, product judgment, and measurable AI-adoption experience.',
    siteName: 'Austen Tucker-Crowder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hands-On AI Builder | Austen Tucker-Crowder',
    description: 'Austen Tucker-Crowder builds useful AI systems, from prototype to working product, backed by program leadership, product judgment, and measurable AI-adoption experience.',
  },
};

export const blogIndexMetadata: Metadata = {
  title: 'AI Engineering Build Logs & Essays',
  description: 'Build logs and essays about AI, engineering, and making useful things.',
  alternates: { canonical: '/blog', types: { 'application/rss+xml': '/feed.xml' } },
  openGraph: {
    type: 'website',
    url: '/blog',
    title: 'AI Engineering Build Logs & Essays',
    description: 'Build logs and essays about AI, engineering, and making useful things.',
    siteName: PERSON_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Engineering Build Logs & Essays',
    description: 'Build logs and essays about AI, engineering, and making useful things.',
  },
};

export function blogTagMetadata(tag: string, postCount: number): Metadata {
  const title = `${tag} — Blog — Austen Tucker-Crowder`;
  return {
    title,
    alternates: { canonical: `/blog/tag/${encodeURIComponent(tag)}` },
    robots: postCount < 3 ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export function blogPostMetadata(post: BlogPost): Metadata {
  const title = `${post.seo?.title ?? post.title} — Austen Tucker-Crowder`;
  const description = post.seo?.description ?? post.excerpt;
  // Copies of thearcades.me originals point there; work-only posts self-canonicalize.
  const canonical = originalEditionUrl(post.slug) ?? `/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical, types: { 'application/rss+xml': '/feed.xml' } },
    // The co-located PNG response is deliberately the share image for every article.
    // Display heroes may be SVGs, while social services consistently accept this raster card.
    openGraph: { type: 'article', url: canonical, title, description, publishedTime: post.publishDate },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export function caseStudyMetadata(study: CaseStudy, siteName: string): Metadata {
  const socialTitle = `${study.title} — ${siteName}`;
  const title = study.seoTitle ?? socialTitle;
  return {
    title,
    description: study.body,
    alternates: {
      canonical: `/work/${study.slug}`,
      types: { 'text/markdown': `/work/${study.slug}.md` },
    },
    openGraph: { type: 'article', url: `/work/${study.slug}`, title: socialTitle, description: study.body },
    twitter: { card: 'summary_large_image', title: socialTitle, description: study.body },
  };
}
