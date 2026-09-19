import { NextResponse } from 'next/server';
import { z } from 'zod';

const LIST_ID = 20;
const REQUEST_TIMEOUT_MS = 15_000;

const schema = z.object({
  email: z.string().trim().email(),
  placement: z.string().trim().max(100).optional(),
});

function config() {
  const baseUrl =
    process.env.ACTIVECAMPAIGN_API_URL?.trim() ||
    process.env.AC_API_URL?.trim();
  const apiKey =
    process.env.ACTIVECAMPAIGN_API_KEY?.trim() ||
    process.env.AC_API_KEY?.trim();

  if (!baseUrl || !apiKey) {
    throw new Error('ActiveCampaign API is not configured');
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey };
}

async function activeCampaignRequest(
  path: string,
  init: RequestInit,
  baseUrl: string,
  apiKey: string,
) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Api-Token': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init.headers,
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: 'no-store',
  });

  const text = await response.text();
  if (!response.ok) {
    console.error('[subscribe] ActiveCampaign request failed', {
      path,
      status: response.status,
      body: text.slice(0, 300),
    });
    throw new Error('ActiveCampaign request failed');
  }

  return text ? JSON.parse(text) as unknown : {};
}

export async function POST(request: Request) {
  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: 'Enter a valid email address.' },
      { status: 400 },
    );
  }

  try {
    const { baseUrl, apiKey } = config();

    const sync = await activeCampaignRequest(
      '/api/3/contact/sync',
      {
        method: 'POST',
        body: JSON.stringify({ contact: { email: parsed.email } }),
      },
      baseUrl,
      apiKey,
    ) as { contact?: { id?: string | number } };

    const contactId = Number(sync.contact?.id);
    if (!Number.isSafeInteger(contactId) || contactId <= 0) {
      throw new Error('ActiveCampaign returned no contact id');
    }

    await activeCampaignRequest(
      '/api/3/contactLists',
      {
        method: 'POST',
        body: JSON.stringify({
          contactList: {
            contact: contactId,
            list: LIST_ID,
            status: 1,
          },
        }),
      },
      baseUrl,
      apiKey,
    );

    console.log('[subscribe] ok', {
      listId: LIST_ID,
      placement: parsed.placement ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[subscribe] failed', {
      reason: error instanceof Error ? error.message : 'unknown error',
    });
    return NextResponse.json(
      { error: 'Could not subscribe right now. Please try again.' },
      { status: 502 },
    );
  }
}
