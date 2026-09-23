import test from 'node:test';
import assert from 'node:assert/strict';
import { addKitSubscriberToWorkForm, addKitWorkTag, createInactiveKitSubscriber, findKitSubscriber, getKitSubscriberById, isValidSignupEmail } from './kit-subscription';

test('signup validation accepts ordinary addresses and rejects malformed or oversized input', () => {
  assert.equal(isValidSignupEmail(' person@example.com '), true);
  assert.equal(isValidSignupEmail('not-an-email'), false);
  assert.equal(isValidSignupEmail(`a${'x'.repeat(250)}@example.com`), false);
});

test('lookup asks Kit for one exact address across all states and fails closed on malformed data', async () => {
  const calls: string[] = [];
  const fetcher: typeof fetch = async input => {
    calls.push(String(input));
    return Response.json({ subscribers: [{ id: 2718, email_address: 'Reader@example.com', state: 'inactive' }] });
  };
  assert.deepEqual(await findKitSubscriber('Reader@example.com', 'key', fetcher), {
    kind: 'found', subscriber: { id: 2718, emailAddress: 'Reader@example.com', state: 'inactive' },
  });
  const url = new URL(calls[0]);
  assert.equal(url.searchParams.get('email_address'), 'Reader@example.com');
  assert.equal(url.searchParams.get('status'), 'all');
  assert.deepEqual(await findKitSubscriber('Reader@example.com', 'key', async () => Response.json({ subscribers: [{ id: 1 }] })), { kind: 'failed' });
});

test('lookup suppresses blocked states and treats exact-address misses as missing', async () => {
  const blocked = await findKitSubscriber('reader@example.com', 'key', async () => Response.json({ subscribers: [{ id: 10, email_address: 'reader@example.com', state: 'complained' }] }));
  const missing = await findKitSubscriber('reader@example.com', 'key', async () => Response.json({ subscribers: [{ id: 10, email_address: 'other@example.com', state: 'active' }] }));
  assert.deepEqual(blocked, { kind: 'blocked' });
  assert.deepEqual(missing, { kind: 'missing' });
});

test('Kit mutations use only numeric configured IDs and report provider acceptance', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    return Response.json({ subscriber: { id: 2718, email_address: 'reader@example.com', state: 'inactive' } }, { status: 201 });
  };
  assert.deepEqual(await createInactiveKitSubscriber('reader@example.com', 'key', fetcher), { id: 2718, emailAddress: 'reader@example.com', state: 'inactive' });
  assert.equal(await addKitSubscriberToWorkForm(2718, '12345', 'key', fetcher), true);
  assert.equal(await addKitWorkTag(2718, '98765', 'key', fetcher), true);
  assert.deepEqual(calls.map(call => call.url), [
    'https://api.kit.com/v4/subscribers',
    'https://api.kit.com/v4/forms/12345/subscribers/2718',
    'https://api.kit.com/v4/tags/98765/subscribers/2718',
  ]);
  assert.deepEqual(await getKitSubscriberById(2718, 'key', async () => Response.json({ subscriber: { id: 2718, email_address: 'reader@example.com', state: 'active' } })), {
    id: 2718, emailAddress: 'reader@example.com', state: 'active',
  });
});
