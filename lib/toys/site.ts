import { PERSON_NAME, SITE_URL, absoluteUrl } from '@/lib/site-metadata';

/**
 * The toys and Lab case studies moved here from www.thearcades.me (Nov 2026).
 * They were written against that site's helpers; these names map them onto
 * this site's metadata so the moved code stays close to its original.
 */
export const SITE_NAME = PERSON_NAME;
export { SITE_URL };
export const absoluteSiteUrl = absoluteUrl;

/** This site's generated default card (app/opengraph-image.tsx). */
export const DEFAULT_SOCIAL_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: PERSON_NAME,
} as const;
