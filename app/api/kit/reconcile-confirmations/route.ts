import { createReconciliationRuntime } from '@/lib/newsletter-runtime';
import { isKitReconciliationEnabled, reconcileVerifiedKitSignups } from '@/lib/newsletter-flow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function response(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store, max-age=0' } });
}

export async function GET(request: Request) {
  if (!isKitReconciliationEnabled(process.env.KIT_RECONCILE_ENABLED)) return response({ disabled: true }, 404);
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');
  if (!secret || authorization !== `Bearer ${secret}`) return response({ error: 'unauthorized' }, 401);

  const runtime = createReconciliationRuntime();
  if (!runtime) return response({ error: 'configuration_unavailable' }, 503);
  try {
    return response(await reconcileVerifiedKitSignups(runtime.config, runtime.ledger));
  } catch {
    return response({ error: 'reconciliation_failed' }, 502);
  }
}
