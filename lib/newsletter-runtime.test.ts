import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewsletterRuntime } from './newsletter-runtime';

const baseEnv: NodeJS.ProcessEnv = {
  NODE_ENV: 'test',
  RESEND_API_KEY: 'domain-restricted-sending-key',
  RESEND_CONTACTS_API_KEY: 'full-access-contacts-key',
  RESEND_FROM_EMAIL: 'austen@mail.thearcades.me',
  RESEND_TOPIC_WORK_AI_ID: 'b6d24b8e-af0b-4c3c-be0c-359bbd97381e',
  SIGNUP_LINK_SECRET: 'a-very-long-test-secret-used-only-for-unit-tests',
  UPSTASH_REDIS_REST_URL: 'https://redis.example.test',
  UPSTASH_REDIS_REST_TOKEN: 'mock-redis-token',
};

test('runtime reads the shared Work / AI topic variable and keeps sending and contacts keys separate', () => {
  const runtime = createNewsletterRuntime(baseEnv);
  assert.ok(runtime);
  assert.equal(runtime.config.apiKey, 'full-access-contacts-key');
  assert.equal(runtime.config.topicId, 'b6d24b8e-af0b-4c3c-be0c-359bbd97381e');
  assert.equal(createNewsletterRuntime({ ...baseEnv, RESEND_TOPIC_WORK_AI_ID: undefined }), null);
});
