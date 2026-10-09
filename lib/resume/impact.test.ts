import assert from 'node:assert/strict';
import test from 'node:test';

import { editionsUsing } from './impact';

test('impact lists exactly the editions that include a record', () => {
  assert.deepEqual(editionsUsing('ach.gr.loan-tool'), ['ai-builder', 'program-owner', 'cv']);
  assert.deepEqual(editionsUsing('ach.ac.learning'), ['cv']);
  assert.deepEqual(editionsUsing('ach.arity.planning'), ['ai-builder', 'technical-program-owner', 'program-owner', 'cv'], 'highlight and detail uses both count');
  assert.deepEqual(editionsUsing('skills.methodologies'), ['program-owner', 'cv']);
  assert.deepEqual(editionsUsing('identity.email'), ['ai-builder', 'technical-program-owner', 'program-owner', 'cv']);
  assert.deepEqual(editionsUsing('summary.ai-builder').length, 4);
  assert.deepEqual(editionsUsing('ach.missing'), []);
});
