import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { unsubscribeLegacyKitSubscriber } from './legacy-kit-unsubscribe';
import { readLegacyWorkUnsubscribeToken, readWorkUnsubscribeToken } from './work-unsubscribe-token';

const secret = 'a-very-long-test-secret-used-only-for-unit-tests';
const subscriberId = 2718;
const emailDigest = 'e'.repeat(64);

function legacyToken() {
  const payload = Buffer.from(`${subscriberId}:${emailDigest}`).toString('base64url');
  const signature = createHmac('sha256', secret).update(`work-build-notes-unsubscribe-v1:${payload}`).digest('base64url');
  return `${payload}.${signature}`;
}

test('legacy unsubscribe tokens from Kit welcome emails remain valid only through the legacy reader', () => {
  const token = legacyToken();
  assert.deepEqual(readLegacyWorkUnsubscribeToken(token, secret), { subscriberId, emailDigest });
  assert.equal(readLegacyWorkUnsubscribeToken(token, `${secret}-wrong`), null);
  assert.equal(readWorkUnsubscribeToken(token, secret), null);
});

test('legacy unsubscribe calls only the Kit unsubscribe endpoint with the subscriber ID', async () => {
  let calledUrl = '';
  let calledInit: RequestInit | undefined;
  const fetcher: typeof fetch = async (input, init) => {
    calledUrl = String(input);
    calledInit = init;
    return new Response(null, { status: 200 });
  };

  assert.equal(await unsubscribeLegacyKitSubscriber(subscriberId, 'legacy-key', fetcher), true);
  assert.equal(calledUrl, `https://api.kit.com/v4/subscribers/${subscriberId}/unsubscribe`);
  assert.equal(calledInit?.method, 'POST');
  assert.equal(new Headers(calledInit?.headers).get('X-Kit-Api-Key'), 'legacy-key');
  assert.equal(await unsubscribeLegacyKitSubscriber(0, 'legacy-key', fetcher), false);
});
