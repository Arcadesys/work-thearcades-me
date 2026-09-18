import type { Accent } from './content';

/**
 * The customer-journeys design brief (`/journeys`).
 *
 * Origin: a Claude Design mockup ("Customer Journeys.dc.html") built from a
 * chat about three audiences work.thearcades.me serves. That mockup guessed
 * at parts of the current site it hadn't actually seen — this file corrects
 * those guesses against the real, shipped site as of 2026-09-14, and tracks
 * what's already true, what this pass fixed, and what's still an open call
 * for Austen (mostly pricing/positioning decisions, not code).
 *
 * This page is intentionally unlinked from navigation — it's a working
 * brief, not a public credibility piece, until a decision says otherwise.
 */

export type JourneyStatus = 'resolved' | 'fixed' | 'needs-call';

export const STATUS_LABEL: Record<JourneyStatus, string> = {
  resolved: 'already true',
  fixed: 'fixed this pass',
  'needs-call': 'needs your call',
};

export type JourneyStage = {
  number: string;
  title: string;
  entryPoint: string;
  thinking: string;
  touchpoint: string;
  feeling: { pct: number; word: string; live: boolean };
  status: JourneyStatus;
  note: string;
  metric: string;
};

export type Journey = {
  number: string;
  title: string;
  statusPill: string;
  accent: Accent;
  goal: string;
  stages: JourneyStage[];
  priorityMove: string;
  verifiedAgainst: string;
};

export const journeysIntro = {
  eyebrow: 'work.thearcades.me · design brief',
  heading: 'Three audiences, three paths',
  body: 'One site does three jobs: keep blog readers coming back, get hiring managers to reach out, and turn AI-curious business owners into a first call. This is a working brief, not a finished page — it started as a Claude Design mockup, got checked against what the site actually does, and now tracks what shipped versus what still needs a call from Austen.',
} as const;

export const journeys: Journey[] = [
  {
    number: '01',
    title: 'The reader',
    statusPill: 'leak fixed this pass',
    accent: 'pink',
    goal: 'Someone who reads one post subscribes for the build notes. The writing is the credibility; the list is the conversion.',
    stages: [
      {
        number: '01',
        title: 'Lands on one post',
        entryPoint: 'Search, a shared link, social, a forwarded email',
        thinking: '"this reads like a person, not a content mill"',
        touchpoint: 'A post page arrived at cold',
        feeling: { pct: 68, word: 'curious', live: true },
        status: 'resolved',
        note: 'Already true: the site header and brand mark appear on every post, so a cold arrival always sees what this is and who writes it.',
        metric: 'scroll past 50% on arrival',
      },
      {
        number: '02',
        title: 'Reads it through',
        entryPoint: 'Already on the page — no nav needed',
        thinking: '"this is good — who wrote it?"',
        touchpoint: 'Body copy, tags, back link',
        feeling: { pct: 86, word: 'absorbed', live: true },
        status: 'fixed',
        note: 'Interest peaks mid-read and the old page had no ask until the very end. Post pages now carry an inline build-notes card partway through the piece instead of only at the bottom.',
        metric: 'read-through rate per post',
      },
      {
        number: '03',
        title: 'Wants the next one',
        entryPoint: 'End of post — previously a dead end',
        thinking: '"is there a next one, or do I have to keep checking?"',
        touchpoint: 'End of post',
        feeling: { pct: 30, word: 'stalled', live: false },
        status: 'fixed',
        note: 'Most posts had zero related-content links — only the two or three tied to a case study got any. Every post now closes with a "more like this" block: same series first, shared topics after.',
        metric: 'clicks to a second post',
      },
      {
        number: '04',
        title: 'Subscribes',
        entryPoint: 'Signup form',
        thinking: '"what arrives, and how often?"',
        touchpoint: 'Build-notes signup form',
        feeling: { pct: 80, word: 'committed', live: true },
        status: 'fixed',
        note: 'The form now states the cadence: one email a week. That answers the only open question from the last pass.',
        metric: 'subscribes per 100 readers',
      },
    ],
    priorityMove: 'The mid-read leak is closed: an inline card at the point of peak interest, plus a related-posts block so "what’s next" has an answer. The signup form now states its cadence too — one email a week.',
    verifiedAgainst: 'app/blog/[slug]/page.tsx, app/blog/layout.tsx, components/subscribe-form.tsx, lib/blog.ts, lib/content.ts (2026-09-17)',
  },
  {
    number: '02',
    title: 'The hiring manager',
    statusPill: 'verified — no change needed',
    accent: 'orange',
    goal: 'Someone evaluating you for a role gets what they need and reaches out. This lane already does its job.',
    stages: [
      {
        number: '01',
        title: 'Checks you out',
        entryPoint: 'Résumé link, LinkedIn, a recruiter, a referral',
        thinking: '"is this person real, current, and senior?"',
        touchpoint: 'Home page and bio',
        feeling: { pct: 52, word: 'screening', live: true },
        status: 'resolved',
        note: 'Already true: work.thearcades.me is its own portfolio, entirely separate from the fiction site. Fiction shows up exactly once, as an outbound footer link — nothing competes with role framing on this domain.',
        metric: 'bounce rate on the homepage',
      },
      {
        number: '02',
        title: 'Scans the work',
        entryPoint: 'Nav straight to the work',
        thinking: '"have they done the thing I need done?"',
        touchpoint: 'Selected-work section',
        feeling: { pct: 72, word: 'interested', live: true },
        status: 'resolved',
        note: 'Already true: each case card leads with an outcome (a locked-volume stat, a named accessibility result), not a task list.',
        metric: 'projects opened per visit',
      },
      {
        number: '03',
        title: 'Looks for proof',
        entryPoint: 'A specific project page they were pointed at',
        thinking: '"will the scope and the outcomes hold up in a reference call?"',
        touchpoint: 'Individual project write-ups',
        feeling: { pct: 84, word: 'reassured', live: true },
        status: 'resolved',
        note: 'Already true: every case study is a full Situation/Task/Action/Result write-up, not prose the reader has to mine for proof.',
        metric: 'time on a write-up',
      },
      {
        number: '04',
        title: 'Gets in touch',
        entryPoint: 'Contact page and inbox',
        thinking: '"how do I reach them without a form maze?"',
        touchpoint: 'Contact section',
        feeling: { pct: 92, word: 'decided', live: true },
        status: 'resolved',
        note: 'Already true: a direct mailto CTA, no form maze.',
        metric: 'qualified inbound per month',
      },
    ],
    priorityMove: 'No code change here. The one thing the original mockup flagged — role framing competing with fiction — turned out to already be solved by the site being its own domain. Leave this lane alone.',
    verifiedAgainst: 'app/page.tsx, components/site-header.tsx, lib/content.ts (2026-09-14)',
  },
  {
    number: '03',
    title: 'The business owner who needs AI to make sense',
    statusPill: 'mostly there — one open ask',
    accent: 'amber',
    goal: 'Someone who wants AI explained without buzzwords, so their business runs more smoothly, books a first conversation.',
    stages: [
      {
        number: '01',
        title: 'Hears you explain it',
        entryPoint: 'A talk, a workshop, a warm intro, a blog post that made sense',
        thinking: '"finally, someone explained this without the buzzwords"',
        touchpoint: 'The room, the intro email, your voice',
        feeling: { pct: 88, word: 'relieved', live: true },
        status: 'needs-call',
        note: 'No per-talk landing pages exist yet, so the momentum from a room has nowhere local to land. This needs a real talk or room to name before it’s worth building — tell me the next one and I’ll wire up the route.',
        metric: 'visits from talk landing pages',
      },
      {
        number: '02',
        title: 'Looks for what you do',
        entryPoint: 'Home page, typed in from memory',
        thinking: '"what would they actually do for a business like mine?"',
        touchpoint: '/work-with-me',
        feeling: { pct: 26, word: 'confused', live: false },
        status: 'resolved',
        note: 'Already true: /work-with-me explains AI enablement and websites/apps in plain language, no jargon, with two clear ways to work together. This was the mockup’s biggest wrong guess — it assumed no services page existed.',
        metric: 'services page → contact rate',
      },
      {
        number: '03',
        title: 'Checks it’s been done before',
        entryPoint: 'Projects, LinkedIn, asking a mutual contact',
        thinking: '"has this worked somewhere real, or is it all theory?"',
        touchpoint: '/work-with-me service panels',
        feeling: { pct: 38, word: 'unconvinced', live: false },
        status: 'fixed',
        note: 'The case-study links on /work-with-me pointed to the same write-ups the hiring-manager lane uses, framed for employers. Each service panel now carries a one-line result — pulled from the case study’s own published outcome, not new copy — so the proof reads as a client result, not a résumé bullet.',
        metric: 'reads of a client story',
      },
      {
        number: '04',
        title: 'Books a first call',
        entryPoint: 'Contact form or a booking link',
        thinking: '"what’s the smallest thing I can say yes to?"',
        touchpoint: '/work-with-me first-step and pricing sections',
        feeling: { pct: 44, word: 'hesitant', live: false },
        status: 'needs-call',
        note: 'A 3-step process and sliding-scale pricing are already live, which is smaller-commitment than the mockup’s guess of one fixed-price starter package. Whether you want a single named starter on top of that is a pricing-model call, not a code fix — I didn’t invent one.',
        metric: 'first calls booked per month',
      },
    ],
    priorityMove: 'The real remaining gap is stage 01: no landing page tuned to the room someone just left. Everything downstream of that — the plain-language page, the client-framed proof, the low-commitment first step — already exists or shipped this pass.',
    verifiedAgainst: 'app/work-with-me/page.tsx, lib/content.ts (2026-09-14)',
  },
];

export const journeysFooter = {
  heading: 'Read across the three',
  body: 'All three lanes climb until the site has to make an offer. Lane 02 already makes one and works — verified, not guessed. Lane 01’s mid-read leak and dead-end ending are fixed this pass; only its cadence promise is still open. Lane 03’s plain-language page and client-framed proof already exist or shipped this pass; only a talk to name and a pricing call remain.',
} as const;
