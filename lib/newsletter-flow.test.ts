import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmNewsletterVerification, isKitReconciliationEnabled, isWorkWelcomeEnabled, reconcileVerifiedKitSignups, requestNewsletterVerification, type SignupDependencies } from './newsletter-flow';
import { createSignupChallenge, decryptSignupEmail, isValidSignupChallenge, signupIpFingerprint, type SignupLedger, type SignupRecord } from './signup-verification';
import type { KitSubscriber } from './kit-subscription';
import { readWorkUnsubscribeToken } from './work-unsubscribe-token';

const secret = 'a-very-long-test-secret-used-only-for-unit-tests';
const config = { apiKey: 'test-key', formId: '9953061', tagId: '23806915', tokenSecret: secret, welcomeEnabled: true };

class MemoryLedger implements SignupLedger {
  record?: SignupRecord;
  token = '';
  queue: SignupRecord[] = [];
  welcomeAddresses = new Map<string, 'sending' | 'sent' | 'uncertain'>();
  async issue(record: SignupRecord) { this.record = structuredClone(record); return true; }
  async releaseEmailCooldown() {}
  async claim(token: string) {
    if (token !== this.token || !this.record) return { status: 'missing' };
    if (this.record.state === 'completed') return { status: 'completed' };
    if (this.record.state === 'waiting_kit_confirmation') return { status: 'waiting_kit_confirmation' };
    if (!['pending', 'retry', 'processing'].includes(this.record.state)) return { status: 'invalid' };
    this.record.state = 'processing';
    return { status: 'claimed', record: structuredClone(this.record) };
  }
  async cancel() { if (this.record) this.record.state = 'cancelled'; return 'cancelled'; }
  async retry(id: string) { if (this.record?.id === id) this.record.state = 'retry'; }
  async waitForKitConfirmation(id: string, subscriberId: number, nextAt: number) {
    if (this.record?.id !== id) return;
    this.record.state = 'waiting_kit_confirmation';
    this.record.encryptedEmail = '';
    this.record.subscriberId = subscriberId;
    this.record.queueExpiresAt = nextAt + 30 * 24 * 60 * 60 * 1000;
    this.queue = [structuredClone(this.record)];
  }
  async complete(id: string) { if (this.record?.id === id) this.record.state = 'completed'; this.queue = []; }
  async suppress(id: string) { if (this.record?.id === id) this.record.state = 'suppressed'; this.queue = []; }
  async claimDueKitConfirmations() { const records = this.queue; this.queue = []; return records; }
  async rescheduleKitConfirmation(id: string) { if (this.record?.id === id) this.queue = [structuredClone(this.record)]; }
  async claimWorkWelcome(digest: string) {
    const current = this.welcomeAddresses.get(digest);
    if (current === 'sending') return 'busy' as const;
    if (current) return 'already_handled' as const;
    this.welcomeAddresses.set(digest, 'sending');
    return 'claimed' as const;
  }
  async settleWorkWelcome(digest: string, state: 'sent' | 'uncertain') {
    if (this.welcomeAddresses.get(digest) !== 'sending') return false;
    this.welcomeAddresses.set(digest, state);
    return true;
  }
  async releaseWorkWelcome(digest: string) { if (this.welcomeAddresses.get(digest) === 'sending') this.welcomeAddresses.delete(digest); }
}

function dependencies(state: 'active' | 'inactive' | 'missing' | 'blocked' = 'missing') {
  const ledger = new MemoryLedger();
  const calls: string[] = [];
  const subscriber: KitSubscriber = { id: 77, emailAddress: 'reader@example.com', state: state === 'missing' ? 'inactive' : state === 'blocked' ? 'cancelled' : state };
  const deps: SignupDependencies = {
    ledger,
    mail: async (_email, token) => { calls.push('mail'); ledger.token = token; return 'sent'; },
    welcome: async () => { calls.push('welcome'); return 'sent'; },
    kit: {
      find: async () => { calls.push('find'); return state === 'blocked' ? { kind: 'blocked' } : state === 'missing' ? { kind: 'missing' } : { kind: 'found', subscriber }; },
      create: async () => { calls.push('create'); return subscriber; },
      addToForm: async () => { calls.push('form'); return true; },
      addTag: async () => { calls.push('tag'); return true; },
    },
    now: () => 1_800_000_000_000,
  };
  return { ledger, calls, deps };
}

test('request sends a private link but performs no Kit writes before explicit confirmation', async () => {
  const { ledger, calls, deps } = dependencies('inactive');
  assert.equal(await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps), 'sent');
  assert.deepEqual(calls, ['find', 'mail']);
  assert.equal(ledger.record?.state, 'pending');
  assert.ok(ledger.record?.encryptedEmail);
  assert.equal(JSON.stringify(ledger.record).includes('reader@example.com'), false);
});

test('blocked addresses receive no challenge email; provider lookup failure fails closed', async () => {
  const blocked = dependencies('blocked');
  assert.equal(await requestNewsletterVerification('reader@example.com', 'blog_post', config, blocked.deps), 'suppressed');
  assert.deepEqual(blocked.calls, ['find']);
  const failed = dependencies();
  failed.deps.kit.find = async () => ({ kind: 'failed' });
  assert.equal(await requestNewsletterVerification('reader@example.com', 'blog_post', config, failed.deps), 'failed');
  assert.deepEqual(failed.calls, []);
});

test('a Redis cooldown suppresses repeat verification mail without revealing why', async () => {
  const limited = dependencies();
  limited.deps.ledger.issue = async () => false;
  assert.equal(await requestNewsletterVerification('reader@example.com', 'blog_post', config, limited.deps), 'suppressed');
  assert.deepEqual(limited.calls, ['find']);
});

test('uncertain Postmark outcome keeps its one-time challenge valid for a possibly delivered email', async () => {
  const uncertain = dependencies();
  uncertain.deps.mail = async (_email, token) => { uncertain.ledger.token = token; return 'uncertain'; };
  assert.equal(await requestNewsletterVerification('reader@example.com', 'blog_post', config, uncertain.deps), 'uncertain');
  assert.equal(uncertain.ledger.record?.state, 'pending');
  assert.ok(uncertain.ledger.record?.encryptedEmail);
  assert.equal(uncertain.ledger.token.length > 0, true);
});

test('explicitly verified active contact is added to the Work form and tag only after link use', async () => {
  const { ledger, calls, deps } = dependencies('active');
  let welcomeToken = '';
  deps.welcome = async (_email, token) => { calls.push('welcome'); welcomeToken = token; return 'sent'; };
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps);
  assert.deepEqual(calls, ['find', 'mail']);
  const result = await confirmNewsletterVerification(ledger.token, config, deps);
  assert.equal(result, 'active');
  assert.deepEqual(calls, ['find', 'mail', 'find', 'form', 'tag', 'welcome']);
  assert.equal(ledger.record?.state, 'completed');
  assert.equal([...ledger.welcomeAddresses.values()][0], 'sent');
  assert.deepEqual(readWorkUnsubscribeToken(welcomeToken, secret), { subscriberId: 77, emailDigest: ledger.record?.emailDigest });
});

test('inactive contact enters verified-only DOI queue and receives no tag until active', async () => {
  const { ledger, calls, deps } = dependencies('inactive');
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps);
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'kit_confirmation_required');
  assert.deepEqual(calls, ['find', 'mail', 'find', 'form']);
  assert.equal(ledger.record?.state, 'waiting_kit_confirmation');
  assert.equal(ledger.record?.subscriberId, 77);
  const fetcher: typeof fetch = async input => {
    const url = String(input);
    if (url === 'https://api.kit.com/v4/subscribers/77') return Response.json({ subscriber: { id: 77, email_address: 'reader@example.com', state: 'active' } });
    assert.equal(url, 'https://api.kit.com/v4/tags/23806915/subscribers/77');
    return Response.json({ subscriber: { id: 77 } });
  };
  const result = await reconcileVerifiedKitSignups({ apiKey: 'test-key', tagId: '23806915', tokenSecret: secret, welcomeEnabled: true, welcome: async email => { calls.push(`welcome:${email}`); return 'sent'; } }, ledger, 1_800_000_000_000, fetcher);
  assert.deepEqual(result, { processed: 1, tagged: 1, waiting: 0, suppressed: 0, failed: 0 });
  assert.equal(ledger.record?.state, 'completed');
  assert.deepEqual(calls, ['find', 'mail', 'find', 'form', 'welcome:reader@example.com']);
});

test('a welcome email is sent once per address across later explicit requests', async () => {
  const { ledger, calls, deps } = dependencies('active');
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps);
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'active');
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps);
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'active');
  assert.equal(calls.filter(call => call === 'welcome').length, 1);
});

test('uncertain welcome delivery is recorded and never retried to avoid duplicates', async () => {
  const { ledger, calls, deps } = dependencies('active');
  deps.welcome = async () => { calls.push('welcome-uncertain'); return 'uncertain'; };
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps);
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'active');
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps);
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'active');
  assert.equal(calls.filter(call => call === 'welcome-uncertain').length, 1);
  assert.equal([...ledger.welcomeAddresses.values()][0], 'uncertain');
});

test('definite welcome rejection releases the marker for an explicit retry', async () => {
  const { ledger, calls, deps } = dependencies('active');
  deps.welcome = async () => { calls.push('welcome-rejected'); return 'rejected'; };
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps);
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'active');
  assert.equal(ledger.record?.state, 'retry');
  assert.equal(ledger.welcomeAddresses.size, 0);
  deps.welcome = async () => { calls.push('welcome-retry'); return 'sent'; };
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'active');
  assert.equal(ledger.welcomeAddresses.values().next().value, 'sent');
});

test('Work welcome is disabled by default while explicitly verified tagging still completes', async () => {
  const { ledger, calls, deps } = dependencies('active');
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps);
  assert.equal(await confirmNewsletterVerification(ledger.token, { ...config, welcomeEnabled: false }, deps), 'active');
  assert.deepEqual(calls, ['find', 'mail', 'find', 'form', 'tag']);
  assert.equal(ledger.welcomeAddresses.size, 0);
});

test('Work welcome remains disabled in reconciliation unless explicitly enabled', async () => {
  const { ledger, calls, deps } = dependencies('inactive');
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps);
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'kit_confirmation_required');
  const fetcher: typeof fetch = async input => {
    const url = String(input);
    if (url === 'https://api.kit.com/v4/subscribers/77') return Response.json({ subscriber: { id: 77, email_address: 'reader@example.com', state: 'active' } });
    assert.equal(url, 'https://api.kit.com/v4/tags/23806915/subscribers/77');
    return Response.json({ subscriber: { id: 77 } });
  };
  await reconcileVerifiedKitSignups({ apiKey: 'test-key', tagId: '23806915', tokenSecret: secret, welcome: async email => { calls.push(`welcome:${email}`); return 'sent'; } }, ledger, 1_800_000_000_000, fetcher);
  assert.equal(calls.some(call => call.startsWith('welcome:')), false);
  assert.equal(ledger.welcomeAddresses.size, 0);
});

test('failed partial Kit operation stays retryable and completion replay is safe', async () => {
  const { ledger, calls, deps } = dependencies('active');
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps);
  let failTag = true;
  deps.kit.addTag = async () => { calls.push('tag'); if (failTag) return false; return true; };
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'failed');
  assert.equal(ledger.record?.state, 'retry');
  failTag = false;
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'active');
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'completed');
  assert.equal(calls.filter(call => call === 'form').length, 2); // Kit's add-to-form endpoint is idempotent.
});

test('challenge has HMAC format and rejects tampering', () => {
  const challenge = createSignupChallenge('reader@example.com', 'blog_post', secret, 1_800_000_000_000);
  assert.equal(JSON.stringify(challenge.record).includes('reader@example.com'), false);
  assert.equal(challenge.record.expiresAt, 1_800_000_000_000 + 24 * 60 * 60 * 1000);
  assert.equal(challenge.token.split('.').length, 4);
  assert.equal(isValidSignupChallenge(challenge.token, secret), true);
  assert.equal(decryptSignupEmail(challenge.record.encryptedEmail, secret), 'reader@example.com');
  const parts = challenge.token.split('.');
  parts[3] = `${parts[3][0] === 'A' ? 'B' : 'A'}${parts[3].slice(1)}`;
  const changed = parts.join('.');
  assert.equal(isValidSignupChallenge(changed, secret), false);
});

test('verified reconciliation stays explicitly disabled unless opted in', () => {
  assert.equal(isKitReconciliationEnabled(undefined), false);
  assert.equal(isKitReconciliationEnabled('TRUE'), false);
  assert.equal(isKitReconciliationEnabled('true'), true);
  assert.equal(isWorkWelcomeEnabled(undefined), false);
  assert.equal(isWorkWelcomeEnabled('TRUE'), false);
  assert.equal(isWorkWelcomeEnabled('true'), true);
});

test('IP abuse-limit keys use a secret-keyed digest and reject untrusted malformed values', () => {
  const fingerprint = signupIpFingerprint('203.0.113.8', secret);
  assert.equal(typeof fingerprint, 'string');
  assert.equal(fingerprint?.includes('203.0.113.8'), false);
  assert.notEqual(fingerprint, signupIpFingerprint('203.0.113.8', `${secret}-different`));
  assert.equal(signupIpFingerprint('not-an-ip', secret), undefined);
});
