import sources from '../content/blog-sources.json';

/** thearcades.me owns original provenance (shared AGENTS.md policy, map v2). */
export const ORIGINAL_SITE_URL = 'https://www.thearcades.me';

const SLUG = '[a-z0-9]+(?:-[a-z0-9]+)*';
const ORIGINAL_ARTICLE_PATH = new RegExp(`^/projects/${SLUG}/${SLUG}$`);

/** Fail closed: a malformed source URL must never become a canonical. */
export function validateOriginalEditionUrl(slug: string, value: unknown): string {
  let url: URL;
  try {
    url = new URL(String(value));
  } catch {
    throw new TypeError(`Invalid original edition URL for ${slug}`);
  }
  if (url.origin !== ORIGINAL_SITE_URL || url.href !== value || url.username || url.password
    || url.search || url.hash || !ORIGINAL_ARTICLE_PATH.test(url.pathname)) {
    throw new TypeError(`Original edition for ${slug} must be an exact HTTPS thearcades.me article URL`);
  }
  return url.href;
}

const originalBySlug = new Map(
  Object.entries(sources as Record<string, { url?: unknown }>)
    .filter(([, source]) => source.url !== undefined)
    .map(([slug, source]) => [slug, validateOriginalEditionUrl(slug, source.url)]),
);

/** The thearcades.me original a work copy points to, or undefined for work-only posts. */
export function originalEditionUrl(slug: string): string | undefined {
  return originalBySlug.get(slug);
}
