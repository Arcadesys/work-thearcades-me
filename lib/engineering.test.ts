import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import sitemap from '../app/sitemap';

const engineeringSource = readFileSync(
  fileURLToPath(new URL('../app/engineering/page.tsx', import.meta.url)),
  'utf8',
);
const engineeringContent = readFileSync(
  fileURLToPath(new URL('./engineering.ts', import.meta.url)),
  'utf8',
);
const llms = readFileSync(fileURLToPath(new URL('../public/llms.txt', import.meta.url)), 'utf8');

const thesis = 'Bunch looks like a continuity app. Underneath, it asks a harder question: how do you let AI act on private, durable state without giving the model god mode?';
const architectureTerms = ['MCP', 'REST', 'typed domain contracts', 'SystemService', 'PostgreSQL', 'private media', 'AI providers'];

test('the engineering tour is a public discovery route', () => {
  assert(sitemap().some((entry) => entry.url === 'https://work.thearcades.me/engineering'));
  assert.match(llms, /Technical tour: https:\/\/work\.thearcades\.me\/engineering/);
});

test('the engineering tour keeps its source-linked technical promises', () => {
  assert(engineeringSource.includes("alternates: { canonical: '/engineering' }"));
  assert(engineeringContent.includes(thesis));
  assert(engineeringSource.includes('Try the interactive demo'));
  assert(engineeringSource.includes('https://system.thearcades.me/demo'));
  assert(engineeringContent.includes('Two interfaces. One set of rules.'));

  for (const term of architectureTerms) {
    assert(engineeringContent.includes(term), term);
  }
});
