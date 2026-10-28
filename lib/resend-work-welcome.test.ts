import test from 'node:test';
import assert from 'node:assert/strict';
import { sendWorkWelcomeEmail, workWelcomeEmail } from './resend-work-welcome';

const config = { apiKey: 'api-key', fromEmail: 'austen@mail.thearcades.me' };

test('Work welcome content remains readable and includes visible unsubscribe link', () => {
  assert.equal(workWelcomeEmail.subject, 'Welcome to the build notes');
  assert.equal(workWelcomeEmail.preview, 'Practical notes on AI engineering, creative tools, and access.');
  assert.match(workWelcomeEmail.html, /<html lang="en">/);
  assert.match(workWelcomeEmail.html, /font-size:18px/);
  assert.match(workWelcomeEmail.html, /newsletter\/unsubscribe#token=preview/);
});

test('Resend welcome carries RFC 8058 one-click unsubscribe headers', async () => {
  let requestBody: Record<string, unknown> | undefined;
  const fetcher: typeof fetch = async (_input, init) => { requestBody = JSON.parse(String(init?.body)); return Response.json({ id: 'email-id' }); };
  assert.equal(await sendWorkWelcomeEmail('reader@example.com', 'opaque-token', config, fetcher), 'sent');
  assert.deepEqual(requestBody?.to, ['reader@example.com']);
  assert.equal(requestBody?.subject, workWelcomeEmail.subject);
  assert.deepEqual(requestBody?.headers, {
    'List-Unsubscribe': '<https://work.thearcades.me/api/newsletter/unsubscribe?token=opaque-token>',
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  });
  assert.match(String(requestBody?.text), /newsletter\/unsubscribe#token=opaque-token/);
  assert.match(String(requestBody?.html), /newsletter\/unsubscribe#token=opaque-token/);
});

test('uncertain Resend welcome outcome is never retried as a definite rejection', async () => {
  assert.equal(await sendWorkWelcomeEmail('reader@example.com', 'token', config, async () => { throw new Error('timeout'); }), 'uncertain');
  assert.equal(await sendWorkWelcomeEmail('reader@example.com', 'token', config, async () => Response.json({ message: 'accepted?' })), 'uncertain');
  assert.equal(await sendWorkWelcomeEmail('reader@example.com', 'token', config, async () => new Response('rejected', { status: 422 })), 'rejected');
});
