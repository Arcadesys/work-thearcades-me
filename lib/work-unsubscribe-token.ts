import { createHmac, timingSafeEqual } from 'node:crypto';

const scope = 'work-build-notes-unsubscribe-v1';

export function createWorkUnsubscribeToken(subscriberId: number, emailDigest: string, secret: string) {
  if (!Number.isSafeInteger(subscriberId) || subscriberId < 1 || !/^[0-9a-f]{64}$/i.test(emailDigest) || Buffer.byteLength(secret, 'utf8') < 32) return null;
  const payload = Buffer.from(`${subscriberId}:${emailDigest}`).toString('base64url');
  const signature = createHmac('sha256', secret).update(`${scope}:${payload}`).digest('base64url');
  return `${payload}.${signature}`;
}

export function readWorkUnsubscribeToken(token: string, secret: string) {
  if (Buffer.byteLength(secret, 'utf8') < 32) return null;
  const [payload, signature, ...extra] = token.split('.');
  if (extra.length || !/^[A-Za-z0-9_-]{90,130}$/.test(payload ?? '') || !/^[A-Za-z0-9_-]{43}$/.test(signature ?? '')) return null;
  const expected = createHmac('sha256', secret).update(`${scope}:${payload}`).digest();
  const received = Buffer.from(signature, 'base64url');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  let decoded: string;
  try { decoded = Buffer.from(payload, 'base64url').toString('utf8'); } catch { return null; }
  const [rawId, emailDigest, ...payloadExtra] = decoded.split(':');
  if (payloadExtra.length || !/^[1-9]\d{0,15}$/.test(rawId ?? '') || !/^[0-9a-f]{64}$/i.test(emailDigest ?? '')) return null;
  const subscriberId = Number(rawId);
  if (!Number.isSafeInteger(subscriberId)) return null;
  return { subscriberId, emailDigest };
}
