import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from '@/components/external-link';
import { SiteHeader } from '@/components/site-header';
import { engineeringTour } from '@/lib/engineering';
import { JsonLd } from '@/lib/json-ld';
import { breadcrumbJsonLd, personJsonLd, SITE_URL } from '@/lib/site-metadata';
import styles from './engineering.module.css';

export const metadata: Metadata = {
  title: 'Bunch technical tour — Austen Tucker-Crowder',
  description: engineeringTour.description,
  alternates: { canonical: '/engineering' },
  openGraph: {
    type: 'article',
    url: '/engineering',
    title: 'Bunch technical tour — Austen Tucker-Crowder',
    description: engineeringTour.description,
  },
  twitter: { card: 'summary_large_image', title: 'Bunch technical tour — Austen Tucker-Crowder', description: engineeringTour.description },
};

function EvidenceLinks({ links, label }: { links: readonly { label: string; href: string; note?: string }[]; label: string }) {
  return (
    <ul className={styles.evidenceLinks} aria-label={label}>
      {links.map((link) => (
        <li key={link.href}>
          <ExternalLink href={link.href}>{link.label}<span className="visually-hidden"> (opens in a new tab)</span></ExternalLink>
          {link.note && <p>{link.note}</p>}
        </li>
      ))}
    </ul>
  );
}

export default function EngineeringPage() {
  const tour = engineeringTour;
  const architecture = tour.architecture;

  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: tour.title,
        description: tour.description,
        url: `${SITE_URL}/engineering`,
        mainEntityOfPage: `${SITE_URL}/engineering`,
        author: personJsonLd(),
      }} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Engineering', path: '/engineering' }])} />
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />

      <main id="main" tabIndex={-1} className={styles.page}>
        <section className={`shell ${styles.hero}`} aria-labelledby="engineering-title">
          <Link className="label back-link" href="/#work"><span aria-hidden="true">← </span>Selected work</Link>
          <h1 id="engineering-title">{tour.title}</h1>
          <p className={styles.thesis}>{tour.thesis}</p>
          <p className={styles.framing}>{tour.framing}</p>
          <div className="btn-row">
            <ExternalLink className="btn btn-gradient" href="https://system.thearcades.me/demo">Try the interactive demo<span aria-hidden="true"> →</span></ExternalLink>
            <ExternalLink className="btn btn-ghost" href="https://github.com/Arcadesys/bunch">View the source<span aria-hidden="true"> ↗</span></ExternalLink>
          </div>
        </section>

        <section className={`shell ${styles.section}`} aria-labelledby="architecture-heading">
          <p className="label kicker"><span className="dot" />Architecture</p>
          <h2 id="architecture-heading">{architecture.headline}</h2>
          <figure className={styles.architecture} aria-labelledby="architecture-heading architecture-caption">
            <div className={styles.architectureInterfaces} aria-label="Bunch interfaces">
              {architecture.diagram.interfaces.map((layer, index) => (
                <div className={styles.interface} key={layer.label}>
                  <div className={styles.layer}>
                    <strong>{layer.label}</strong>
                    <span>{layer.description}</span>
                  </div>
                  <span className={styles.transport}>{architecture.diagram.transports[index]}</span>
                  <span className={styles.connector} aria-hidden="true">↓</span>
                </div>
              ))}
            </div>
            <div className={styles.architectureSpine}>
              {[architecture.diagram.contracts, architecture.diagram.service].map((layer) => (
                <div key={layer.label}>
                  <div className={styles.layer}>
                    <strong>{layer.label}</strong>
                    <span>{layer.description}</span>
                  </div>
                  <span className={styles.connector} aria-hidden="true">↓</span>
                </div>
              ))}
            </div>
            <div className={styles.architectureDependencies} aria-label="Systems behind the shared service">
              {architecture.diagram.dependencies.map((layer) => (
                <div className={styles.layer} key={layer.label}>
                  <strong>{layer.label}</strong>
                  <span>{layer.description}</span>
                </div>
              ))}
            </div>
            <p className={styles.safeguards}>{architecture.diagram.safeguards.join(' · ')}</p>
            <figcaption id="architecture-caption">{architecture.diagram.label}. The two top interfaces converge on the shared service before durable records are read or changed.</figcaption>
          </figure>
          <div className={styles.architectureText}>
            <h3>Text equivalent</h3>
            <p>{architecture.proseEquivalent}</p>
            <ul>
              {architecture.diagram.connections.map((connection) => <li key={connection}>{connection}</li>)}
            </ul>
          </div>
          <EvidenceLinks links={architecture.evidence} label="Architecture evidence" />
        </section>

        <section className={`shell ${styles.section}`} aria-labelledby="stories-heading">
          <p className="label kicker"><span className="dot" />Three war stories</p>
          <h2 id="stories-heading">What changed when the work met reality</h2>
          <ol className={styles.stories}>
            {tour.stories.map((story, index) => (
              <li key={story.title}>
                <article>
                  <p className="label">{String(index + 1).padStart(2, '0')} · {story.theme}</p>
                  <h3>{story.title}</h3>
                  {story.anchorLine && <p className={styles.anchorLine}>{story.anchorLine}</p>}
                  {story.narrativeBeats.map((beat) => <p key={beat}>{beat}</p>)}
                  <EvidenceLinks links={story.evidence} label={`Evidence for ${story.title}`} />
                </article>
              </li>
            ))}
          </ol>
        </section>

        <section className={`shell ${styles.section}`} aria-labelledby="workflow-heading">
          <p className="label kicker"><span className="dot" />Agent workflow</p>
          <h2 id="workflow-heading">{tour.agentWorkflow.mainPoint}</h2>
          <ol className={styles.workflow}>
            {tour.agentWorkflow.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}
          </ol>
          <div className={styles.humanWork}>
            <h3>The human work stays human</h3>
            <ul>{tour.agentWorkflow.humanWork.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </section>

        <section className={`shell ${styles.section}`} aria-labelledby="evidence-heading">
          <p className="label kicker"><span className="dot" />Production evidence</p>
          <h2 id="evidence-heading">{tour.productionEvidence.heading}</h2>
          <p className={styles.sectionIntro}>{tour.productionEvidence.body}</p>
          <ul className={styles.chips} aria-label="Implementation areas represented in the evidence">
            {tour.productionEvidence.chips.map((chip) => <li key={chip}>{chip}</li>)}
          </ul>
          <EvidenceLinks links={tour.productionEvidence.evidence} label="Production evidence" />
        </section>

        <section className={`shell ${styles.digDeeper}`} aria-labelledby="dig-deeper-heading">
          <p className="label kicker"><span className="dot" />Dig deeper</p>
          <h2 id="dig-deeper-heading">Inspect the implementation trail</h2>
          <EvidenceLinks links={tour.digDeeper} label="Further Bunch engineering reading" />
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-row label">
          <p>© 2026 Austen Tucker-Crowder</p>
          <nav aria-label="Engineering tour footer">
            <Link href="/work/bunch">Bunch case study</Link>
            <Link href="/#contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
