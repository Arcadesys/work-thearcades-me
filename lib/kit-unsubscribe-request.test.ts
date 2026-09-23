import test from 'node:test';
import assert from 'node:assert/strict';
import { readWorkUnsubscribeRequestToken } from './kit-unsubscribe-request';

test('RFC 8058 one-click requests require the opaque query token and exact form value', async () => {
  const request = new Request('https://work.thearcades.me/api/kit/unsubscribe?token=opaque', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'List-Unsubscribe=One-Click',
  });
  assert.equal(await readWorkUnsubscribeRequestToken(request), 'opaque');
  assert.equal(await readWorkUnsubscribeRequestToken(new Request('https://work.thearcades.me/api/kit/unsubscribe?token=opaque')), null);
  const wrongBody = new Request('https://work.thearcades.me/api/kit/unsubscribe?token=opaque', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'List-Unsubscribe=other',
  });
  assert.equal(await readWorkUnsubscribeRequestToken(wrongBody), null);
});

test('fallback page POST accepts a JSON token without placing it in a URL', async () => {
  const request = new Request('https://work.thearcades.me/api/kit/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'opaque' }),
  });
  assert.equal(await readWorkUnsubscribeRequestToken(request), 'opaque');
});
