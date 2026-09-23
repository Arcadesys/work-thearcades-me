import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidSignupEmail, submitKitSignup } from './kit-subscription';

test('signup validation accepts ordinary addresses and rejects malformed or oversized input', () => {
  assert.equal(isValidSignupEmail(' person@example.com '), true);
  assert.equal(isValidSignupEmail('not-an-email'), false);
  assert.equal(isValidSignupEmail(`a${'x'.repeat(250)}@example.com`), false);
});

test('Kit signup creates an inactive subscriber and adds that subscriber to the configured form', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    if (calls.length === 1) {
      return Response.json({ subscriber: { id: 2718, state: 'inactive' } }, { status: 201 });
    }
    return Response.json({ subscriber: { id: 2718 } }, { status: 201 });
  };

  assert.equal(await submitKitSignup('reader@example.com', { apiKey: 'server-secret', formId: '12345' }, fetcher), 'accepted');
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://api.kit.com/v4/subscribers');
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { email_address: 'reader@example.com', state: 'inactive' });
  assert.equal(calls[0].init?.headers && new Headers(calls[0].init.headers).get('X-Kit-Api-Key'), 'server-secret');
  assert.equal(calls[1].url, 'https://api.kit.com/v4/forms/12345/subscribers/2718');
  assert.equal(calls[1].init?.body, '{}');
});

test('Kit rejection and invalid form configuration fail without reporting acceptance', async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls += 1;
    return new Response(null, { status: 422 });
  };

  assert.equal(await submitKitSignup('reader@example.com', { apiKey: 'server-secret', formId: '123' }, fetcher), 'failed');
  assert.equal(await submitKitSignup('reader@example.com', { apiKey: 'server-secret', formId: 'not-an-id' }, fetcher), 'failed');
  assert.equal(calls, 1);
});

test('an already-active subscriber is not added to the double-opt-in form', async () => {
  const calls: string[] = [];
  const fetcher: typeof fetch = async input => {
    calls.push(String(input));
    return Response.json({ subscriber: { id: 2718, state: 'active' } }, { status: 200 });
  };

  assert.equal(await submitKitSignup('reader@example.com', { apiKey: 'server-secret', formId: '12345' }, fetcher), 'already_active');
  assert.deepEqual(calls, ['https://api.kit.com/v4/subscribers']);
});

test('an unknown subscriber state fails closed before form addition', async () => {
  const calls: string[] = [];
  const fetcher: typeof fetch = async input => {
    calls.push(String(input));
    return Response.json({ subscriber: { id: 2718 } }, { status: 201 });
  };

  assert.equal(await submitKitSignup('reader@example.com', { apiKey: 'server-secret', formId: '12345' }, fetcher), 'failed');
  assert.deepEqual(calls, ['https://api.kit.com/v4/subscribers']);
});
