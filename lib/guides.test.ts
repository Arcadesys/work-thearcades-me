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

test('the AI-picture guide presents the fictional Sprig repair with decision labels', () => {
  const source = readFileSync('app/guides/how-to-make-ai-generated-pictures-that-arent-slop/page.tsx', 'utf8');
  const assets = [
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
  assert(!source.includes('Moxie'));
});

test('the guide uses the Bunch style clash and Colette model sheet as continuity evidence', () => {
  const source = readFileSync('app/guides/how-to-make-ai-generated-pictures-that-arent-slop/page.tsx', 'utf8');
  const assets = [
    'bunch-style-clash-group.webp',
    'colette-model-sheet.webp',
    'colette-piano-portrait.webp',
  ];

  for (const asset of assets) {
    assert(source.includes(`/images/guides/image-ratchet/${asset}`), asset);
    assert.doesNotThrow(() => readFileSync(`public/images/guides/image-ratchet/${asset}`));
  }

  assert(source.includes('How did I get all these styles to clash? Here’s how.'));
  assert(source.includes('Sample model-sheet prompt'));
  assert(source.includes('Sample group-photo prompt'));
  assert(source.includes('How we made Colette together.'));
  assert(source.includes('Continuity reference'));
  assert(source.includes('Scene result'));
  assert(source.includes('not a record of a real event'));
});

test('each ratchet step includes a concrete sample prompt', () => {
  const source = readFileSync('app/guides/how-to-make-ai-generated-pictures-that-arent-slop/page.tsx', 'utf8');

  assert.equal(source.match(/    prompt: '/g)?.length, 6);
  assert(source.includes('Do not generate or edit anything yet'));
  assert(source.includes('write a keep-list of three to six visible things'));
  assert(source.includes('Change only the water stream'));
  assert(source.includes('Use Reference 1 only for the camera'));
  assert(source.includes('Report three short lists: Improved, Preserved, and Drifted'));
  assert(source.includes('Give this version one verdict: KEEP, REVISE, or DISCARD'));
  assert(source.includes('<p className={styles.promptLabel}>Sample prompt</p>'));
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
