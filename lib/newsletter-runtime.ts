import { findKitSubscriber, createInactiveKitSubscriber, addKitSubscriberToWorkForm, addKitWorkTag } from './kit-subscription';
import { sendSignupVerificationEmail } from './postmark-verification';
import { createSignupLedgerFromEnv, validLinkSecret } from './signup-verification';
import type { SignupConfig, SignupDependencies } from './newsletter-flow';

export type NewsletterRuntime = { config: SignupConfig; dependencies: SignupDependencies };

export function createNewsletterRuntime(env: NodeJS.ProcessEnv = process.env): NewsletterRuntime | null {
  const {
    KIT_API_KEY,
    KIT_FORM_ID,
    KIT_WORK_TAG_ID,
    SIGNUP_LINK_SECRET,
    POSTMARK_SERVER_TOKEN,
    POSTMARK_FROM_EMAIL,
    POSTMARK_TRANSACTIONAL_STREAM,
    UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN,
  } = env;
  if (!KIT_API_KEY || !KIT_FORM_ID || !KIT_WORK_TAG_ID || !validLinkSecret(SIGNUP_LINK_SECRET)
    || !POSTMARK_SERVER_TOKEN || !POSTMARK_FROM_EMAIL || !POSTMARK_TRANSACTIONAL_STREAM
    || !UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) return null;

  const ledger = createSignupLedgerFromEnv(env);
  if (!ledger) return null;
  const apiKey = KIT_API_KEY;
  const formId = KIT_FORM_ID;
  const tagId = KIT_WORK_TAG_ID;
  const config: SignupConfig = { apiKey, formId, tagId, tokenSecret: SIGNUP_LINK_SECRET };
  const dependencies: SignupDependencies = {
    ledger,
    mail: (email, token) => sendSignupVerificationEmail(email, token, {
      serverToken: POSTMARK_SERVER_TOKEN,
      fromEmail: POSTMARK_FROM_EMAIL,
      messageStream: POSTMARK_TRANSACTIONAL_STREAM,
    }),
    kit: {
      find: email => findKitSubscriber(email, apiKey),
      create: email => createInactiveKitSubscriber(email, apiKey),
      addToForm: id => addKitSubscriberToWorkForm(id, formId, apiKey),
      addTag: id => addKitWorkTag(id, tagId, apiKey),
    },
  };
  return { config, dependencies };
}

export function createReconciliationRuntime(env: NodeJS.ProcessEnv = process.env) {
  const { KIT_API_KEY, KIT_WORK_TAG_ID } = env;
  const ledger = createSignupLedgerFromEnv(env);
  if (!KIT_API_KEY || !KIT_WORK_TAG_ID || !ledger) return null;
  return { config: { apiKey: KIT_API_KEY, tagId: KIT_WORK_TAG_ID }, ledger };
}
