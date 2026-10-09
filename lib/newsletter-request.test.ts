import assert from 'node:assert/strict';
import test from 'node:test';
import { submitNewsletterRequest } from './newsletter-request';

test('a request has intent then acceptance; analytics contains placement only, never email/provider status', async () => {
  const sent: unknown[] = [];
  const report = (event: string, properties: Record<string, string>) => sent.push({ event, properties });
  const accepted = await submitNewsletterRequest('reader@example.com', 'blog_post', report, async (url, init) => {
    assert.equal(url, '/api/kit/subscribe'); assert.equal(JSON.parse(String(init?.body)).email, 'reader@example.com');
    assert.deepEqual(sent, [{ event: 'subscribe_submit_intent', properties: { placement: 'blog_post' } }]);
    return Response.json({ accepted: true, confirmationRequired: true });
  });
  assert.equal(accepted, true);
  assert.deepEqual(sent, [{ event: 'subscribe_submit_intent', properties: { placement: 'blog_post' } }, { event: 'subscribe_verification_requested', properties: { placement: 'blog_post' } }]);
});

test('HTTP/network failure records failure only; retry can be accepted and reporter failure never blocks signup', async () => {
  const names: string[] = [];
  for (const fetcher of [async () => new Response(null, { status: 502 }), async () => { throw new Error('network'); }]) {
    assert.equal(await submitNewsletterRequest('reader@example.com', 'homepage', event => names.push(event), fetcher), false);
  }
  assert.deepEqual(names, ['subscribe_submit_intent', 'subscribe_request_failed', 'subscribe_submit_intent', 'subscribe_request_failed']);
  assert.equal(await submitNewsletterRequest('reader@example.com', 'homepage', () => { throw new Error('blocked'); }, async () => Response.json({ accepted: true })), true);
});
