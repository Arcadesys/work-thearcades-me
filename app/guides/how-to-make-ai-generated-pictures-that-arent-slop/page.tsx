import type { Metadata } from 'next';
import Link from 'next/link';

import { ExternalLink } from '@/components/external-link';
import { SiteHeader } from '@/components/site-header';
import { site } from '@/lib/content';
import { pictureGuide } from '@/lib/guides';
import { JsonLd } from '@/lib/json-ld';
import { breadcrumbJsonLd, guideJsonLd } from '@/lib/site-metadata';

import styles from './picture-guide.module.css';

export const metadata: Metadata = {
  title: `${pictureGuide.title} — ${site.name}`,
  description: pictureGuide.description,
  alternates: { canonical: pictureGuide.path },
  openGraph: {
    type: 'article',
    url: pictureGuide.path,
    title: `${pictureGuide.title} — ${site.name}`,
    description: pictureGuide.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${pictureGuide.title} — ${site.name}`,
    description: pictureGuide.description,
  },
};

const steps = [
  {
    title: 'Name the picture’s job before you ask for a picture',
    body: 'Write one sentence about what must still be true when the image is done. Is it a person who must remain recognizable? A product whose controls must stay readable? A scene whose point is a particular relationship or action? This is the success condition, not a pile of style words.',
  },
  {
    title: 'Choose a reference that carries the hard part',
    body: 'Start from a reference when composition, pose, camera distance, lighting, or a person’s recognizable features matter. In my fox work, a photograph supplies the composition while the model performs the transformation. A reference is not a decorative attachment; it is the source for what you are trying to preserve.',
  },
  {
    title: 'Protect composition and silhouette',
    body: 'Before polishing texture, check the large shapes: who is where, what they are holding, where the eye goes first, and whether the subject reads at a glance. If the intended relationship disappears at a small size, detail will not rescue it. Treat the room, the camera angle, and the subject’s outline as explicit constraints when they carry meaning.',
  },
  {
    title: 'Evaluate the result against a short contract',
    body: 'Review the same small set of requirements each time: identity, protected objects, scene, style boundary, and the one thing the image must communicate. Some checks can be deterministic; the final call is human. The question is not “is this pretty?” but “did it preserve what I asked it to preserve?”',
  },
  {
    title: 'Repair one named defect, then re-check what it could disturb',
    body: 'A useful repair is narrow enough to inspect. Ask for one defect, not a new image with a vague wish attached. Afterward, check the protected requirements again: a local repair can quietly change the pose, identity, prop, or scene you had already accepted.',
  },
  {
    title: 'Ship with a truthful description and a clear limit',
    body: 'Write alt text that replaces the image’s useful meaning for someone who cannot see it; do not make it a prompt transcript. Keep the source/reference relationship and meaningful edits legible in your own records. Do not present an AI image as documentation, proof, or a faithful record of an event it did not capture.',
  },
] as const;

export default function PictureGuidePage() {
  return (
    <div className={styles.page}>
      <JsonLd data={guideJsonLd(pictureGuide)} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: pictureGuide.title, path: pictureGuide.path }])} />
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />

      <main className={`shell ${styles.main}`} id="main" tabIndex={-1}>
        <header className={styles.intro}>
          <p className="label kicker"><span className="dot" />Practical guide</p>
          <h1>{pictureGuide.title}</h1>
          <p className="lede">The difference is not a magic prompt. It is knowing what must survive the generation, checking it, and repairing a specific failure without throwing away the rest.</p>
          <p className={styles.scope}>This is an evaluation practice, not a claim that a model can reliably make any image—or that generated images are evidence of what happened.</p>
        </header>

        <section className={styles.start} aria-labelledby="start-heading">
          <p className="label">Start here</p>
          <h2 id="start-heading">Make a tiny acceptance checklist.</h2>
          <ul>
            <li>What must the viewer understand?</li>
            <li>What reference or composition must remain intact?</li>
            <li>Which identity, object, or boundary may not drift?</li>
            <li>What single defect would make this version unusable?</li>
          </ul>
        </section>

        <section className={styles.workflow} aria-labelledby="workflow-heading">
          <div className={styles.sectionHeading}>
            <p className="label">The loop</p>
            <h2 id="workflow-heading">Six steps from intention to an inspectable result</h2>
          </div>
          <ol>
            {steps.map((step, index) => (
              <li className={styles.step} key={step.title}>
                <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.repair} aria-labelledby="repair-heading">
          <p className="label">Concrete repair pattern</p>
          <h2 id="repair-heading">“The fox is right, but the glasses warped.”</h2>
          <p>In <Link href="/blog/the-fox-and-the-eval">The Fox and the Eval</Link>, I describe a model making the right fox while warping the glasses, putting paw pads on the backs of hands, or redrawing the room. The repair target is not “make it better.” It is “repair the glasses,” followed by another pass over the traits and scene that were already approved.</p>
          <p>That distinction matters: a model can fix the named defect by making a different picture. A repair is only useful when the change stays local enough for a person to verify.</p>
        </section>

        <section className={styles.reading} aria-labelledby="reading-heading">
          <p className="label">Receipts and further reading</p>
          <h2 id="reading-heading">The practice behind this guide</h2>
          <ul>
            <li><Link href="/blog/the-fox-and-the-eval">The Fox and the Eval</Link> — the public account of preserving a character, a photographic composition, and a boundary between subject and scene.</li>
            <li><Link href="/blog/four-stages-nobody-tells-you-about">The Four Stages Nobody Tells You About</Link> — why systems, structured inputs, and evaluation outlast prompt obsession.</li>
            <li><ExternalLink href="https://github.com/Arcadesys/furry-image-studio">Furry Image Studio</ExternalLink> — the public prototype referenced in the evaluation essay.</li>
          </ul>
        </section>

        <aside className={styles.next} aria-labelledby="next-heading">
          <p className="label">Next step</p>
          <h2 id="next-heading">Need an image workflow people can actually inspect?</h2>
          <p>Bring the task, the constraints, and the people who need to judge the result. We can build the smallest useful evaluation loop around them.</p>
          <Link className="btn btn-gradient" href="/work-with-me">See how we can work together <span aria-hidden="true">→</span></Link>
        </aside>
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
