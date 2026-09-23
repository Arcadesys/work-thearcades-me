type KitConfig = { apiKey: string; formId: string; tagId: string };
type Fetcher = typeof fetch;
type KitSubscriber = { id?: unknown; state?: unknown };
type KitPage = { subscribers?: unknown; pagination?: { has_next_page?: unknown; end_cursor?: unknown } };

const numericId = /^[1-9]\d*$/;
const pageLimit = 1000;
const maxPages = 100;

async function listSubscribers(url: URL, apiKey: string, fetcher: Fetcher) {
  const subscriberIds = new Set<number>();
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  for (let pageNumber = 0; pageNumber < maxPages; pageNumber += 1) {
    if (cursor) url.searchParams.set('after', cursor);
    else url.searchParams.delete('after');

    const response = await fetcher(url, {
      headers: { 'X-Kit-Api-Key': apiKey },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Kit subscriber lookup failed');

    const body = await response.json() as KitPage;
    if (!Array.isArray(body.subscribers)) throw new Error('Kit subscriber response was invalid');
    for (const entry of body.subscribers as KitSubscriber[]) {
      if (typeof entry.id === 'number' && Number.isSafeInteger(entry.id) && entry.id > 0) {
        // A form's default active status is Kit's confirmed state. Keep this check
        // even though the request filters active members, so malformed responses fail closed.
        if (url.pathname.includes('/forms/') && entry.state !== 'active') continue;
        subscriberIds.add(entry.id);
      } else throw new Error('Kit subscriber response was invalid');
    }

    if (body.pagination?.has_next_page !== true) return subscriberIds;
    const nextCursor = body.pagination.end_cursor;
    if (typeof nextCursor !== 'string' || !nextCursor || seenCursors.has(nextCursor)) {
      throw new Error('Kit pagination response was invalid');
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }

  throw new Error('Kit pagination limit was reached');
}

async function tagInBatches(ids: number[], config: KitConfig, fetcher: Fetcher) {
  let added = 0;
  let failed = 0;
  const concurrency = 5;

  for (let offset = 0; offset < ids.length; offset += concurrency) {
    const responses = await Promise.all(ids.slice(offset, offset + concurrency).map(async id => {
      try {
        return await fetcher(`https://api.kit.com/v4/tags/${config.tagId}/subscribers/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': config.apiKey },
          body: '{}',
          signal: AbortSignal.timeout(8000),
        });
      } catch {
        return null;
      }
    }));
    for (const response of responses) {
      if (response?.ok) added += 1;
      else failed += 1;
    }
  }
  return { added, failed };
}

/** Reconcile confirmed form members against the tag, leaving pending members untouched. */
export async function reconcileConfirmedKitSubscribers(config: KitConfig, fetcher: Fetcher = fetch) {
  if (![config.formId, config.tagId].every(id => numericId.test(id)) || !config.apiKey) {
    throw new Error('Kit reconciliation configuration is invalid');
  }

  const formUrl = new URL(`https://api.kit.com/v4/forms/${config.formId}/subscribers`);
  formUrl.searchParams.set('status', 'active');
  formUrl.searchParams.set('slim', 'true');
  formUrl.searchParams.set('per_page', String(pageLimit));

  const tagUrl = new URL(`https://api.kit.com/v4/tags/${config.tagId}/subscribers`);
  tagUrl.searchParams.set('status', 'all');
  tagUrl.searchParams.set('slim', 'true');
  tagUrl.searchParams.set('per_page', String(pageLimit));

  // Complete both reads before making any writes. If either is incomplete, defer all
  // tagging to the next daily run rather than acting on a partial view.
  const [confirmedIds, taggedIds] = await Promise.all([
    listSubscribers(formUrl, config.apiKey, fetcher),
    listSubscribers(tagUrl, config.apiKey, fetcher),
  ]);
  const missingTag = [...confirmedIds].filter(id => !taggedIds.has(id));
  const result = await tagInBatches(missingTag, config, fetcher);
  return {
    confirmed: confirmedIds.size,
    alreadyTagged: confirmedIds.size - missingTag.length,
    ...result,
  };
}
