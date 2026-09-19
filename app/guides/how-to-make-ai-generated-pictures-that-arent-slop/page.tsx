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

const demoFrames = [
  {
    src: '/images/guides/image-ratchet/sprig-current-best.webp',
    status: 'Starting point',
    alt: 'Blue garden robot Sprig kneels beside a wilted sunflower. Water from the can misses the pot and splashes onto the greenhouse floor.',
    caption: 'Almost everything works: Sprig, the worried pose, the low camera, the warm painted greenhouse, and the wilted flower. One thing does not: the water misses the pot.',
  },
  {
    src: '/images/guides/image-ratchet/sprig-roller-coaster.webp',
    status: 'Roller-coaster rewrite',
    alt: 'A tall mint-green robot stands beside a healthy sunflower in a glossy greenhouse, replacing Sprig, the wilted flower, the low camera, and the painted style.',
    caption: 'The water reaches the flower, but the picture traded away nearly everything else. The fix worked. The image did not.',
  },
  {
    src: '/images/guides/image-ratchet/sprig-local-repair.webp',
    status: 'Ratchet repair',
    alt: 'The original blue robot, wilted sunflower, low greenhouse view, and painted style remain while the water now lands inside the pot.',
    caption: 'The water now lands in the pot. Sprig, the pose, the flower, the camera, the light, and the medium stay put. One visible problem changed.',
  },
] as const;

const referenceFrames = [
  {
    src: '/images/guides/image-ratchet/sprig-composition-source.webp',
    width: 1200,
    height: 900,
    status: 'Job 1: Where things go',
    alt: 'Loose gray storyboard showing a generic kneeling figure at left and a drooping sunflower at right inside a greenhouse.',
    caption: 'This rough sketch owns the camera, pose, scale, and first place the eye lands. It says nothing about who the character is or how the final should be painted.',
  },
  {
    src: '/images/guides/image-ratchet/sprig-identity-source.webp',
    width: 1200,
    height: 800,
    status: 'Job 2: Who Sprig is',
    alt: 'Model sheet of Sprig showing the same round blue body, single amber eye, triangle antenna, yellow apron, leaf patch, grippers, and boots from several angles.',
    caption: 'This sheet owns Sprig’s identity. It does not decide the greenhouse layout, action, camera, or final texture.',
  },
  {
    src: '/images/guides/image-ratchet/sprig-style-source.webp',
    width: 1200,
    height: 900,
    status: 'Job 3: How it feels',
    alt: 'Greenhouse style board with layered paper leaves, gouache brush texture, terracotta pots, warm gold light, and cool teal shadows.',
    caption: 'This board owns the handmade paper-and-paint look, palette, and light. It deliberately contains neither Sprig nor the final composition.',
  },
] as const;

const ratchet = [
  {
    title: 'Save the version you like best',
    body: 'Call it the current best and keep it where you can see it. Newer does not mean better, and a new image should never quietly replace the last one that worked.',
    example: 'The first Sprig image is the current best. The missed water is annoying, but the picture already has a clear character, action, camera, and mood.',
    prompt: 'This is my current best. Do not generate or edit anything yet. Treat this image as the version to beat, and confirm which image you are using as the baseline.',
  },
  {
    title: 'Write a short keep-list',
    body: 'Name three to six things you would be upset to lose. Use plain, visible facts: the blue one-eyed robot, kneeling on the left, the drooping flower on the right, the low camera, and the paper-and-paint finish.',
    example: 'A keep-list turns “I liked the old one more” into a comparison you can actually make.',
    prompt: 'Before editing, write a keep-list of three to six visible things that already work. For this image, protect Sprig’s blue one-eyed design, the kneeling pose on the left, the drooping flower on the right, the low camera, and the paper-and-paint finish.',
  },
  {
    title: 'Ask for one change you can point to',
    body: '“Make it better” gives the model permission to remake the whole picture. A useful instruction names one visible result and leaves the rest alone.',
    example: 'For Sprig: “Make the water land inside the pot. Keep everything else the same.” We can tell whether that happened without debating taste.',
    prompt: 'Change only the water stream so it lands inside the flowerpot. Remove the splash where it hit the floor. Keep every item on the keep-list unchanged.',
  },
  {
    title: 'Give every reference one job',
    body: 'Do not toss several images into the prompt and call them inspiration. Say what each one controls: where things go, what the subject looks like, or how the final image should feel.',
    example: 'The gray sketch owns the layout. The model sheet owns Sprig. The painted board owns texture and light. If Sprig turns green, we know the identity reference lost.',
    prompt: 'Use Reference 1 only for the camera, layout, and pose. Use Reference 2 only for Sprig’s identity and proportions. Use Reference 3 only for the paper-and-paint texture, palette, and light. Do not let one reference overwrite another reference’s job.',
  },
  {
    title: 'Put the two versions side by side',
    body: 'First check the change you asked for. Then walk down the keep-list. Looking at only the new image makes drift easy to miss because the new version may still be attractive.',
    example: 'The glossy green-robot version fixes the water. Side by side, it also reveals five stolen wins: character, pose, flower, camera, and medium.',
    prompt: 'Compare the new image with the current best. First say whether the requested change worked. Then check every keep-list item. Report three short lists: Improved, Preserved, and Drifted. Do not judge the new image by itself.',
  },
  {
    title: 'Keep the new one only if it really wins',
    body: 'The new image becomes your current best only when the requested change improved and the keep-list still holds. If it fixed one thing by breaking three others, keep the old image and try again.',
    example: 'The localized Sprig repair wins because the water moves into the pot while the rest of the picture remains recognizably the same.',
    prompt: 'Give this version one verdict: KEEP, REVISE, or DISCARD. Choose KEEP only if the requested change improved and every keep-list item survived. If you choose REVISE, name the single next repair. If you choose DISCARD, keep the old current best.',
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
          <p className={styles.lede}>Treat your image workflow like a ratchet, not a roller coaster.</p>
          <p className={styles.scope}>Keep the best version you have. Change one thing. Keep the new version only if it fixes the problem without breaking what you already liked.</p>
        </header>

        <article className={styles.article}>
          <section aria-labelledby="demo-heading">
            <p className="label">Start with the comparison</p>
            <h2 id="demo-heading">One small fix. Two very different outcomes.</h2>
            <p>Sprig is a fictional garden robot built for this guide—no private portrait or personal identity is hiding underneath. In the starting image, Sprig is trying to save a wilted sunflower, but the water misses the pot.</p>
            <p>A roller-coaster workflow asks for a better picture and hopes. It gets a healthy flower, plus a different robot, pose, camera, mood, and medium. A ratchet workflow moves the water and leaves the picture alone.</p>

            <div className={styles.demoComparison} aria-label="Starting image, broad rewrite, and localized repair">
              {demoFrames.map((frame) => (
                <figure className={styles.figureCard} key={frame.src}>
                  <p className={styles.status}>{frame.status}</p>
                  <a className={styles.imageLink} href={frame.src} target="_blank" rel="noreferrer" aria-label={`Open ${frame.status.toLowerCase()} at full size`}>
                    <Image src={frame.src} width={1200} height={900} sizes="(max-width: 820px) calc(100vw - 40px), 340px" alt={frame.alt} loading="eager" />
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
                    <p className={styles.stepExample}><strong>In this demo:</strong> {step.example}</p>
                    <p className={styles.promptLabel}>Sample prompt</p>
                    <pre className={styles.samplePrompt}><code>{step.prompt}</code></pre>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="references-heading">
            <p className="label">Three sources, three jobs</p>
            <h2 id="references-heading">Tell the model what to borrow from each image.</h2>
            <p>A reference is easier to follow when it has one clear responsibility. For the Sprig demo, the first source decides where everything goes. The second decides who Sprig is. The third decides how the picture is painted. None of them has to solve the whole image.</p>

            <div className={styles.referenceSequence} aria-label="Three source images with separate production jobs">
              {referenceFrames.map((frame) => (
                <figure className={styles.figureCard} key={frame.src}>
                  <p className={styles.status}>{frame.status}</p>
                  <a className={styles.imageLink} href={frame.src} target="_blank" rel="noreferrer" aria-label={`Open ${frame.status.toLowerCase()} at full size`}>
                    <Image src={frame.src} width={frame.width} height={frame.height} sizes="(max-width: 820px) calc(100vw - 40px), 340px" alt={frame.alt} />
                  </a>
                  <figcaption>{frame.caption}</figcaption>
                </figure>
              ))}
            </div>

            <p>For adding a new character to a photographic scene, my current working default is human-first: choose the pose, insert a human stand-in, check scale and floor contact, convert only that person, then compare the result with both the human checkpoint and the original backplate. It costs an extra pass and it can still drift. It is a useful default from our experiments, not a universal law. I am not reproducing that backplate here because the preserved photograph contains real bystanders.</p>
          </section>

          <section aria-labelledby="recognition-heading">
            <p className="label">Three kinds of right</p>
            <h2 id="recognition-heading">The represented person owns the last test.</h2>
            <p>Code can check whether I defined the character well enough to test. A model can compare the result with the references and flag a missing tail, warped glasses, or a room that changed. Neither can decide whether the person in the picture recognizes themself.</p>
            <p>That matters in Bunch, where a portrait can be a recognition surface rather than decoration. A technically accurate picture can still feel like nobody. The human judgment is not an embarrassing gap in the eval. It is the acceptance test the other checks are there to support.</p>
          </section>

          <section className={styles.boundaries} aria-labelledby="boundaries-heading">
            <p className="label">Keep the labels simple</p>
            <h2 id="boundaries-heading">A draft is not a final.</h2>
            <p><strong>Generated</strong> means the tool made something. <strong>Saved</strong> means you kept the file. <strong>Chosen</strong> means you picked it. <strong>Approved</strong> means the person or client who matters said yes. Those are four different moments.</p>
            <p>If the right reference is missing, stop and ask for it. If nobody has approved the image, call it a draft. A polished picture can still be the wrong picture.</p>
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
