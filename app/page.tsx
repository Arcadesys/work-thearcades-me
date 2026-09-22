import Image from 'next/image';
import { publicPosts, displayDate } from '@/lib/blog';
import Link from 'next/link';
import type { CaseStudy } from '@/lib/content';
import { SiteHeader } from '@/components/site-header';
import { ExternalLink } from '@/components/external-link';
import { RevealOnScroll } from '@/components/reveal-on-scroll';
import { SubscribeForm } from '@/components/subscribe-form';
import styles from './home.module.css';
import {
  about,
  beliefs,
  caseStudies,
  contact,
  hero,
  newsletter,
  notes,
  outcomes,
  ownerStat,
  quote,
  site,
} from '@/lib/content';

function Arrow() {
  return <span aria-hidden="true"> →</span>;
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="label kicker">
      <span className="dot" />
      {children}
    </p>
  );
}

function CaseSummary({ study }: { study: CaseStudy }) {
  return (
    <div>
      <p className="label case-pill">{study.lane}</p>
      <h3 id={`${study.id}-title`}>{study.title}</h3>
      <p>{study.body}</p>
      <ul className="tag-list" aria-label={`${study.lane} disciplines`}>
        {study.tags.map((tag) => (
          <li className="label" key={tag}>{tag}</li>
        ))}
      </ul>
      <Link className="label case-more" href={`/work/${study.slug}`}>
        Read the full story<Arrow />
        <span className="visually-hidden"> about {study.title}</span>
      </Link>
      {study.homeSupplementaryLink && (
        <Link className="label case-technical-tour" href={study.homeSupplementaryLink.href}>
          {study.homeSupplementaryLink.label}
        </Link>
      )}
    </div>
  );
}

const caseById = Object.fromEntries(caseStudies.map((study) => [study.id, study]));

export default function Home() {
  const latestPost = publicPosts()[0];
  const featuredNote = latestPost
    ? {
        badge: 'Latest',
        date: displayDate(latestPost.publishDate),
        kind: 'Blog post',
        title: latestPost.title,
        body: latestPost.excerpt,
        href: `/blog/${latestPost.slug}`,
      }
    : null;

  const bunch = caseById['builder-case'];
  const guaranteedRate = caseById['owner-case'];
  const aiEnablement = caseById['evangelist-case'];

  return (
    <>
      <RevealOnScroll />
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader home />

      <main className={styles.home} id="main" tabIndex={-1}>
        <section className="shell section-top hero" id="top" aria-labelledby="hero-heading">
          <div className="hero-grid">
            <div>
              <h1 className="label kicker hero-eyebrow" id="hero-heading" data-reveal="1">
                <span className="dot" />
                AI engineering and enablement — Austen Tucker-Crowder
              </h1>
              <p className="hero-heading" data-reveal="2">
                {hero.headingBefore}
                <span className="glow-accent">{hero.headingAccent}</span>
                {hero.headingAfter}
              </p>
              <p className="hero-intro" data-reveal="3">{hero.intro}</p>
              <p className="hero-payoff" data-reveal="4">{hero.authorship}</p>
              <p className="hero-payoff" data-reveal="5">
                <Link href="/work/ai-enablement">{hero.evidence}</Link>.
              </p>
              <div className="btn-row" data-reveal="6">
                <a className="btn btn-gradient" href="#work">
                  See what I’ve built<Arrow />
                </a>
                <a
                  className="btn btn-outline"
                  href={`mailto:${site.email}`}
                  data-funnel-event="contact_click"
                  data-funnel-placement="hero"
                >
                  Talk about AI engineering work
                </a>
              </div>
            </div>
            <div className={styles.heroPortrait}>
              <Image
                src="/images/headshots/austen-tucker-crowder.jpeg"
                alt="Austen Tucker-Crowder smiling in glasses."
                fill
                priority
                sizes="(max-width: 939px) min(100vw - 48px, 340px), 360px"
                className={styles.heroHeadshot}
              />
            </div>
          </div>
        </section>

        <div className="shell"><hr className="rule" /></div>

        <section className="shell section-flush-top" id="work" aria-labelledby="work-heading">
          <Kicker>Selected work</Kicker>
          <h2 className="h2 case-heading" id="work-heading">Working software first. Organizational leverage second.</h2>

          <article
            className="case case-featured"
            id={bunch.id}
            data-accent={bunch.accent}
            data-reveal="1"
            aria-labelledby={`${bunch.id}-title`}
          >
            <CaseSummary study={bunch} />
            {bunch.image && (
              <figure className="case-figure">
                <div>
                  <Image
                    src={bunch.image.src}
                    width={bunch.image.width}
                    height={bunch.image.height}
                    sizes="(max-width: 840px) calc(100vw - 64px), 480px"
                    alt={bunch.image.alt}
                  />
                </div>
                <figcaption>{bunch.image.caption}</figcaption>
              </figure>
            )}
          </article>

          <article
            className="case case-split"
            id={aiEnablement.id}
            data-accent={aiEnablement.accent}
            data-reveal="2"
            aria-labelledby={`${aiEnablement.id}-title`}
          >
            <CaseSummary study={aiEnablement} />
            <h4 className="stat">
              2% → 43% <span className="label">agentic-coding adoption</span>
            </h4>
          </article>

          <article
            className="case case-split-top"
            id={guaranteedRate.id}
            data-accent={guaranteedRate.accent}
            data-reveal="3"
            aria-labelledby={`${guaranteedRate.id}-title`}
          >
            <CaseSummary study={guaranteedRate} />
            <h4 className="stat">
              {ownerStat.value} <span className="label">{ownerStat.label}</span>
            </h4>
          </article>
        </section>

        <section className="shell section" aria-labelledby="principles-heading">
          <Kicker>How I work</Kicker>
          <h2 className="h2" id="principles-heading">Build. Explain. Hand off.</h2>
          <p className="lede">
            I like the seam between engineering and product: make the smallest useful thing,
            learn from reality, then leave the system more legible than I found it.
          </p>
          <ul className="beliefs" data-reveal="1" aria-label="Working principles">
            {beliefs.map((belief) => (
              <li className="belief" key={belief.title} data-accent={belief.accent}>
                <p className="belief-title"><span className="dot-sm" />{belief.title}</p>
                <p>{belief.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="shell section-flush-top" aria-labelledby="outcomes-heading">
          <Kicker>What happens if you bring me in</Kicker>
          <h2 className="h2" id="outcomes-heading">From fuzzy opportunity to an owned system.</h2>
          <div className="lane-grid">
            {outcomes.map((outcome, index) => (
              <div className="lane" key={outcome.number} data-accent={outcome.accent} data-reveal={index + 1}>
                <span className="lane-number">{outcome.number}</span>
                <h3>{outcome.title}</h3>
                <p>{outcome.body}</p>
              </div>
            ))}
          </div>
          <div className="btn-row portfolio-cta-row">
            <Link className="btn btn-outline" href="/work-with-me">
              See what I offer<Arrow />
            </Link>
            <Link
              className="btn btn-ghost"
              href={site.resumeUrl}
              data-funnel-event="resume_click"
              data-funnel-placement="outcomes"
            >
              View résumé
            </Link>
          </div>
        </section>

        <section className="quote-band" aria-label="How I think about text">
          <div className="quote-inner">
            <blockquote><p>“{quote.text}”</p></blockquote>
            <hr className="rule" />
            <p className="label quote-attribution">{quote.attribution}</p>
          </div>
        </section>

        <section className="shell section-flush-top" id="notes" aria-labelledby="notes-heading">
          <Kicker>The build log</Kicker>
          <h2 className="h2" id="notes-heading">What I’m thinking about while I build.</h2>
          <div className="notes-intro">
            <p className="lede">
              AI build logs and essays about the technology, written as I go. Fiction and publishing live at{' '}
              <ExternalLink className="prose-link" href={site.creativeUrl}>The Arcades’ Lab</ExternalLink>.
            </p>
            <Link className="label notes-all" href="/blog">All posts<Arrow /></Link>
          </div>

          {featuredNote && (
            <article className="featured-note" data-reveal="1" aria-labelledby="featured-note-title">
              <p className="label featured-meta">
                <span className="badge">{featuredNote.badge}</span>
                <span>{featuredNote.date}</span>
                <span aria-hidden="true">·</span>
                <span>{featuredNote.kind}</span>
              </p>
              <h3 id="featured-note-title">{featuredNote.title}</h3>
              <p>{featuredNote.body}</p>
              <div className="featured-actions">
                <Link className="btn btn-outline" href={featuredNote.href}>Continue reading<Arrow /></Link>
              </div>
            </article>
          )}

          <div className="subscribe" id="subscribe" data-reveal="1">
            <p className="label kicker"><span className="dot" />{newsletter.kicker}</p>
            <h3>{newsletter.heading}</h3>
            <p>{newsletter.body}</p>
            <SubscribeForm placement="homepage" />
          </div>

          <p className="label earlier-label">Earlier</p>
          <ul className="earlier">
            {notes.map((note, index) => (
              <li key={note.href} data-reveal={index + 2}>
                <ExternalLink href={note.href}>
                  <span className="label">{note.date}</span>
                  <span className="earlier-title">{note.title} <span aria-hidden="true">→</span></span>
                  <span className="earlier-body">{note.body}</span>
                </ExternalLink>
              </li>
            ))}
          </ul>
        </section>

        <section className="shell section" id="about" aria-labelledby="about-heading">
          <div className="about-grid">
            <div>
              <Kicker>About</Kicker>
              <h2 className="h2" id="about-heading">{about.heading}</h2>
              <p className="lede">
                {about.lede} I’m happiest where product, engineering, communication, and a slightly unreasonable amount of curiosity overlap.
              </p>
            </div>
            <ul className="facts">
              {about.facts.map((fact, index) => (
                <li className="fact" key={fact.title} data-reveal={index + 1}>
                  <strong>{fact.title}</strong>
                  <span>{fact.body}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-heading">
          <div className="contact-inner">
            <p className="label">{contact.kicker}</p>
            <h2 id="contact-heading">{contact.heading}</h2>
            <p>{contact.body}</p>
            <div className="btn-row">
              <a
                className="btn btn-lg btn-gradient"
                href={`mailto:${site.email}`}
                data-funnel-event="contact_click"
                data-funnel-placement="contact_section"
                style={{ fontSize: '1.125rem' }}
              >
                Talk about AI engineering work<Arrow />
              </a>
              <ExternalLink
                className="btn btn-lg btn-outline"
                href={site.bookingUrl}
                data-funnel-event="booking_click"
                data-funnel-placement="contact_section"
                style={{ fontSize: '1.125rem' }}
              >
                Discuss a project<Arrow />
              </ExternalLink>
            </div>
            <nav className="btn-row" aria-label="Contact options">
              <Link className="contact-services-link" href={site.resumeUrl} data-funnel-event="resume_click" data-funnel-placement="contact_section">View résumé<Arrow /></Link>
              <Link className="contact-services-link" href="/work-with-me">What I offer<Arrow /></Link>
              <ExternalLink className="contact-services-link" href={site.linkedinUrl}>LinkedIn<Arrow /></ExternalLink>
              <ExternalLink className="contact-services-link" href={site.githubUrl}>GitHub<Arrow /></ExternalLink>
            </nav>
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
    </>
  );
}
