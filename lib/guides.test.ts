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

test('the AI-picture guide presents the five authorized ratchet images with decision labels', () => {
  const source = readFileSync('app/guides/how-to-make-ai-generated-pictures-that-arent-slop/page.tsx', 'utf8');
  const assets = [
    'moxie-piano-current-best.webp',
    'moxie-piano-paw-repair.webp',
    'fur-nor-feather-sleeping-candidate.webp',
    'fur-nor-feather-standing-repair-candidate.webp',
    'fur-nor-feather-tail-repair-candidate.webp',
  ];

  for (const asset of assets) {
    assert(source.includes(`/images/guides/image-ratchet/${asset}`), asset);
    assert.doesNotThrow(() => readFileSync(`public/images/guides/image-ratchet/${asset}`));
  }

  assert(source.includes("status: 'Current-best candidate'"));
  assert(source.includes("status: 'Rejected direction'"));
  assert(source.includes('no creator score was recorded'));
});

test('the AI-picture guide metadata describes the ratchet thesis', () => {
  assert.match(pictureGuide.description, /changing one thing without losing everything/);
});

test('the AI-picture guide offers the complete image ratchet skill download', () => {
  const guide = readFileSync('app/guides/how-to-make-ai-generated-pictures-that-arent-slop/page.tsx', 'utf8');
  const skill = readFileSync('public/downloads/image-ratchet-skill.md', 'utf8');

  assert(guide.includes("const SKILL_DOWNLOAD_PATH = '/downloads/image-ratchet-skill.md'"));
  assert(guide.includes('Download the skill and improve your image generation today.'));
  assert(guide.includes('data-funnel-event="image_ratchet_skill_download"'));
  assert(skill.includes('name: image-ratchet'));
  assert(skill.includes('**Keep:**'));
  assert(skill.includes('**Revise:**'));
  assert(skill.includes('**Discard:**'));
  assert(skill.includes('A candidate is not canon'));
});
