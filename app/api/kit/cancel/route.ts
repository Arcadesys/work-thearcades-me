import { createNewsletterRuntime } from '@/lib/newsletter-runtime';
import { isValidSignupChallenge } from '@/lib/signup-verification';

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
  if (!sameOrigin(request)) return json({ cancelled: false }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({ cancelled: false }, 415);

  let payload: unknown;
  try {
    const body = await request.text();
    if (body.length > 2048) return json({ cancelled: false }, 413);
    payload = JSON.parse(body);
  } catch {
    return json({ cancelled: false }, 400);
  }
  const token = typeof payload === 'object' && payload !== null && 'token' in payload ? payload.token : undefined;
  if (typeof token !== 'string' || token.length > 512) return json({ cancelled: false }, 400);

  const runtime = createNewsletterRuntime();
  if (!runtime) return json({ cancelled: false }, 503);
  if (!isValidSignupChallenge(token, runtime.config.tokenSecret)) return json({ cancelled: false }, 410);
  try {
    const status = await runtime.dependencies.ledger.cancel(token);
    return status === 'cancelled'
      ? json({ cancelled: true }, 200)
      : json({ cancelled: false }, 409);
  } catch {
    return json({ cancelled: false }, 502);
  }
}
