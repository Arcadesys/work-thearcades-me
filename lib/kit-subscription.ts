import { z } from 'zod';

const emailSchema = z.email().max(254);
const idSchema = z.string().regex(/^[1-9]\d*$/);

type KitConfig = { apiKey: string; formId: string };
type Fetcher = typeof fetch;

export function isValidSignupEmail(value: unknown): value is string {
  return typeof value === 'string' && emailSchema.safeParse(value.trim()).success;
}

/** Create the subscriber as inactive, then add it to the Kit form to trigger its double opt-in. */
export async function submitKitSignup(email: string, config: KitConfig, fetcher: Fetcher = fetch) {
  if (!isValidSignupEmail(email) || !config.apiKey || !idSchema.safeParse(config.formId).success) return false;

  const headers = {
    'Content-Type': 'application/json',
    'X-Kit-Api-Key': config.apiKey,
  };
  const requestOptions = { method: 'POST', headers, signal: AbortSignal.timeout(8000) };

  try {
    const createResponse = await fetcher('https://api.kit.com/v4/subscribers', {
      ...requestOptions,
      body: JSON.stringify({ email_address: email.trim(), state: 'inactive' }),
    });
    if (!createResponse.ok) return false;

    const created = await createResponse.json() as { subscriber?: { id?: unknown } };
    const subscriberId = created.subscriber?.id;
    if (typeof subscriberId !== 'number' || !Number.isSafeInteger(subscriberId) || subscriberId < 1) return false;

    const formResponse = await fetcher(
      `https://api.kit.com/v4/forms/${config.formId}/subscribers/${subscriberId}`,
      { ...requestOptions, body: '{}' },
    );
    return formResponse.ok;
  } catch {
    // Never log Kit responses or the address submitted in the request.
    return false;
  }
}
