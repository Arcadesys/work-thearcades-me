import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignProperties, collectionEnvironment, outgoingEvent, referrerDomain, safePath, sanitizeProperties } from './analytics-policy';
test('production and explicitly enabled preview are isolated', () => {
 assert.equal(collectionEnvironment('work.thearcades.me', 'production'), 'production');
 for (const host of ['localhost', 'www.thearcades.me', 'work.thearcades.me.evil.com', 'test.vercel.app']) assert.equal(collectionEnvironment(host, 'production'), null);
 assert.equal(collectionEnvironment('test.vercel.app', 'preview'), null);
 assert.equal(collectionEnvironment('test.vercel.app', 'preview', 'true'), 'preview');
 assert.equal(collectionEnvironment('localhost', 'preview', 'true'), null);
});
test('campaigns discard private fields and unsafe values', () => {
 assert.deepEqual(campaignProperties('?utm_source=Newsletter&utm_medium=email&utm_campaign=fall&utm_content=hero&email=private@example.com&token=secret'), {utm_source:'newsletter',utm_medium:'email',utm_campaign:'fall',utm_content:'hero'});
 assert.deepEqual(campaignProperties('?utm_source=private%40example.com&utm_campaign=hello%20world'), {});
});
test('outgoing SDK properties fail closed', () => {
 const result = sanitizeProperties({distinct_id:'abc-123', $session_id:'session-123', $current_url:'https://work.thearcades.me/?email=private@example.com#secret', $referrer:'https://example.com/private?token=secret', $set:{email:'private@example.com'}, email:'private@example.com', placement:'hero', pathname:'/resume', environment:'preview', arbitrary:'secret'});
 assert.deepEqual(result, {distinct_id:'abc-123',$session_id:'session-123',placement:'hero',pathname:'/resume',environment:'preview',$process_person_profile:false,$geoip_disable:true});
 assert.equal(safePath('/private@example.com'), '/other');
 assert.equal(referrerDomain('https://example.com/private?token=secret#fragment'), 'example.com');
 assert.equal(referrerDomain('mailto:private@example.com'), '');
});
test('outgoing events retain only the token and session identity required for ingestion', () => {
 const timestamp = new Date('2026-09-14T00:00:00.000Z');
 const result = outgoingEvent({
  event: '$pageview', uuid: 'event-id', timestamp,
  properties: { token: 'untrusted-token', distinct_id: 'visitor-123', $session_id: 'session-123', $current_url: 'https://work.thearcades.me/?email=private@example.com', pathname: '/resume' },
  $set: { email: 'private@example.com' }, $set_once: { name: 'Private Name' },
 } as Parameters<typeof outgoingEvent>[0], 'project-token');
 assert.deepEqual(result, { event: '$pageview', uuid: 'event-id', timestamp, properties: { distinct_id: 'visitor-123', $session_id: 'session-123', pathname: '/resume', $process_person_profile: false, $geoip_disable: true, token: 'project-token' } });
 assert.equal(outgoingEvent({ event: '$identify', uuid: 'event-id', timestamp }, 'project-token'), null);
});
