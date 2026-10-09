import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import sitemap from '../../app/sitemap';
import { DEFAULT_EDITION, editionDownloads, editionPath, isPublishedEdition, publishedEditions, resumeMetadata } from './editions';
import { PROFILE_IDS, PROFILES, resolveResume } from './index';

test('only approved editions are published; AI Builder is the default at /resume', () => {
  assert.equal(DEFAULT_EDITION, 'ai-builder');
  assert.deepEqual(publishedEditions(), PROFILE_IDS.filter((id) => PROFILES[id].status === 'approved'));
  assert.deepEqual(PROFILE_IDS.map(editionPath), ['/resume', '/resume/technical-program-owner', '/resume/program-owner', '/resume/cv']);
  for (const bad of ['cv', 'technical-program-owner', 'program-owner', 'nope', '../package.json', '', 'AI-Builder']) {
    assert.equal(isPublishedEdition(bad), false, bad);
  }
  assert.equal(isPublishedEdition('ai-builder'), true);
});

test('downloads come from the export manifest; the default keeps /resume.pdf', () => {
  const manifest = JSON.parse(readFileSync('public/resume/manifest.json', 'utf8'));
  assert.deepEqual(editionDownloads('ai-builder'), {
    pdf: { href: '/resume.pdf', pages: manifest.editions[0].pdf.pages },
    text: { href: '/resume/Austen-Tucker-Crowder-AI-Builder.txt' },
  });
  assert.throws(() => editionDownloads('cv'), /No published artifacts/);
});

test('each edition has its own title, description and self-canonical', () => {
  const builder = resumeMetadata(resolveResume('ai-builder'));
  assert.equal(builder.title, 'Résumé — Austen Tucker-Crowder');
  assert.equal(builder.alternates?.canonical, '/resume');
  assert.match(String(builder.description), /^Hands-on AI builder/);
  const tpo = resumeMetadata(resolveResume('technical-program-owner'));
  assert.equal(tpo.title, 'Résumé: Technical Program Owner — Austen Tucker-Crowder');
  assert.equal(tpo.alternates?.canonical, '/resume/technical-program-owner');
  assert.equal((tpo.openGraph as { url?: string }).url, '/resume/technical-program-owner');
});

test('/resume/ai-builder redirects to /resume, and drafts stay out of the sitemap', () => {
  assert.match(readFileSync('next.config.ts', 'utf8'), /source: '\/resume\/ai-builder', destination: '\/resume', permanent: true/);
  const urls = sitemap().map((entry) => entry.url);
  assert(urls.includes('https://work.thearcades.me/resume'));
  for (const id of PROFILE_IDS.filter((profile) => !publishedEditions().includes(profile))) {
    assert(!urls.includes(`https://work.thearcades.me${editionPath(id)}`), `${id} in sitemap`);
  }
});
