import { isValidSignupEmail } from '@/lib/kit-subscription';
import { createNewsletterRuntime } from '@/lib/newsletter-runtime';
import { requestNewsletterVerification } from '@/lib/newsletter-flow';
import { signupIpFingerprint } from '@/lib/signup-verification';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ accepted: false }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({ accepted: false }, 415);

  let payload: unknown;
  try {
    const body = await request.text();
    if (body.length > 2048) return json({ accepted: false }, 413);
    payload = JSON.parse(body);
  } catch {
    return json({ accepted: false }, 400);
  }

  const values = typeof payload === 'object' && payload !== null ? payload as Record<string, unknown> : {};
  const email = values.email;
  const placement = values.placement;
  if (!isValidSignupEmail(email) || typeof placement !== 'string' || !/^[a-z0-9_-]{1,64}$/.test(placement)) {
    return json({ accepted: false }, 400);
  }

  const runtime = createNewsletterRuntime();
  if (!runtime) return json({ accepted: false }, 503);

  try {
    const clientIp = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
    const ipFingerprint = signupIpFingerprint(clientIp, runtime.config.tokenSecret);
    const result = await requestNewsletterVerification(email, placement, runtime.config, runtime.dependencies, ipFingerprint);
    if (result === 'failed') return json({ accepted: false }, 502);
    // Keep response text and shape identical for suppressed addresses and sent mail.
    return json({ accepted: true }, 202);
  } catch {
    return json({ accepted: false }, 502);
  }
}
