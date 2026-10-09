import assert from 'node:assert/strict';
import { test } from 'node:test';
// Static runner module is shared by the browser and these state checks.
// @ts-expect-error plain JavaScript module deliberately has no TS declaration
import { freshRun, restoreRun, remainingAt, toggleClock, beginSession, changePressure } from '../public/campaigns/message-in-a-bottle-module/run-state.mjs';

test('saved campaign progress survives session changes and timer pause', () => {
  let state = { ...freshRun(), marks: { '0-plan': true }, notes: 'Crew kept the lamp.', clocks: { slide: 2 } };
  state = toggleClock(state, 1000);
  assert.equal(remainingAt(state, 6000), 14395);
  state = toggleClock(state, 6000);
  assert.equal(state.deadline, null);
  const saved = restoreRun(JSON.parse(JSON.stringify(state)));
  assert.equal(saved.remaining, 14395);
  const next = beginSession(saved, 6);
  assert.equal(next.activeSession, 6);
  assert.equal(next.marks['0-plan'], true);
  assert.equal(next.notes, 'Crew kept the lamp.');
  assert.equal(next.clocks.slide, 2);
  assert.equal(next.deadline, null);
});
test('clock limits and corrupt stored data cannot advance or damage a run', () => {
  const state = freshRun();
  const clock = { id: 'quake', max: 6 };
  assert.equal(changePressure(state, clock, 99).clocks.quake, 6);
  assert.equal(changePressure(state, clock, -1).clocks.quake, 0);
  assert.equal(restoreRun({ version: 1, activeSession: 99, remaining: -5, marks: { '__proto__': true, '0-plan': true }, notes: null }).activeSession, 0);
  assert.equal(restoreRun({ version: 99 }).deadline, null);
  assert.equal(remainingAt({ ...state, deadline: 1000 }, 2000), 0);
});
