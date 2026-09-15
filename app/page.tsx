import Image from 'next/image';
import { publicPosts, displayDate } from '@/lib/blog';
import Link from 'next/link';
import type { CaseStudy } from '@/lib/content';
import { SiteHeader } from '@/components/site-header';
import { ExternalLink } from '@/components/external-link';
import { RevealOnScroll } from '@/components/reveal-on-scroll';
import { SubscribeForm } from '@/components/subscribe-form';
import {
  about,
  beliefs,
  caseStudies,
  contact,
  hero,
  lanes,
  newsletter,
  notes,
  ownerStat,
  quote,
  site,
} from '@/lib/content';

function Arrow({ dir = 'right' }: { dir?: 'right' | 'down' }) {
  return <span aria-hidden="true">{dir === 'right' ? ' →' : ' ↓'}</span>;
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="label kicker">
      <span className="dot" />
      {children}
    </p>
  );
}

/** Left-hand column shared by all three case study cards. */
function CaseSummary({ study }: { study: CaseStudy }) {
  return (
    <div>
      <p className="label case-pill">{study.lane}</p>
      <h3 id={`${study.id}-title`}>
        <Link href={`/work/${study.slug}`}>{study.title}</Link>
      </h3>
      <p>{study.body}</p>
      <ul className="tag-list" aria-label={`${study.lane} disciplines`}>
        {study.tags.map((tag) => (
          <li className="label" key={tag}>
            {tag}
          </li>
        ))}
      </ul>
      <Link className="label case-more" href={`/work/${study.slug}`}>
        Read the full story
        <Arrow />
        <span className="visually-hidden"> about {study.title}</span>
      </Link>
    </div>
  );
}

const caseById = Object.fromEntries(caseStudies.map((study) => [study.id, study]));

export default function Home() {
  const latestPost = publicPosts()[0];
  const featuredNote = latestPost ? { badge: 'Latest', date: displayDate(latestPost.publishDate), kind: 'Blog post', title: latestPost.title, body: latestPost.excerpt, href: `/blog/${latestPost.slug}` } : null;
  const bunch = caseById['builder-case'];
  const guaranteedRate = caseById['owner-case'];
  const aiEnablement = caseById['evangelist-case'];

  return (
    <>
      <RevealOnScroll />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <SiteHeader home />

      <main id="main" tabIndex={-1}>
        {/* Hero */}
        <section className="shell section-top hero" id="top" aria-labelledby="hero-heading">
          <div className="hero-grid">
            <div>
              <p className="label kicker hero-eyebrow" data-reveal="1">
                <span className="dot" />
                {hero.eyebrow}
              </p>
              <h1 id="hero-heading" data-reveal="2">
                {hero.headingBefore}
                <span className="glow-accent">{hero.headingAccent}</span>
                {hero.headingAfter}
              </h1>
              <p className="hero-intro" data-reveal="3">
                {hero.intro}
              </p>
              <p className="hero-payoff" data-reveal="4">
                <Link href="/work/ai-enablement">{hero.evidence}</Link>.
              </p>
              <div className="btn-row" data-reveal="5">
                <a className="btn btn-gradient" href={`mailto:${site.email}`} data-funnel-event="contact_click" data-funnel-placement="hero">
                  Discuss a role
                  <Arrow />
                </a>
                <a className="btn btn-outline" href={site.resumeUrl} data-funnel-event="resume_click" data-funnel-placement="hero">
                  View résumé
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="shell">
          <hr className="rule" />
        </div>

        {/* Selected work */}
        <section className="shell section-flush-top" id="work" aria-labelledby="work-heading">
          <Kicker>Selected work</Kicker>
          <h2 className="h2 case-heading" id="work-heading">
            A few problems I’ve gotten attached to.
          </h2>

          <article
            className="case case-featured"
            id={aiEnablement.id}
            data-accent={aiEnablement.accent}
            data-reveal="1"
            aria-labelledby={`${aiEnablement.id}-title`}
          >
            <CaseSummary study={aiEnablement} />
            {aiEnablement.image && (
              <figure className="case-figure">
                <div>
                  <Image
                    src={aiEnablement.image.src}
                    width={aiEnablement.image.width}
                    height={aiEnablement.image.height}
                    sizes="(max-width: 840px) calc(100vw - 64px), 480px"
                    alt={aiEnablement.image.alt}
                  />
                </div>
                <figcaption>{aiEnablement.image.caption}</figcaption>
              </figure>
            )}
          </article>

          <article
            className="case case-split"
            id={guaranteedRate.id}
            data-accent={guaranteedRate.accent}
            data-reveal="2"
            aria-labelledby={`${guaranteedRate.id}-title`}
          >
            <CaseSummary study={guaranteedRate} />
            <p className="stat">
              {ownerStat.value}
              <span className="label">{ownerStat.label}</span>
            </p>
          </article>

          <article
            className="case case-split-top"
            id={bunch.id}
            data-accent={bunch.accent}
            data-reveal="3"
            aria-labelledby={`${bunch.id}-title`}
          >
            <CaseSummary study={bunch} />
            {bunch.image && (
              <figure className="case-figure">
                <div>
                  <Image src={bunch.image.src} width={bunch.image.width} height={bunch.image.height} sizes="(max-width: 840px) calc(100vw - 64px), 480px" alt={bunch.image.alt} />
                </div>
                <figcaption>{bunch.image.caption}</figcaption>
              </figure>
            )}
          </article>
        </section>

        {/* Working principles and lanes */}
        <section className="shell section" aria-labelledby="lanes-heading">
          <Kicker>How I work</Kicker>
          <h2 className="h2" id="lanes-heading">
            Builder. Owner. Evangelist. Advocate.
          </h2>
          <p className="lede">
            Four lanes, one operating system: understand the real problem, make the thing, and bring people with me.
          </p>
          <ul className="beliefs" data-reveal="1" aria-label="Working principles">
            {beliefs.map((belief) => (
              <li className="belief" key={belief.title} data-accent={belief.accent}>
                <p className="belief-title"><span className="dot-sm" />{belief.title}</p>
                <p>{belief.body}</p>
              </li>
            ))}
          </ul>
          <div className="lane-grid">
            {lanes.map((lane, index) => (
              <div className="lane" key={lane.number} data-accent={lane.accent} data-reveal={index + 2}>
                <span className="lane-number">{lane.number}</span>
                <h3>{lane.title}</h3>
                <p>{lane.body}</p>
                <a className="label lane-link" href={lane.href}>{lane.link}<Arrow /></a>
              </div>
            ))}
          </div>
        </section>

        {/* Quote */}
        <section className="quote-band" aria-label="How I think about text">
          <div className="quote-inner">
            <blockquote>
              <p>“{quote.text}”</p>
            </blockquote>
            <hr className="rule" />
            <p className="label quote-attribution">{quote.attribution}</p>
          </div>
        </section>

        {/* About */}
        <section className="shell section" id="about" aria-labelledby="about-heading">
          <div className="about-grid">
            <div>
              <Kicker>About</Kicker>
              <h2 className="h2" id="about-heading">
                {about.heading}
              </h2>
              <p className="lede">{about.lede} I’m happiest where product, engineering, communication, and a slightly unreasonable amount of curiosity overlap.</p>
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

        {/* Build log */}
        <section className="shell section-flush-top" id="notes" aria-labelledby="notes-heading">
          <Kicker>The build log</Kicker>
          <h2 className="h2" id="notes-heading">
            What I’m thinking about.
          </h2>
          <div className="notes-intro">
            <p className="lede">
              AI build logs and essays about the technology, written as I go. Fiction and publishing live at{' '}
              <ExternalLink className="prose-link" href={site.creativeUrl}>
                The Arcades’ Lab
              </ExternalLink>
              .
            </p>
            <Link className="label notes-all" href="/blog">
              All posts
              <Arrow />
            </Link>
          </div>

          {featuredNote && <article className="featured-note" data-reveal="1" aria-labelledby="featured-note-title">
            <p className="label featured-meta">
              <span className="badge">{featuredNote.badge}</span>
              <span>{featuredNote.date}</span>
              <span aria-hidden="true">·</span>
              <span>{featuredNote.kind}</span>
            </p>
            <h3 id="featured-note-title">
              <Link href={featuredNote.href}>{featuredNote.title}</Link>
            </h3>
            <p>{featuredNote.body}</p>
            <div className="featured-actions">
              <Link className="btn btn-outline" href={featuredNote.href}>
                Continue reading
                <Arrow />
              </Link>
            </div>
          </article>}

          <div className="subscribe" id="subscribe" data-reveal="1">
            <p className="label kicker">
              <span className="dot" />
              {newsletter.kicker}
            </p>
            <h3>{newsletter.heading}</h3>
            <p>{newsletter.body}</p>
            <SubscribeForm />
          </div>

          <p className="label earlier-label">Earlier</p>
          <ul className="earlier">
            {notes.map((note, index) => (
              <li key={note.href} data-reveal={index + 2}>
                <ExternalLink href={note.href}>
                  <span className="label">{note.date}</span>
                  <span className="earlier-title">
                    {note.title} <span aria-hidden="true">→</span>
                  </span>
                  <span className="earlier-body">{note.body}</span>
                </ExternalLink>
              </li>
            ))}
          </ul>
        </section>

        {/* Contact */}
        <section className="contact" id="contact" aria-labelledby="contact-heading">
          <div className="contact-inner">
            <p className="label">{contact.kicker}</p>
            <h2 id="contact-heading">{contact.heading}</h2>
            <p>{contact.body}</p>
            <div className="btn-row">
              <a className="btn btn-lg btn-gradient" href={`mailto:${site.email}`} data-funnel-event="contact_click" data-funnel-placement="contact_section" style={{ fontSize: '1.125rem' }}>
                Hire Me
                <Arrow />
              </a>
              <ExternalLink className="btn btn-lg btn-outline" href={site.bookingUrl} data-funnel-event="booking_click" data-funnel-placement="contact_section" style={{ fontSize: '1.125rem' }}>
                Consulting Opportunities
                <Arrow />
              </ExternalLink>
            </div>
            <nav className="btn-row" aria-label="Contact options">
              <Link className="contact-services-link" href={site.resumeUrl} data-funnel-event="resume_click" data-funnel-placement="contact_section">View résumé <Arrow /></Link>
              <Link className="contact-services-link" href="/work-with-me">Explore consulting services <Arrow /></Link>
              <ExternalLink className="contact-services-link" href={site.githubUrl}>
                GitHub
                <Arrow />
              </ExternalLink>
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
