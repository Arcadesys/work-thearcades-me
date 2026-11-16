'use client';

import { track } from '@/lib/analytics-client';

type ToyEventName =
  | 'toy_started'
  | 'first_choice_made'
  | 'toy_completed'
  | 'toy_restarted'
  | 'next_toy_started';

export function trackToyEvent(
  name: ToyEventName,
  toyId: string,
  properties: Record<string, string | number | boolean> = {},
) {
  // This site's PostHog client applies its own path and environment rules.
  // It takes string and number values only.
  const safe = Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [key, typeof value === 'boolean' ? String(value) : value]),
  );
  track(name, { toy: toyId, ...safe });
}
