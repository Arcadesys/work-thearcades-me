/**
 * Checks the metadata Next.js actually emitted, not the source config. Run after
 * `npm run build` with `npm run test:rendered`; it fails if no build exists.
 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { test } from 'node:test';

const SITE_URL = 'https://work.thearcades.me';
const APP_DIR = join(process.cwd(), '.next', 'server', 'app');

function html(route: string): string {
  const file = join(APP_DIR, route === '/' ? 'index.html' : `${route.slice(1)}.html`);
  assert(existsSync(file), `missing prerendered ${route}; run npm run build first`);
  return readFileSync(file, 'utf8');
}

function all(source: string, pattern: RegExp): string[] {
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

const canonicals = (source: string) => all(source, /<link rel="canonical" href="([^"]*)"/g);
const ogUrls = (source: string) => all(source, /<meta property="og:url" content="([^"]*)"/g);
const titles = (source: string) => all(source, /<title>([^<]*)<\/title>/g);

const indexable: Array<{ route: string; title: string }> = [
  { route: '/', title: 'Hands-On AI Builder | Austen Tucker-Crowder' },
  { route: '/work-with-me', title: 'AI Building &amp; Workflow Consulting — Austen Tucker-Crowder' },
  { route: '/layoff-triage', title: 'Career Coach in a Bottle: The Layoff Triage Skill — Austen Tucker-Crowder' },
  { route: '/blog/when-in-crisis-make-tea', title: 'What I Did After a Layoff: Start With Tea — Austen Tucker-Crowder' },
  { route: '/work/bunch', title: 'Building an MCP Context System: Bunch' },
  { route: '/resume', title: 'Résumé — Austen Tucker-Crowder' },
  { route: '/privacy', title: 'Privacy — Austen Tucker-Crowder' },
];

test('public pages emit exactly one self-canonical and a matching og:url', () => {
  for (const { route, title } of indexable) {
    const source = html(route);
    const expected = route === '/' ? SITE_URL : `${SITE_URL}${route}`;
    assert.deepEqual(canonicals(source), [expected], `${route} canonical`);
    assert.deepEqual(ogUrls(source), [expected], `${route} og:url`);
    assert.deepEqual(titles(source), [title], `${route} title`);
  }
});

test('article and case-study JSON-LD images point at the same card as og:image', () => {
  for (const route of ['/blog/when-in-crisis-make-tea', '/work/bunch']) {
    const source = html(route);
    const [ogImage] = all(source, /<meta property="og:image" content="([^"]*)"/g);
    const images = all(source, /"image":"([^"]*)"/g);
    assert.deepEqual(images, [`${SITE_URL}${route}/opengraph-image`], `${route} JSON-LD image`);
    assert.equal(ogImage.split('?')[0], images[0], `${route} og:image`);
  }
  assert.deepEqual(all(html('/resume'), /<meta property="og:title" content="([^"]*)"/g), ['Résumé — Austen Tucker-Crowder']);
});

test('noindex utility pages emit no canonical at all', () => {
  for (const route of ['/newsletter/verify', '/newsletter/unsubscribe']) {
    const source = html(route);
    assert.match(source, /<meta name="robots" content="noindex, nofollow"\/>/, `${route} robots`);
    assert.deepEqual(canonicals(source), [], `${route} canonical`);
    assert.deepEqual(ogUrls(source), [], `${route} og:url`);
  }
});

test('no prerendered page other than the homepage claims the homepage URL', () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith('.html')) files.push(path);
    }
  };
  walk(APP_DIR);
  assert(files.length > 10, 'expected a full prerendered build');
  for (const file of files) {
    const name = relative(APP_DIR, file);
    if (name === 'index.html') continue;
    const source = readFileSync(file, 'utf8');
    for (const url of [...canonicals(source), ...ogUrls(source)]) {
      assert.notEqual(url.replace(/\/$/, ''), SITE_URL, `${name} inherits the homepage URL`);
    }
  }
});
