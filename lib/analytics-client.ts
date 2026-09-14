import posthog from 'posthog-js';
import { campaignProperties, collectionEnvironment, outgoingEvent, referrerDomain, safePath, sanitizeProperties, type AnalyticsEvent } from './analytics-policy';
let enabled = false;
let entry: Record<string, string> = {};
let lastPath: string | undefined;
let firstPage = true;
export function initializeAnalytics() {
  const environment = collectionEnvironment(location.hostname, process.env.NEXT_PUBLIC_VERCEL_ENV, process.env.NEXT_PUBLIC_POSTHOG_PREVIEW_ENABLED);
  const token = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!environment || !token || !['https://us.i.posthog.com', 'https://eu.i.posthog.com'].includes(host ?? '')) return;
  try {
    // If session storage is unavailable, fail closed rather than persist elsewhere.
    sessionStorage.setItem('work-analytics-check', '1');
    sessionStorage.removeItem('work-analytics-check');
    entry = { ...campaignProperties(location.search), landing_page: safePath(location.pathname), referring_domain: referrerDomain(document.referrer) };
    const savedEntry = sessionStorage.getItem('work-analytics-entry');
    if (savedEntry) {
      const saved = sanitizeProperties(JSON.parse(savedEntry));
      entry = Object.fromEntries(Object.entries(saved).filter(([key, value]) => typeof value === 'string' && (key.startsWith('utm_') || key === 'landing_page' || key === 'referring_domain'))) as Record<string, string>;
    } else sessionStorage.setItem('work-analytics-entry', JSON.stringify(entry));
    posthog.init(token, {
      api_host: host, persistence: 'sessionStorage', person_profiles: 'never',
      autocapture: false, capture_pageview: false, capture_pageleave: false,
      capture_dead_clicks: false, rageclick: false, capture_exceptions: false,
      capture_heatmaps: false, capture_performance: false, disable_session_recording: true,
      disable_capture_url_hashes: true, disable_scroll_properties: true,
      enable_recording_console_log: false, disable_surveys: true, disable_product_tours: true,
      disable_conversations: true, disable_web_experiments: true, disable_external_dependency_loading: true,
      advanced_disable_flags: true, advanced_disable_toolbar_metrics: true,
      save_referrer: false, save_campaign_params: false, ip: false,
      before_send: event => outgoingEvent(event, token),
    });
    enabled = true;
  } catch { enabled = false; }
}
export function track(name: AnalyticsEvent, properties: Record<string, string> = {}) {
  if (!enabled) return;
  try {
    posthog.capture(name, { ...entry, ...properties, hostname: location.hostname, pathname: safePath(location.pathname), environment: collectionEnvironment(location.hostname, process.env.NEXT_PUBLIC_VERCEL_ENV, process.env.NEXT_PUBLIC_POSTHOG_PREVIEW_ENABLED) });
  } catch { /* Analytics must never interfere with navigation. */ }
}
export function trackNavigation(pathname: string) {
  if (lastPath === pathname) return;
  lastPath = pathname;
  track('$pageview');
  if (firstPage && Object.keys(entry).some(key => key.startsWith('utm_'))) track('campaign_landing');
  firstPage = false;
  const match = /^\/work\/(bunch|guaranteed-rate|ai-enablement)\/?$/.exec(pathname);
  if (match) track('case_study_view', { slug: match[1] });
}
