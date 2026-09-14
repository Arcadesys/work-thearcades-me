'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics-client';
export function AnalyticsEvents() {
  useEffect(() => {
    const recordClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>('[data-funnel-event]');
      const name = link?.dataset.funnelEvent;
      if (name === 'resume_click' || name === 'contact_click' || name === 'booking_click') {
        track(name, { placement: link?.dataset.funnelPlacement ?? 'unspecified' });
      }
    };
    document.addEventListener('click', recordClick);
    return () => document.removeEventListener('click', recordClick);
  }, []);
  return null;
}
