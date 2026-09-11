import Image from 'next/image';
import Link from 'next/link';
import type { CaseStudy } from '@/lib/content';
import { CommentForm } from '@/components/comment-form';
import { ExternalLink } from '@/components/external-link';
import { RevealOnScroll } from '@/components/reveal-on-scroll';
import { SubscribeForm } from '@/components/subscribe-form';
import {
  about,
  beliefs,
  caseStudies,
  commentBox,
  commentCount,
  comments,
  contact,
  evangelistTakeaways,
  featuredNote,
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
  const builder = caseById['builder-case'];
  const owner = caseById['owner-case'];
  const evangelist = caseById['evangelist-case'];

  return (
    <>
      <RevealOnScroll />
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="header-wrap">
        <header className="site-header">
          <a className="brand" href="#top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/the-arcades-logo.svg" alt="" width={244} height={34} />
            <span className="visually-hidden">{site.name} — back to top</span>
          </a>
          <nav className="site-nav label" aria-label="Main">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#notes">Notes</a>
            <a href="#contact">Contact</a>
            <ExternalLink className="nav-cta" href={site.resumeUrl}>
              Résumé
              <Arrow />
            </ExternalLink>
          </nav>
        </header>
      </div>

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
              <p className="hero-tagline" data-reveal="3">
                {hero.tagline}
              </p>
              <p className="hero-intro" data-reveal="4">
                {hero.intro}
              </p>
              <div className="btn-row" data-reveal="5">
                <a className="btn btn-gradient" href="#subscribe">
                  Get the build notes
                  <Arrow />
                </a>
                <a className="btn btn-outline" href="#work">
                  See my work
                </a>
                <ExternalLink className="btn btn-ghost" href={site.bookingUrl}>
                  Book time
                  <Arrow />
                </ExternalLink>
              </div>
            </div>

            <ul className="beliefs" data-reveal="6" aria-label="How I build">
              {beliefs.map((belief) => (
                <li className="belief" key={belief.title} data-accent={belief.accent}>
                  <p className="belief-title">
                    <span className="dot-sm" />
                    {belief.title}
                  </p>
                  <p>{belief.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="shell">
          <hr className="rule" />
        </div>

        {/* How I work */}
        <section className="shell section" aria-labelledby="lanes-heading">
          <Kicker>How I work</Kicker>
          <h2 className="h2" id="lanes-heading">
            Builder. Owner. Evangelist. Advocate.
          </h2>
          <p className="lede">
            Four lanes, one operating system: understand the real problem, make the thing, and bring people with me.
          </p>
          <div className="lane-grid">
            {lanes.map((lane, index) => (
              <div className="lane" key={lane.number} data-accent={lane.accent} data-reveal={index + 1}>
                <span className="lane-number">{lane.number}</span>
                <h3>{lane.title}</h3>
                <p>{lane.body}</p>
                <a className="label lane-link" href={lane.href}>
                  {lane.link}
                  <Arrow />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Selected work */}
        <section className="shell section-flush-top" id="work" aria-labelledby="work-heading">
          <Kicker>Selected work</Kicker>
          <h2 className="h2 case-heading" id="work-heading">
            A few problems I’ve gotten attached to.
          </h2>

          <article
            className="case case-featured"
            id={builder.id}
            data-accent={builder.accent}
            data-reveal="1"
            aria-labelledby={`${builder.id}-title`}
          >
            <CaseSummary study={builder} />
            {builder.image && (
              <figure className="case-figure">
                <div>
                  <Image
                    src={builder.image.src}
                    width={builder.image.width}
                    height={builder.image.height}
                    sizes="(max-width: 840px) calc(100vw - 64px), 480px"
                    alt={builder.image.alt}
                  />
                </div>
                <figcaption>{builder.image.caption}</figcaption>
              </figure>
            )}
          </article>

          <article
            className="case case-split"
            id={owner.id}
            data-accent={owner.accent}
            data-reveal="2"
            aria-labelledby={`${owner.id}-title`}
          >
            <CaseSummary study={owner} />
            <p className="stat">
              {ownerStat.value}
              <span className="label">{ownerStat.label}</span>
            </p>
          </article>

          <article
            className="case case-split-top"
            id={evangelist.id}
            data-accent={evangelist.accent}
            data-reveal="3"
            aria-labelledby={`${evangelist.id}-title`}
          >
            <CaseSummary study={evangelist} />
            <div>
              <p className="label" id="takeaways-heading">
                {evangelistTakeaways.heading}
              </p>
              <ul className="takeaways" aria-labelledby="takeaways-heading">
                {evangelistTakeaways.items.map((item) => (
                  <li key={item}>
                    <span className="dot-sm" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </article>
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
              <p className="lede">{about.lede}</p>
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
            <ExternalLink className="label notes-all" href={site.blogUrl}>
              All posts
              <Arrow />
            </ExternalLink>
          </div>

          <article className="featured-note" data-reveal="1" aria-labelledby="featured-note-title">
            <p className="label featured-meta">
              <span className="badge">{featuredNote.badge}</span>
              <span>{featuredNote.date}</span>
              <span aria-hidden="true">·</span>
              <span>{featuredNote.kind}</span>
            </p>
            <h3 id="featured-note-title">
              <ExternalLink href={featuredNote.href}>{featuredNote.title}</ExternalLink>
            </h3>
            <p>{featuredNote.body}</p>
            <div className="featured-actions">
              <ExternalLink className="btn btn-outline" href={featuredNote.href}>
                Continue reading
                <Arrow />
              </ExternalLink>
              <a className="label jump-comments" href="#comments">
                {commentCount} comments
                <Arrow dir="down" />
              </a>
            </div>
          </article>

          <section className="comments" id="comments" data-reveal="2" aria-labelledby="comments-heading">
            <p className="label kicker" id="comments-heading">
              <span className="dot" />
              Comments · {commentCount}
            </p>
            <ul className="comment-list">
              {comments.map((comment) => (
                <li className="comment" key={comment.author}>
                  <Image src={comment.avatar} width={40} height={40} alt="" />
                  <div className="comment-body">
                    <p className="comment-meta">
                      <span className="comment-author">{comment.author}</span>
                      <span className="label">{comment.when}</span>
                    </p>
                    <p>{comment.body}</p>
                    {comment.canReply && (
                      <a className="label comment-reply" href="#comment-body">
                        Reply<span className="visually-hidden"> to {comment.author}</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <CommentForm />
          </section>

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

          <div className="subscribe" id="subscribe" data-reveal="1">
            <p className="label kicker">
              <span className="dot" />
              {newsletter.kicker}
            </p>
            <h3>{newsletter.heading}</h3>
            <p>{newsletter.body}</p>
            <SubscribeForm />
          </div>
        </section>

        {/* Contact */}
        <section className="contact" id="contact" aria-labelledby="contact-heading">
          <div className="contact-inner">
            <p className="label">{contact.kicker}</p>
            <h2 id="contact-heading">
              {contact.headingBefore}
              <span className="glow-accent">{contact.headingAccent}</span>
              {contact.headingAfter}
            </h2>
            <p>{contact.body}</p>
            <div className="btn-row">
              <ExternalLink className="btn btn-lg btn-gradient" href={site.bookingUrl}>
                Grab time on my calendar
                <Arrow />
              </ExternalLink>
              <a className="btn btn-lg btn-outline" href={`mailto:${site.email}`}>
                Email me
              </a>
              <ExternalLink className="btn btn-lg btn-ghost" href={site.githubUrl}>
                GitHub
              </ExternalLink>
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
    </>
  );
}
