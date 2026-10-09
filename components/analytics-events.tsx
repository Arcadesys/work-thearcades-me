'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics-client';
import { isPrivateAnalyticsPath } from '@/lib/analytics-policy';
import type { AnalyticsEvent } from '@/lib/analytics-policy';

const funnelEvents = new Set<AnalyticsEvent>([
  'resume_click',
  'contact_click',
  'booking_click',
  'triage_skill_download',
  'image_ratchet_skill_download',
]);

/** Records only the public event name and placement supplied by the page. */
export function AnalyticsEvents() {
  useEffect(() => {
    const recordClick = (event: MouseEvent) => {
      if (isPrivateAnalyticsPath(window.location.pathname)) return;
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest<HTMLElement>('[data-funnel-event]');
      const name = control?.dataset.funnelEvent as AnalyticsEvent | undefined;
      if (control && name && funnelEvents.has(name)) {
        const interaction = name === 'resume_click' ? control.dataset.funnelPlacement === 'resume_pdf' ? 'resume_pdf'
          : control.dataset.funnelPlacement === 'resume_text' ? 'resume_text' : 'resume_navigation' : undefined;
        track(name, { placement: control.dataset.funnelPlacement ?? 'unspecified', ...(interaction ? { interaction_type: interaction } : {}) });
      }
    };

    document.addEventListener('click', recordClick);
    return () => document.removeEventListener('click', recordClick);
  }, []);

  return null;
}
