'use client';

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;
const SAFE_UTM_VALUE = /^[a-z0-9_-]{1,64}$/;

/** Removes fragments and unknown query values before Vercel receives a URL. */
function removeUnsafeQueryValues(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url, window.location.origin);
  const safeParameters = new URLSearchParams();

  for (const key of UTM_KEYS) {
    const value = url.searchParams.get(key)?.toLowerCase();
    if (value && SAFE_UTM_VALUE.test(value)) safeParameters.set(key, value);
  }

  return {
    ...event,
    url: `${url.pathname}${safeParameters.size ? `?${safeParameters}` : ''}`,
  };
}

export function PublicAnalytics() {
  return <Analytics beforeSend={removeUnsafeQueryValues} />;
}
