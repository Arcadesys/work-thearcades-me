import {
  addKitSubscriberToWorkForm,
  addKitWorkTag,
  findKitSubscriber,
  getKitSubscriberById,
  type KitSubscriber,
} from './kit-subscription';
import { createSignupChallenge, decryptSignupEmail, isValidSignupChallenge, type SignupLedger, type SignupRecord } from './signup-verification';
import type { WelcomeMailResult } from './postmark-work-welcome';
import { createWorkUnsubscribeToken } from './work-unsubscribe-token';

export type SignupConfig = { apiKey: string; formId: string; tagId: string; tokenSecret: string; welcomeEnabled?: boolean };
export function isKitReconciliationEnabled(value: string | undefined) { return value === 'true'; }
export function isWorkWelcomeEnabled(value: string | undefined) { return value === 'true'; }
export type SignupMailResult = 'sent' | 'rejected' | 'uncertain';
export type SignupMailer = (email: string, token: string) => Promise<SignupMailResult>;
export type SignupDependencies = {
  ledger: SignupLedger;
  mail: SignupMailer;
  welcome(email: string, unsubscribeToken: string): Promise<WelcomeMailResult>;
  kit: {
    find(email: string): ReturnType<typeof findKitSubscriber>;
    create(email: string): Promise<KitSubscriber | null>;
    addToForm(id: number): Promise<boolean>;
    addTag(id: number): Promise<boolean>;
  };
  now?: () => number;
};

export async function requestNewsletterVerification(
  email: string,
  placement: string,
  config: SignupConfig,
  dependencies: SignupDependencies,
  ipFingerprint?: string,
): Promise<'sent' | 'uncertain' | 'suppressed' | 'failed'> {
  const current = await dependencies.kit.find(email);
  if (current.kind === 'blocked') return 'suppressed';
  if (current.kind === 'failed') return 'failed';

  const challenge = createSignupChallenge(email, placement, config.tokenSecret, dependencies.now?.());
  if (!await dependencies.ledger.issue(challenge.record, ipFingerprint)) return 'suppressed';
  let mailResult: SignupMailResult;
  try { mailResult = await dependencies.mail(email, challenge.token); } catch { mailResult = 'uncertain'; }
  if (mailResult === 'uncertain') return 'uncertain';
  if (mailResult === 'rejected') {
    await dependencies.ledger.cancel(challenge.token);
    await dependencies.ledger.releaseEmailCooldown(challenge.record.emailDigest);
    return 'failed';
  }
  return 'sent';
}

export type ConfirmNewsletterResult = 'active' | 'kit_confirmation_required' | 'completed' | 'cancelled' | 'suppressed' | 'invalid' | 'busy' | 'failed';

async function applyActiveSubscriber(record: SignupRecord, subscriberId: number, email: string, config: SignupConfig, dependencies: SignupDependencies) {
  if (!await dependencies.kit.addToForm(subscriberId)) {
    await dependencies.ledger.retry(record.id);
    return false;
  }
  if (!await dependencies.kit.addTag(subscriberId)) {
    await dependencies.ledger.retry(record.id);
    return false;
  }
  const welcomeResult = await deliverWorkWelcome(record, email, subscriberId, config.tokenSecret, config.welcomeEnabled === true, dependencies);
  if (welcomeResult === 'retry') {
    await dependencies.ledger.retry(record.id);
    return true;
  }
  await dependencies.ledger.complete(record.id);
  return true;
}

type WelcomeDependencies = Pick<SignupDependencies, 'ledger' | 'welcome'>;

async function deliverWorkWelcome(record: SignupRecord, email: string, subscriberId: number, tokenSecret: string, enabled: boolean, dependencies: WelcomeDependencies): Promise<'done' | 'retry'> {
  if (!enabled) return 'done';
  const claim = await dependencies.ledger.claimWorkWelcome(record.emailDigest);
  if (claim === 'already_handled') return 'done';
  if (claim !== 'claimed') return 'retry';

  const unsubscribeToken = createWorkUnsubscribeToken(subscriberId, record.emailDigest, tokenSecret);
  if (!unsubscribeToken) {
    await dependencies.ledger.releaseWorkWelcome(record.emailDigest);
    return 'retry';
  }
  let result: WelcomeMailResult;
  try { result = await dependencies.welcome(email, unsubscribeToken); } catch { result = 'uncertain'; }
  if (result === 'rejected') {
    await dependencies.ledger.releaseWorkWelcome(record.emailDigest);
    return 'retry';
  }
  try {
    await dependencies.ledger.settleWorkWelcome(record.emailDigest, result);
  } catch {
    // Leave the address-level sending marker in place if delivery may have succeeded.
  }
  return 'done';
}

export async function confirmNewsletterVerification(
  token: string,
  config: SignupConfig,
  dependencies: SignupDependencies,
): Promise<ConfirmNewsletterResult> {
  if (!isValidSignupChallenge(token, config.tokenSecret)) return 'invalid';
  const claim = await dependencies.ledger.claim(token);
  if (claim.status === 'completed') return 'completed';
  if (claim.status === 'cancelled' || claim.status === 'suppressed' || claim.status === 'expired' || claim.status === 'superseded' || claim.status === 'missing' || claim.status === 'invalid') return 'invalid';
  if (claim.status === 'waiting_kit_confirmation') return 'kit_confirmation_required';
  if (claim.status === 'busy') return 'busy';
  if (claim.status !== 'claimed' || !claim.record?.encryptedEmail) return 'failed';

  const record = claim.record;
  let email: string;
  try {
    email = decryptSignupEmail(record.encryptedEmail, config.tokenSecret);
  } catch {
    await dependencies.ledger.retry(record.id);
    return 'failed';
  }

  const existing = await dependencies.kit.find(email);
  if (existing.kind === 'failed') {
    await dependencies.ledger.retry(record.id);
    return 'failed';
  }
  if (existing.kind === 'blocked') {
    await dependencies.ledger.suppress(record.id);
    return 'suppressed';
  }

  let subscriber: KitSubscriber | null;
  if (existing.kind === 'found') subscriber = existing.subscriber;
  else subscriber = await dependencies.kit.create(email);

  if (!subscriber) {
    await dependencies.ledger.retry(record.id);
    return 'failed';
  }
  if (['bounced', 'cancelled', 'complained'].includes(subscriber.state)) {
    await dependencies.ledger.suppress(record.id);
    return 'suppressed';
  }

  if (subscriber.state === 'active') {
    const completed = await applyActiveSubscriber(record, subscriber.id, email, config, dependencies);
    return completed ? 'active' : 'failed';
  }

  if (subscriber.state !== 'inactive') {
    await dependencies.ledger.retry(record.id);
    return 'failed';
  }
  if (!await dependencies.kit.addToForm(subscriber.id)) {
    await dependencies.ledger.retry(record.id);
    return 'failed';
  }
  const now = dependencies.now?.() ?? Date.now();
  await dependencies.ledger.waitForKitConfirmation(record.id, subscriber.id, now + 24 * 60 * 60 * 1000);
  return 'kit_confirmation_required';
}

export type ReconcileConfig = { apiKey: string; tagId: string; tokenSecret: string; welcomeEnabled?: boolean; welcome: SignupDependencies['welcome'] };

export async function reconcileVerifiedKitSignups(
  config: ReconcileConfig,
  ledger: SignupLedger,
  now = Date.now(),
  fetcher: typeof fetch = fetch,
) {
  const records = await ledger.claimDueKitConfirmations(now);
  let tagged = 0;
  let waiting = 0;
  let suppressed = 0;
  let failed = 0;

  for (const record of records) {
    const subscriberId = record.subscriberId;
    if (!subscriberId) {
      await ledger.suppress(record.id);
      suppressed += 1;
      continue;
    }
    const subscriber = await getKitSubscriberById(subscriberId, config.apiKey, fetcher);
    if (!subscriber) {
      await ledger.rescheduleKitConfirmation(record.id, now + 24 * 60 * 60 * 1000);
      failed += 1;
      continue;
    }
    if (['bounced', 'cancelled', 'complained'].includes(subscriber.state)) {
      await ledger.suppress(record.id);
      suppressed += 1;
      continue;
    }
    if (subscriber.state !== 'active') {
      await ledger.rescheduleKitConfirmation(record.id, now + 24 * 60 * 60 * 1000);
      waiting += 1;
      continue;
    }
    if (await addKitWorkTag(subscriberId, config.tagId, config.apiKey, fetcher)) {
      const welcomeResult = await deliverWorkWelcome(record, subscriber.emailAddress, subscriber.id, config.tokenSecret, config.welcomeEnabled === true, { ledger, welcome: config.welcome });
      if (welcomeResult === 'retry') {
        await ledger.rescheduleKitConfirmation(record.id, now + 24 * 60 * 60 * 1000);
        failed += 1;
        continue;
      }
      await ledger.complete(record.id);
      tagged += 1;
    } else {
      await ledger.rescheduleKitConfirmation(record.id, now + 24 * 60 * 60 * 1000);
      failed += 1;
    }
  }
  return { processed: records.length, tagged, waiting, suppressed, failed };
}
