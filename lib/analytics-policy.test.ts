import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignProperties, caseStudySlug, collectionEnvironment, eventNames, outgoingEvent, referrerDomain, safePath, sanitizeProperties } from './analytics-policy';

const browserUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36';

test('canonical production and explicitly enabled preview are isolated', () => {
  assert.equal(collectionEnvironment('work.thearcades.me'), 'production');
  assert.equal(collectionEnvironment('work.thearcades.me', 'production'), 'production');
  for (const host of ['localhost', 'www.thearcades.me', 'work.thearcades.me.evil.com', 'test.vercel.app']) {
    assert.equal(collectionEnvironment(host, 'production'), null);
  }
  assert.equal(collectionEnvironment('test.vercel.app', 'preview'), null);
  assert.equal(collectionEnvironment('test.vercel.app', 'preview', 'true'), 'preview');
  assert.equal(collectionEnvironment('localhost', 'preview', 'true'), null);
});

test('campaigns discard private fields and unsafe values', () => {
  assert.deepEqual(
    campaignProperties('?utm_source=Newsletter&utm_medium=email&utm_campaign=fall&utm_content=hero&email=private@example.com&token=secret'),
    { utm_source: 'newsletter', utm_medium: 'email', utm_campaign: 'fall', utm_content: 'hero' },
  );
  assert.deepEqual(campaignProperties('?utm_source=private%40example.com&utm_campaign=hello%20world'), {});
});

test('the conversion-event allowlist preserves every existing funnel event', () => {
  for (const name of ['$pageview', 'case_study_view', 'resume_click', 'contact_click', 'booking_click', 'triage_skill_download', 'image_ratchet_skill_download', 'subscribe_submit_intent', 'subscribe_request_accepted', 'campaign_landing']) assert.ok((eventNames as readonly string[]).includes(name));
});

test('outgoing SDK properties fail closed while retaining privacy-safe web analytics fields', () => {
  const result = sanitizeProperties({
    distinct_id: 'abc-123',
    $session_id: 'session-123',
    $window_id: 'window-123',
    $raw_user_agent: browserUserAgent,
    $current_url: 'https://evil.example/?email=private@example.com#secret',
    $referrer: 'https://evil.example/private?token=secret',
    $set: { email: 'private@example.com' },
    email: 'private@example.com',
    placement: 'hero',
    hostname: 'work.thearcades.me',
    referring_domain: 'example.com',
    pathname: '/resume',
    landing_page: '/resume',
    environment: 'preview',
    arbitrary: 'secret',
  });

  assert.deepEqual(result, {
    distinct_id: 'abc-123',
    $session_id: 'session-123',
    $window_id: 'window-123',
    $raw_user_agent: browserUserAgent,
    placement: 'hero',
    hostname: 'work.thearcades.me',
    referring_domain: 'example.com',
    pathname: '/resume',
    landing_page: '/resume',
    environment: 'preview',
    $host: 'work.thearcades.me',
    $pathname: '/resume',
    $current_url: 'https://work.thearcades.me/resume',
    $referrer: 'https://example.com',
    $process_person_profile: false,
    $geoip_disable: true,
    $ip: '0.0.0.0',
  });

  assert.equal(sanitizeProperties({ $raw_user_agent: 'Mozilla/5.0\nprivate@example.com' }).$raw_user_agent, undefined);
  assert.equal(sanitizeProperties({ $raw_user_agent: 'x'.repeat(513) }).$raw_user_agent, undefined);
  assert.equal(safePath('/layoff-triage'), '/layoff-triage');
  assert.equal(safePath('/guides/how-to-make-ai-generated-pictures-that-arent-slop'), '/guides/how-to-make-ai-generated-pictures-that-arent-slop');
  assert.equal(safePath('/engineering'), '/engineering');
  assert.equal(safePath('/journeys'), '/other');
  assert.equal(safePath('/work/job-search-cockpit'), '/work/job-search-cockpit');
  assert.equal(safePath('/private@example.com'), '/other');
  assert.equal(referrerDomain('https://example.com/private?token=secret#fragment'), 'example.com');
  assert.equal(referrerDomain('mailto:private@example.com'), '');
});

test('public case studies have a stable view slug without exposing private paths', () => {
  assert.equal(caseStudySlug('/work/job-search-cockpit'), 'job-search-cockpit');
  assert.equal(caseStudySlug('/work/bunch'), 'bunch');
  assert.equal(caseStudySlug('/jobs'), undefined);
  assert.equal(caseStudySlug('/work/private@example.com'), undefined);
});

test('outgoing events retain only the project token plus safe analytics identity/context', () => {
  const timestamp = new Date('2026-09-14T00:00:00.000Z');
  const result = outgoingEvent({
    event: '$pageview',
    uuid: 'event-id',
    timestamp,
    properties: {
      token: 'untrusted-token',
      distinct_id: 'visitor-123',
      $session_id: 'session-123',
      $raw_user_agent: browserUserAgent,
      hostname: 'work.thearcades.me',
      referring_domain: 'example.com',
      $current_url: 'https://evil.example/?email=private@example.com',
      pathname: '/resume',
    },
    $set: { email: 'private@example.com' },
    $set_once: { name: 'Private Name' },
  } as Parameters<typeof outgoingEvent>[0], 'project-token');

  assert.deepEqual(result, {
    event: '$pageview',
    uuid: 'event-id',
    timestamp,
    properties: {
      distinct_id: 'visitor-123',
      $session_id: 'session-123',
      $raw_user_agent: browserUserAgent,
      hostname: 'work.thearcades.me',
      referring_domain: 'example.com',
      pathname: '/resume',
      $host: 'work.thearcades.me',
      $pathname: '/resume',
      $current_url: 'https://work.thearcades.me/resume',
      $referrer: 'https://example.com',
      $process_person_profile: false,
      $geoip_disable: true,
      $ip: '0.0.0.0',
      token: 'project-token',
    },
  });

  assert.equal(outgoingEvent({ event: '$identify', uuid: 'event-id', timestamp }, 'project-token'), null);
});

test('engagement and conversion properties are finite, versioned and stage names are derived', () => {
  const event = (name: string, properties: Record<string, unknown>) => outgoingEvent({ event: name, uuid: 'id', timestamp: new Date(), properties: { hostname: 'work.thearcades.me', environment: 'production', pathname: '/resume', ...properties } }, 'test-token');
  const reading = event('reading-engagement', { active_seconds: 30, depth_percent: 50, engagement_checkpoint: '30s', email: 'private@example.com', engagement_version: 'forged' });
  assert.equal(reading?.properties.active_seconds, 30); assert.equal(reading?.properties.content_type, 'resume');
  assert.equal(reading?.properties.engagement_version, 'visible_active_v1'); assert.equal(reading?.properties.email, undefined);
  assert.equal(event('reading-engagement', { active_seconds: -10, depth_percent: 50, engagement_checkpoint: 'final' }), null);
  assert.equal(event('reading-engagement', { pathname: '/newsletter/verify#token', active_seconds: 30, depth_percent: 50, engagement_checkpoint: 'final' }), null);
  for (const [kind, stage] of [['resume_pdf', 'resume_download_intent'], ['resume_text', 'resume_download_intent'], ['forged', 'resume_navigation_intent']]) {
    const result = event('resume_click', { interaction_type: kind, conversion_stage: 'confirmed_hire' });
    assert.equal(result?.properties.conversion_stage, stage);
  }
  assert.equal(event('contact_click', { email: 'private', conversion_stage: 'inquiry' })?.properties.conversion_stage, 'contact_intent');
  assert.equal(event('subscribe_verification_requested', {})?.properties.conversion_stage, 'verification_request_accepted');
  assert.equal(event('subscribe_request_failed', {})?.properties.conversion_stage, 'request_failed');
  assert.equal(event('$pageview', { pathname: '/newsletter/verify' }), null);
});
