import { z } from 'zod';

const emailSchema = z.email().max(254);
type Fetcher = typeof fetch;
const api = 'https://api.resend.com';
export type ResendContact = { id: string; email: string; unsubscribed: boolean };
export type ResendContactResult = { kind: 'found'; contact: ResendContact } | { kind: 'missing' } | { kind: 'blocked' } | { kind: 'failed' };

export function isValidSignupEmail(value: unknown): value is string {
  return typeof value === 'string' && emailSchema.safeParse(value.trim()).success;
}

function headers(apiKey: string, json = false) {
  return { Authorization: `Bearer ${apiKey}`, ...(json ? { 'Content-Type': 'application/json' } : {}) };
}
function parseContact(value: unknown): ResendContact | null {
  if (typeof value !== 'object' || value === null) return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(item.id)
    || typeof item.email !== 'string' || !isValidSignupEmail(item.email)
    || typeof item.unsubscribed !== 'boolean') return null;
  return { id: item.id, email: item.email, unsubscribed: item.unsubscribed };
}

/** Exact-address read. Any provider uncertainty fails closed before signup or resubscription. */
export async function findResendContact(email: string, apiKey: string, topicId: string, fetcher: Fetcher = fetch): Promise<ResendContactResult> {
  if (!isValidSignupEmail(email) || !apiKey || !/^[0-9a-f-]{36}$/i.test(topicId)) return { kind: 'failed' };
  const address = email.trim();
  try {
    const [contactResponse, suppressionResponse] = await Promise.all([
      fetcher(`${api}/contacts/${encodeURIComponent(address)}`, { headers: headers(apiKey), signal: AbortSignal.timeout(8000) }),
      fetcher(`${api}/suppressions/${encodeURIComponent(address)}`, { headers: headers(apiKey), signal: AbortSignal.timeout(8000) }),
    ]);
    if (suppressionResponse.ok) return { kind: 'blocked' };
    if (suppressionResponse.status !== 404) return { kind: 'failed' };
    if (contactResponse.status === 404) return { kind: 'missing' };
    if (!contactResponse.ok) return { kind: 'failed' };
    const contact = parseContact(await contactResponse.json());
    if (!contact || contact.email.toLowerCase() !== address.toLowerCase()) return { kind: 'failed' };
    if (contact.unsubscribed) return { kind: 'blocked' };
    const topicsResponse = await fetcher(`${api}/contacts/${encodeURIComponent(address)}/topics`, { headers: headers(apiKey), signal: AbortSignal.timeout(8000) });
    if (!topicsResponse.ok) return { kind: 'failed' };
    const topicsBody = await topicsResponse.json() as { data?: unknown };
    const topics = Array.isArray(topicsBody.data) ? topicsBody.data : Array.isArray(topicsBody) ? topicsBody : null;
    if (!topics) return { kind: 'failed' };
    const workTopic = topics.find((topic: unknown) => typeof topic === 'object' && topic !== null && (topic as Record<string, unknown>).id === topicId) as Record<string, unknown> | undefined;
    if (workTopic?.subscription === 'opt_out') return { kind: 'blocked' };
    return { kind: 'found', contact };
  } catch { return { kind: 'failed' }; }
}

/** Writes only after first-party confirmation. Resend global suppressions and opt-outs are never cleared. */
export async function subscribeResendContact(email: string, apiKey: string, topicId: string, fetcher: Fetcher = fetch): Promise<ResendContact | null> {
  if (!isValidSignupEmail(email) || !apiKey || !/^[0-9a-f-]{36}$/i.test(topicId)) return null;
  const address = email.trim();
  const current = await findResendContact(address, apiKey, topicId, fetcher);
  if (current.kind === 'blocked' || current.kind === 'failed') return null;
  try {
    let contact = current.kind === 'found' ? current.contact : null;
    if (!contact) {
      const created = await fetcher(`${api}/contacts`, {
        method: 'POST', headers: headers(apiKey, true), body: JSON.stringify({ email: address, unsubscribed: false }), signal: AbortSignal.timeout(8000),
      });
      if (!created.ok) return null;
      const body = await created.json() as { data?: unknown };
      contact = parseContact(body.data ?? body);
      if (!contact) return null;
    }
    const response = await fetcher(`${api}/contacts/${encodeURIComponent(contact.id)}/topics`, {
      method: 'PATCH', headers: headers(apiKey, true), body: JSON.stringify([{ id: topicId, subscription: 'opt_in' }]), signal: AbortSignal.timeout(8000),
    });
    return response.ok ? contact : null;
  } catch { return null; }
}

export async function unsubscribeResendContact(id: string, apiKey: string, topicId: string, fetcher: Fetcher = fetch) {
  if (!/^[0-9a-f-]{36}$/i.test(id) || !apiKey || !/^[0-9a-f-]{36}$/i.test(topicId)) return false;
  try {
    const [contactResponse, topicResponse] = await Promise.all([
      fetcher(`${api}/contacts/${encodeURIComponent(id)}`, { method: 'PATCH', headers: headers(apiKey, true), body: JSON.stringify({ unsubscribed: true }), signal: AbortSignal.timeout(8000) }),
      fetcher(`${api}/contacts/${encodeURIComponent(id)}/topics`, { method: 'PATCH', headers: headers(apiKey, true), body: JSON.stringify([{ id: topicId, subscription: 'opt_out' }]), signal: AbortSignal.timeout(8000) }),
    ]);
    return contactResponse.ok && topicResponse.ok;
  } catch { return false; }
}
