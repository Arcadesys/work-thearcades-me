import test from 'node:test';
import assert from 'node:assert/strict';
import { findResendContact, isValidSignupEmail, subscribeResendContact, unsubscribeResendContact } from './resend-contacts';

const topicId = 'b6d24b8e-af0b-4c3c-be0c-359bbd97381e';
const contactId = 'e169aa45-1ecf-4183-9955-b1499d5701d3';
const contact = { object: 'contact', id: contactId, email: 'reader@example.com', unsubscribed: false };

test('signup email validation accepts ordinary addresses and rejects malformed or oversized input', () => {
  assert.equal(isValidSignupEmail(' person@example.com '), true);
  assert.equal(isValidSignupEmail('Reader@Example.COM'), true);
  assert.equal(isValidSignupEmail('not-an-email'), false);
  assert.equal(isValidSignupEmail(`a${'x'.repeat(250)}@example.com`), false);
});

test('contact lookup canonicalizes casing before checking contacts and suppressions', async () => {
  const urls: string[] = [];
  const fetcher: typeof fetch = async input => {
    const url = String(input); urls.push(url);
    if (url.includes('/suppressions/')) return new Response(null, { status: 404 });
    if (url.endsWith('/topics')) return Response.json({ data: [{ id: topicId, subscription: 'opt_in' }] });
    return Response.json({ ...contact, email: 'Reader@Example.COM' });
  };
  assert.deepEqual(await findResendContact(' Reader@Example.COM ', 'key', topicId, fetcher), {
    kind: 'found', contact: { id: contactId, email: 'reader@example.com', unsubscribed: false },
  });
  assert.deepEqual(urls, [
    'https://api.resend.com/contacts/reader%40example.com',
    'https://api.resend.com/suppressions/reader%40example.com',
    'https://api.resend.com/contacts/reader%40example.com/topics',
  ]);
  assert.deepEqual(await findResendContact('Reader@Example.COM', 'key', topicId, async input => {
    const url = String(input);
    if (url.includes('/suppressions/')) return new Response(null, { status: 404 });
    return Response.json({ ...contact, email: 'Reader@Example.COM', unsubscribed: true });
  }), { kind: 'blocked' });
});

test('contact lookup checks exact address, topic preference, global unsubscribe, and suppressions', async () => {
  const urls: string[] = [];
  const fetcher: typeof fetch = async input => {
    const url = String(input); urls.push(url);
    if (url.includes('/suppressions/')) return new Response(null, { status: 404 });
    if (url.endsWith('/topics')) return Response.json({ data: [{ id: topicId, subscription: 'opt_in' }] });
    return Response.json(contact);
  };
  assert.deepEqual(await findResendContact('reader@example.com', 'key', topicId, fetcher), { kind: 'found', contact: { id: contactId, email: 'reader@example.com', unsubscribed: false } });
  assert.ok(urls.includes('https://api.resend.com/contacts/reader%40example.com'));
  assert.deepEqual(await findResendContact('reader@example.com', 'key', topicId, async input => String(input).includes('/suppressions/') ? Response.json({ type: 'complaint' }) : Response.json(contact)), { kind: 'blocked' });
  assert.deepEqual(await findResendContact('reader@example.com', 'key', topicId, async input => String(input).includes('/suppressions/') ? new Response(null, { status: 404 }) : Response.json({ ...contact, unsubscribed: true })), { kind: 'blocked' });
  assert.deepEqual(await findResendContact('reader@example.com', 'key', topicId, async input => String(input).includes('/suppressions/') ? new Response(null, { status: 404 }) : String(input).endsWith('/topics') ? Response.json({ data: [{ id: topicId, subscription: 'opt_out' }] }) : Response.json(contact)), { kind: 'blocked' });
});

test('provider uncertainty and malformed contact records fail closed', async () => {
  const down: typeof fetch = async input => String(input).includes('/suppressions/') ? new Response(null, { status: 404 }) : new Response(null, { status: 503 });
  assert.deepEqual(await findResendContact('reader@example.com', 'key', topicId, down), { kind: 'failed' });
  const malformed: typeof fetch = async input => String(input).includes('/suppressions/') ? new Response(null, { status: 404 }) : Response.json({ id: 'bad' });
  assert.deepEqual(await findResendContact('reader@example.com', 'key', topicId, malformed), { kind: 'failed' });
});

test('confirmed new signup creates a contact then opts into only Work / AI', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input); calls.push({ url, init });
    if (url.includes('/suppressions/')) return new Response(null, { status: 404 });
    if (init?.method === 'POST') return Response.json(contact, { status: 201 });
    if (init?.method === 'PATCH') return Response.json({ object: 'contact_topics', id: topicId });
    if (url.endsWith('/topics')) return Response.json({ data: [] });
    return new Response(null, { status: 404 });
  };
  assert.deepEqual(await subscribeResendContact(' Reader@Example.COM ', 'key', topicId, fetcher), { id: contactId, email: 'reader@example.com', unsubscribed: false });
  const create = calls.find(call => call.init?.method === 'POST');
  assert.equal(create?.url, 'https://api.resend.com/contacts');
  assert.deepEqual(JSON.parse(String(create?.init?.body)), { email: 'reader@example.com', unsubscribed: false });
  assert.ok(calls.some(call => call.url === 'https://api.resend.com/contacts/reader%40example.com'));
  const write = calls.find(call => call.init?.method === 'PATCH');
  assert.equal(write?.url, `https://api.resend.com/contacts/${contactId}/topics`);
  assert.deepEqual(JSON.parse(String(write?.init?.body)), [{ id: topicId, subscription: 'opt_in' }]);
});

test('unsubscribe marks the Resend contact and Work / AI topic unsubscribed', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher: typeof fetch = async (input, init) => { calls.push({ url: String(input), init }); return new Response(null, { status: 204 }); };
  assert.equal(await unsubscribeResendContact(contactId, 'key', topicId, fetcher), true);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map(call => JSON.parse(String(call.init?.body))), [
    { unsubscribed: true }, [{ id: topicId, subscription: 'opt_out' }],
  ]);
});
