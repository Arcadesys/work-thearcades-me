type Fetcher = typeof fetch;

/** Temporary bridge for old Kit email links; this endpoint only unsubscribes. */
export async function unsubscribeLegacyKitSubscriber(subscriberId: number, apiKey: string, fetcher: Fetcher = fetch) {
  if (!Number.isSafeInteger(subscriberId) || subscriberId < 1 || !apiKey) return false;
  try {
    const response = await fetcher(`https://api.kit.com/v4/subscribers/${subscriberId}/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': apiKey },
      body: '{}',
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
