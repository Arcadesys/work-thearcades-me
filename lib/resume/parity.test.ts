/**
 * Migration parity (#48): the adapter in lib/resume.ts must reproduce the exact
 * exports and truth-review seeds captured before the career record existed.
 * Parity proves the migration preserved wording; it does not verify claims.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import * as resume from '../resume';
import { baselineResumeClaims } from '../resume-truth';

const legacy = JSON.parse(readFileSync(new URL('./legacy-parity.fixture.json', import.meta.url), 'utf8'));

test('every legacy résumé export is reproduced exactly, key order included', () => {
  const current = Object.fromEntries(Object.entries(resume).sort(([a], [b]) => a.localeCompare(b)));
  assert.deepEqual(Object.keys(current), Object.keys(legacy.exports));
  for (const name of Object.keys(legacy.exports)) {
    assert.equal(JSON.stringify(current[name]), JSON.stringify(legacy.exports[name]), name);
  }
});

test('private truth-review seeds keep their positional IDs and wording', () => {
  assert.deepEqual(baselineResumeClaims(), legacy.truthSeeds);
});
