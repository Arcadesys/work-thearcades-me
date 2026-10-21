import { unsubscribeResendContact } from '@/lib/resend-contacts';
import { readWorkUnsubscribeRequestToken } from '@/lib/newsletter-unsubscribe-request';
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
  const apiKey = process.env.RESEND_CONTACTS_API_KEY;
  const topicId = process.env.RESEND_WORK_AI_TOPIC_ID;
  if (!secret || !apiKey || !topicId) return response({ unsubscribed: false }, 503);

  const token = await readWorkUnsubscribeRequestToken(request);
  if (!token) return response({ unsubscribed: false }, 400);
  const target = readWorkUnsubscribeToken(token, secret);
  if (!target) return response({ unsubscribed: false }, 400);
  try {
    if (!await unsubscribeResendContact(target.contactId, apiKey, topicId)) return response({ unsubscribed: false }, 502);
    return response({ unsubscribed: true }, 200);
  } catch {
    return response({ unsubscribed: false }, 502);
  }
}
