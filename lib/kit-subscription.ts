import { z } from 'zod';

const emailSchema = z.email().max(254);
const idSchema = /^[1-9]\d*$/;
const blockedStates = new Set(['bounced', 'cancelled', 'complained']);
const workSignupReferrer = 'https://work.thearcades.me/blog';

type Fetcher = typeof fetch;
export type KitSubscriberState = 'active' | 'inactive' | 'bounced' | 'cancelled' | 'complained';
export type KitSubscriber = { id: number; emailAddress: string; state: KitSubscriberState };
export type KitStatusResult = { kind: 'found'; subscriber: KitSubscriber } | { kind: 'missing' } | { kind: 'blocked' } | { kind: 'failed' };

export function isValidSignupEmail(value: unknown): value is string {
  return typeof value === 'string' && emailSchema.safeParse(value.trim()).success;
}

function parseSubscriber(value: unknown): KitSubscriber | null {
  if (typeof value !== 'object' || value === null) return null;
  const entry = value as Record<string, unknown>;
  if (typeof entry.id !== 'number' || !Number.isSafeInteger(entry.id) || entry.id < 1) return null;
  if (typeof entry.email_address !== 'string' || !isValidSignupEmail(entry.email_address)) return null;
  if (typeof entry.state !== 'string' || !['active', 'inactive', 'bounced', 'cancelled', 'complained'].includes(entry.state)) return null;
  return { id: entry.id, emailAddress: entry.email_address, state: entry.state as KitSubscriberState };
}

/** Look up only the exact address and all statuses; never use account-wide scans. */
export async function findKitSubscriber(email: string, apiKey: string, fetcher: Fetcher = fetch): Promise<KitStatusResult> {
  if (!isValidSignupEmail(email) || !apiKey) return { kind: 'failed' };
  const url = new URL('https://api.kit.com/v4/subscribers');
  url.searchParams.set('email_address', email.trim());
  url.searchParams.set('status', 'all');
  url.searchParams.set('slim', 'true');
  url.searchParams.set('per_page', '10');

  try {
    const response = await fetcher(url, {
      headers: { 'X-Kit-Api-Key': apiKey },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { kind: 'failed' };
    const body = await response.json() as { subscribers?: unknown };
    if (!Array.isArray(body.subscribers)) return { kind: 'failed' };
    const subscribers = body.subscribers.map(parseSubscriber);
    if (subscribers.some(subscriber => subscriber === null)) return { kind: 'failed' };
    const matches = (subscribers as KitSubscriber[])
      .filter(subscriber => subscriber.emailAddress.trim().toLowerCase() === email.trim().toLowerCase());
    if (matches.length === 0) return { kind: 'missing' };
    if (matches.length !== 1) return { kind: 'failed' };
    const subscriber = matches[0];
    return blockedStates.has(subscriber.state) ? { kind: 'blocked' } : { kind: 'found', subscriber };
  } catch {
    return { kind: 'failed' };
  }
}

export async function createInactiveKitSubscriber(email: string, apiKey: string, fetcher: Fetcher = fetch): Promise<KitSubscriber | null> {
  if (!isValidSignupEmail(email) || !apiKey) return null;
  try {
    const response = await fetcher('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': apiKey },
      body: JSON.stringify({ email_address: email.trim(), state: 'inactive' }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const body = await response.json() as { subscriber?: unknown };
    return parseSubscriber(body.subscriber);
  } catch {
    return null;
  }
}

export async function addKitSubscriberToWorkForm(subscriberId: number, formId: string, apiKey: string, fetcher: Fetcher = fetch) {
  if (!Number.isSafeInteger(subscriberId) || subscriberId < 1 || !idSchema.test(formId) || !apiKey) return false;
  try {
    const response = await fetcher(`https://api.kit.com/v4/forms/${formId}/subscribers/${subscriberId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': apiKey },
      body: JSON.stringify({ referrer: workSignupReferrer }),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function addKitWorkTag(subscriberId: number, tagId: string, apiKey: string, fetcher: Fetcher = fetch) {
  if (!Number.isSafeInteger(subscriberId) || subscriberId < 1 || !idSchema.test(tagId) || !apiKey) return false;
  try {
    const response = await fetcher(`https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriberId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': apiKey },
      body: '{}',
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getKitSubscriberById(id: number, apiKey: string, fetcher: Fetcher = fetch): Promise<KitSubscriber | null> {
  if (!Number.isSafeInteger(id) || id < 1 || !apiKey) return null;
  try {
    const response = await fetcher(`https://api.kit.com/v4/subscribers/${id}`, {
      headers: { 'X-Kit-Api-Key': apiKey },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const body = await response.json() as { subscriber?: unknown };
    return parseSubscriber(body.subscriber);
  } catch {
    return null;
  }
}
