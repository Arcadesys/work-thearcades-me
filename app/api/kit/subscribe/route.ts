import { isValidSignupEmail, submitKitSignup } from '@/lib/kit-subscription';

export const runtime = 'nodejs';

function json(body: { accepted: boolean }, status: number) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({ accepted: false }, 415);
  }

  let payload: unknown;
  try {
    const body = await request.text();
    if (body.length > 2048) return json({ accepted: false }, 413);
    payload = JSON.parse(body);
  } catch {
    return json({ accepted: false }, 400);
  }

  const email = typeof payload === 'object' && payload !== null && 'email' in payload
    ? payload.email
    : undefined;
  if (!isValidSignupEmail(email)) return json({ accepted: false }, 400);

  const { KIT_API_KEY, KIT_FORM_ID } = process.env;
  if (!KIT_API_KEY || !KIT_FORM_ID) return json({ accepted: false }, 503);

  const accepted = await submitKitSignup(email, { apiKey: KIT_API_KEY, formId: KIT_FORM_ID });
  return accepted ? json({ accepted: true }, 200) : json({ accepted: false }, 502);
}
