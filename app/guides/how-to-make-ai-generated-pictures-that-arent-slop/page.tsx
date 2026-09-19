import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { ExternalLink } from '@/components/external-link';
import { SiteHeader } from '@/components/site-header';
import { site } from '@/lib/content';
import { pictureGuide } from '@/lib/guides';
import { JsonLd } from '@/lib/json-ld';
import { breadcrumbJsonLd, guideJsonLd } from '@/lib/site-metadata';

import styles from './picture-guide.module.css';

const SKILL_DOWNLOAD_PATH = '/downloads/image-ratchet-skill.md';

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

const pianoFrames = [
  {
    src: '/images/guides/image-ratchet/moxie-piano-current-best.webp',
    width: 1085,
    height: 1450,
    status: 'Current-best candidate',
    alt: 'Moxie, an orange fox with purple glasses, seated at a piano. Her long forearms end in narrow, awkward paws on the keys.',
    caption: 'This candidate already had the face, glasses, pose, room, clothing, light, and framing I wanted. The paws were the named defect.',
  },
  {
    src: '/images/guides/image-ratchet/moxie-piano-paw-repair.webp',
    width: 1085,
    height: 1450,
    status: 'Localized repair candidate',
    alt: 'The same piano portrait of Moxie with shorter, more coherent fox paws resting on the keys while the rest of the scene remains nearly unchanged.',
    caption: 'The paws changed. The earlier wins survived. That is what makes this a useful repair candidate instead of merely another good picture.',
  },
] as const;

const coverFrames = [
  {
    src: '/images/guides/image-ratchet/fur-nor-feather-sleeping-candidate.webp',
    status: 'Baseline candidate',
    alt: 'Square storybook cover showing Moxie asleep beneath a magpie and gold moon, with her tail forming a thick loop around her body.',
    caption: 'The sleeping composition has a clear first read, but the tail becomes a closed ring with no believable attachment to the body.',
  },
  {
    src: '/images/guides/image-ratchet/fur-nor-feather-standing-repair-candidate.webp',
    status: 'Rejected direction',
    alt: 'A polished square cover showing Moxie standing and holding a magpie, replacing the earlier sleeping composition.',
    caption: 'This pass makes Moxie and the magpie legible co-leads, but it solves the problem by making a different picture. The ratchet rejects the direction for losing the baseline composition; this is not a recorded creator verdict.',
  },
  {
    src: '/images/guides/image-ratchet/fur-nor-feather-tail-repair-candidate.webp',
    status: 'Localized repair candidate',
    alt: 'The sleeping cover composition restored, now with one fox tail visibly curving from Moxie’s body to a cream tip near her paws.',
    caption: 'This pass stays close to the sleeping candidate while giving the tail one readable root, curve, and tip. It is still a candidate: no creator score was recorded for this trace.',
  },
] as const;

const ratchet = [
  {
    title: 'Keep a named current best',
    body: 'Do not let the newest image become the default just because it is new. Keep the last version that earned its place available for comparison.',
  },
  {
    title: 'Write down what it already won',
    body: 'The keep-list might include the face, glasses, room, camera, silhouette, hand position, lighting, or the relationship between two characters. If you cannot name a win, you cannot protect it.',
  },
  {
    title: 'Choose one visible win for this pass',
    body: '“Make it better” has no stopping condition. “Give the tail one visible attachment at the pelvis while preserving the sleeping pose” can be inspected.',
  },
  {
    title: 'Give every reference one job',
    body: 'A photograph can own the composition. A model sheet can own identity. A style reference can own shape language. Asking all three to vaguely inspire the result makes it harder to tell which source was ignored.',
  },
  {
    title: 'Compare the candidate with the current best',
    body: 'Check the requested change first, then every item on the keep-list. A repaired paw does not compensate for a different face or a redrawn room.',
  },
  {
    title: 'Promote only without regression',
    body: 'If the named defect improved and the earlier wins survived, the candidate becomes the new current best. Otherwise keep the old one and try a narrower move.',
  },
] as const;

export default function PictureGuidePage() {
  return (
    <div className={styles.page}>
      <JsonLd data={guideJsonLd(pictureGuide)} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }, { name: pictureGuide.title, path: pictureGuide.path }])} />
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader current="/guides" />

      <main className={`shell ${styles.main}`} id="main" tabIndex={-1}>
        <header className={styles.intro}>
          <p className="label kicker"><span className="dot" />Practical guide</p>
          <h1>{pictureGuide.title}</h1>
          <p className={styles.lede}>The trick is not making one good picture. It is changing one thing without losing everything that already works.</p>
          <p className={styles.scope}>This is the image ratchet: keep a current best, name one repair, and promote the new version only when the earlier wins survive.</p>
        </header>

        <article className={styles.article}>
          <section aria-labelledby="piano-heading">
            <p className="label">Start with the comparison</p>
            <h2 id="piano-heading">A repair should leave most of the picture alone.</h2>
            <p>In the first piano image, Moxie was already Moxie. The glasses sat correctly. The green shirt, room, camera angle, and warm domestic light all worked. The failure was smaller and stranger: her paws stretched into narrow hands that did not feel attached to the same fox.</p>
            <p>That makes the next instruction simple: repair the paws and protect everything else. The usefulness of the second image is not that it is prettier. It is that you can see what changed.</p>

            <div className={styles.pianoComparison} aria-label="Moxie piano repair comparison">
              {pianoFrames.map((frame) => (
                <figure className={styles.figureCard} key={frame.src}>
                  <p className={styles.status}>{frame.status}</p>
                  <a className={styles.imageLink} href={frame.src} target="_blank" rel="noreferrer" aria-label={`Open ${frame.status.toLowerCase()} at full size`}>
                    <Image src={frame.src} width={frame.width} height={frame.height} sizes="(max-width: 720px) calc(100vw - 40px), 500px" alt={frame.alt} loading="eager" />
                  </a>
                  <figcaption>{frame.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section aria-labelledby="authorship-heading">
            <p className="label">Before the mechanics</p>
            <h2 id="authorship-heading">The picture needs an opinion.</h2>
            <p>A lot of generated imagery is competent and dead. It has lighting, detail, and no reason to exist. Before I generate, I want to know who owns the image, what just happened, what each character wants, and where the eye should land first.</p>
            <p>Those decisions turn a render into a moment. A hand has to grip the prop instead of hovering near it. Two characters need distinct reactions instead of the same pleasant expression. The background needs to support the beat instead of becoming an expensive screensaver. Style words cannot do that work for you.</p>
          </section>

          <section aria-labelledby="ratchet-heading">
            <p className="label">The ratchet</p>
            <h2 id="ratchet-heading">Keep the wins. Move one thing.</h2>
            <ol className={styles.ratchet}>
              {ratchet.map((step, index) => (
                <li key={step.title}>
                  <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="different-picture-heading">
            <p className="label">The expensive failure</p>
            <h2 id="different-picture-heading">The model can fix the defect by making a different picture.</h2>
            <p>These <em>fur nor Feather</em> traces make the failure visible. The standing cover is polished. It also abandons the sleeping composition that gave the first candidate its quiet, circular shape. Under a ratchet, polish cannot pay for that regression.</p>
            <p>The labels below describe how the candidates behave against the preservation contract. None of these traces contains a recorded creator score, so none is presented as an approved final.</p>

            <div className={styles.coverSequence} aria-label="Three fur nor Feather repair candidates in chronological order">
              {coverFrames.map((frame) => (
                <figure className={styles.figureCard} key={frame.src}>
                  <p className={styles.status}>{frame.status}</p>
                  <a className={styles.imageLink} href={frame.src} target="_blank" rel="noreferrer" aria-label={`Open ${frame.status.toLowerCase()} at full size`}>
                    <Image src={frame.src} width={1254} height={1254} sizes="(max-width: 720px) calc(100vw - 40px), (max-width: 1100px) 45vw, 340px" alt={frame.alt} />
                  </a>
                  <figcaption>{frame.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section aria-labelledby="references-heading">
            <p className="label">References are production parts</p>
            <h2 id="references-heading">Make each source responsible for something.</h2>
            <p>“Use these references” is not a plan. I assign them jobs. The photograph owns the room and camera. The character sheet owns the face, markings, glasses, and body. The style reference owns the drawing language. When the output drifts, I can ask which source lost the argument.</p>
            <p>For adding a new character to a photographic scene, my current working default is human-first: choose the pose, insert a human stand-in, check scale and floor contact, convert only that person, then compare the result with both the human checkpoint and the original backplate. It costs an extra pass and it can still drift. It is a useful default from our experiments, not a universal law. I am not reproducing that backplate here because the preserved photograph contains real bystanders.</p>
          </section>

          <section aria-labelledby="recognition-heading">
            <p className="label">Three kinds of right</p>
            <h2 id="recognition-heading">The represented person owns the last test.</h2>
            <p>Code can check whether I defined the character well enough to test. A model can compare the result with the references and flag a missing tail, warped glasses, or a room that changed. Neither can decide whether the person in the picture recognizes themself.</p>
            <p>That matters in Bunch, where a portrait can be a recognition surface rather than decoration. A technically accurate picture can still feel like nobody. The human judgment is not an embarrassing gap in the eval. It is the acceptance test the other checks are there to support.</p>
          </section>

          <section className={styles.boundaries} aria-labelledby="boundaries-heading">
            <p className="label">Do not blur the states</p>
            <h2 id="boundaries-heading">A candidate is not canon.</h2>
            <p>If an approved identity reference is missing, the honest state is <code>NEEDS_INFORMATION</code>, not a confident substitute. A generated image is not an approved profile. An uploaded file is not proof that it was saved. A saved image is not proof that it was selected. A selection is not the same as the represented person saying, “Yes, that is me.”</p>
            <p>The distinctions sound fussy until a polished image quietly teaches the wrong face. Keep the states separate. Keep the current best. Let each repair earn the next click.</p>
          </section>

          <section className={styles.reading} aria-labelledby="reading-heading">
            <p className="label">Evidence trail</p>
            <h2 id="reading-heading">The work behind the guide</h2>
            <ul>
              <li><Link href="/blog/the-fox-and-the-eval">The Fox and the Eval</Link> — why code, model, and human judgment all matter.</li>
              <li><Link href="/blog/bunch-part-two">Bunch, Part II: After MVP</Link> — freezing prompts, sources, settings, and output hashes so an eval does not rot.</li>
              <li><Link href="/blog/bunch-part-three">Bunch, Part III: The Group Photo</Link> — staging a multi-person image without inventing missing references.</li>
              <li><ExternalLink href="https://github.com/Arcadesys/furry-image-studio">Furry Image Studio</ExternalLink> — the public prototype behind the workflow.</li>
            </ul>
          </section>
        </article>

        <aside className={styles.download} aria-labelledby="download-heading">
          <p className="label">Free skill download</p>
          <h2 id="download-heading">Download the skill and improve your image generation today.</h2>
          <p>Give this plain-text instruction file to your AI assistant—or paste it into a new conversation—to keep a current best, protect earlier wins, and make one inspectable repair at a time.</p>
          <a
            className="btn btn-gradient"
            href={SKILL_DOWNLOAD_PATH}
            download
            data-funnel-event="image_ratchet_skill_download"
            data-funnel-placement="image_generation_guide"
          >
            Download the image ratchet skill<span aria-hidden="true"> →</span>
          </a>
        </aside>

        <aside className={styles.next} aria-labelledby="next-heading">
          <p className="label">Build the ratchet</p>
          <h2 id="next-heading">Need an image workflow that remembers what already worked?</h2>
          <p>Bring the picture, the protected traits, and the people who have to judge it. We can make the smallest useful loop that preserves earlier wins instead of asking you to remember every one.</p>
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
