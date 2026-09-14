import type { Metadata } from 'next';
import Link from 'next/link';

import { SiteHeader } from '@/components/site-header';
import { ExternalLink } from '@/components/external-link';
import { hero, site } from '@/lib/content';
import {
  RESUME_ACCOMPLISHMENTS,
  RESUME_CANONICAL_PATH,
  RESUME_COMMUNITY,
  RESUME_DESCRIPTION,
  RESUME_EARLIER,
  RESUME_EDUCATION,
  RESUME_EXPERIENCE,
  RESUME_PDF_PATH,
  RESUME_PROFILE,
  RESUME_SKILLS,
  RESUME_SUMMARY,
} from '@/lib/resume';

import styles from './resume.module.css';

export const metadata: Metadata = {
  title: 'Résumé — Austen Tucker-Crowder',
  description: RESUME_DESCRIPTION,
  alternates: { canonical: RESUME_CANONICAL_PATH },
  openGraph: {
    type: 'profile',
    title: `Resume — ${RESUME_PROFILE.name}`,
    description: RESUME_DESCRIPTION,
    url: RESUME_CANONICAL_PATH,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Resume — ${RESUME_PROFILE.name}`,
    description: RESUME_DESCRIPTION,
  },
};

export default function ResumePage() {
  return (
    <div className="services-page">
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader current="/resume" />

      <main className={styles.page} id="main" tabIndex={-1}>

      <header className={styles.header}>
        <h1 className={styles.name}>{RESUME_PROFILE.name}</h1>
        <p className={styles.titleLine}>{RESUME_PROFILE.titleLine}</p>
        <p className={styles.location}>{RESUME_PROFILE.location}</p>
        <p className={styles.roleIntro}>{hero.intro}</p>
        <div className={styles.contact}>
          <a href={`mailto:${RESUME_PROFILE.email}`}>{RESUME_PROFILE.email}</a>
          <a href={RESUME_PROFILE.siteUrl}>{RESUME_PROFILE.site}</a>
          <a href={RESUME_PROFILE.githubUrl}>{RESUME_PROFILE.github}</a>
        </div>
        <div className={styles.roleActions}>
          <a className={`btn btn-gradient ${styles.rolePrimary}`} href={`mailto:${RESUME_PROFILE.email}`} data-funnel-event="contact_click" data-funnel-placement="resume_header">
            Discuss a leadership role <span aria-hidden="true">→</span>
          </a>
          <a className={styles.roleSecondary} href={RESUME_PDF_PATH} download data-funnel-event="resume_click" data-funnel-placement="resume_pdf">Download résumé PDF</a>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="resume-summary">
        <h2 id="resume-summary" className={styles.sectionHeading}>Summary</h2>
        <p className={styles.summary}>{RESUME_SUMMARY}</p>
      </section>

      <section className={styles.section} aria-labelledby="resume-accomplishments">
        <h2 id="resume-accomplishments" className={styles.sectionHeading}>Key Accomplishments</h2>
        <ul className={styles.accomplishments}>
          {RESUME_ACCOMPLISHMENTS.map((item) => (
            <li key={item.text}>
              {item.text}
              {item.proofHref ? (
                <Link className={styles.proofLink} href={item.proofHref}>See the work</Link>
              ) : null}
            </li>
          ))}
        </ul>
        <p className={styles.proofRow}>
          <span>See the work:</span>
          <Link href="/#work">Case studies</Link>
          <Link href="https://www.thearcades.me/projects">Projects</Link>
        </p>
      </section>

      <section className={styles.section} aria-labelledby="resume-experience">
        <h2 id="resume-experience" className={styles.sectionHeading}>Experience</h2>
        {RESUME_EXPERIENCE.map((role) => (
          <article className={styles.card} key={role.company}>
            <h3 className={styles.jobCompany}>{role.company}</h3>
            <p className={styles.jobTitle}>{role.title}</p>
            <p className={styles.jobMeta}>{role.location} &middot; {role.dates}</p>
            <ul className={styles.jobBullets}>
              {role.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          </article>
        ))}
      </section>

      <section className={styles.section} aria-labelledby="resume-earlier">
        <h2 id="resume-earlier" className={styles.sectionHeading}>Earlier Experience</h2>
        <div className={styles.card}>
          <ul className={styles.lineList}>
            {RESUME_EARLIER.map((role) => (
              <li className={styles.line} key={role.org}>
                <strong>{role.org}</strong> — {role.role} ({role.dates})
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="resume-community">
        <h2 id="resume-community" className={styles.sectionHeading}>Community &amp; Volunteer Work</h2>
        <article className={styles.card}>
          <h3 className={styles.jobCompany}>{RESUME_COMMUNITY.organization}</h3>
          <p className={styles.jobTitle}>{RESUME_COMMUNITY.title}</p>
          <p className={styles.jobMeta}>{RESUME_COMMUNITY.location}</p>
          <p className={styles.summary}>{RESUME_COMMUNITY.description}</p>
        </article>
      </section>

      <section className={styles.section} aria-labelledby="resume-skills">
        <h2 id="resume-skills" className={styles.sectionHeading}>Tools &amp; Skills</h2>
        <div className={styles.card}>
          {RESUME_SKILLS.map((group) => (
            <p className={styles.skillGroup} key={group.label}>
              <strong>{group.label}:</strong> {group.skills}
            </p>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="resume-education">
        <h2 id="resume-education" className={styles.sectionHeading}>Education &amp; Certifications</h2>
        <div className={styles.card}>
          <ul className={styles.lineList}>
            {RESUME_EDUCATION.map((line) => <li className={styles.line} key={line}>{line}</li>)}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="resume-hire">
        <h2 id="resume-hire" className={styles.sectionHeading}>Discuss a leadership role</h2>
        <div className={styles.hire}>
          <p className={styles.hireCopy}>{hero.intro}</p>
          <div className={styles.hireActions}>
            <a className={styles.hirePrimary} href={`mailto:${RESUME_PROFILE.email}`} data-funnel-event="contact_click" data-funnel-placement="resume_footer">
              Discuss a leadership role <span aria-hidden="true">→</span>
            </a>
            <Link className={styles.hireSecondary} href="/#work">Read the case studies</Link>
            <Link className={styles.hireSecondary} href="https://www.thearcades.me/projects">See what I build</Link>
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
