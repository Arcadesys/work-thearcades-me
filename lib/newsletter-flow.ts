import { findResendContact, normalizeSignupEmail, subscribeResendContact, type ResendContact } from './resend-contacts';
import { createSignupChallenge, decryptSignupEmail, isValidSignupChallenge, type SignupLedger, type SignupRecord } from './signup-verification';
import type { WelcomeMailResult } from './resend-work-welcome';
import { createWorkUnsubscribeToken } from './work-unsubscribe-token';

export type SignupConfig = { apiKey: string; topicId: string; tokenSecret: string; welcomeEnabled?: boolean };
export function isWorkWelcomeEnabled(value: string | undefined) { return value === 'true'; }
export type SignupMailResult = 'sent' | 'rejected' | 'uncertain';
export type SignupMailer = (email: string, token: string) => Promise<SignupMailResult>;
export type SignupDependencies = {
  ledger: SignupLedger;
  mail: SignupMailer;
  welcome(email: string, unsubscribeToken: string): Promise<WelcomeMailResult>;
  resend: {
    find(email: string): ReturnType<typeof findResendContact>;
    subscribe(email: string): Promise<ResendContact | null>;
  };
  now?: () => number;
};

export async function requestNewsletterVerification(email: string, placement: string, config: SignupConfig, dependencies: SignupDependencies, ipFingerprint?: string): Promise<'sent' | 'uncertain' | 'suppressed' | 'failed'> {
  const address = normalizeSignupEmail(email);
  const current = await dependencies.resend.find(address);
  if (current.kind === 'blocked') return 'suppressed';
  if (current.kind === 'failed') return 'failed';
  const challenge = createSignupChallenge(address, placement, config.tokenSecret, dependencies.now?.());
  if (!await dependencies.ledger.issue(challenge.record, ipFingerprint)) return 'suppressed';
  let mailResult: SignupMailResult;
  try { mailResult = await dependencies.mail(address, challenge.token); } catch { mailResult = 'uncertain'; }
  if (mailResult === 'uncertain') return 'uncertain';
  if (mailResult === 'rejected') {
    await dependencies.ledger.cancel(challenge.token);
    await dependencies.ledger.releaseEmailCooldown(challenge.record.emailDigest);
    return 'failed';
  }
  return 'sent';
}

export type ConfirmNewsletterResult = 'active' | 'completed' | 'cancelled' | 'suppressed' | 'invalid' | 'busy' | 'failed';
export type WelcomeDependencies = Pick<SignupDependencies, 'ledger' | 'welcome'>;

async function deliverWorkWelcome(record: SignupRecord, email: string, contactId: string, tokenSecret: string, enabled: boolean, dependencies: WelcomeDependencies): Promise<'done' | 'retry'> {
  if (!enabled) return 'done';
  const claim = await dependencies.ledger.claimWorkWelcome(record.emailDigest);
  if (claim === 'already_handled') return 'done';
  if (claim !== 'claimed') return 'retry';
  const token = createWorkUnsubscribeToken(contactId, record.emailDigest, tokenSecret);
  if (!token) { await dependencies.ledger.releaseWorkWelcome(record.emailDigest); return 'retry'; }
  let result: WelcomeMailResult;
  try { result = await dependencies.welcome(email, token); } catch { result = 'uncertain'; }
  if (result === 'rejected') { await dependencies.ledger.releaseWorkWelcome(record.emailDigest); return 'retry'; }
  try { await dependencies.ledger.settleWorkWelcome(record.emailDigest, result); } catch { /* Preserve the sending marker when delivery may have succeeded. */ }
  return 'done';
}

export async function confirmNewsletterVerification(token: string, config: SignupConfig, dependencies: SignupDependencies): Promise<ConfirmNewsletterResult> {
  if (!isValidSignupChallenge(token, config.tokenSecret)) return 'invalid';
  const claim = await dependencies.ledger.claim(token);
  if (claim.status === 'completed') return 'completed';
  if (['cancelled', 'suppressed', 'expired', 'superseded', 'missing', 'invalid'].includes(claim.status)) return 'invalid';
  if (claim.status === 'busy') return 'busy';
  if (claim.status !== 'claimed' || !claim.record?.encryptedEmail) return 'failed';
  const record = claim.record;
  let email: string;
  try { email = normalizeSignupEmail(decryptSignupEmail(record.encryptedEmail, config.tokenSecret)); }
  catch { await dependencies.ledger.retry(record.id); return 'failed'; }
  const current = await dependencies.resend.find(email);
  if (current.kind === 'failed') { await dependencies.ledger.retry(record.id); return 'failed'; }
  if (current.kind === 'blocked') { await dependencies.ledger.suppress(record.id); return 'suppressed'; }
  const contact = await dependencies.resend.subscribe(email);
  if (!contact) { await dependencies.ledger.retry(record.id); return 'failed'; }
  const welcome = await deliverWorkWelcome(record, email, contact.id, config.tokenSecret, config.welcomeEnabled === true, dependencies);
  if (welcome === 'retry') { await dependencies.ledger.retry(record.id); return 'failed'; }
  await dependencies.ledger.complete(record.id);
  return 'active';
}
