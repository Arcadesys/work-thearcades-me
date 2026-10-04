/**
 * Résumé export contract (#51): file names, page budgets, the plain-text
 * renderer, and the freshness check for committed artifacts. Everything here is
 * pure or read-only, so tests and CI can verify artifacts without Python.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ResolvedResume, ResolvedSection } from './compose';
import { PROFILE_IDS, PROFILES, resolveResume, type ProfileId } from './index';
import { SCHEMA_VERSION } from './schema';

export const PUBLIC_DIR = 'public/resume';
export const DRAFT_DIR = '.resume-drafts';
export const MANIFEST_PATH = `${PUBLIC_DIR}/manifest.json`;
/** The long-standing default download. It is always a copy of the AI Builder PDF. */
export const COMPAT_PDF_PATH = 'public/resume.pdf';
export const COMPAT_PROFILE: ProfileId = 'ai-builder';

/** Targeted editions must fit two pages; the CV is uncapped. */
export const PAGE_BUDGETS: Record<ProfileId, number | null> = {
  'ai-builder': 2,
  'technical-program-owner': 2,
  'program-owner': 2,
  cv: null,
};

const EDITION_SLUGS: Record<ProfileId, string> = {
  'ai-builder': 'AI-Builder',
  'technical-program-owner': 'Technical-Program-Owner',
  'program-owner': 'Program-Owner',
  cv: 'CV',
};

/** `Austen-Tucker-Crowder-AI-Builder`, from the record's name and an allowlisted profile. */
export function artifactBaseName(profileId: ProfileId, name: string): string {
  if (!(PROFILE_IDS as readonly string[]).includes(profileId)) throw new Error(`Unknown profile ${profileId}`);
  return `${name.normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}-${EDITION_SLUGS[profileId]}`;
}

/** Absolute URL for a resolved link; only https and mailto leave the renderer. */
export function absoluteLink(href: string, siteUrl: string): string {
  const url = href.startsWith('/') && !href.startsWith('//') ? `${siteUrl}${href}` : href;
  if (!/^(https:\/\/|mailto:)/.test(url)) throw new Error(`Refusing unsafe link ${href}`);
  return url;
}

const roleHeading = (role: { employer: string; title: string }) => `${role.employer} — ${role.title}`;
const roleMeta = (role: { location?: string; dates: string }) => [role.location, role.dates].filter(Boolean).join(' | ');

function sectionLines(section: ResolvedSection, siteUrl: string): string[] {
  switch (section.kind) {
    case 'experience':
      return section.roles.flatMap((role) => ['', roleHeading(role), ...(role.scope ? [role.scope] : []), roleMeta(role), ...role.items.map((item) => `- ${item.text}`)]);
    case 'earlier':
      return section.roles.map((role) => `${role.employer} — ${role.title} (${role.dates})`);
    case 'highlights':
      return section.items.map((item) => `- ${item.text}`);
    case 'projects':
      return section.items.flatMap((item) => ['', item.name, item.description, `${item.proofLabel}: ${absoluteLink(item.proofHref, siteUrl)}`]);
    case 'skills':
      return section.groups.map((group) => `${group.label}: ${group.skills}`);
    case 'education':
      return section.items.map((item) => item.text);
    case 'publications':
    case 'talks':
      return section.items.map((item) => [item.title, item.venue, item.date, item.url].filter(Boolean).join(' — '));
    case 'community':
      return section.items.flatMap((item) => ['', `${item.organization} — ${item.title}`, ...(item.location ? [item.location] : []), item.description]);
  }
}

const isEmpty = (section: ResolvedSection) =>
  ('roles' in section && section.roles.length === 0) || ('items' in section && section.items.length === 0) || ('groups' in section && section.groups.length === 0);

/** UTF-8 plain text in reading order with every approved fact. Empty sections are omitted. */
export function renderPlainText(doc: ResolvedResume): string {
  const { identity } = doc;
  const lines = [
    identity.name,
    doc.headline,
    `${identity.location} | ${identity.email}`,
    `${identity.siteUrl} | ${identity.githubUrl}`,
    '',
    'Summary',
    doc.summary,
  ];
  for (const section of doc.sections) {
    if (isEmpty(section)) continue;
    const body = sectionLines(section, identity.siteUrl);
    lines.push('', section.title, ...(body[0] === '' ? body.slice(1) : body));
  }
  return `${lines.join('\n')}\n`;
}

/** Every fact string a rendered edition must contain, for PDF and text parity. */
export function documentFacts(doc: ResolvedResume): string[] {
  const facts = [doc.identity.name, doc.headline, doc.summary, doc.identity.email, doc.identity.location];
  for (const section of doc.sections) {
    if (isEmpty(section)) continue;
    facts.push(section.title);
    if ('roles' in section) for (const role of section.roles) facts.push(role.employer, role.title, role.dates, ...role.items.map((item) => item.text));
    if (section.kind === 'highlights' || section.kind === 'education') facts.push(...section.items.map((item) => item.text));
    if (section.kind === 'projects') for (const item of section.items) facts.push(item.name, item.description);
    if (section.kind === 'skills') for (const group of section.groups) facts.push(group.label, group.skills);
    if (section.kind === 'community') for (const item of section.items) facts.push(item.organization, item.title, item.description);
    if (section.kind === 'publications' || section.kind === 'talks') facts.push(...section.items.map((item) => item.title));
  }
  return facts;
}

export const normalizeText = (text: string) => text.replace(/\s+/g, ' ').trim();

/** Facts missing from text extracted from a PDF (footer lines removed, whitespace normalized). */
export function missingFacts(doc: ResolvedResume, extracted: string): string[] {
  const footer = new RegExp(`^\\s*(${escapeRegExp(doc.identity.name)} \\| ${escapeRegExp(doc.identity.site)}|\\d+ / \\d+)\\s*$`);
  const body = normalizeText(extracted.split(/\n|\f/).filter((line) => !footer.test(line)).join('\n'));
  return documentFacts(doc).filter((fact) => !body.includes(normalizeText(fact)));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export type ManifestEdition = {
  profileId: ProfileId;
  label: string;
  contentDigest: string;
  pdf: { path: string; sha256: string; pages: number; pageBudget: number | null };
  text: { path: string; sha256: string };
};

export type Manifest = {
  schemaVersion: number;
  renderer: string;
  /** Only approved editions are published. Draft editions build to DRAFT_DIR, which is not committed. */
  editions: ManifestEdition[];
  compatibility: { path: string; profileId: ProfileId };
};

export const sha256 = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');

export function pdfToText(pdfPath: string): string | null {
  try {
    return execFileSync('pdftotext', ['-enc', 'UTF-8', pdfPath, '-'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

export async function pdfPageCount(data: Buffer): Promise<number> {
  const { PDFDocument } = await import('pdf-lib');
  return (await PDFDocument.load(data)).getPageCount();
}

export const approvedProfiles = (): ProfileId[] => PROFILE_IDS.filter((id) => PROFILES[id].status === 'approved');

/**
 * Verifies the committed artifacts against the current content: digests, text,
 * hashes, page budgets, the compatibility PDF, and no unpublished drafts. With
 * pdftotext available it also checks that every fact appears in each PDF.
 */
export async function checkArtifacts(root = process.cwd(), options: { requirePdfText?: boolean } = {}): Promise<{ problems: string[]; notes: string[] }> {
  const problems: string[] = [];
  const notes: string[] = [];
  const manifestFile = join(root, MANIFEST_PATH);
  if (!existsSync(manifestFile)) return { problems: [`Missing ${MANIFEST_PATH}; run npm run resume:build`], notes };
  const manifest: Manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  if (manifest.schemaVersion !== SCHEMA_VERSION) problems.push(`Manifest schema ${manifest.schemaVersion} ≠ ${SCHEMA_VERSION}`);

  const approved = approvedProfiles();
  const listed = manifest.editions.map((edition) => edition.profileId);
  if (JSON.stringify(listed) !== JSON.stringify(approved)) problems.push(`Manifest lists [${listed}] but approved editions are [${approved}]`);

  const expectedFiles = new Set(['manifest.json']);
  for (const edition of manifest.editions) {
    if (!approved.includes(edition.profileId)) continue;
    const doc = resolveResume(edition.profileId);
    const base = artifactBaseName(edition.profileId, doc.identity.name);
    const where = `${edition.profileId}:`;
    if (edition.contentDigest !== doc.digest) problems.push(`${where} content changed since the artifacts were built (digest ${edition.contentDigest.slice(0, 12)} ≠ ${doc.digest.slice(0, 12)}); run npm run resume:build`);
    for (const [kind, ext] of [['pdf', 'pdf'], ['text', 'txt']] as const) {
      const expectedPath = `${PUBLIC_DIR}/${base}.${ext}`;
      expectedFiles.add(`${base}.${ext}`);
      if (edition[kind].path !== expectedPath) problems.push(`${where} ${kind} path ${edition[kind].path} ≠ ${expectedPath}`);
      const file = join(root, expectedPath);
      if (!existsSync(file)) { problems.push(`${where} missing ${expectedPath}`); continue; }
      if (sha256(readFileSync(file)) !== edition[kind].sha256) problems.push(`${where} ${expectedPath} does not match its manifest hash`);
    }
    const textFile = join(root, edition.text.path);
    if (existsSync(textFile) && readFileSync(textFile, 'utf8') !== renderPlainText(doc)) problems.push(`${where} ${edition.text.path} is stale`);
    const pdfFile = join(root, edition.pdf.path);
    if (!existsSync(pdfFile)) continue;
    const pages = await pdfPageCount(readFileSync(pdfFile));
    if (pages !== edition.pdf.pages) problems.push(`${where} PDF has ${pages} pages; manifest says ${edition.pdf.pages}`);
    const budget = PAGE_BUDGETS[edition.profileId];
    if (budget !== null && pages > budget) problems.push(`${where} PDF has ${pages} pages, over its ${budget}-page budget`);
    const extracted = pdfToText(pdfFile);
    if (extracted === null) {
      (options.requirePdfText ? problems : notes).push(`${where} pdftotext unavailable; PDF text parity not checked`);
    } else {
      for (const fact of missingFacts(doc, extracted)) problems.push(`${where} PDF is missing text: "${fact.slice(0, 80)}"`);
    }
  }

  const compat = manifest.editions.find((edition) => edition.profileId === COMPAT_PROFILE);
  if (manifest.compatibility?.path !== COMPAT_PDF_PATH || manifest.compatibility?.profileId !== COMPAT_PROFILE) problems.push('Manifest compatibility entry is wrong');
  if (!compat) problems.push(`${COMPAT_PDF_PATH} has no approved ${COMPAT_PROFILE} edition behind it`);
  else if (!existsSync(join(root, COMPAT_PDF_PATH)) || sha256(readFileSync(join(root, COMPAT_PDF_PATH))) !== compat.pdf.sha256) problems.push(`${COMPAT_PDF_PATH} is not the current ${COMPAT_PROFILE} PDF`);

  const publicDir = join(root, PUBLIC_DIR);
  for (const name of existsSync(publicDir) ? readdirSync(publicDir) : []) {
    if (!expectedFiles.has(name)) problems.push(`Unexpected file ${PUBLIC_DIR}/${name}; only approved editions are published`);
  }
  return { problems, notes };
}
