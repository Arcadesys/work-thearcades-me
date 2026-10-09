import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkUnsubscribeToken, readWorkUnsubscribeToken } from './work-unsubscribe-token';

test('unsubscribe token binds the Kit subscriber ID and private email digest without expiry', () => {
  const secret = 'a-very-long-test-secret-used-only-for-unit-tests';
  const emailDigest = 'd'.repeat(64);
  const token = createWorkUnsubscribeToken(2718, emailDigest, secret);
  assert.ok(token);
  assert.deepEqual(readWorkUnsubscribeToken(token, secret), { subscriberId: 2718, emailDigest });
  assert.equal(readWorkUnsubscribeToken(token, `${secret}-wrong`), null);
  const [payload, signature] = token.split('.');
  assert.equal(readWorkUnsubscribeToken(`${payload}.wrong`, secret), null);
  const tamperedPayload = Buffer.from('2718:' + 'e'.repeat(64)).toString('base64url');
  assert.equal(readWorkUnsubscribeToken(`${tamperedPayload}.${signature}`, secret), null);
  assert.equal(createWorkUnsubscribeToken(0, emailDigest, secret), null);
});
