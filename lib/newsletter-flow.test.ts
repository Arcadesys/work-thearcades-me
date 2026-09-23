import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmNewsletterVerification, isKitReconciliationEnabled, reconcileVerifiedKitSignups, requestNewsletterVerification, type SignupDependencies } from './newsletter-flow';
import { createSignupChallenge, decryptSignupEmail, isValidSignupChallenge, signupIpFingerprint, type SignupLedger, type SignupRecord } from './signup-verification';
import type { KitSubscriber } from './kit-subscription';

const secret = 'a-very-long-test-secret-used-only-for-unit-tests';
const config = { apiKey: 'test-key', formId: '9953061', tagId: '23806915', tokenSecret: secret };

class MemoryLedger implements SignupLedger {
  record?: SignupRecord;
  token = '';
  queue: SignupRecord[] = [];
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
}

function dependencies(state: 'active' | 'inactive' | 'missing' | 'blocked' = 'missing') {
  const ledger = new MemoryLedger();
  const calls: string[] = [];
  const subscriber: KitSubscriber = { id: 77, emailAddress: 'reader@example.com', state: state === 'missing' ? 'inactive' : state === 'blocked' ? 'cancelled' : state };
  const deps: SignupDependencies = {
    ledger,
    mail: async (_email, token) => { calls.push('mail'); ledger.token = token; return true; },
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

test('explicitly verified active contact is added to the Work form and tag only after link use', async () => {
  const { ledger, calls, deps } = dependencies('active');
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps);
  assert.deepEqual(calls, ['find', 'mail']);
  const result = await confirmNewsletterVerification(ledger.token, config, deps);
  assert.equal(result, 'active');
  assert.deepEqual(calls, ['find', 'mail', 'find', 'form', 'tag']);
  assert.equal(ledger.record?.state, 'completed');
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
  const result = await reconcileVerifiedKitSignups({ apiKey: 'test-key', tagId: '23806915' }, ledger, 1_800_000_000_000, fetcher);
  assert.deepEqual(result, { processed: 1, tagged: 1, waiting: 0, suppressed: 0, failed: 0 });
  assert.equal(ledger.record?.state, 'completed');
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
  const changed = challenge.token.slice(0, -1) + (challenge.token.endsWith('a') ? 'b' : 'a');
  assert.equal(isValidSignupChallenge(changed, secret), false);
});

test('verified reconciliation stays explicitly disabled unless opted in', () => {
  assert.equal(isKitReconciliationEnabled(undefined), false);
  assert.equal(isKitReconciliationEnabled('TRUE'), false);
  assert.equal(isKitReconciliationEnabled('true'), true);
});

test('IP abuse-limit keys use a secret-keyed digest and reject untrusted malformed values', () => {
  const fingerprint = signupIpFingerprint('203.0.113.8', secret);
  assert.equal(typeof fingerprint, 'string');
  assert.equal(fingerprint?.includes('203.0.113.8'), false);
  assert.notEqual(fingerprint, signupIpFingerprint('203.0.113.8', `${secret}-different`));
  assert.equal(signupIpFingerprint('not-an-ip', secret), undefined);
});
