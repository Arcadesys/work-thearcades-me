/**
 * Web routes and downloads for résumé editions (#50). Only approved editions
 * get a page; AI Builder is the default and lives at /resume.
 */
import type { Metadata } from 'next';

import manifest from '../../public/resume/manifest.json';

import type { Manifest } from './artifacts';
import type { ResolvedResume } from './compose';
import { PROFILE_IDS, PROFILES, type ProfileId } from './index';

export const DEFAULT_EDITION: ProfileId = 'ai-builder';
export const RESUME_BASE_PATH = '/resume';

export const editionPath = (id: ProfileId) => (id === DEFAULT_EDITION ? RESUME_BASE_PATH : `${RESUME_BASE_PATH}/${id}`);

/** Approved editions in display order. Drafts never get a route. */
export const publishedEditions = (): ProfileId[] => PROFILE_IDS.filter((id) => PROFILES[id].status === 'approved');

export function isPublishedEdition(value: string): value is ProfileId {
  return (publishedEditions() as string[]).includes(value);
}

export type EditionDownloads = { pdf: { href: string; pages: number }; text: { href: string } };

/** Download links for a published edition, from the committed export manifest. */
export function editionDownloads(id: ProfileId): EditionDownloads {
  const edition = (manifest as Manifest).editions.find((item) => item.profileId === id);
  if (!edition) throw new Error(`No published artifacts for ${id}; run npm run resume:build`);
  const href = (path: string) => path.replace(/^public/, '');
  return {
    // The default edition keeps the long-standing /resume.pdf link (same bytes).
    pdf: { href: id === DEFAULT_EDITION ? '/resume.pdf' : href(edition.pdf.path), pages: edition.pdf.pages },
    text: { href: href(edition.text.path) },
  };
}

export const editionLinks = () => publishedEditions().map((id) => ({ id, label: PROFILES[id].label, href: editionPath(id) }));

const editionTitle = (doc: ResolvedResume) =>
  doc.profileId === DEFAULT_EDITION ? `Résumé — ${doc.identity.name}` : `Résumé: ${doc.profileLabel} — ${doc.identity.name}`;

/** Title, description, self-canonical and social identity for one published edition. */
export function resumeMetadata(doc: ResolvedResume): Metadata {
  const title = editionTitle(doc);
  const path = editionPath(doc.profileId);
  return {
    title,
    description: doc.page.description,
    alternates: { canonical: path },
    openGraph: { type: 'profile', title, description: doc.page.description, url: path },
    twitter: { card: 'summary_large_image', title, description: doc.page.description },
  };
}
