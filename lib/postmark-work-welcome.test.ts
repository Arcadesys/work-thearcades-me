import test from 'node:test';
import assert from 'node:assert/strict';
import { sendWorkWelcomeEmail, workWelcomeEmail } from './postmark-work-welcome';

const config = { serverToken: 'server-token', fromEmail: 'notes@example.com', messageStream: 'outbound' };

test('Work welcome content matches the approved copy and renders accessible, readable links', () => {
  assert.equal(workWelcomeEmail.subject, 'Welcome to the build notes');
  assert.equal(workWelcomeEmail.preview, 'Practical notes on AI engineering, creative tools, and access.');
  assert.match(workWelcomeEmail.html, /<html lang="en">/);
  assert.match(workWelcomeEmail.html, /font-size:18px/);
  assert.match(workWelcomeEmail.html, /color:#0645ad/);
  assert.match(workWelcomeEmail.html, /href="https:\/\/work\.thearcades\.me\/blog\/bunch"/);
  assert.match(workWelcomeEmail.html, /href="https:\/\/work\.thearcades\.me\/blog\/ai-accessibility-revolution"/);
  assert.match(workWelcomeEmail.html, /href="https:\/\/work\.thearcades\.me\/blog\/wizwor"/);
  assert.match(workWelcomeEmail.text, /https:\/\/work\.thearcades\.me\/blog\/wizwor/);
  assert.match(workWelcomeEmail.text, /You can unsubscribe from any email:/);
  assert.match(workWelcomeEmail.html, /newsletter\/unsubscribe#token=preview/);
});

test('Postmark welcome is sent on outbound stream with link tracking disabled', async () => {
  let requestBody: Record<string, unknown> | undefined;
  const fetcher: typeof fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return Response.json({ ErrorCode: 0, Message: 'OK' });
  };
  assert.equal(await sendWorkWelcomeEmail('reader@example.com', 'opaque-token', config, fetcher), 'sent');
  assert.equal(requestBody?.To, 'reader@example.com');
  assert.equal(requestBody?.Subject, workWelcomeEmail.subject);
  assert.equal(requestBody?.MessageStream, 'outbound');
  assert.equal(requestBody?.TrackOpens, false);
  assert.equal(requestBody?.TrackLinks, 'None');
  const headers = requestBody?.Headers as { Name: string; Value: string }[];
  assert.deepEqual(headers, [
    { Name: 'List-Unsubscribe', Value: '<https://work.thearcades.me/api/kit/unsubscribe?token=opaque-token>' },
    { Name: 'List-Unsubscribe-Post', Value: 'List-Unsubscribe=One-Click' },
  ]);
  assert.match(String(requestBody?.TextBody), /newsletter\/unsubscribe#token=opaque-token/);
  assert.match(String(requestBody?.HtmlBody), /newsletter\/unsubscribe#token=opaque-token/);
});

test('ambiguous Postmark welcome outcome is never classified as a definite send', async () => {
  const uncertain: typeof fetch = async () => { throw new Error('network timeout'); };
  assert.equal(await sendWorkWelcomeEmail('reader@example.com', 'opaque-token', config, uncertain), 'uncertain');
  const malformed: typeof fetch = async () => Response.json({ Message: 'accepted?' });
  assert.equal(await sendWorkWelcomeEmail('reader@example.com', 'opaque-token', config, malformed), 'uncertain');
  const rejected: typeof fetch = async () => Response.json({ ErrorCode: 406, Message: 'rejected' }, { status: 422 });
  assert.equal(await sendWorkWelcomeEmail('reader@example.com', 'opaque-token', config, rejected), 'rejected');
});
