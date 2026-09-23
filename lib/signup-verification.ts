import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { Redis } from '@upstash/redis';
import { isValidSignupEmail } from './kit-subscription';

const recordTtlSeconds = 35 * 24 * 60 * 60;
const challengeTtlSeconds = 25 * 60 * 60;
const tokenTtlSeconds = challengeTtlSeconds;
const confirmationWindowMs = 24 * 60 * 60 * 1000;
const verificationRetryWindowMs = 8 * 24 * 60 * 60 * 1000;
const kitConfirmationWindowMs = 30 * 24 * 60 * 60 * 1000;
const emailCooldownSeconds = 10 * 60;
const ipWindowSeconds = 60 * 60;
const ipRequestLimit = 10;
const leaseMs = 60 * 1000;
const namespace = 'work-newsletter:v1';

export type SignupState = 'pending' | 'processing' | 'retry' | 'waiting_kit_confirmation' | 'completed' | 'cancelled' | 'suppressed' | 'expired';
export type SignupRecord = {
  id: string;
  emailDigest: string;
  encryptedEmail: string;
  tokenDigest: string;
  expiresAt: number;
  placement: string;
  state: SignupState;
  verifiedAt?: number;
  leaseUntil?: number;
  subscriberId?: number;
  queueExpiresAt?: number;
};

export type SignupChallenge = { token: string; record: SignupRecord };
export type SignupLedgerResult = { status: string; record?: SignupRecord };

export function validLinkSecret(secret: string | undefined): secret is string {
  return typeof secret === 'string' && Buffer.byteLength(secret, 'utf8') >= 32;
}

function digest(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function keyForEmail(email: string, secret: string) {
  return createHmac('sha256', secret).update(`work-signup-email:${email.trim().toLowerCase()}`).digest('hex');
}

export function signupIpFingerprint(ip: string | undefined, secret: string) {
  if (!ip || isIP(ip) === 0 || !validLinkSecret(secret)) return undefined;
  return createHmac('sha256', secret).update(`work-signup-ip-v1:${ip}`).digest('hex');
}

function encryptionKey(secret: string) {
  return createHmac('sha256', secret).update('work-signup-email-encryption-v1').digest();
}

function encryptEmail(email: string, secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(email.trim(), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}

export function decryptSignupEmail(value: string, secret: string) {
  const packed = Buffer.from(value, 'base64url');
  if (packed.length < 29) throw new Error('Invalid encrypted signup payload');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(secret), packed.subarray(0, 12));
  decipher.setAuthTag(packed.subarray(12, 28));
  return Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()]).toString('utf8');
}

export function createSignupChallenge(email: string, placement: string, secret: string, now = Date.now()): SignupChallenge {
  if (!isValidSignupEmail(email) || !validLinkSecret(secret)) throw new Error('Invalid signup challenge input');
  const id = randomUUID();
  const expiresAt = now + confirmationWindowMs;
  const nonce = randomBytes(32).toString('base64url');
  const signed = `${id}.${expiresAt}.${nonce}`;
  const signature = createHmac('sha256', secret).update(signed).digest('base64url');
  const token = `${signed}.${signature}`;
  return {
    token,
    record: {
      id,
      emailDigest: keyForEmail(email, secret),
      encryptedEmail: encryptEmail(email, secret),
      tokenDigest: digest(token),
      expiresAt,
      placement,
      state: 'pending',
    },
  };
}

/** Verifies the challenge signature; Redis atomically enforces its expiry and one-time state. */
export function isValidSignupChallenge(token: string, secret: string) {
  const parts = token.split('.');
  if (parts.length !== 4) return false;
  const [id, expiry, nonce, signature] = parts;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^\d{13}$/.test(expiry) || !/^[A-Za-z0-9_-]{30,60}$/.test(nonce) || !/^[A-Za-z0-9_-]{40,50}$/.test(signature)) return false;
  const expiresAt = Number(expiry);
  if (!Number.isSafeInteger(expiresAt)) return false;
  const expected = createHmac('sha256', secret).update(`${id}.${expiry}.${nonce}`).digest();
  const received = Buffer.from(signature, 'base64url');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function requestKey(id: string) { return `${namespace}:request:${id}`; }
function latestKey(emailDigest: string) { return `${namespace}:latest:${emailDigest}`; }
function tokenKey(tokenDigest: string) { return `${namespace}:token:${tokenDigest}`; }
function cooldownKey(emailDigest: string) { return `${namespace}:cooldown:${emailDigest}`; }
function ipWindowKey(fingerprint: string) { return `${namespace}:ip-window:${fingerprint}`; }
function welcomeKey(emailDigest: string) { return `${namespace}:welcome:${emailDigest}`; }
const queueKey = `${namespace}:queue`;

/** Upstash Redis may decode Lua cjson return values before resolving EVAL. */
function parseSignupRecord(value: unknown): SignupRecord | null {
  let candidate = value;
  if (typeof candidate === 'string') {
    try { candidate = JSON.parse(candidate) as unknown; } catch { return null; }
  }
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null;
  const record = candidate as Partial<SignupRecord>;
  const states: SignupState[] = ['pending', 'processing', 'retry', 'waiting_kit_confirmation', 'completed', 'cancelled', 'suppressed', 'expired'];
  if (typeof record.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(record.id)
    || typeof record.emailDigest !== 'string' || !/^[0-9a-f]{64}$/i.test(record.emailDigest)
    || typeof record.tokenDigest !== 'string' || !/^[0-9a-f]{64}$/i.test(record.tokenDigest)
    || !Number.isSafeInteger(record.expiresAt) || typeof record.placement !== 'string'
    || !states.includes(record.state as SignupState)
    || (record.encryptedEmail !== undefined && typeof record.encryptedEmail !== 'string')
    || (record.subscriberId !== undefined && !Number.isSafeInteger(record.subscriberId))) return null;
  return record as SignupRecord;
}

const issueScript = `
if not redis.call('SET', KEYS[4], ARGV[2], 'EX', ARGV[9], 'NX') then return 0 end
if #KEYS > 4 then
  local count = redis.call('INCR', KEYS[5])
  if count == 1 then redis.call('EXPIRE', KEYS[5], ARGV[10]) end
  if count > tonumber(ARGV[11]) then
    redis.call('DEL', KEYS[4])
    return 0
  end
end
local previousId = redis.call('GET', KEYS[2])
if previousId then
  local previousKey = ARGV[6] .. previousId
  local previousRaw = redis.call('GET', previousKey)
  if previousRaw then
    local previous = cjson.decode(previousRaw)
    if previous.state == 'pending' then
      previous.state = 'cancelled'
      previous.encryptedEmail = nil
      redis.call('SET', previousKey, cjson.encode(previous), 'EX', ARGV[8])
      redis.call('DEL', ARGV[7] .. previous.tokenDigest)
    end
  end
end
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[4])
redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[4])
redis.call('SET', KEYS[3], ARGV[3], 'EX', ARGV[5])
return 1
`;

const claimScript = `
local requestId = redis.call('GET', KEYS[1])
if not requestId then return {'missing', ''} end
local raw = redis.call('GET', KEYS[2])
if not raw then return {'missing', ''} end
local record = cjson.decode(raw)
if record.id ~= requestId or record.tokenDigest ~= ARGV[1] then return {'invalid', ''} end
if redis.call('GET', ARGV[6] .. record.emailDigest) ~= record.id then return {'superseded', ''} end
local now = tonumber(ARGV[2])
local status = record.state
if status == 'completed' then return {'completed', ''} end
if status == 'cancelled' or status == 'suppressed' or status == 'expired' then return {status, ''} end
if status == 'waiting_kit_confirmation' then return {'waiting_kit_confirmation', ''} end
if status == 'pending' then
  if tonumber(record.expiresAt) < now then
    record.state = 'expired'
    record.encryptedEmail = nil
    redis.call('SET', KEYS[2], cjson.encode(record), 'EX', ARGV[4])
    return {'expired', ''}
  end
  record.verifiedAt = now
elseif status == 'processing' then
  if tonumber(record.leaseUntil or 0) > now then return {'busy', ''} end
  if now > tonumber(record.verifiedAt or 0) + tonumber(ARGV[5]) then
    record.state = 'expired'
    record.encryptedEmail = nil
    redis.call('SET', KEYS[2], cjson.encode(record), 'EX', ARGV[4])
    return {'expired', ''}
  end
elseif status == 'retry' then
  if now > tonumber(record.verifiedAt or 0) + tonumber(ARGV[5]) then
    record.state = 'expired'
    record.encryptedEmail = nil
    redis.call('SET', KEYS[2], cjson.encode(record), 'EX', ARGV[4])
    return {'expired', ''}
  end
else
  return {'invalid', ''}
end
record.state = 'processing'
record.leaseUntil = now + tonumber(ARGV[3])
redis.call('SET', KEYS[2], cjson.encode(record), 'EX', ARGV[4])
redis.call('EXPIRE', KEYS[1], ARGV[4])
redis.call('EXPIRE', ARGV[6] .. record.emailDigest, ARGV[4])
return {'claimed', cjson.encode(record)}
`;

const cancelScript = `
local requestId = redis.call('GET', KEYS[1])
if not requestId then return 'missing' end
local raw = redis.call('GET', KEYS[2])
if not raw then return 'missing' end
local record = cjson.decode(raw)
if record.id ~= requestId or record.tokenDigest ~= ARGV[1] then return 'invalid' end
if redis.call('GET', KEYS[3]) ~= record.id then return 'superseded' end
if record.state == 'cancelled' then return 'cancelled' end
if record.state ~= 'pending' or tonumber(record.expiresAt) < tonumber(ARGV[2]) then return 'not_cancellable' end
record.state = 'cancelled'
record.encryptedEmail = nil
redis.call('SET', KEYS[2], cjson.encode(record), 'EX', ARGV[3])
redis.call('DEL', KEYS[1])
return 'cancelled'
`;

const retryScript = `
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local record = cjson.decode(raw)
if record.state ~= 'processing' then return 0 end
local remaining = math.floor((tonumber(record.verifiedAt or 0) + tonumber(ARGV[2]) - tonumber(ARGV[1])) / 1000)
if remaining <= 0 then
  record.state = 'expired'
  record.encryptedEmail = nil
  redis.call('SET', KEYS[1], cjson.encode(record), 'EX', ARGV[3])
  return 0
end
record.state = 'retry'
record.leaseUntil = nil
redis.call('SET', KEYS[1], cjson.encode(record), 'EX', remaining)
return 1
`;

const waitForKitScript = `
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local record = cjson.decode(raw)
if record.state ~= 'processing' then return 0 end
record.state = 'waiting_kit_confirmation'
record.leaseUntil = nil
record.encryptedEmail = nil
record.subscriberId = tonumber(ARGV[1])
record.queueExpiresAt = tonumber(ARGV[2])
redis.call('SET', KEYS[1], cjson.encode(record), 'EX', ARGV[4])
redis.call('ZADD', KEYS[2], ARGV[3], record.id)
return 1
`;

const finishScript = `
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local record = cjson.decode(raw)
if record.state ~= 'processing' and record.state ~= 'waiting_kit_confirmation' then return 0 end
record.state = ARGV[1]
record.leaseUntil = nil
record.encryptedEmail = nil
redis.call('SET', KEYS[1], cjson.encode(record), 'EX', ARGV[2])
redis.call('ZREM', KEYS[2], record.id)
return 1
`;

const queueClaimScript = `
local raw = redis.call('GET', KEYS[2])
if not raw then redis.call('ZREM', KEYS[1], ARGV[1]); return {'missing', ''} end
local record = cjson.decode(raw)
if record.state == 'processing' then
  if tonumber(record.leaseUntil or 0) > tonumber(ARGV[2]) then return {'busy', ''} end
elseif record.state ~= 'waiting_kit_confirmation' then
  redis.call('ZREM', KEYS[1], ARGV[1])
  return {'invalid', ''}
end
if tonumber(redis.call('ZSCORE', KEYS[1], ARGV[1]) or '0') > tonumber(ARGV[2]) then return {'not_due', ''} end
if tonumber(record.queueExpiresAt or 0) < tonumber(ARGV[2]) then
  record.state = 'expired'
  redis.call('SET', KEYS[2], cjson.encode(record), 'EX', ARGV[4])
  redis.call('ZREM', KEYS[1], ARGV[1])
  return {'expired', ''}
end
record.state = 'processing'
record.leaseUntil = tonumber(ARGV[2]) + tonumber(ARGV[3])
redis.call('SET', KEYS[2], cjson.encode(record), 'EX', ARGV[4])
return {'claimed', cjson.encode(record)}
`;

const rescheduleScript = `
local raw = redis.call('GET', KEYS[2])
if not raw then redis.call('ZREM', KEYS[1], ARGV[1]); return 0 end
local record = cjson.decode(raw)
if record.state ~= 'processing' then return 0 end
record.state = 'waiting_kit_confirmation'
record.leaseUntil = nil
redis.call('SET', KEYS[2], cjson.encode(record), 'EX', ARGV[3])
redis.call('ZADD', KEYS[1], ARGV[2], ARGV[1])
return 1
`;

const claimWelcomeScript = `
local result = redis.call('SET', KEYS[1], 'sending', 'NX')
if result then return 'claimed' end
local state = redis.call('GET', KEYS[1])
if state == 'sending' then return 'busy' end
return 'already_handled'
`;

const settleWelcomeScript = `
local current = redis.call('GET', KEYS[1])
if current == 'sent' or current == 'uncertain' then return 1 end
if not current then
  redis.call('SET', KEYS[1], 'uncertain', 'NX')
  return 1
end
if current ~= 'sending' then return 0 end
redis.call('SET', KEYS[1], ARGV[1])
return 1
`;

const releaseWelcomeScript = `
if redis.call('GET', KEYS[1]) ~= 'sending' then return 0 end
return redis.call('DEL', KEYS[1])
`;

export interface SignupLedger {
  issue(record: SignupRecord, ipFingerprint?: string): Promise<boolean>;
  releaseEmailCooldown(emailDigest: string): Promise<void>;
  claim(token: string): Promise<SignupLedgerResult>;
  cancel(token: string): Promise<string>;
  retry(id: string): Promise<void>;
  waitForKitConfirmation(id: string, subscriberId: number, nextAt: number): Promise<void>;
  complete(id: string): Promise<void>;
  suppress(id: string): Promise<void>;
  claimDueKitConfirmations(now: number, limit?: number): Promise<SignupRecord[]>;
  rescheduleKitConfirmation(id: string, nextAt: number): Promise<void>;
  claimWorkWelcome(emailDigest: string): Promise<'claimed' | 'busy' | 'already_handled' | 'failed'>;
  settleWorkWelcome(emailDigest: string, state: 'sent' | 'uncertain'): Promise<boolean>;
  releaseWorkWelcome(emailDigest: string): Promise<void>;
}

export class UpstashSignupLedger implements SignupLedger {
  constructor(private readonly redis: Redis) {}

  async issue(record: SignupRecord, ipFingerprint?: string) {
    const tokenDigest = record.tokenDigest;
    const stored = JSON.stringify(record);
    const keys = [requestKey(record.id), latestKey(record.emailDigest), tokenKey(tokenDigest), cooldownKey(record.emailDigest)];
    if (ipFingerprint) keys.push(ipWindowKey(ipFingerprint));
    const result = await this.redis.eval<unknown[], number>(issueScript, keys, [stored, record.id, record.id, challengeTtlSeconds, tokenTtlSeconds, `${namespace}:request:`, `${namespace}:token:`, recordTtlSeconds, emailCooldownSeconds, ipWindowSeconds, ipRequestLimit]);
    return result === 1;
  }

  async releaseEmailCooldown(emailDigest: string) {
    await this.redis.del(cooldownKey(emailDigest));
  }

  async claim(token: string): Promise<SignupLedgerResult> {
    const tokenDigest = digest(token);
    const tokenId = await this.redis.get<string>(tokenKey(tokenDigest));
    if (typeof tokenId !== 'string') return { status: 'missing' };
    const raw = await this.redis.eval<unknown[]>(claimScript, [tokenKey(tokenDigest), requestKey(tokenId)], [tokenDigest, Date.now(), leaseMs, verificationRetryWindowMs / 1000, verificationRetryWindowMs, `${namespace}:latest:`]);
    if (!Array.isArray(raw) || typeof raw[0] !== 'string') return { status: 'invalid' };
    if (raw[0] !== 'claimed') return { status: raw[0] };
    const record = parseSignupRecord(raw[1]);
    if (!record) return { status: 'invalid' };
    return { status: 'claimed', record };
  }

  async cancel(token: string) {
    const tokenDigest = digest(token);
    const tokenId = await this.redis.get<string>(tokenKey(tokenDigest));
    if (typeof tokenId !== 'string') return 'missing';
    const record = await this.redis.get<SignupRecord>(requestKey(tokenId));
    if (!record || typeof record !== 'object') return 'missing';
    return await this.redis.eval<unknown[], string>(cancelScript, [tokenKey(tokenDigest), requestKey(tokenId), latestKey(record.emailDigest)], [tokenDigest, Date.now(), recordTtlSeconds, recordTtlSeconds]);
  }

  async retry(id: string) {
    await this.redis.eval(retryScript, [requestKey(id)], [Date.now(), verificationRetryWindowMs, recordTtlSeconds]);
  }

  async waitForKitConfirmation(id: string, subscriberId: number, nextAt: number) {
    await this.redis.eval(waitForKitScript, [requestKey(id), queueKey], [subscriberId, Date.now() + kitConfirmationWindowMs, nextAt, recordTtlSeconds]);
  }

  async complete(id: string) {
    await this.redis.eval(finishScript, [requestKey(id), queueKey], ['completed', recordTtlSeconds]);
  }

  async suppress(id: string) {
    await this.redis.eval(finishScript, [requestKey(id), queueKey], ['suppressed', recordTtlSeconds]);
  }

  async claimDueKitConfirmations(now: number, limit = 25) {
    const ids = await this.redis.zrange<string[]>(queueKey, 0, limit - 1);
    const claimed: SignupRecord[] = [];
    for (const id of ids) {
      const result = await this.redis.eval<unknown[]>(queueClaimScript, [queueKey, requestKey(id)], [id, now, leaseMs, recordTtlSeconds]);
      if (Array.isArray(result) && result[0] === 'claimed') {
        const record = parseSignupRecord(result[1]);
        if (record) claimed.push(record);
      }
    }
    return claimed;
  }

  async rescheduleKitConfirmation(id: string, nextAt: number) {
    await this.redis.eval(rescheduleScript, [queueKey, requestKey(id)], [id, nextAt, recordTtlSeconds]);
  }

  async claimWorkWelcome(emailDigest: string) {
    if (!/^[0-9a-f]{64}$/i.test(emailDigest)) return 'failed';
    const result = await this.redis.eval<unknown[], string>(claimWelcomeScript, [welcomeKey(emailDigest)], []);
    return result === 'claimed' || result === 'busy' || result === 'already_handled' ? result : 'failed';
  }

  async settleWorkWelcome(emailDigest: string, state: 'sent' | 'uncertain') {
    if (!/^[0-9a-f]{64}$/i.test(emailDigest)) return false;
    return await this.redis.eval<unknown[], number>(settleWelcomeScript, [welcomeKey(emailDigest)], [state]) === 1;
  }

  async releaseWorkWelcome(emailDigest: string) {
    if (!/^[0-9a-f]{64}$/i.test(emailDigest)) return;
    await this.redis.eval<unknown[], number>(releaseWelcomeScript, [welcomeKey(emailDigest)], []);
  }
}

export function redisRestCredentials(env: Record<string, string | undefined> = process.env) {
  const upstashUrl = env.UPSTASH_REDIS_REST_URL;
  const upstashToken = env.UPSTASH_REDIS_REST_TOKEN;
  if (upstashUrl && upstashToken) return { url: upstashUrl, token: upstashToken };

  const vercelUrl = env.KV_REST_API_URL;
  const vercelToken = env.KV_REST_API_TOKEN;
  if (vercelUrl && vercelToken) return { url: vercelUrl, token: vercelToken };
  return null;
}

export function createSignupLedgerFromEnv(env: NodeJS.ProcessEnv = process.env): SignupLedger | null {
  const credentials = redisRestCredentials(env);
  if (!credentials) return null;
  return new UpstashSignupLedger(new Redis(credentials));
}
