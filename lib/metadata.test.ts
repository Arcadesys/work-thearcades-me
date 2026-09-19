import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Metadata } from 'next';
import { homepageMetadata, SITE_URL, blogPostMetadata, caseStudyMetadata } from './site-metadata';
import { loadPosts } from './blog';
import { caseStudyBySlug, site, workWithMe } from './content';
import { RESUME_CANONICAL_PATH } from './resume';

const absolute = (path: string) => new URL(path, SITE_URL).href;

function canonical(metadata: Metadata) {
  return metadata.alternates?.canonical?.toString();
}

test('public entry points keep their explicit, absolute canonical contracts', async () => {
  const tea = blogPostMetadata(loadPosts().find((post) => post.slug === 'when-in-crisis-make-tea')!);
  const bunch = caseStudyMetadata(caseStudyBySlug('bunch')!, site.name);

  assert.equal(absolute(canonical(homepageMetadata)!), `${SITE_URL}/`);
  assert.equal(absolute('/work-with-me'), `${SITE_URL}/work-with-me`);
  assert.equal(absolute('/layoff-triage'), `${SITE_URL}/layoff-triage`);
  assert.equal(absolute(canonical(tea)!), `${SITE_URL}/blog/when-in-crisis-make-tea`);
  assert.equal(absolute(canonical(bunch)!), `${SITE_URL}/work/bunch`);
  assert.equal(absolute(RESUME_CANONICAL_PATH), `${SITE_URL}/resume`);
});

test('social metadata stays route-specific and requests raster large-image cards', async () => {
  const tea = blogPostMetadata(loadPosts().find((post) => post.slug === 'when-in-crisis-make-tea')!);
  const bunch = caseStudyMetadata(caseStudyBySlug('bunch')!, site.name);

  assert.equal(homepageMetadata.openGraph?.url, '/');
  assert.equal(workWithMe.title, 'Build the first useful version');
  assert.equal(tea.openGraph?.url, '/blog/when-in-crisis-make-tea');
  assert.equal(bunch.openGraph?.url, '/work/bunch');
  for (const metadata of [homepageMetadata, tea, bunch]) {
    assert(metadata.twitter && 'card' in metadata.twitter);
    assert.equal(metadata.twitter.card, 'summary_large_image');
  }
  assert.equal(tea.openGraph?.title, 'When in crisis, make tea. — Austen Tucker-Crowder');
  assert.equal(bunch.openGraph?.title, 'Bunch: free, open software for continuity across memory gaps — Austen Tucker-Crowder');
});
