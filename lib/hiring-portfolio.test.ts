import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { caseStudyBySlug, hero } from './content';
import { relatedPosts } from './blog';

const source = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('hiring entry leads with the approved enablement lane and immediate proof paths', () => {
  assert.equal(`${hero.headingBefore}${hero.headingAccent}${hero.headingAfter}`, 'AI enablement leader who builds.');
  const home = source('../app/page.tsx');
  const heroMarkup = home.slice(home.indexOf('<section className="shell section-top hero"'), home.indexOf('<div className="shell"><hr'));
  assert.match(heroMarkup, /<h1 className="hero-heading" id="hero-heading">/);
  assert.match(heroMarkup, /href="\/engineering"/);
  assert.match(heroMarkup, /data-funnel-placement="hero">Résumé/);
  assert.match(heroMarkup, /hero\.evidence/);
  assert.match(source('../components/site-header.tsx'), /aria-label="Hiring shortcuts"/);
});

test('Bunch discovery distinguishes inspectable code from an open-source licence', () => {
  const bunch = caseStudyBySlug('bunch')!;
  assert.doesNotMatch(`${bunch.title} ${bunch.body}`, /free and open|free, open/);
  assert.equal(bunch.homeDemoLink?.href, 'https://system.thearcades.me/demo');
  assert.equal(bunch.homeSupplementaryLink?.href, '/engineering');
  assert(bunch.snapshot?.some((item) => item.value.includes('rights are reserved')));
  assert.match(bunch.evidence!.note!, /one personal observation/);
});

test('case-study ownership remains explicit and outcome claims stay bounded', () => {
  const enablement = caseStudyBySlug('ai-enablement')!;
  assert(enablement.snapshot?.some((item) => item.value.includes('Senior Program Owner')));
  assert.match(enablement.star!.task!.join(' '), /led the Devin adoption effort/);
  assert.match(enablement.evidence!.note!, /broader organizational work/);
  const cockpit = caseStudyBySlug('job-search-cockpit')!;
  assert(cockpit.snapshot?.some((item) => item.value.includes('No hiring-outcome claim yet')));
  assert.match(caseStudyBySlug('guaranteed-rate')!.evidence!.note!, /separate pieces of work/);
});

test('the hiring path reaches contact before the newsletter and prioritizes relevant reading', () => {
  const home = source('../app/page.tsx');
  assert(home.indexOf('id="contact"') < home.indexOf('id="notes"'));
  const slugs = relatedPosts(caseStudyBySlug('ai-enablement')!).map(post => post.slug);
  assert.deepEqual(slugs, ['context-engineering-is-a-soda-gun', 'four-stages-nobody-tells-you-about']);
});
