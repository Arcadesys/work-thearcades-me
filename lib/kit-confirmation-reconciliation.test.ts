import test from 'node:test';
import assert from 'node:assert/strict';
import { isKitReconciliationEnabled, reconcileConfirmedKitSubscribers } from './kit-confirmation-reconciliation';

test('confirmation reconciliation is disabled unless explicitly opted in', () => {
  assert.equal(isKitReconciliationEnabled(undefined), false);
  assert.equal(isKitReconciliationEnabled(''), false);
  assert.equal(isKitReconciliationEnabled('TRUE'), false);
  assert.equal(isKitReconciliationEnabled('true'), true);
});

test('reconciliation tags only active form subscribers missing the tag', async () => {
  const calls: Array<{ url: URL; method: string }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    const method = init?.method ?? 'GET';
    calls.push({ url, method });

    if (method === 'POST') return Response.json({ subscriber: { id: Number(url.pathname.split('/').at(-1)) } }, { status: 201 });
    if (url.pathname === '/v4/forms/9953061/subscribers' && !url.searchParams.has('after')) {
      return Response.json({
        subscribers: [{ id: 101, state: 'active' }, { id: 202, state: 'active' }, { id: 303, state: 'inactive' }],
        pagination: { has_next_page: true, end_cursor: 'next-form-page' },
      });
    }
    if (url.pathname === '/v4/forms/9953061/subscribers') {
      return Response.json({ subscribers: [{ id: 404, state: 'active' }], pagination: { has_next_page: false } });
    }
    if (url.pathname === '/v4/tags/23806915/subscribers') {
      return Response.json({ subscribers: [{ id: 202, state: 'inactive' }], pagination: { has_next_page: false } });
    }
    throw new Error(`Unexpected Kit request: ${method} ${url.pathname}`);
  };

  const result = await reconcileConfirmedKitSubscribers({ apiKey: 'test-key', formId: '9953061', tagId: '23806915' }, fetcher);
  assert.deepEqual(result, { confirmed: 3, alreadyTagged: 1, added: 2, failed: 0 });
  assert.equal(calls.some(call => call.method === 'POST' && call.url.pathname.endsWith('/303')), false);
  assert.equal(calls.some(call => call.method === 'POST' && call.url.pathname.endsWith('/202')), false);
  assert.equal(calls.some(call => call.method === 'POST' && call.url.pathname.endsWith('/101')), true);
  assert.equal(calls.some(call => call.method === 'POST' && call.url.pathname.endsWith('/404')), true);
  assert.equal(calls.some(call => call.url.pathname === '/v4/forms/9953061/subscribers' && call.url.searchParams.get('status') !== 'active'), false);
  assert.equal(calls.some(call => call.url.pathname === '/v4/tags/23806915/subscribers' && call.url.searchParams.get('status') !== 'all'), false);
});

test('an incomplete provider read fails before any tag write', async () => {
  let tagWrites = 0;
  const fetcher: typeof fetch = async input => {
    const url = new URL(String(input));
    if (url.pathname === '/v4/forms/9953061/subscribers') return new Response(null, { status: 503 });
    if (url.pathname === '/v4/tags/23806915/subscribers') {
      return Response.json({ subscribers: [], pagination: { has_next_page: false } });
    }
    tagWrites += 1;
    return Response.json({});
  };

  await assert.rejects(
    reconcileConfirmedKitSubscribers({ apiKey: 'test-key', formId: '9953061', tagId: '23806915' }, fetcher),
    /Kit subscriber lookup failed/,
  );
  assert.equal(tagWrites, 0);
});
