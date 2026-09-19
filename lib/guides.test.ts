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
