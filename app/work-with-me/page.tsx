import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { ExternalLink } from '@/components/external-link';
import { caseStudyBySlug, site, workWithMe } from '@/lib/content';

export const metadata: Metadata = {
  title: `${workWithMe.title} — ${site.name}`,
  description: workWithMe.description,
  alternates: { canonical: '/work-with-me' },
  openGraph: {
    type: 'website',
    url: '/work-with-me',
    title: `${workWithMe.title} — ${site.name}`,
    description: workWithMe.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${workWithMe.title} — ${site.name}`,
    description: workWithMe.description,
  },
};

export default function WorkWithMePage() {
  return (
    <div className="services-page">
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader current="/work-with-me" />

      <main className="shell services-main" id="main" tabIndex={-1}>
        <div className="services-intro">
          <h1>{workWithMe.title}</h1>
          <p>{workWithMe.intro}</p>
          <a className="btn btn-gradient" href={`mailto:${site.email}`} data-funnel-event="contact_click" data-funnel-placement="work_with_me_intro">{workWithMe.roleLabel}<span aria-hidden="true"> →</span></a>
        </div>
        <section className="services-intro" aria-labelledby="consulting-heading">
          <h2 id="consulting-heading">{workWithMe.consultingTitle}</h2>
          <p>{workWithMe.consultingIntro}</p>
        </section>
        <div className="service-panels">
          {workWithMe.services.map((service) => {
            const example = caseStudyBySlug(service.exampleSlug)!;
            return (
              <section className="service-panel" key={service.id} aria-labelledby={service.id}>
                <h2 id={service.id}>{service.title}</h2>
                <p>{service.body}</p>
                <ul>{service.includes.map((item) => <li key={item}>{item}</li>)}</ul>
                <p>{service.detail}</p>
                {example.principle && <p className="service-proof">“{example.principle}”</p>}
                <ExternalLink className="btn btn-gradient" href={site.bookingUrl} data-funnel-event="booking_click" data-funnel-placement="service_panel">{workWithMe.bookingLabel}</ExternalLink>
                <Link className="service-example" href={`/work/${example.slug}`}>See how it played out: {example.title}<span aria-hidden="true"> →</span></Link>
              </section>
            );
          })}
        </div>
        <div className="services-details">
          <section aria-labelledby="first-step">
            <h2 id="first-step">{workWithMe.firstStep.title}</h2>
            <ol>{workWithMe.firstStep.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>
          <section aria-labelledby="pricing">
            <h2 id="pricing">{workWithMe.pricing.title}</h2>
            <p>{workWithMe.pricing.body}</p>
            <p>{workWithMe.pricing.welcome}</p>
          </section>
          <section aria-labelledby="talk-project">
            <h2 id="talk-project">{workWithMe.bookingLabel}</h2>
            <p>{workWithMe.closing}</p>
            <ExternalLink className="btn btn-gradient" href={site.bookingUrl} data-funnel-event="booking_click" data-funnel-placement="work_with_me_footer">{workWithMe.bookingLabel}</ExternalLink>
          </section>
        </div>
      </main>
      <footer className="site-footer">
        <div className="footer-row label">
          <p>© 2026 {site.name}</p>
          <nav aria-label="Elsewhere">
            <ExternalLink href={site.creativeUrl}>The Arcades’ Lab</ExternalLink>
            <ExternalLink href={site.publishingUrl}>Free Play Publishing</ExternalLink>
          </nav>
        </div>
      </footer>
    </div>
  );
}
