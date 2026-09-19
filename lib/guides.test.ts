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

test('the AI-picture guide presents the fictional Sprig demo with decision labels and reference jobs', () => {
  const source = readFileSync('app/guides/how-to-make-ai-generated-pictures-that-arent-slop/page.tsx', 'utf8');
  const assets = [
    'sprig-composition-source.webp',
    'sprig-identity-source.webp',
    'sprig-style-source.webp',
    'sprig-current-best.webp',
    'sprig-roller-coaster.webp',
    'sprig-local-repair.webp',
  ];

  for (const asset of assets) {
    assert(source.includes(`/images/guides/image-ratchet/${asset}`), asset);
    assert.doesNotThrow(() => readFileSync(`public/images/guides/image-ratchet/${asset}`));
  }

  assert(source.includes("status: 'Starting point'"));
  assert(source.includes("status: 'Roller-coaster rewrite'"));
  assert(source.includes("status: 'Ratchet repair'"));
  assert(source.includes("status: 'Job 1: Where things go'"));
  assert(source.includes("status: 'Job 2: Who Sprig is'"));
  assert(source.includes("status: 'Job 3: How it feels'"));
  assert(!source.includes('Moxie'));
});

test('the AI-picture guide metadata describes the ratchet thesis', () => {
  assert.match(pictureGuide.description, /Treat your image workflow like a ratchet/);
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
