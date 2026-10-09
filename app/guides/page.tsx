import type { Metadata } from 'next';
import Link from 'next/link';

import { ExternalLink } from '@/components/external-link';
import { SiteHeader } from '@/components/site-header';
import { site } from '@/lib/content';
import { pictureGuide } from '@/lib/guides';
import { JsonLd } from '@/lib/json-ld';
import { breadcrumbJsonLd } from '@/lib/site-metadata';

import styles from './guides.module.css';

const TITLE = `Practical AI Guides — ${site.name}`;
const DESCRIPTION = 'Practical, evaluation-led guides for building and checking useful AI-assisted work.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/guides' },
  openGraph: {
    type: 'website',
    url: '/guides',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function GuidesPage() {
  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }])} />
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader current="/guides" />

      <main className={`shell ${styles.main}`} id="main" tabIndex={-1}>
        <header className={styles.intro}>
          <p className="label kicker"><span className="dot" />Practical guides</p>
          <h1>Guides for making useful AI work</h1>
          <p className="lede">Practical, evaluation-led approaches for building and checking AI-assisted work without losing the parts that matter.</p>
        </header>

        <section aria-labelledby="guides-heading">
          <h2 className="visually-hidden" id="guides-heading">Published guides</h2>
          <ul className={styles.list}>
            <li>
              <article className={styles.card}>
                <p className="label">Image generation</p>
                <h3><Link href={pictureGuide.path}>{pictureGuide.title}</Link></h3>
                <p>{pictureGuide.description}</p>
                <Link className="label" href={pictureGuide.path}>Read the guide <span aria-hidden="true">→</span></Link>
              </article>
            </li>
          </ul>
        </section>
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
