export async function readWorkUnsubscribeRequestToken(request: Request): Promise<string | null> {
  if (request.method !== 'POST') return null;
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType === 'application/x-www-form-urlencoded') {
    const token = new URL(request.url).searchParams.get('token') ?? '';
    if (token.length > 256) return null;
    const body = await request.text();
    if (body.length > 128 || new URLSearchParams(body).get('List-Unsubscribe') !== 'One-Click') return null;
    return token || null;
  }
  if (contentType !== 'application/json') return null;
  let payload: unknown;
  try {
    const body = await request.text();
    if (body.length > 512) return null;
    payload = JSON.parse(body);
  } catch {
    return null;
  }
  const value = typeof payload === 'object' && payload !== null && 'token' in payload ? payload.token : undefined;
  return typeof value === 'string' && value.length <= 256 ? value : null;
}
