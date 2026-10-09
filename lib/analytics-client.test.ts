import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import posthog from 'posthog-js';
import { createEngagementSender, initializeAnalytics, track } from './analytics-client';
import { outgoingEvent } from './analytics-policy';

function browser(t: TestContext, path = '/resume', failStorage = false) {
  const location = { hostname: 'work.thearcades.me', pathname: path, search: '?utm_campaign=analytics-verification' };
  const records = new Map<string, string>();
  const sessionStorage = { getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => { if (failStorage) throw new Error('blocked'); records.set(key, value); }, removeItem: (key: string) => records.delete(key) };
  for (const [key, value] of Object.entries({ location, document: { referrer: '' }, sessionStorage })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : Reflect.deleteProperty(globalThis, key));
  }
  return location;
}

test('reading final flush keeps public page/campaign after private navigation and requests immediate beacon', (t) => {
  const location = browser(t);
  t.mock.method(posthog, 'init', () => posthog);
  const capture = t.mock.method(posthog, 'capture', () => undefined);
  initializeAnalytics();
  const send = createEngagementSender('/resume');
  location.pathname = '/jobs/private'; location.search = '?email=private@example.com#token';
  send({ active_seconds: 40, depth_percent: 75, engagement_checkpoint: 'final', engagement_version: 'visible_active_v1' });
  assert.equal(capture.mock.calls.length, 1);
  const [name, properties, options] = capture.mock.calls[0].arguments;
  assert.equal(name, 'reading-engagement');
  assert.equal(properties?.pathname, '/resume');
  assert.equal(properties?.utm_campaign, 'analytics-verification');
  assert.deepEqual(options, { send_instantly: true, transport: 'sendBeacon' });
  assert.ok(!JSON.stringify(properties).includes('private'));
  const output = outgoingEvent({ event: String(name), uuid: 'event-id', timestamp: new Date(), properties: properties ?? {} }, 'test-token');
  assert.equal(output?.properties.content_type, 'resume');
});

test('storage denial disables SDK initialization and all capture without a persistent fallback', (t) => {
  browser(t, '/resume', true);
  const init = t.mock.method(posthog, 'init', () => posthog);
  const capture = t.mock.method(posthog, 'capture', () => undefined);
  initializeAnalytics();
  track('resume_click', { placement: 'hero' });
  createEngagementSender('/resume')({ active_seconds: 30, depth_percent: 25, engagement_checkpoint: '30s', engagement_version: 'visible_active_v1' });
  assert.equal(init.mock.calls.length, 0); assert.equal(capture.mock.calls.length, 0);
});

test('verification and unsubscribe pages cannot initialize or emit token-bearing pageviews', (t) => {
  const location = browser(t, '/newsletter/verify');
  const init = t.mock.method(posthog, 'init', () => posthog);
  const capture = t.mock.method(posthog, 'capture', () => undefined);
  initializeAnalytics(); track('subscribe_request_accepted');
  location.pathname = '/newsletter/unsubscribe'; initializeAnalytics(); track('$pageview');
  assert.equal(init.mock.calls.length, 0); assert.equal(capture.mock.calls.length, 0);
});
