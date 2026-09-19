export const eventNames = ['$pageview', 'case_study_view', 'resume_click', 'contact_click', 'booking_click', 'triage_skill_download', 'subscribe_submit', 'campaign_landing'] as const;
export type AnalyticsEvent = typeof eventNames[number];
type CapturedEvent = {
  event: string;
  uuid?: string;
  timestamp?: Date;
  properties?: Record<string, unknown>;
};
const safeValue = /^[a-z0-9_-]{1,64}$/;
export function campaignProperties(search: string): Record<string, string> {
  const parameters = new URLSearchParams(search);
  return Object.fromEntries(['source', 'medium', 'campaign', 'content'].flatMap(key => {
    const value = parameters.get(`utm_${key}`)?.toLowerCase();
    return value && safeValue.test(value) ? [[`utm_${key}`, value]] : [];
  }));
}
export function collectionEnvironment(hostname: string, environment?: string, preview?: string) {
  if (environment === 'production' && hostname === 'work.thearcades.me') return 'production';
  if (environment === 'preview' && preview === 'true' && hostname.endsWith('.vercel.app')) return 'preview';
  return null;
}
export function safePath(path: string) {
  // Public route shapes only; unknown paths cannot leak user-entered URL data.
  return /^\/(?:work-with-me|resume|privacy|layoff-triage|blog(?:\/(?:tag\/)?[a-z0-9-]+)?|work\/(?:bunch|guaranteed-rate|ai-enablement))?\/?$/.test(path) ? path : '/other';
}
export function referrerDomain(referrer: string) {
  try { const url = new URL(referrer); return /^https?:$/.test(url.protocol) ? url.hostname : ''; } catch { return ''; }
}
export function sanitizeProperties(properties: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const key of ['distinct_id', '$session_id', '$window_id', '$lib', '$lib_version']) {
    const value = properties[key];
    if (typeof value === 'string' && /^[a-zA-Z0-9_.-]{1,100}$/.test(value)) clean[key] = value;
  }
  for (const key of ['placement', 'slug', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const value = properties[key];
    if (typeof value === 'string' && safeValue.test(value)) clean[key] = value;
  }
  for (const key of ['hostname', 'referring_domain']) {
    const value = properties[key];
    if (typeof value === 'string' && /^[a-z0-9.-]{1,253}$/.test(value)) clean[key] = value;
  }
  for (const key of ['pathname', 'landing_page']) if (typeof properties[key] === 'string') clean[key] = safePath(properties[key]);
  if (properties.environment === 'production' || properties.environment === 'preview') clean.environment = properties.environment;
  clean.$process_person_profile = false;
  clean.$geoip_disable = true;
  clean.$ip = '0.0.0.0';
  return clean;
}

export function outgoingEvent(event: CapturedEvent | null, token: string) {
  if (!event || !event.uuid || !event.timestamp || !eventNames.includes(event.event as AnalyticsEvent)) return null;
  return {
    event: event.event,
    uuid: event.uuid,
    timestamp: event.timestamp,
    // Reconstruct the SDK payload so top-level $set/$set_once cannot update people.
    properties: { ...sanitizeProperties(event.properties ?? {}), token },
  };
}
