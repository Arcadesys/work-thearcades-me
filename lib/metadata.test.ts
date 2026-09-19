import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Metadata } from 'next';
import { homepageMetadata, PERSON_ID, SITE_URL, blogPostMetadata, caseStudyMetadata, blogPostJsonLd, caseStudyJsonLd, blogIndexMetadata, guideJsonLd, websiteJsonLd } from './site-metadata';
import { loadPosts } from './blog';
import { caseStudyBySlug, site, workWithMe } from './content';
import { pictureGuide } from './guides';
import { RESUME_CANONICAL_PATH } from './resume';
import { serializeJsonLd } from './json-ld';

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
  assert.equal(tea.openGraph?.title, 'What I Did After a Layoff: Start With Tea — Austen Tucker-Crowder');
  assert.equal(bunch.openGraph?.title, 'Bunch: free, open software for continuity across memory gaps — Austen Tucker-Crowder');
});

test('case studies use exact search titles without changing their visible editorial headings', () => {
  const bunch = caseStudyBySlug('bunch')!;
  const enablement = caseStudyBySlug('ai-enablement')!;

  assert.equal(caseStudyMetadata(bunch, site.name).title, 'Building an MCP Context System: Bunch');
  assert.equal(caseStudyMetadata(enablement, site.name).title, 'AI Adoption Case Study: ActiveCampaign');
  assert.equal(bunch.title, 'Bunch: free, open software for continuity across memory gaps');
  assert.equal(enablement.title, 'Turning AI adoption into measurable, repeatable practice');
  assert.equal(blogIndexMetadata.title, 'AI Engineering Build Logs & Essays');
});

test('structured data is canonical, source-bounded, and safe to embed in HTML', () => {
  const post = loadPosts().find((candidate) => candidate.slug === 'when-in-crisis-make-tea')!;
  const study = caseStudyBySlug('bunch')!;
  const postSchema = blogPostJsonLd(post);
  const studySchema = caseStudyJsonLd(study);

  assert.equal(postSchema['@type'], 'BlogPosting');
  assert.equal(postSchema.url, `${SITE_URL}/blog/when-in-crisis-make-tea`);
  assert.equal(postSchema.datePublished, post.publishDate);
  assert.equal(studySchema['@type'], 'Article');
  assert.equal(studySchema.url, `${SITE_URL}/work/bunch`);
  assert.equal(studySchema.author.name, 'Austen Tucker-Crowder');
  assert.deepEqual(websiteJsonLd(), { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: 'Austen Tucker-Crowder', url: SITE_URL, publisher: { '@id': PERSON_ID } });
  assert.equal(guideJsonLd(pictureGuide).url, `${SITE_URL}${pictureGuide.path}`);
  assert.equal(serializeJsonLd({ headline: '</script><script>alert(1)</script>' }).includes('</script>'), false);
  assert.match(serializeJsonLd({ headline: '</script>' }), /\\u003c\/script>/);
});
