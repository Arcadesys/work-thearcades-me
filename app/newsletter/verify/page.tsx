import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { NewsletterVerification } from '@/components/newsletter-verification';

export const metadata: Metadata = {
  title: 'Confirm Work build notes — Austen Tucker-Crowder',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function NewsletterVerifyPage() {
  return <div className="services-page">
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main" tabIndex={-1} className="services-main">
      <NewsletterVerification />
    </main>
  </div>;
}
