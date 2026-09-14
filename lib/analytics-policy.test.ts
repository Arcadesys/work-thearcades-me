import test from 'node:test';
import assert from 'node:assert/strict';
import { campaignProperties, collectionEnvironment, referrerDomain, safePath, sanitizeProperties } from './analytics-policy';
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
