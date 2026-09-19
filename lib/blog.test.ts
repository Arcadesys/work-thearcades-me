import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sources from '../content/blog-sources.json';
import { loadPosts, publicPosts, postTags, relatedPosts, relatedWork, displayBuildDate, articleBody, archiveLinks } from './blog';
import { blogPostMetadata } from './site-metadata';
import { caseStudies } from './content';
import sitemap from '../app/sitemap';
import robots from '../app/robots';
import { GET as feedRoute } from '../app/feed.xml/route';

test('Bunch preserves the complete source file, metadata, and explicit association', () => {
  const raw = readFileSync('content/blog/bunch.md');
  assert.equal(createHash('sha256').update(raw).digest('hex'), sources.bunch.sha256);
  const post = loadPosts().find(post => post.slug === 'bunch')!;
  assert.equal(post.publishDate, '2026-09-09T10:00:00.000Z');
  assert.deepEqual(post.tags, ['did', 'accessibility', 'ai', 'mcp', 'disability', 'neurodiversity']);
  assert(postTags(post).includes('bunch'));
  assert.deepEqual(relatedWork(post).map(work => work.slug), ['bunch']);
  assert(!relatedPosts(caseStudies.find(work => work.slug === 'ai-enablement')!).some(post => post.slug === 'bunch'));
});
test('visibility is bounded by publication instant and sorting handles offsets', () => {
  const post = loadPosts().find(post => post.slug === 'bunch')!;
  const older = { ...post, slug: 'older', publishDate: '2026-09-09T06:00:00-05:00' };
  const newer = { ...post, slug: 'newer', publishDate: '2026-09-09T10:30:00-01:00' };
  assert.equal(publicPosts(new Date('2026-09-09T09:59:59Z'), [post]).length, 0);
  assert.equal(publicPosts(new Date(post.publishDate), [post]).length, 1);
  assert.deepEqual(publicPosts(new Date('2026-09-10'), [older, newer]).map(p => p.slug), ['newer', 'older']);
});
test('invalid metadata and accidental draft flags fail closed', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'blog-test-'));
  try {
    writeFileSync(path.join(dir, 'bunch.md'), readFileSync('content/blog/bunch.md', 'utf8').replace("id: '88'", "id: '88'\ndraft: true"));
    assert.throws(() => loadPosts(dir));
    writeFileSync(path.join(dir, 'bunch.md'), readFileSync('content/blog/bunch.md', 'utf8').replace('2026-09-09T10:00:00.000Z', '2026-02-30T10:00:00Z'));
    assert.throws(() => loadPosts(dir));
  } finally { rmSync(dir, { recursive: true }); }
});
test('partial build dates never display invented precision', () => {
  assert.equal(displayBuildDate('2025'), '2025');
  assert.equal(displayBuildDate('2026-07'), 'July 2026');
  assert.throws(() => displayBuildDate('2026-13'));
});

test('all selected imports preserve exact source files or archive bodies', () => {
  const posts = loadPosts();
  assert.equal(posts.length, 13);
  for (const [slug, receipt] of Object.entries(sources)) {
    const post = posts.find(post => post.slug === slug)!;
    assert(post, `Missing ${slug}`);
    if ('sha256' in receipt) {
      assert.equal(createHash('sha256').update(readFileSync(`content/blog/${slug}.md`)).digest('hex'), receipt.sha256, slug);
    } else if ('bodySha256' in receipt) {
      assert.equal(createHash('sha256').update(post.body).digest('hex'), receipt.bodySha256, slug);
      assert(!articleBody(post).startsWith(`# ${post.title}\n`));
    }
  }
});
test('archive links resolve without exposing handoffs or unselected drafts', () => {
  assert.equal(archiveLinks['bunch-part-two']['the-fox-and-the-eval-publishing.md'], '/blog/the-fox-and-the-eval');
  assert.equal(archiveLinks['the-fox-and-the-eval']['photos-arent-sticky.md'], '');
  const [media] = sources['the-fox-and-the-eval'].media;
  assert.equal(createHash('sha256').update(readFileSync(`public${media.destination}`)).digest('hex'), media.sha256);
});

test('the launch post links the skill and keeps a weekly cadence promise', () => {
  const post = loadPosts().find(post => post.slug === 'when-in-crisis-make-tea')!;
  assert.deepEqual(post.tags, ['career', 'ai-enablement', 'layoffs', 'building-in-public']);
  assert.equal(post.title, 'When in crisis, make tea.');
  assert.equal(post.publishDate, '2026-09-17T13:00:00.000Z');
  assert.equal(post.seo?.title, 'What I Did After a Layoff: Start With Tea');
  assert.equal(blogPostMetadata(post).title, 'What I Did After a Layoff: Start With Tea — Austen Tucker-Crowder');
  assert(post.body.includes('[Download the free Layoff Triage Skill](/layoff-triage)'));
  assert(!post.body.includes('**Download the free Layoff Triage Skill**'));
});

test('the layoff triage skill download exists and is referenced by the post and its landing page', () => {
  assert(readFileSync('public/downloads/layoff-triage-skill.md', 'utf8').includes('I was just laid off. Start with tea.'));
  assert(readFileSync('app/layoff-triage/page.tsx', 'utf8').includes('/downloads/layoff-triage-skill.md'));
  assert(readFileSync('app/layoff-triage/page.tsx', 'utf8').includes('Illustrative response, derived from the skill'));
});

test('sitemap includes every public post and excludes the private journeys route', () => {
  const entries = sitemap();
  const urls = entries.map(entry => entry.url);
  for (const post of publicPosts()) assert(urls.includes(`https://work.thearcades.me/blog/${post.slug}`), post.slug);
  assert(urls.includes('https://work.thearcades.me/blog/when-in-crisis-make-tea'));
  assert(urls.includes('https://work.thearcades.me/layoff-triage'));
  assert(!urls.some(url => url.includes('/journeys')));
});

test('robots disallows journeys and points at the sitemap', () => {
  const config = robots();
  assert.equal(config.sitemap, 'https://work.thearcades.me/sitemap.xml');
  const rule = Array.isArray(config.rules) ? config.rules[0] : config.rules;
  assert.equal(rule.disallow, '/journeys');
});

test('the RSS feed lists exactly the public posts', async () => {
  const response = feedRoute();
  const body = await response.text();
  const posts = publicPosts();
  const itemCount = body.match(/<item>/g)?.length ?? 0;
  assert.equal(itemCount, posts.length);
  assert(body.includes('When in crisis, make tea.'));
  assert.equal(response.headers.get('Content-Type'), 'application/rss+xml; charset=utf-8');
});
