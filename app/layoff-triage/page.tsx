import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SubscribeForm } from '@/components/subscribe-form';
import { site, newsletter } from '@/lib/content';

const TITLE = 'Career Coach in a Bottle: The Layoff Triage Skill';
const DESCRIPTION = 'A free AI skill that triages a layoff in order: stabilize what’s urgent, name what you learned, find the value you create, and build the smallest opportunity engine — with a one-task emergency command for when it’s too much.';
const DOWNLOAD_PATH = '/downloads/layoff-triage-skill.md';

export const metadata: Metadata = {
  title: `${TITLE} — ${site.name}`,
  description: DESCRIPTION,
  alternates: { canonical: '/layoff-triage' },
  openGraph: { type: 'website', title: TITLE, description: DESCRIPTION },
};

export default function LayoffTriagePage() {
  return (
    <div className="services-page">
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader current="/layoff-triage" />

      <main className="shell services-main" id="main" tabIndex={-1}>
        <div className="services-intro">
          <p className="label kicker"><span className="dot" />Free download</p>
          <h1>{TITLE}</h1>
          {/* eslint-disable-next-line @next/next/no-img-element -- placeholder art; see docs/image-prompts.md */}
          <img src="/images/layoff-triage-hero.svg" alt="" width={1200} height={630} style={{ width: '100%', height: 'auto', borderRadius: 12 }} />
          <p>{DESCRIPTION}</p>
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

        <section className="services-details" aria-labelledby="how-it-works">
          <h2 id="how-it-works">How to use it</h2>
          <ol>
            <li>Download the file above. It&rsquo;s a plain-text skill — no account, no signup.</li>
            <li>Drop it into Claude, ChatGPT, or whatever assistant you use, as a project file, custom instructions, or a pasted system prompt.</li>
            <li>Open with <strong>&ldquo;I was just laid off. Start with tea.&rdquo;</strong> It walks the triage in order. If it ever feels like too much, say <strong>&ldquo;I&rsquo;m overwhelmed&rdquo;</strong> and it will stop and hand you exactly one 15-minute task.</li>
          </ol>
        </section>

        <section className="services-intro" aria-labelledby="where-it-came-from">
          <h2 id="where-it-came-from">Where it came from</h2>
          <p>
            I built this for myself after my second layoff, then wrote up the whole process in{' '}
            <Link href="/blog/when-in-crisis-make-tea">When in crisis, make tea</Link>. It&rsquo;s free because the point isn&rsquo;t
            the download — it&rsquo;s that the next chance to work together starts with something useful, not a cold ask.
          </p>
        </section>

        <div className="subscribe" aria-label="Subscribe">
          <p className="label kicker"><span className="dot" />{newsletter.kicker}</p>
          <h3>{newsletter.heading}</h3>
          <p>{newsletter.body}</p>
          <SubscribeForm placement="layoff_triage_page" />
        </div>
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
