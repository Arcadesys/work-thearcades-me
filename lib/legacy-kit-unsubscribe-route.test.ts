import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { POST as legacyRoutePost } from '../app/api/kit/unsubscribe/route';
import { POST as newsletterRoutePost } from '../app/api/newsletter/unsubscribe/route';

const secret = 'a-very-long-test-secret-used-only-for-unit-tests';

function legacyToken() {
  const payload = Buffer.from(`2718:${'f'.repeat(64)}`).toString('base64url');
  const signature = createHmac('sha256', secret).update(`work-build-notes-unsubscribe-v1:${payload}`).digest('base64url');
  return `${payload}.${signature}`;
}

test('legacy API route and old visible-link endpoint still unsubscribe with a Kit token', async () => {
  const priorEnv = {
    secret: process.env.SIGNUP_LINK_SECRET,
    apiKey: process.env.KIT_LEGACY_UNSUBSCRIBE_API_KEY,
    resendKey: process.env.RESEND_CONTACTS_API_KEY,
    topic: process.env.RESEND_TOPIC_WORK_AI_ID,
  };
  const priorFetch = globalThis.fetch;
  const requests: string[] = [];
  process.env.SIGNUP_LINK_SECRET = secret;
  process.env.KIT_LEGACY_UNSUBSCRIBE_API_KEY = 'mock-legacy-key';
  delete process.env.RESEND_CONTACTS_API_KEY;
  delete process.env.RESEND_TOPIC_WORK_AI_ID;
  globalThis.fetch = (async input => {
    requests.push(String(input));
    return new Response(null, { status: 200 });
  }) as typeof fetch;

  try {
    const token = legacyToken();
    const rfc8058 = await legacyRoutePost(new Request(`https://work.thearcades.me/api/kit/unsubscribe?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'List-Unsubscribe=One-Click',
    }));
    assert.equal(rfc8058.status, 200);
    assert.deepEqual(await rfc8058.json(), { unsubscribed: true });

    const visibleLink = await newsletterRoutePost(new Request('https://work.thearcades.me/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }));
    assert.equal(visibleLink.status, 200);
    assert.deepEqual(await visibleLink.json(), { unsubscribed: true });
    assert.deepEqual(requests, [
      'https://api.kit.com/v4/subscribers/2718/unsubscribe',
      'https://api.kit.com/v4/subscribers/2718/unsubscribe',
    ]);
  } finally {
    globalThis.fetch = priorFetch;
    if (priorEnv.secret === undefined) delete process.env.SIGNUP_LINK_SECRET;
    else process.env.SIGNUP_LINK_SECRET = priorEnv.secret;
    if (priorEnv.apiKey === undefined) delete process.env.KIT_LEGACY_UNSUBSCRIBE_API_KEY;
    else process.env.KIT_LEGACY_UNSUBSCRIBE_API_KEY = priorEnv.apiKey;
    if (priorEnv.resendKey === undefined) delete process.env.RESEND_CONTACTS_API_KEY;
    else process.env.RESEND_CONTACTS_API_KEY = priorEnv.resendKey;
    if (priorEnv.topic === undefined) delete process.env.RESEND_TOPIC_WORK_AI_ID;
    else process.env.RESEND_TOPIC_WORK_AI_ID = priorEnv.topic;
  }
});
