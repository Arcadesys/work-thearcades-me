import { unsubscribeKitSubscriber } from '@/lib/kit-subscription';
import { readWorkUnsubscribeRequestToken } from '@/lib/kit-unsubscribe-request';
import { readWorkUnsubscribeToken } from '@/lib/work-unsubscribe-token';

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
  const apiKey = process.env.KIT_API_KEY;
  if (!secret || !apiKey) return response({ unsubscribed: false }, 503);

  const token = await readWorkUnsubscribeRequestToken(request);
  if (!token) return response({ unsubscribed: false }, 400);
  const target = readWorkUnsubscribeToken(token, secret);
  if (!target) return response({ unsubscribed: false }, 400);
  try {
    if (!await unsubscribeKitSubscriber(target.subscriberId, apiKey)) return response({ unsubscribed: false }, 502);
    return response({ unsubscribed: true }, 200);
  } catch {
    return response({ unsubscribed: false }, 502);
  }
}
