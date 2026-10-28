import { unsubscribeResendContact } from '@/lib/resend-contacts';
import { readWorkUnsubscribeRequestToken } from '@/lib/newsletter-unsubscribe-request';
import { unsubscribeLegacyKitSubscriber } from '@/lib/legacy-kit-unsubscribe';
import { readLegacyWorkUnsubscribeToken, readWorkUnsubscribeToken } from '@/lib/work-unsubscribe-token';

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
  const apiKey = process.env.RESEND_CONTACTS_API_KEY;
  const topicId = process.env.RESEND_TOPIC_WORK_AI_ID;
  if (!secret) return response({ unsubscribed: false }, 503);

  const token = await readWorkUnsubscribeRequestToken(request);
  if (!token) return response({ unsubscribed: false }, 400);
  const target = readWorkUnsubscribeToken(token, secret);
  if (!target) {
    const legacyTarget = readLegacyWorkUnsubscribeToken(token, secret);
    const legacyApiKey = process.env.KIT_LEGACY_UNSUBSCRIBE_API_KEY;
    if (!legacyTarget) return response({ unsubscribed: false }, 400);
    if (!legacyApiKey) return response({ unsubscribed: false }, 503);
    return await unsubscribeLegacyKitSubscriber(legacyTarget.subscriberId, legacyApiKey)
      ? response({ unsubscribed: true }, 200)
      : response({ unsubscribed: false }, 502);
  }
  if (!apiKey || !topicId) return response({ unsubscribed: false }, 503);
  try {
    if (!await unsubscribeResendContact(target.contactId, apiKey, topicId)) return response({ unsubscribed: false }, 502);
    return response({ unsubscribed: true }, 200);
  } catch {
    return response({ unsubscribed: false }, 502);
  }
}
