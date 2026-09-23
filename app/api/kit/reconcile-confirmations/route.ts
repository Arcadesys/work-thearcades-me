import { timingSafeEqual } from 'node:crypto';
import { isKitReconciliationEnabled, reconcileConfirmedKitSubscribers } from '@/lib/kit-confirmation-reconciliation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

function authorized(request: Request, secret: string) {
  const actual = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function GET(request: Request) {
  if (!isKitReconciliationEnabled(process.env.KIT_RECONCILE_ENABLED)) {
    return json({ error: 'reconciliation_disabled' }, 503);
  }

  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return json({ error: 'not_configured' }, 503);
  if (!authorized(request, secret)) return json({ error: 'unauthorized' }, 401);

  const { KIT_API_KEY, KIT_FORM_ID, KIT_WORK_TAG_ID } = process.env;
  if (!KIT_API_KEY || !KIT_FORM_ID || !KIT_WORK_TAG_ID) return json({ error: 'not_configured' }, 503);

  try {
    const result = await reconcileConfirmedKitSubscribers({
      apiKey: KIT_API_KEY,
      formId: KIT_FORM_ID,
      tagId: KIT_WORK_TAG_ID,
    });
    return result.failed === 0
      ? json({ ok: true, ...result })
      : json({ ok: false, ...result }, 502);
  } catch {
    // Provider errors and subscriber data are intentionally excluded from the response.
    return json({ error: 'reconciliation_failed' }, 502);
  }
}
