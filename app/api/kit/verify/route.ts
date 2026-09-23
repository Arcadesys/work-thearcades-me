import { confirmNewsletterVerification } from '@/lib/newsletter-flow';
import { createNewsletterRuntime } from '@/lib/newsletter-runtime';

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
  const token = typeof payload === 'object' && payload !== null && 'token' in payload ? payload.token : undefined;
  if (typeof token !== 'string' || token.length > 512) return json({ accepted: false }, 400);

  const runtime = createNewsletterRuntime();
  if (!runtime) return json({ accepted: false }, 503);

  try {
    const result = await confirmNewsletterVerification(token, runtime.config, runtime.dependencies);
    if (result === 'active' || result === 'kit_confirmation_required') {
      return json({ accepted: true, state: result }, 200);
    }
    if (result === 'completed') return json({ accepted: false, state: 'completed' }, 200);
    if (result === 'busy') return json({ accepted: false, state: 'processing' }, 202);
    if (result === 'suppressed') return json({ accepted: false, state: 'unavailable' }, 409);
    if (result === 'invalid' || result === 'cancelled') return json({ accepted: false }, 410);
    return json({ accepted: false }, 502);
  } catch {
    return json({ accepted: false }, 502);
  }
}
