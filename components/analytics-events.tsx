'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics-client';
import type { AnalyticsEvent } from '@/lib/analytics-policy';

const funnelEvents = new Set<AnalyticsEvent>([
  'resume_click',
  'contact_click',
  'booking_click',
  'triage_skill_download',
  'subscribe_submit',
]);

/** Records only the public event name and placement supplied by the page. */
export function AnalyticsEvents() {
  useEffect(() => {
    const recordClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest<HTMLElement>('[data-funnel-event]');
      const name = control?.dataset.funnelEvent as AnalyticsEvent | undefined;
      if (control && name && funnelEvents.has(name)) {
        track(name, { placement: control.dataset.funnelPlacement ?? 'unspecified' });
      }
    };

    document.addEventListener('click', recordClick);
    return () => document.removeEventListener('click', recordClick);
  }, []);

  return null;
}
