type Reporter = (event: 'subscribe_submit_intent' | 'subscribe_verification_requested' | 'subscribe_request_failed', properties: { placement: string }) => void;

/** Enumeration-safe request acceptance only; provider confirmation stays separate. */
export async function submitNewsletterRequest(email: string, placement: string, report: Reporter, fetcher: typeof fetch = fetch): Promise<boolean> {
  const record = (event: Parameters<Reporter>[0]) => { try { report(event, { placement }); } catch { /* Measurement is optional. */ } };
  record('subscribe_submit_intent');
  try {
    const response = await fetcher('/api/kit/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, placement }) });
    if (!response.ok) throw new Error('Request rejected');
    record('subscribe_verification_requested'); return true;
  } catch {
    record('subscribe_request_failed'); return false;
  }
}
