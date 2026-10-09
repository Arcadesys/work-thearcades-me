/**
 * Markdown release report for résumé editions (#52), written to the CI job
 * summary: every edition's status, digest and page count, plus the content
 * diff against a base ref. `npm run resume:report -- origin/main`
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

import { DRAFT_DIR, MANIFEST_PATH, PAGE_BUDGETS, artifactBaseName, pdfPageCount, type Manifest } from '../lib/resume/artifacts';
import { PROFILE_IDS, PROFILES, resolveResume } from '../lib/resume/index';

async function main() {
const base = process.argv[2];
const git = (...args: string[]) => {
  try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return ''; }
};
const manifest: Manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
const revision = git('rev-parse', 'HEAD').trim() || 'unknown';

const lines = [
  '## Résumé editions',
  '',
  `Tested revision: \`${revision}\``,
  '',
  '| Edition | Status | Pages | Content digest | Download |',
  '| --- | --- | --- | --- | --- |',
];
for (const id of PROFILE_IDS) {
  const doc = resolveResume(id);
  const published = manifest.editions.find((edition) => edition.profileId === id);
  const budget = PAGE_BUDGETS[id];
  const draftPdf = `${DRAFT_DIR}/${artifactBaseName(id, doc.identity.name)}.pdf`;
  const count = published?.pdf.pages ?? (existsSync(draftPdf) ? await pdfPageCount(readFileSync(draftPdf)) : undefined);
  const pages = count === undefined ? 'not built' : `${count}${budget ? ` / ${budget}` : ''}`;
  const where = published ? `\`${published.pdf.path.replace(/^public/, '')}\`` : `workflow artifact \`${draftPdf}\``;
  lines.push(`| ${PROFILES[id].label} | ${PROFILES[id].status} | ${pages} | \`${doc.digest.slice(0, 12)}\` | ${where} |`);
}
if (base) {
  const diff = git('diff', '--stat', base, '--', 'content/resume', 'public/resume', 'public/resume.pdf').trim();
  const text = git('diff', '--unified=1', base, '--', 'content/resume', 'public/resume/*.txt').trim();
  lines.push('', `### Changes since \`${base}\``, '', diff ? '```\n' + diff + '\n```' : 'No résumé content or artifact changes.');
  if (text) lines.push('', '<details><summary>Content diff</summary>', '', '```diff', text.slice(0, 60_000), '```', '', '</details>');
}
lines.push('', 'Draft editions are public-safe fixtures for review and are not published. Previews and artifacts are not private storage.');
console.log(lines.join('\n'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
