import test from 'node:test';
import assert from 'node:assert/strict';
import { redisRestCredentials } from './signup-verification';

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
