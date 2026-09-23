import { findKitSubscriber, createInactiveKitSubscriber, addKitSubscriberToWorkForm, addKitWorkTag } from './kit-subscription';
import { sendSignupVerificationEmail } from './postmark-verification';
import { sendWorkWelcomeEmail } from './postmark-work-welcome';
import { createSignupLedgerFromEnv, validLinkSecret } from './signup-verification';
import { isWorkWelcomeEnabled, type SignupConfig, type SignupDependencies } from './newsletter-flow';

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
  } = env;
  if (!KIT_API_KEY || !KIT_FORM_ID || !KIT_WORK_TAG_ID || !validLinkSecret(SIGNUP_LINK_SECRET)
    || !POSTMARK_SERVER_TOKEN || !POSTMARK_FROM_EMAIL || !POSTMARK_TRANSACTIONAL_STREAM) return null;

  const ledger = createSignupLedgerFromEnv(env);
  if (!ledger) return null;
  const apiKey = KIT_API_KEY;
  const formId = KIT_FORM_ID;
  const tagId = KIT_WORK_TAG_ID;
  const config: SignupConfig = { apiKey, formId, tagId, tokenSecret: SIGNUP_LINK_SECRET, welcomeEnabled: isWorkWelcomeEnabled(env.WORK_WELCOME_ENABLED) };
  const dependencies: SignupDependencies = {
    ledger,
    mail: (email, token) => sendSignupVerificationEmail(email, token, {
      serverToken: POSTMARK_SERVER_TOKEN,
      fromEmail: POSTMARK_FROM_EMAIL,
      messageStream: POSTMARK_TRANSACTIONAL_STREAM,
      environment: env.VERCEL_ENV,
      vercelUrl: env.VERCEL_URL,
    }),
    welcome: (email, token) => sendWorkWelcomeEmail(email, token, {
      serverToken: POSTMARK_SERVER_TOKEN,
      fromEmail: POSTMARK_FROM_EMAIL,
      messageStream: POSTMARK_TRANSACTIONAL_STREAM,
      environment: env.VERCEL_ENV,
      vercelUrl: env.VERCEL_URL,
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
  const { KIT_API_KEY, KIT_WORK_TAG_ID, SIGNUP_LINK_SECRET, POSTMARK_SERVER_TOKEN, POSTMARK_FROM_EMAIL, POSTMARK_TRANSACTIONAL_STREAM } = env;
  const ledger = createSignupLedgerFromEnv(env);
  if (!KIT_API_KEY || !KIT_WORK_TAG_ID || !validLinkSecret(SIGNUP_LINK_SECRET) || !ledger || !POSTMARK_SERVER_TOKEN || !POSTMARK_FROM_EMAIL || !POSTMARK_TRANSACTIONAL_STREAM) return null;
  return {
    config: {
      apiKey: KIT_API_KEY,
      tagId: KIT_WORK_TAG_ID,
      tokenSecret: SIGNUP_LINK_SECRET,
      welcomeEnabled: isWorkWelcomeEnabled(env.WORK_WELCOME_ENABLED),
      welcome: (email: string, token: string) => sendWorkWelcomeEmail(email, token, {
        serverToken: POSTMARK_SERVER_TOKEN,
        fromEmail: POSTMARK_FROM_EMAIL,
        messageStream: POSTMARK_TRANSACTIONAL_STREAM,
        environment: env.VERCEL_ENV,
        vercelUrl: env.VERCEL_URL,
      }),
    },
    ledger,
  };
}
