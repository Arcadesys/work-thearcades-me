import Image from 'next/image';
import { ExternalLink } from '@/components/external-link';
import { caseStudies, lanes, notes, site } from '@/lib/content';

function Arrow() {
  return <span aria-hidden="true"> →</span>;
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <nav className="shell nav" aria-label="Main navigation">
          <a className="brand" href="#top">{site.name}</a>
          <div className="nav-links">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#notes">Notes</a>
            <a href="#contact">Contact</a>
            <ExternalLink className="resume-link" href={site.resumeUrl}>View résumé <Arrow /></ExternalLink>
          </div>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <div className="shell" id="top">
          <section className="hero" aria-labelledby="hero-heading">
            <div className="hero-copy">
              <p className="eyebrow">AI Builder &amp; Evangelist</p>
              <h1 id="hero-heading">Hi. I make useful things.</h1>
              <p className="tagline">Finding elegant solutions to inelegant problems for twenty years.</p>
              <p className="intro">I build AI systems, own messy problems end to end, and help people get comfortable enough with new technology to actually use it. I’m happiest where product, engineering, communication, and a slightly unreasonable amount of curiosity overlap.</p>
              <div className="buttons">
                <a className="button primary" href="#work">See my work</a>
                <ExternalLink className="button secondary" href={site.resumeUrl}>View résumé</ExternalLink>
              </div>
              <div className="beliefs">
                <div className="belief"><strong>Start small. Ship fast.</strong><span>Build the smallest useful thing first, then learn from reality.</span></div>
                <div className="belief"><strong>Make it legible.</strong><span>Useful beats impressive. If people can’t understand it, they can’t use it.</span></div>
                <div className="belief"><strong>Build for handoff.</strong><span>Good systems should be maintainable, teachable, and bigger than one heroic person.</span></div>
              </div>
            </div>
          </section>
          <section id="work" aria-labelledby="work-heading">
            <p className="section-kicker">How I work</p>
            <h2 id="work-heading">Builder. Owner. Evangelist.</h2>
            <p className="section-lede">Three lanes, one operating system: understand the real problem, make the thing, and bring people with me.</p>
            <div className="lanes">
              {lanes.map((lane) => <article className="lane" key={lane.number}><span className="lane-number">{lane.number}</span><h3>{lane.title}</h3><p>{lane.body}</p><a href={lane.href}>{lane.link}<Arrow /></a></article>)}
            </div>
          </section>
          <section aria-labelledby="selected-work-heading">
            <p className="section-kicker">Selected work</p>
            <h2 id="selected-work-heading">A few problems I’ve gotten attached to.</h2>
            <div className="case-studies">
              {caseStudies.map((study) => <article className="case-study" id={study.id} key={study.id}><p className="case-label">{study.lane}</p><div><h3>{study.title}</h3><p>{study.body}</p>{study.id === 'builder-case' && <figure className="case-visual"><Image src="/images/bunch-data-model.png" width={1792} height={2316} sizes="(max-width: 840px) calc(100vw - 64px), 480px" alt="Bunch data model: people have pictures, hosting history, and fronting history; a return can have a catch-up with saved notes, tasks, decisions, and conversation summaries." /><figcaption>Bunch’s published data model. Hosting records responsibility; fronting records presence.</figcaption></figure>}<ul className="tag-list" aria-label={`${study.lane} disciplines`}>{study.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul></div></article>)}
            </div>
          </section>
        </div>
        <div className="shell quote-wrap"><section className="quote" aria-label="Personal approach to words and systems"><blockquote>“Text isn’t just a medium for me. It’s an instrument I’ve spent thirty years learning to play.”</blockquote><footer>Writing, editing, layout, publishing, product, and now AI.</footer></section></div>
        <div className="shell">
          <section id="about" aria-labelledby="about-heading"><div className="about-grid"><div><p className="section-kicker">About</p><h2 id="about-heading">A few things about me.</h2><p className="section-lede">I’ve spent my career moving between disciplines that are usually treated as separate. That turns out to be very useful in a text-first AI world.</p></div><div className="facts"><div className="fact"><strong>16+ years delivering customer-focused software solutions.</strong><span>AI transformation leadership, program management, agile coaching, and practical building.</span></div><div className="fact"><strong>Twenty years of published writing under several names.</strong><span>Novels, short fiction, poetry, essays, and the occasional live performance.</span></div><div className="fact"><strong>I care about tools that survive contact with actual humans.</strong><span>Accessibility, legibility, and adoption are product requirements, not garnish.</span></div></div></div></section>
          <section id="notes" aria-labelledby="notes-heading"><p className="section-kicker">Notes</p><h2 id="notes-heading">What I’m thinking about.</h2><p className="section-lede">Build notes and essays from the public archive. Fiction and publishing live at The Arcades’ Lab.</p><div className="notes-grid">{notes.map((note) => <article className="note-card" key={note.href}><p className="date">{note.date}</p><h3><ExternalLink href={note.href}>{note.title}</ExternalLink></h3><p>{note.body}</p></article>)}</div></section>
          <section id="contact" className="cta" aria-labelledby="contact-heading"><p className="section-kicker">Say hello</p><h2 id="contact-heading">If you’ve got an inelegant problem, I’m interested.</h2><p>I’m looking for work where AI, product thinking, communication, and practical building all belong in the same room.</p><div className="buttons"><ExternalLink className="button primary" href={site.bookingUrl}>Book a conversation</ExternalLink><a className="button secondary" href={`mailto:${site.email}`}>Email me</a><ExternalLink className="button secondary" href={site.githubUrl}>GitHub</ExternalLink></div></section>
        </div>
      </main>
      <footer className="site-footer"><div className="shell footer-row"><span>© 2026 Austen Tucker-Crowder</span><div><ExternalLink href={site.creativeUrl}>The Arcades’ Lab</ExternalLink><ExternalLink href={site.publishingUrl}>Free Play Publishing</ExternalLink></div></div></footer>
    </>
  );
}
