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

test('verification and Kit-active readiness are counted once in atomic ledger transitions', async () => {
  const secret = 'c'.repeat(32);
  const { token, record } = createSignupChallenge('reader@example.com', 'work', secret);
  const calls: Array<{ script: string; keys: string[]; args: unknown[] }> = [];
  const processing = { ...record, state: 'processing' as const, verifiedAt: Date.now(), leaseUntil: Date.now() + 60_000 };
  const redis = {
    get: async () => record.id,
    eval: async (script: string, keys: string[], args: unknown[]) => {
      calls.push({ script, keys, args });
      if (script.includes("local status = record.state")) return ['claimed', processing];
      return 1;
    },
  };

  const ledger = new UpstashSignupLedger(redis as never);
  assert.equal((await ledger.claim(token)).status, 'claimed');
  await ledger.complete(record.id);

  assert.equal(calls.length, 2);
  assert.match(calls[0].script, /if status == 'pending' then[\s\S]*HINCRBY/);
  assert.match(calls[0].script, /first_party_verified/);
  assert.match(calls[1].script, /record\.state ~= 'processing' and record\.state ~= 'waiting_kit_confirmation'/);
  assert.match(calls[1].script, /kit_active_ready/);
  assert.match(calls[1].script, /record\.kitActiveAt = tonumber\(ARGV\[3\]\)/);
  assert.match(calls[0].script, /if status == 'pending' then/);
  assert.equal(calls[0].keys[2].startsWith('work-newsletter:v1:metrics:'), true);
  assert.equal(calls[1].keys[2].startsWith('work-newsletter:v1:metrics:'), true);
  assert.match(calls[0].script, /EXPIRE/);
  assert.match(calls[1].script, /EXPIRE/);
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

test('welcome address marker claims atomically and keeps sent or uncertain results durable', async () => {
  const states = new Map<string, string>();
  const redis = {
    eval: async (_script: string, keys: string[], args: string[]) => {
      const key = keys[0];
      if (args.length === 0) {
        if (states.has(key)) return states.get(key) === 'sending' ? 'busy' : 'already_handled';
        states.set(key, 'sending');
        return 'claimed';
      }
      if (args[0] === 'sent' || args[0] === 'uncertain') {
        if (states.get(key) !== 'sending') return 0;
        states.set(key, args[0]);
        return 1;
      }
      if (states.get(key) === 'sending') { states.delete(key); return 1; }
      return 0;
    },
  };
  const ledger = new UpstashSignupLedger(redis as never);
  const digest = 'c'.repeat(64);
  assert.equal(await ledger.claimWorkWelcome(digest), 'claimed');
  assert.equal(await ledger.claimWorkWelcome(digest), 'busy');
  assert.equal(await ledger.settleWorkWelcome(digest, 'uncertain'), true);
  assert.equal(await ledger.claimWorkWelcome(digest), 'already_handled');
  assert.equal(await ledger.settleWorkWelcome('invalid', 'sent'), false);
});
