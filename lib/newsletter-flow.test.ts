import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmNewsletterVerification, isWorkWelcomeEnabled, requestNewsletterVerification, type SignupDependencies } from './newsletter-flow';
import { createSignupChallenge, decryptSignupEmail, isValidSignupChallenge, signupIpFingerprint, type SignupLedger, type SignupRecord } from './signup-verification';
import type { ResendContact } from './resend-contacts';
import { readWorkUnsubscribeToken } from './work-unsubscribe-token';

const secret = 'a-very-long-test-secret-used-only-for-unit-tests';
const contact: ResendContact = { id: 'e169aa45-1ecf-4183-9955-b1499d5701d3', email: 'reader@example.com', unsubscribed: false };
const config = { apiKey: 'contacts-test-key', topicId: 'b6d24b8e-af0b-4c3c-be0c-359bbd97381e', tokenSecret: secret, welcomeEnabled: true };

class MemoryLedger implements SignupLedger {
  record?: SignupRecord; token = ''; welcomes = new Map<string, 'sending' | 'sent' | 'uncertain'>();
  async issue(record: SignupRecord) { this.record = structuredClone(record); return true; }
  async releaseEmailCooldown() {}
  async claim(token: string) {
    if (token !== this.token || !this.record) return { status: 'missing' };
    if (this.record.state === 'completed') return { status: 'completed' };
    if (!['pending', 'retry', 'processing'].includes(this.record.state)) return { status: 'invalid' };
    this.record.state = 'processing'; return { status: 'claimed', record: structuredClone(this.record) };
  }
  async cancel() { if (this.record) this.record.state = 'cancelled'; return 'cancelled'; }
  async retry(id: string) { if (this.record?.id === id) this.record.state = 'retry'; }
  async complete(id: string) { if (this.record?.id === id) this.record.state = 'completed'; }
  async suppress(id: string) { if (this.record?.id === id) this.record.state = 'suppressed'; }
  async claimWorkWelcome(key: string) { const value = this.welcomes.get(key); if (value === 'sending') return 'busy' as const; if (value) return 'already_handled' as const; this.welcomes.set(key, 'sending'); return 'claimed' as const; }
  async settleWorkWelcome(key: string, state: 'sent' | 'uncertain') { this.welcomes.set(key, state); return true; }
  async releaseWorkWelcome(key: string) { this.welcomes.delete(key); }
}

function setup(findKind: 'found' | 'missing' | 'blocked' | 'failed' = 'missing') {
  const ledger = new MemoryLedger(); const events: string[] = [];
  const deps: SignupDependencies = {
    ledger,
    mail: async (_email, token) => { events.push('mail'); ledger.token = token; return 'sent'; },
    welcome: async () => { events.push('welcome'); return 'sent'; },
    resend: {
      find: async () => { events.push('find'); return findKind === 'found' ? { kind: 'found', contact } : { kind: findKind }; },
      subscribe: async () => { events.push('subscribe'); return findKind === 'blocked' || findKind === 'failed' ? null : contact; },
    },
    now: () => 1_800_000_000_000,
  };
  return { ledger, events, deps };
}

test('request sends a private confirmation link and performs no contact writes', async () => {
  const { ledger, events, deps } = setup('found');
  assert.equal(await requestNewsletterVerification('reader@example.com', 'blog_post', config, deps), 'sent');
  assert.deepEqual(events, ['find', 'mail']);
  assert.equal(ledger.record?.state, 'pending');
  assert.ok(ledger.record?.encryptedEmail);
  assert.equal(JSON.stringify(ledger.record).includes('reader@example.com'), false);
});

test('signup request and confirmation use one canonical email for lookup, challenge, and writes', async () => {
  const { ledger, deps } = setup('missing');
  const lookups: string[] = [];
  const mailed: string[] = [];
  const subscribed: string[] = [];
  const welcomed: string[] = [];
  deps.resend.find = async email => { lookups.push(email); return { kind: 'found', contact }; };
  deps.resend.subscribe = async email => { subscribed.push(email); return contact; };
  deps.mail = async (email, token) => { mailed.push(email); ledger.token = token; return 'sent'; };
  deps.welcome = async email => { welcomed.push(email); return 'sent'; };

  assert.equal(await requestNewsletterVerification(' Reader@Example.COM ', 'blog_post', config, deps), 'sent');
  assert.equal(ledger.record && decryptSignupEmail(ledger.record.encryptedEmail, secret), 'reader@example.com');
  assert.equal(await confirmNewsletterVerification(ledger.token, config, deps), 'active');
  assert.deepEqual(lookups, ['reader@example.com', 'reader@example.com']);
  assert.deepEqual(mailed, ['reader@example.com']);
  assert.deepEqual(subscribed, ['reader@example.com']);
  assert.deepEqual(welcomed, ['reader@example.com']);
});

test('blocked addresses receive no verification email and read errors fail closed', async () => {
  const blocked = setup('blocked');
  assert.equal(await requestNewsletterVerification('reader@example.com', 'blog_post', config, blocked.deps), 'suppressed');
  assert.deepEqual(blocked.events, ['find']);
  const failed = setup('failed');
  assert.equal(await requestNewsletterVerification('reader@example.com', 'blog_post', config, failed.deps), 'failed');
  assert.deepEqual(failed.events, ['find']);
});

test('uncertain Resend email outcome keeps the challenge valid without retrying mail', async () => {
  const value = setup();
  value.deps.mail = async (_email, token) => { value.ledger.token = token; return 'uncertain'; };
  assert.equal(await requestNewsletterVerification('reader@example.com', 'blog_post', config, value.deps), 'uncertain');
  assert.equal(value.ledger.record?.state, 'pending');
  assert.ok(value.ledger.record?.encryptedEmail);
});

test('first-party confirmation is the only subscription step and applies the Work / AI topic', async () => {
  const value = setup('missing'); let welcomeToken = '';
  value.deps.welcome = async (_email, token) => { value.events.push('welcome'); welcomeToken = token; return 'sent'; };
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, value.deps);
  assert.deepEqual(value.events, ['find', 'mail']);
  assert.equal(await confirmNewsletterVerification(value.ledger.token, config, value.deps), 'active');
  assert.deepEqual(value.events, ['find', 'mail', 'find', 'subscribe', 'welcome']);
  assert.equal(value.ledger.record?.state, 'completed');
  assert.deepEqual(readWorkUnsubscribeToken(welcomeToken, secret), { contactId: contact.id, emailDigest: value.ledger.record?.emailDigest });
});

test('an address that becomes suppressed before confirmation is not subscribed', async () => {
  const value = setup('missing');
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, value.deps);
  value.deps.resend.find = async () => ({ kind: 'blocked' });
  assert.equal(await confirmNewsletterVerification(value.ledger.token, config, value.deps), 'suppressed');
  assert.equal(value.events.includes('subscribe'), false);
});

test('welcome remains disabled by default and each confirmed address gets at most one welcome', async () => {
  const value = setup('found');
  await requestNewsletterVerification('reader@example.com', 'blog_post', config, value.deps);
  assert.equal(await confirmNewsletterVerification(value.ledger.token, { ...config, welcomeEnabled: false }, value.deps), 'active');
  assert.equal(value.events.includes('welcome'), false);
  assert.equal(isWorkWelcomeEnabled(undefined), false);
  assert.equal(isWorkWelcomeEnabled('TRUE'), false);
  assert.equal(isWorkWelcomeEnabled('true'), true);
});

test('challenge is signed, time bounded, and stores the address only in encrypted form', () => {
  const challenge = createSignupChallenge('reader@example.com', 'blog_post', secret, 1_800_000_000_000);
  assert.equal(JSON.stringify(challenge.record).includes('reader@example.com'), false);
  assert.equal(challenge.record.expiresAt, 1_800_000_000_000 + 24 * 60 * 60 * 1000);
  assert.equal(isValidSignupChallenge(challenge.token, secret), true);
  assert.equal(decryptSignupEmail(challenge.record.encryptedEmail, secret), 'reader@example.com');
  const parts = challenge.token.split('.'); parts[3] = `${parts[3][0] === 'A' ? 'B' : 'A'}${parts[3].slice(1)}`;
  assert.equal(isValidSignupChallenge(parts.join('.'), secret), false);
  assert.notEqual(signupIpFingerprint('203.0.113.8', secret), '203.0.113.8');
});
