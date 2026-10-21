import { findResendContact, isValidSignupEmail, subscribeResendContact } from './resend-contacts';
import { sendSignupVerificationEmail } from './resend-verification';
import { sendWorkWelcomeEmail } from './resend-work-welcome';
import { createSignupLedgerFromEnv, validLinkSecret } from './signup-verification';
import { isWorkWelcomeEnabled, type SignupConfig, type SignupDependencies } from './newsletter-flow';

export type NewsletterRuntime = { config: SignupConfig; dependencies: SignupDependencies };

export function createNewsletterRuntime(env: NodeJS.ProcessEnv = process.env): NewsletterRuntime | null {
  const { RESEND_API_KEY, RESEND_CONTACTS_API_KEY, RESEND_FROM_EMAIL, RESEND_WORK_AI_TOPIC_ID, SIGNUP_LINK_SECRET } = env;
  if (!RESEND_API_KEY || !RESEND_CONTACTS_API_KEY || !RESEND_FROM_EMAIL || !RESEND_WORK_AI_TOPIC_ID
    || !/^[0-9a-f-]{36}$/i.test(RESEND_WORK_AI_TOPIC_ID) || !validLinkSecret(SIGNUP_LINK_SECRET)) return null;
  const ledger = createSignupLedgerFromEnv(env);
  if (!ledger) return null;
  const config: SignupConfig = {
    apiKey: RESEND_CONTACTS_API_KEY,
    topicId: RESEND_WORK_AI_TOPIC_ID,
    tokenSecret: SIGNUP_LINK_SECRET,
    welcomeEnabled: isWorkWelcomeEnabled(env.WORK_WELCOME_ENABLED),
  };
  const dependencies: SignupDependencies = {
    ledger,
    mail: (email, token) => sendSignupVerificationEmail(email, token, {
      apiKey: RESEND_API_KEY, fromEmail: RESEND_FROM_EMAIL, environment: env.VERCEL_ENV, vercelUrl: env.VERCEL_URL,
    }),
    welcome: (email, token) => sendWorkWelcomeEmail(email, token, {
      apiKey: RESEND_API_KEY, fromEmail: RESEND_FROM_EMAIL, environment: env.VERCEL_ENV, vercelUrl: env.VERCEL_URL,
    }),
    resend: {
      find: email => findResendContact(email, RESEND_CONTACTS_API_KEY, RESEND_WORK_AI_TOPIC_ID),
      subscribe: async email => {
        if (!isValidSignupEmail(email)) return null;
        return subscribeResendContact(email, RESEND_CONTACTS_API_KEY, RESEND_WORK_AI_TOPIC_ID);
      },
    },
  };
  return { config, dependencies };
}
