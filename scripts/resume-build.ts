/**
 * Build résumé PDF and plain-text artifacts from the career record (#51).
 *
 *   npm run resume:build                 # every edition
 *   npm run resume:build -- ai-builder   # one edition
 *
 * Approved editions publish to public/resume/ (and AI Builder to /resume.pdf);
 * draft editions build to .resume-drafts/ for review and are never published.
 * Every artifact is generated and verified in a staging directory first. Any
 * failure exits non-zero and leaves the known-good published files untouched.
 * Requires Python with requirements-resume.txt and poppler's pdftotext.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import {
  COMPAT_PDF_PATH, COMPAT_PROFILE, DRAFT_DIR, MANIFEST_PATH, PAGE_BUDGETS, PUBLIC_DIR,
  artifactBaseName, checkArtifacts, missingFacts, pdfPageCount, pdfToText, renderPlainText, sha256,
  type Manifest, type ManifestEdition,
} from '../lib/resume/artifacts';
import { PROFILE_IDS, PROFILES, resolveResume, type ProfileId } from '../lib/resume/index';
import { SCHEMA_VERSION } from '../lib/resume/schema';

const ROOT = process.cwd();
const requested = process.argv.slice(2);
const unknown = requested.filter((id) => !(PROFILE_IDS as readonly string[]).includes(id));
if (unknown.length) {
  console.error(`Unknown profile(s): ${unknown.join(', ')}. Use: ${PROFILE_IDS.join(', ')}`);
  process.exit(2);
}
const targets = (requested.length ? requested : [...PROFILE_IDS]) as ProfileId[];

type Built = { profileId: ProfileId; approved: boolean; base: string; edition: ManifestEdition; renderer: string };

async function buildOne(profileId: ProfileId, staging: string, problems: string[], warnings: string[]): Promise<Built | undefined> {
  const doc = resolveResume(profileId);
  const approved = PROFILES[profileId].status === 'approved';
  const base = artifactBaseName(profileId, doc.identity.name);
  const jsonPath = join(staging, `${base}.json`);
  const pdfPath = join(staging, `${base}.pdf`);
  writeFileSync(jsonPath, JSON.stringify(doc));

  let renderer = '';
  try {
    const out = execFileSync(process.env.PYTHON ?? 'python3', ['scripts/generate-resume-pdf.py', jsonPath, pdfPath], { cwd: ROOT, encoding: 'utf8' });
    renderer = JSON.parse(out.trim().split('\n').pop()!).renderer;
  } catch (error) {
    problems.push(`${profileId}: PDF generation failed: ${(error as Error).message}`);
    return undefined;
  }
  const pdf = readFileSync(pdfPath);
  const pages = await pdfPageCount(pdf);
  const budget = PAGE_BUDGETS[profileId];
  if (budget !== null && pages > budget) {
    const message = `${profileId}: ${pages} pages, over the ${budget}-page budget. Edit the profile's selections; fonts are never shrunk and text is never dropped.`;
    (approved ? problems : warnings).push(message);
  }
  const extracted = pdfToText(pdfPath);
  if (extracted === null) problems.push('pdftotext is required to verify PDF text (install poppler-utils)');
  else for (const fact of missingFacts(doc, extracted)) problems.push(`${profileId}: PDF is missing text: "${fact.slice(0, 80)}"`);

  const text = renderPlainText(doc);
  writeFileSync(join(staging, `${base}.txt`), text);
  for (const warning of doc.warnings) warnings.push(`${profileId}: ${warning.code}: ${warning.message}`);
  return {
    profileId, approved, base, renderer,
    edition: {
      profileId, label: doc.profileLabel, contentDigest: doc.digest,
      pdf: { path: `${PUBLIC_DIR}/${base}.pdf`, sha256: sha256(pdf), pages, pageBudget: budget },
      text: { path: `${PUBLIC_DIR}/${base}.txt`, sha256: sha256(text) },
    },
  };
}

/** Write via a temporary sibling and rename, so readers never see a half-written file. */
function place(from: string, to: string) {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, `${to}.tmp`);
  renameSync(`${to}.tmp`, to);
}

async function main() {
  const staging = mkdtempSync(join(tmpdir(), 'resume-build-'));
  const problems: string[] = [];
  const warnings: string[] = [];
  const built: Built[] = [];
  try {
    for (const profileId of targets) {
      const result = await buildOne(profileId, staging, problems, warnings);
      if (result) built.push(result);
    }
    for (const warning of warnings) console.warn(`warning ${warning}`);
    if (problems.length) {
      for (const problem of problems) console.error(`error ${problem}`);
      console.error('\nNothing was published; existing artifacts are unchanged.');
      process.exitCode = 1;
      return;
    }

    const manifestFile = join(ROOT, MANIFEST_PATH);
    const previous: Manifest | undefined = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : undefined;
    const editions = new Map((previous?.editions ?? []).map((edition) => [edition.profileId, edition]));
    for (const item of built) {
      if (item.approved) {
        place(join(staging, `${item.base}.pdf`), join(ROOT, item.edition.pdf.path));
        place(join(staging, `${item.base}.txt`), join(ROOT, item.edition.text.path));
        editions.set(item.profileId, item.edition);
        if (item.profileId === COMPAT_PROFILE) place(join(staging, `${item.base}.pdf`), join(ROOT, COMPAT_PDF_PATH));
      } else {
        // A draft is never public: remove anything an earlier approval published.
        for (const ext of ['pdf', 'txt']) rmSync(join(ROOT, PUBLIC_DIR, `${item.base}.${ext}`), { force: true });
        editions.delete(item.profileId);
        for (const ext of ['pdf', 'txt', 'json']) place(join(staging, `${item.base}.${ext}`), join(ROOT, DRAFT_DIR, `${item.base}.${ext}`));
      }
    }
    const manifest: Manifest = {
      schemaVersion: SCHEMA_VERSION,
      renderer: built[0]?.renderer ?? previous?.renderer ?? '',
      editions: PROFILE_IDS.flatMap((id) => editions.get(id) ?? []),
      compatibility: { path: COMPAT_PDF_PATH, profileId: COMPAT_PROFILE },
    };
    mkdirSync(join(ROOT, PUBLIC_DIR), { recursive: true });
    writeFileSync(`${manifestFile}.tmp`, `${JSON.stringify(manifest, null, 2)}\n`);
    renameSync(`${manifestFile}.tmp`, manifestFile);

    for (const item of built) {
      const { pdf } = item.edition;
      console.log(`${item.approved ? 'published' : 'draft    '} ${item.profileId.padEnd(24)} ${pdf.pages} page(s)${pdf.pageBudget ? ` / ${pdf.pageBudget}` : ''}  ${item.approved ? pdf.path : `${DRAFT_DIR}/${item.base}.pdf`}`);
    }
    const { problems: after } = await checkArtifacts(ROOT, { requirePdfText: true });
    if (after.length) {
      for (const problem of after) console.error(`check ${problem}`);
      process.exitCode = 1;
    }
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
