import { unsubscribeLegacyKitSubscriber } from '@/lib/legacy-kit-unsubscribe';
import { readWorkUnsubscribeRequestToken } from '@/lib/newsletter-unsubscribe-request';
import { readLegacyWorkUnsubscribeToken } from '@/lib/work-unsubscribe-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function response(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store, max-age=0' } });
}

export async function GET() {
  // Email link scanners and previewers must never unsubscribe an address.
  return response({ unsubscribed: false }, 405);
}

export async function POST(request: Request) {
  const secret = process.env.SIGNUP_LINK_SECRET;
  const apiKey = process.env.KIT_LEGACY_UNSUBSCRIBE_API_KEY;
  if (!secret || !apiKey) return response({ unsubscribed: false }, 503);

  const token = await readWorkUnsubscribeRequestToken(request);
  if (!token) return response({ unsubscribed: false }, 400);
  const target = readLegacyWorkUnsubscribeToken(token, secret);
  if (!target) return response({ unsubscribed: false }, 400);
  return await unsubscribeLegacyKitSubscriber(target.subscriberId, apiKey)
    ? response({ unsubscribed: true }, 200)
    : response({ unsubscribed: false }, 502);
}
