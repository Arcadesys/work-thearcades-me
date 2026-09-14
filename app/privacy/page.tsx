import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
export const metadata: Metadata = { title: 'Privacy — Austen Tucker-Crowder' };
export default function PrivacyPage() {
  return <div className="services-page">
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader current="/privacy" />
    <main id="main" tabIndex={-1} className="privacy-copy">
      <h1>Privacy and site analytics</h1>
      <p>I use PostHog to understand which pages people read and which links they choose: case studies, résumé, email contact, and booking links. A click shows interest; it does not establish that someone contacted me or booked a meeting.</p>
      <p>Analytics records the public page path, site hostname, referring website domain, and validated campaign labels. It excludes email addresses, form contents, URL fragments, and other query parameters. Newsletter sign-up and external booking services handle information separately when you choose to use them.</p>
      <p>A random identifier in your browser’s session storage links activity within the same tab session. Analytics does not use persistent cookies or local storage to recognize returning visitors, create person profiles, or identify you. Session replay, heatmaps, automatic click capture, and location enrichment are disabled.</p>
      <p>Events are sent to PostHog’s US service. As with any network service, the provider receives connection information needed to deliver requests. The site disables IP-based location enrichment and does not add IP addresses to event properties.</p>
      <p>Analytics is optional for using the site: navigation and contact links keep working if collection is blocked. My site theme preference uses local storage separately from analytics.</p>
    </main>
  </div>;
}
