import test from 'node:test';
import assert from 'node:assert/strict';
import { sendSignupVerificationEmail, verificationSiteOrigin } from './resend-verification';

test('verification email uses Resend with a first-party confirmation link', async () => {
  let request: RequestInit | undefined;
  const fetcher: typeof fetch = async (_input, init) => { request = init; return Response.json({ id: 'email-id' }); };
  assert.equal(await sendSignupVerificationEmail('reader@example.com', 'signed.token', { apiKey: 'private', fromEmail: 'austen@mail.thearcades.me' }, fetcher), 'sent');
  const body = JSON.parse(String(request?.body));
  assert.deepEqual(body.to, ['reader@example.com']);
  assert.equal(new Headers(request?.headers).get('authorization'), 'Bearer private');
  assert.match(body.text, /#token=signed.token/);
  assert.match(body.html, /Confirm my email/);
  assert.doesNotMatch(body.text, /\?token=/);
});

test('network uncertainty preserves the challenge while clear rejection can be retried', async () => {
  const config = { apiKey: 'private', fromEmail: 'austen@mail.thearcades.me' };
  assert.equal(await sendSignupVerificationEmail('reader@example.com', 'token', config, async () => new Response('provider detail', { status: 500 })), 'uncertain');
  assert.equal(await sendSignupVerificationEmail('reader@example.com', 'token', config, async () => new Response('rejected', { status: 422 })), 'rejected');
  assert.equal(await sendSignupVerificationEmail('reader@example.com', 'token', config, async () => new Response('not json', { status: 200 })), 'uncertain');
});

test('verification links use only a validated Vercel deployment host for previews', () => {
  assert.equal(verificationSiteOrigin({ environment: 'preview', vercelUrl: 'work-preview-abc.vercel.app' }), 'https://work-preview-abc.vercel.app');
  assert.equal(verificationSiteOrigin({ environment: 'production', vercelUrl: 'work-preview-abc.vercel.app' }), 'https://work.thearcades.me');
  assert.equal(verificationSiteOrigin({ environment: 'preview', vercelUrl: 'work.vercel.app.attacker.invalid' }), 'https://work.thearcades.me');
  assert.equal(verificationSiteOrigin({ environment: 'preview', vercelUrl: 'https://work-preview.vercel.app/path' }), 'https://work.thearcades.me');
});
