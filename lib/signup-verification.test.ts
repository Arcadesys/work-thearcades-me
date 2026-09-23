import test from 'node:test';
import assert from 'node:assert/strict';
import { createSignupChallenge, redisRestCredentials, UpstashSignupLedger } from './signup-verification';

test('Redis config accepts Vercel KV names without duplicating credentials', () => {
  assert.deepEqual(redisRestCredentials({ KV_REST_API_URL: 'https://kv.example', KV_REST_API_TOKEN: 'kv-token' }), {
    url: 'https://kv.example', token: 'kv-token',
  });
});

test('complete explicit Upstash pair takes precedence over complete Vercel KV pair', () => {
  assert.deepEqual(redisRestCredentials({
    UPSTASH_REDIS_REST_URL: 'https://upstash.example',
    UPSTASH_REDIS_REST_TOKEN: 'upstash-token',
    KV_REST_API_URL: 'https://kv.example',
    KV_REST_API_TOKEN: 'kv-token',
  }), { url: 'https://upstash.example', token: 'upstash-token' });
});

test('Redis config fails closed on incomplete pairs rather than mixing credentials', () => {
  assert.equal(redisRestCredentials({ UPSTASH_REDIS_REST_URL: 'https://upstash.example', KV_REST_API_TOKEN: 'kv-token' }), null);
  assert.equal(redisRestCredentials({ UPSTASH_REDIS_REST_TOKEN: 'upstash-token', KV_REST_API_URL: 'https://kv.example' }), null);
});

test('claim accepts Upstash EVAL replies with an auto-decoded record object', async () => {
  const secret = 'a'.repeat(32);
  const { token, record } = createSignupChallenge('reader@example.com', 'work', secret);
  const processing = { ...record, state: 'processing' as const, verifiedAt: Date.now(), leaseUntil: Date.now() + 60_000 };
  const redis = {
    get: async () => record.id,
    eval: async () => ['claimed', processing],
  };
  const result = await new UpstashSignupLedger(redis as never).claim(token);
  assert.equal(result.status, 'claimed');
  assert.deepEqual(result.record, processing);
});

test('queue claim accepts auto-decoded records and records without encrypted email', async () => {
  const secret = 'b'.repeat(32);
  const { record } = createSignupChallenge('reader@example.com', 'work', secret);
  const queued = {
    ...record,
    encryptedEmail: undefined,
    state: 'processing' as const,
    subscriberId: 1234,
    verifiedAt: Date.now(),
    leaseUntil: Date.now() + 60_000,
  };
  const redis = {
    zrange: async () => [record.id],
    eval: async () => ['claimed', queued],
  };
  const claimed = await new UpstashSignupLedger(redis as never).claimDueKitConfirmations(Date.now());
  assert.deepEqual(claimed, [queued]);
});
