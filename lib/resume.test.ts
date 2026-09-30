import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PDFDict, PDFDocument, PDFName, PDFString } from 'pdf-lib';

import {
  RESUME_ACCOMPLISHMENTS,
  RESUME_BUILDS,
  RESUME_EXPERIENCE,
  RESUME_HIRING_EXPERIENCE,
  RESUME_HIRING_SKILLS,
  RESUME_PROFILE,
  RESUME_SKILLS,
  RESUME_SUMMARY,
} from './resume';

test('the hiring edition preserves the approved lane, official title, and shared attribution', () => {
  assert.equal(RESUME_PROFILE.titleLine, 'Hands-On AI Builder | Product & Program Leadership');
  assert.equal(RESUME_HIRING_EXPERIENCE[0].title, 'Senior Program Owner | AI Enablement & Transformation');
  assert.match(RESUME_HIRING_EXPERIENCE[0].bullets[0], /^Helped raise agentic-coding adoption from roughly 2% to 43% of merge requests/);
  assert.doesNotMatch(RESUME_SUMMARY, /2%|43%/);
});

test('public selections keep the full claim bank and its positional identities intact', () => {
  assert.equal(RESUME_ACCOMPLISHMENTS.length, 8);
  assert.deepEqual(RESUME_EXPERIENCE.map((role) => role.bullets.length), [10, 3, 2, 3, 3]);
  assert.deepEqual(RESUME_HIRING_EXPERIENCE.map((role) => role.bullets.length), [6, 2, 2, 2, 2]);
  for (const [index, role] of RESUME_HIRING_EXPERIENCE.entries()) {
    assert.equal(role.company, RESUME_EXPERIENCE[index].company);
    assert(role.bullets.every((bullet) => RESUME_EXPERIENCE[index].bullets.includes(bullet)));
  }
  assert.equal(RESUME_SKILLS.length, 6);
  assert.equal(RESUME_HIRING_SKILLS.length, 4);
  assert(RESUME_HIRING_SKILLS.every((group) => RESUME_SKILLS.includes(group)));
});

test('the résumé gives builds direct proof paths without a repeated accomplishments section', () => {
  assert.deepEqual(RESUME_BUILDS.map((build) => build.proofHref), ['/engineering', '/work/job-search-cockpit']);
  const page = readFileSync(new URL('../app/resume/page.tsx', import.meta.url), 'utf8');
  assert(page.includes('RESUME_HIRING_EXPERIENCE.map'));
  assert(page.includes('RESUME_HIRING_SKILLS.map'));
  assert(page.includes('RESUME_BUILDS.map'));
  assert(!page.includes('RESUME_ACCOMPLISHMENTS'));
  assert(page.indexOf('id="resume-experience"') < page.indexOf('id="resume-builds"'));
});

test('the published PDF is two pages with clickable contact and build evidence', async () => {
  const pdf = await PDFDocument.load(readFileSync(new URL('../public/resume.pdf', import.meta.url)));
  assert.equal(pdf.getPageCount(), 2);
  assert.equal(pdf.getAuthor(), RESUME_PROFILE.name);
  assert.equal(pdf.getSubject(), RESUME_PROFILE.titleLine);
  const urls = pdf.getPages().flatMap((page) => {
    const annotations = page.node.Annots();
    if (!annotations) return [];
    return Array.from({ length: annotations.size() }, (_, index) => {
      const annotation = annotations.lookup(index, PDFDict);
      const action = annotation.lookup(PDFName.of('A'), PDFDict);
      return action.lookup(PDFName.of('URI'), PDFString).decodeText();
    });
  });
  for (const url of [
    `mailto:${RESUME_PROFILE.email}`,
    RESUME_PROFILE.siteUrl,
    RESUME_PROFILE.githubUrl,
    ...RESUME_BUILDS.map((build) => `${RESUME_PROFILE.siteUrl}${build.proofHref}`),
  ]) assert(urls.includes(url), `Missing PDF link: ${url}`);
});
