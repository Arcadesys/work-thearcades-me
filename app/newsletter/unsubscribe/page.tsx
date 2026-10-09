import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { NewsletterUnsubscribe } from '@/components/newsletter-unsubscribe';

export const metadata: Metadata = {
  title: 'Unsubscribe from email — Austen Tucker-Crowder',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function NewsletterUnsubscribePage() {
  return <div className="services-page">
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main" tabIndex={-1} className="services-main">
      <NewsletterUnsubscribe />
    </main>
  </div>;
}
