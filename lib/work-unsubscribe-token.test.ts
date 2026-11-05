import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkUnsubscribeToken, readWorkUnsubscribeToken } from './work-unsubscribe-token';

test('unsubscribe token binds the Resend contact ID and private email digest without expiry', () => {
  const secret = 'a-very-long-test-secret-used-only-for-unit-tests';
  const emailDigest = 'd'.repeat(64);
  const contactId = 'e169aa45-1ecf-4183-9955-b1499d5701d3';
  const token = createWorkUnsubscribeToken(contactId, emailDigest, secret);
  assert.ok(token);
  assert.deepEqual(readWorkUnsubscribeToken(token, secret), { contactId, emailDigest });
  assert.equal(readWorkUnsubscribeToken(token, `${secret}-wrong`), null);
  const [payload, signature] = token.split('.');
  assert.equal(readWorkUnsubscribeToken(`${payload}.wrong`, secret), null);
  const tamperedPayload = Buffer.from('2718:' + 'e'.repeat(64)).toString('base64url');
  assert.equal(readWorkUnsubscribeToken(`${tamperedPayload}.${signature}`, secret), null);
  assert.equal(createWorkUnsubscribeToken('invalid', emailDigest, secret), null);
});
