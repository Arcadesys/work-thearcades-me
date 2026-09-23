import test from 'node:test';
import assert from 'node:assert/strict';
import { sendSignupVerificationEmail } from './postmark-verification';

test('verification email uses an explicit fragment link and disables Postmark tracking', async () => {
  let request: RequestInit | undefined;
  const fetcher: typeof fetch = async (_input, init) => {
    request = init;
    return Response.json({ ErrorCode: 0 }, { status: 200 });
  };
  assert.equal(await sendSignupVerificationEmail('reader@example.com', 'signed.token', {
    serverToken: 'private', fromEmail: 'notes@example.com', messageStream: 'outbound',
  }, fetcher), true);
  const body = JSON.parse(String(request?.body));
  assert.equal(body.To, 'reader@example.com');
  assert.equal(body.TrackOpens, false);
  assert.equal(body.TrackLinks, 'None');
  assert.match(body.TextBody, /#token=signed.token/);
  assert.match(body.HtmlBody, /Confirm my email/);
  assert.doesNotMatch(body.TextBody, /\?token=/);
});

test('provider rejection is returned without exposing provider response details', async () => {
  const result = await sendSignupVerificationEmail('reader@example.com', 'token', {
    serverToken: 'private', fromEmail: 'notes@example.com', messageStream: 'outbound',
  }, async () => new Response('private provider detail', { status: 500 }));
  assert.equal(result, false);
});
