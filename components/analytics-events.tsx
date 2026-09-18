'use client';

import { track } from '@vercel/analytics/react';
import { useEffect } from 'react';

const SAFE_UTM_VALUE = /^[a-z0-9_-]{1,64}$/;
const customEventsEnabled = process.env.NEXT_PUBLIC_VERCEL_CUSTOM_EVENTS_ENABLED === 'true';

type FunnelEvent = 'resume_click' | 'contact_click' | 'booking_click' | 'triage_skill_download' | 'subscribe_submit';

/**
 * Tracks only public funnel interactions. Event properties intentionally omit
 * addresses, form fields, full URLs, and visitor identifiers.
 */
export function AnalyticsEvents() {
  useEffect(() => {
    if (!customEventsEnabled) return;

    const recordClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('[data-funnel-event]');
      if (!link) return;

      const name = link.dataset.funnelEvent as FunnelEvent | undefined;
      if (!name) return;

      track(name, { placement: link.dataset.funnelPlacement ?? 'unspecified' });
    };

    document.addEventListener('click', recordClick);
    return () => document.removeEventListener('click', recordClick);
  }, []);

  useEffect(() => {
    if (!customEventsEnabled) return;

    const parameters = new URLSearchParams(window.location.search);
    const source = parameters.get('utm_source')?.toLowerCase();
    const campaign = parameters.get('utm_campaign')?.toLowerCase();
    const properties = {
      source: source && SAFE_UTM_VALUE.test(source) ? source : null,
      campaign: campaign && SAFE_UTM_VALUE.test(campaign) ? campaign : null,
    };

    // This records the entry landing only. Keeping two properties makes the
    // event compatible with Vercel Pro's custom-event property limit.
    if (properties.source || properties.campaign) track('campaign_landing', properties);
  }, []);

  return null;
}

export function CaseStudyView({ slug }: { slug: string }) {
  useEffect(() => {
    if (!customEventsEnabled) return;

    track('case_study_view', { slug });
  }, [slug]);

  return null;
}
