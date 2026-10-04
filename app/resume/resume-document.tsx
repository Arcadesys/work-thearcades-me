import Link from 'next/link';

import { ExternalLink } from '@/components/external-link';
import { SiteHeader } from '@/components/site-header';
import { site } from '@/lib/content';
import type { ResolvedResume, ResolvedSection } from '@/lib/resume/compose';
import { editionDownloads, editionLinks } from '@/lib/resume/editions';

import styles from './resume.module.css';

/** Stable section anchors; `resume-builds` predates the shared renderer. */
const sectionId = (kind: ResolvedSection['kind']) => `resume-${kind === 'projects' ? 'builds' : kind}`;

const isEmpty = (section: ResolvedSection) =>
  ('roles' in section && section.roles.length === 0) || ('items' in section && section.items.length === 0) || ('groups' in section && section.groups.length === 0);

function Section({ section }: { section: ResolvedSection }) {
  const id = sectionId(section.kind);
  let body: React.ReactNode;
  switch (section.kind) {
    case 'experience':
      body = section.roles.map((role) => (
        <article className={styles.card} key={role.id}>
          <h3 className={styles.jobCompany}>{role.employer}</h3>
          <p className={styles.jobTitle}>{role.title}</p>
          {role.scope ? <p className={styles.jobMeta}>{role.scope}</p> : null}
          <p className={styles.jobMeta}>{[role.location, role.dates].filter(Boolean).join(' · ')}</p>
          {role.items.length ? (
            <ul className={styles.jobBullets}>
              {role.items.map((item) => <li key={item.id}>{item.text}</li>)}
            </ul>
          ) : null}
          {role.evidence ? <Link className={styles.proofLink} href={role.evidence.href}>{role.evidence.label}</Link> : null}
        </article>
      ));
      break;
    case 'earlier':
      body = (
        <div className={styles.card}>
          <ul className={styles.lineList}>
            {section.roles.map((role) => (
              <li className={styles.line} key={role.id}><strong>{role.employer}</strong> — {role.title} ({role.dates})</li>
            ))}
          </ul>
        </div>
      );
      break;
    case 'highlights':
      body = (
        <div className={styles.card}>
          <ul className={styles.jobBullets}>{section.items.map((item) => <li key={item.id}>{item.text}</li>)}</ul>
        </div>
      );
      break;
    case 'projects':
      body = section.items.map((item) => (
        <article className={styles.card} key={item.id}>
          <h3 className={styles.jobCompany}>{item.name}</h3>
          <p className={styles.summary}>{item.description}</p>
          <Link className={styles.proofLink} href={item.proofHref}>{item.proofLabel}</Link>
        </article>
      ));
      break;
    case 'skills':
      body = (
        <div className={styles.card}>
          {section.groups.map((group) => <p className={styles.skillGroup} key={group.id}><strong>{group.label}:</strong> {group.skills}</p>)}
        </div>
      );
      break;
    case 'education':
      body = (
        <div className={styles.card}>
          <ul className={styles.lineList}>{section.items.map((item) => <li className={styles.line} key={item.id}>{item.text}</li>)}</ul>
        </div>
      );
      break;
    case 'publications':
    case 'talks':
      body = (
        <div className={styles.card}>
          <ul className={styles.lineList}>
            {section.items.map((item) => (
              <li className={styles.line} key={item.id}>
                {item.url ? <a href={item.url}>{item.title}</a> : item.title}
                {[item.venue, item.date].filter(Boolean).map((part) => ` — ${part}`).join('')}
              </li>
            ))}
          </ul>
        </div>
      );
      break;
    case 'community':
      body = section.items.map((item) => (
        <article className={styles.card} key={item.id}>
          <h3 className={styles.jobCompany}>{item.organization}</h3>
          <p className={styles.jobTitle}>{item.title}</p>
          {item.location ? <p className={styles.jobMeta}>{item.location}</p> : null}
          <p className={styles.summary}>{item.description}</p>
        </article>
      ));
      break;
  }
  return (
    <section className={styles.section} aria-labelledby={id}>
      <h2 id={id} className={styles.sectionHeading}>{section.title}</h2>
      {body}
    </section>
  );
}

/** One résumé edition rendered from its resolved document; no selection happens here. */
export function ResumeDocument({ doc }: { doc: ResolvedResume }) {
  const { identity } = doc;
  const downloads = editionDownloads(doc.profileId);
  const editions = editionLinks();
  return (
    <div className={`services-page ${styles.shell}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader current="/resume" />

      <main className={styles.page} id="main" tabIndex={-1} data-resume-profile={doc.profileId} data-resume-digest={doc.digest}>

      {editions.length > 1 ? (
        <nav className={styles.editions} aria-label="Résumé editions">
          <p className={styles.editionsLabel}>Choose an edition:</p>
          <ul>
            {editions.map((edition) => (
              <li key={edition.id}>
                {edition.id === doc.profileId
                  ? <a href={edition.href} aria-current="page"><strong>{edition.label}</strong>&nbsp;(current)</a>
                  : <Link href={edition.href}>{edition.label}</Link>}
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <header className={styles.header}>
        <h1 className={styles.name}>{identity.name}</h1>
        <p className={styles.titleLine}>{doc.headline}</p>
        <p className={styles.location}>{identity.location}</p>
        <div className={styles.contact}>
          <a href={`mailto:${identity.email}`}>{identity.email}</a>
          <a href={identity.siteUrl}>{identity.site}</a>
          <a href={identity.githubUrl}>{identity.github}</a>
        </div>
        <div className={styles.roleActions}>
          <a className={`btn btn-gradient ${styles.rolePrimary}`} href={`mailto:${identity.email}`} data-funnel-event="contact_click" data-funnel-placement="resume_header">
            {doc.page.cta} <span aria-hidden="true">→</span>
          </a>
          <a className={styles.roleSecondary} href={downloads.pdf.href} download data-funnel-event="resume_click" data-funnel-placement="resume_pdf">Download résumé PDF ({downloads.pdf.pages} {downloads.pdf.pages === 1 ? 'page' : 'pages'})</a>
          <a href={downloads.text.href} download>Plain-text version</a>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="resume-summary">
        <h2 id="resume-summary" className={styles.sectionHeading}>Summary</h2>
        <p className={styles.summary}>{doc.summary}</p>
      </section>

      {doc.sections.filter((section) => !isEmpty(section)).map((section) => <Section key={section.kind} section={section} />)}

      <section className={`${styles.section} ${styles.contactSection}`} aria-labelledby="resume-hire">
        <h2 id="resume-hire" className={styles.sectionHeading}>{doc.page.cta}</h2>
        <div className={styles.hire}>
          <p className={styles.hireCopy}>{doc.page.pitch}</p>
          <div className={styles.hireActions}>
            <a className={styles.hirePrimary} href={`mailto:${identity.email}`} data-funnel-event="contact_click" data-funnel-placement="resume_footer">
              {doc.page.cta} <span aria-hidden="true">→</span>
            </a>
            <ExternalLink className={styles.hireSecondary} href={site.bookingUrl} data-funnel-event="booking_click" data-funnel-placement="resume_footer">Discuss a focused project</ExternalLink>
            <Link className={styles.hireSecondary} href="/#work">Read the case studies</Link>
            <Link className={styles.hireSecondary} href="/engineering">See what I build</Link>
          </div>
        </div>
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
