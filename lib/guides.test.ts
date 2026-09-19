import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import sitemap from '../app/sitemap';
import { pictureGuide } from './guides';

test('the AI-picture guide has a stable public path and sitemap entry', () => {
  assert.equal(pictureGuide.title, "How to make ai generated pictures that aren't slop");
  assert.equal(pictureGuide.path, '/guides/how-to-make-ai-generated-pictures-that-arent-slop');
  assert(sitemap().some((entry) => entry.url === `https://work.thearcades.me${pictureGuide.path}`));
});

test('Guides has a public index and the guide is nested beneath it', () => {
  const index = readFileSync('app/guides/page.tsx', 'utf8');
  const guide = readFileSync('app/guides/how-to-make-ai-generated-pictures-that-arent-slop/page.tsx', 'utf8');

  assert(sitemap().some((entry) => entry.url === 'https://work.thearcades.me/guides'));
  assert(index.includes(`href={pictureGuide.path}`));
  assert(index.includes("alternates: { canonical: '/guides' }"));
  assert(index.includes("{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }"));
  assert(guide.includes("{ name: 'Guides', path: '/guides' }"));
});

test('the AI-picture guide links every image-generation build log', () => {
  const source = readFileSync('app/guides/how-to-make-ai-generated-pictures-that-arent-slop/page.tsx', 'utf8');
  for (const href of [
    '/blog/the-fox-and-the-eval',
    '/blog/bunch-part-two',
    '/blog/bunch-part-three',
  ]) {
    assert(source.includes(`href="${href}"`), href);
  }
});
