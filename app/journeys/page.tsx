import { Fragment } from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { ExternalLink } from '@/components/external-link';
import { site } from '@/lib/content';
import { journeys, journeysFooter, journeysIntro, STATUS_LABEL, type JourneyStage } from '@/lib/journeys';

// Working design brief, not a public page: kept out of the nav and out of
// search until a decision says it should be either.
export const metadata: Metadata = {
  title: `Customer journeys — ${site.name}`,
  description: journeysIntro.body,
  alternates: { canonical: '/journeys' },
  robots: { index: false, follow: false },
};

const ROW_LABELS = ['entry point', 'thinking', 'touchpoint', 'feeling', 'status', 'win'] as const;

function StatusPill({ status }: { status: JourneyStage['status'] }) {
  return <span className={`journey-status journey-status-${status}`}>{STATUS_LABEL[status]}</span>;
}

export default function JourneysPage() {
  return (
    <div className="journeys-page">
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />

      <main className="shell journeys-main" id="main" tabIndex={-1}>
        <header className="journeys-intro">
          <p className="label kicker"><span className="dot" />{journeysIntro.eyebrow}</p>
          <h1 className="h2">{journeysIntro.heading}</h1>
          <p className="lede">{journeysIntro.body}</p>
        </header>

        {journeys.map((journey) => (
          <section className="journey-section" key={journey.number} data-accent={journey.accent} aria-labelledby={`journey-${journey.number}-title`}>
            <div className="journey-section-head">
              <span className="label journey-lane-label">lane {journey.number}</span>
              <h2 id={`journey-${journey.number}-title`}>{journey.title}</h2>
              <span className="journey-status-pill">{journey.statusPill}</span>
            </div>
            <p className="journey-goal">{journey.goal}</p>

            <p className="label journey-scroll-hint" aria-hidden="true">Scroll sideways for all four stages →</p>
            <div className="journey-grid-scroll">
              <div className="journey-grid">
                <div className="journey-corner" aria-hidden="true" />
                {journey.stages.map((stage) => (
                  <div className="journey-stage-head" key={stage.number}>
                    <span className="label journey-stage-number">{stage.number}</span>
                    <div className="journey-stage-title">{stage.title}</div>
                  </div>
                ))}

                {ROW_LABELS.map((rowLabel) => (
                  <Fragment key={`${journey.number}-${rowLabel}`}>
                    <div className="label journey-row-label">{rowLabel}</div>
                    {journey.stages.map((stage) => (
                      <div className="journey-cell" key={`${journey.number}-${stage.number}-${rowLabel}`}>
                        {rowLabel === 'entry point' && stage.entryPoint}
                        {rowLabel === 'thinking' && <span className="journey-quote">{stage.thinking}</span>}
                        {rowLabel === 'touchpoint' && stage.touchpoint}
                        {rowLabel === 'feeling' && (
                          <>
                            <div className="journey-feeling-track"><div className="journey-feeling-fill" data-live={stage.feeling.live} style={{ width: `${stage.feeling.pct}%` }} /></div>
                            <div className="journey-feeling-word" data-live={stage.feeling.live}>{stage.feeling.word}</div>
                          </>
                        )}
                        {rowLabel === 'status' && (
                          <>
                            <StatusPill status={stage.status} />
                            <p className="journey-note">{stage.note}</p>
                          </>
                        )}
                        {rowLabel === 'win' && <span className="journey-metric">{stage.metric}</span>}
                      </div>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="journey-priority">
              <span className="label journey-priority-label">priority move</span>
              <p>{journey.priorityMove}</p>
            </div>
            <p className="journey-verified label">Verified against {journey.verifiedAgainst}</p>
          </section>
        ))}

        <footer className="journeys-summary">
          <div className="rule" />
          <p className="label">{journeysFooter.heading}</p>
          <p className="lede">{journeysFooter.body}</p>
        </footer>
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
