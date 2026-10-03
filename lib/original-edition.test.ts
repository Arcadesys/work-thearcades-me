import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadPosts } from './blog';
import { caseStudyBySlug, site } from './content';
import { originalEditionUrl, validateOriginalEditionUrl } from './original-edition';
import { blogPostJsonLd, blogPostMetadata, caseStudyMetadata, SITE_URL } from './site-metadata';

// Map v2: thearcades.me originals are canonical; these work copies point there.
const COPIES = [
  { slug: 'bunch', original: 'https://www.thearcades.me/projects/bunch/bunch' },
  { slug: 'four-stages-nobody-tells-you-about', original: 'https://www.thearcades.me/projects/arcade-blog/four-stages-nobody-tells-you-about' },
  { slug: 'claude-design-and-the-novel-t', original: 'https://www.thearcades.me/projects/the-singularity-log/claude-design-and-the-novel-t' },
] as const;

for (const { slug, original } of COPIES) {
  test(`${slug}: copy points canonical, og:url and schema identity at the original`, () => {
    const post = loadPosts().find((candidate) => candidate.slug === slug);
    assert.ok(post, slug);
    assert.equal(originalEditionUrl(slug), original);
    const metadata = blogPostMetadata(post);
    assert.equal(metadata.alternates?.canonical, original);
    assert.equal(metadata.openGraph?.url, original);
    const schema = blogPostJsonLd(post);
    assert.equal(schema.url, original);
    assert.equal(schema.mainEntityOfPage, original);
    assert.equal(schema.datePublished, post.publishDate, 'provenance date is unchanged');
  });
}

test('work-only posts and the distinct Bunch case study keep their own canonical', () => {
  const tea = loadPosts().find((post) => post.slug === 'when-in-crisis-make-tea')!;
  assert.equal(originalEditionUrl('when-in-crisis-make-tea'), undefined);
  assert.equal(blogPostMetadata(tea).alternates?.canonical, '/blog/when-in-crisis-make-tea');
  assert.equal(blogPostJsonLd(tea).url, `${SITE_URL}/blog/when-in-crisis-make-tea`);
  assert.equal(caseStudyMetadata(caseStudyBySlug('bunch')!, site.name).alternates?.canonical, '/work/bunch');
  assert.equal(originalEditionUrl('context-engineering-is-a-soda-gun'), undefined, 'archive imports have no live original');
});

test('only exact HTTPS thearcades.me article URLs are accepted as originals', () => {
  assert.equal(validateOriginalEditionUrl('bunch', COPIES[0].original), COPIES[0].original);
  for (const value of [
    'http://www.thearcades.me/projects/bunch/bunch', 'https://thearcades.me/projects/bunch/bunch',
    'https://www.thearcades.me.evil.example/projects/bunch/bunch', 'https://evil.example/projects/bunch/bunch',
    'https://person@www.thearcades.me/projects/bunch/bunch', 'https://www.thearcades.me:444/projects/bunch/bunch',
    'https://www.thearcades.me/projects/bunch/bunch?utm_source=x', 'https://www.thearcades.me/projects/bunch/bunch#part',
    'https://www.thearcades.me/projects/bunch/%62unch', 'https://www.thearcades.me/projects/bunch/bunch/',
    'https://www.thearcades.me/', 'https://work.thearcades.me/blog/bunch', 'javascript:alert(1)', '', undefined,
  ]) assert.throws(() => validateOriginalEditionUrl('bunch', value), TypeError, String(value));
});
