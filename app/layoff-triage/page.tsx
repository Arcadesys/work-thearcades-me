import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SubscribeForm } from '@/components/subscribe-form';
import { site, newsletter } from '@/lib/content';
import { layoffTriageMetadata } from '@/lib/entry-page-metadata';
import styles from './layoff-triage.module.css';

const TITLE = 'Career Coach in a Bottle: The Layoff Triage Skill';
const DOWNLOAD_PATH = '/downloads/layoff-triage-skill.md';

export const metadata: Metadata = {
  title: layoffTriageMetadata.title,
  description: layoffTriageMetadata.description,
  alternates: { canonical: layoffTriageMetadata.canonical },
  openGraph: { type: 'website', title: layoffTriageMetadata.title, description: layoffTriageMetadata.description, url: layoffTriageMetadata.canonical },
};

export default function LayoffTriagePage() {
  return (
    <div className="services-page">
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader current="/layoff-triage" />

      <main className={`shell services-main ${styles.main}`} id="main" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="triage-title">
          <div className={styles.heroCopy}>
            <p className="label kicker"><span className="dot" />Free download</p>
            <h1 id="triage-title">{TITLE}</h1>
            <p className={styles.lede}>A free, downloadable plain-text instruction file for an AI assistant. It helps you work through a layoff in order, beginning with what needs attention now rather than a giant job-search checklist.</p>
            <a
              className="btn btn-gradient"
              href={DOWNLOAD_PATH}
              download
              data-funnel-event="triage_skill_download"
              data-funnel-placement="layoff_triage_page"
            >
              Download the skill<span aria-hidden="true"> →</span>
            </a>
          </div>

          <div className={styles.heroArt} aria-hidden="true">
            <img
              src="/images/layoff-triage-hero.svg"
              alt=""
              width={1200}
              height={630}
            />
          </div>
        </section>

        <section className={styles.contentGrid} aria-label="About the layoff triage skill">
          <article className={styles.card} aria-labelledby="how-it-works">
            <p className={styles.stepLabel}>Three steps</p>
            <h2 id="how-it-works">How to use it</h2>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepNumber} aria-hidden="true">1</span>
                <div>
                  <strong>Download the file.</strong>
                  <p>It&rsquo;s plain text. No account, no signup, no ceremony.</p>
                </div>
              </li>
              <li>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <div>
                  <strong>Give it to your AI assistant.</strong>
                  <p>Use your assistant&rsquo;s documented way to add instructions. If it has no such option, paste the file into a new conversation.</p>
                </div>
              </li>
              <li>
                <span className={styles.stepNumber} aria-hidden="true">3</span>
                <div>
                  <strong>Start with tea.</strong>
                  <p>
                    Say <strong>&ldquo;I was just laid off. Start with tea.&rdquo;</strong> If it gets to be too much,
                    say <strong>&ldquo;I&rsquo;m overwhelmed&rdquo;</strong> and it will hand you exactly one 15-minute task.
                  </p>
                </div>
              </li>
            </ol>
          </article>

          <article className={`${styles.card} ${styles.exampleCard}`} aria-labelledby="example-title">
            <p className={styles.stepLabel}>Illustrative example</p>
            <h2 id="example-title">What the first exchange can look like</h2>
            <p className={styles.exampleLabel}>Starting request</p>
            <blockquote className={styles.exampleQuote}>I was just laid off. Start with tea.</blockquote>
            <p className={styles.exampleLabel}>Illustrative response, derived from the skill</p>
            <blockquote className={styles.exampleQuote}>Before we plan the job search, choose one small task already in reach: make tea, drink water, or take a short walk. When you&rsquo;ve done that, tell me whether there&rsquo;s a deadline you need to handle this week.</blockquote>
            <p className={styles.exampleNote}>The exact wording depends on the assistant and your situation. The file is guidance for a conversation; it does not provide benefits, legal, medical, mental-health, or employment advice.</p>
          </article>

          <aside className={`${styles.card} ${styles.originCard}`} aria-labelledby="what-it-does">
            <p className={styles.stepLabel}>What it covers</p>
            <h2 id="what-it-does">A calm order of operations</h2>
            <p>It starts by separating urgent deadlines from everything that can wait, then helps you name what you learned, identify the value you create, and build the smallest useful opportunity engine.</p>
            <p>Bring what is urgent for you and answer its questions in your own words. If you say you&rsquo;re overwhelmed, it should stop and offer one concrete task that takes 15 minutes or less.</p>
          </aside>
        </section>

        <section className={styles.originSection} aria-labelledby="where-it-came-from">
          <div className={`${styles.card} ${styles.originCopy}`}>
            <p className={styles.stepLabel}>Why this exists</p>
            <h2 id="where-it-came-from">Where it came from</h2>
            <p>
              I built this for myself after my second layoff, then wrote up the whole process in{' '}
              <Link href="/blog/when-in-crisis-make-tea">When in crisis, make tea</Link>.
            </p>
            <p>
              It&rsquo;s free because the point isn&rsquo;t the download. It&rsquo;s that the next chance to work together
              starts with something useful, not a cold ask.
            </p>
          </div>
        </section>

        <section className={styles.subscribeWrap} aria-label="Subscribe">
          <div className="subscribe">
            <p className="label kicker"><span className="dot" />{newsletter.kicker}</p>
            <h3>{newsletter.heading}</h3>
            <p>{newsletter.body}</p>
            <SubscribeForm placement="layoff_triage_page" />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-row label">
          <p>© 2026 {site.name}</p>
          <Link href="/blog">All posts</Link>
        </div>
      </footer>
    </div>
  );
}
