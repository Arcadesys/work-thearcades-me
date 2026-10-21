# work.thearcades.me

An independent, static Next.js portfolio for Austen Tucker-Crowder’s AI engineering, enablement, and building work. It deliberately links out to the existing public creative and publishing site rather than merging those audiences.

## Run locally

```bash
npm install
npm run dev
```

## Deployment and handoff

- Production project: `austen-tuckers-projects/work-thearcades-me` on Vercel.
- Active custom production URL: `https://work.thearcades.me`.
- Vercel production URL: `https://work-thearcades-me.vercel.app`.
- The GitHub repository is connected to Vercel. Pushes to `main` create production deployments; other branches create previews.

For a manual production deploy from this checkout:

```bash
vercel --prod --scope austen-tuckers-projects
```

For a concise handoff to Claude Code, open this repository and start with:

```bash
git status --short --branch
npm run lint
npm run build
```

## Source record

- Résumé and verified employment claims: `https://www.thearcades.me/resume` and the source repository’s `content/resume/resume.md`.
- Bio, contact details, and published-writing history: `https://www.thearcades.me/bio` and `https://www.thearcades.me/bibliography`.
- Published notes and their URLs: the existing public Arcades’ Lab archive.
- Bunch diagram: copied from the canonical writing archive at `blog/arcadesblog/assets/bunch-data-model.png`; its source is the published Bunch build note.

## Intentional omissions

- No professional headshot was found in the approved sources. The existing illustrated creative-site avatar was not used as a substitute.
- No verified employer logos or LinkedIn URL were found, so no logo strip or LinkedIn control is present.
- The pull quotation and its footer are supplied self-description from the approved wireframe; they are not represented as an externally sourced quotation.

## Iteration log

### 2026-10-13 — Private jobs cockpit moved to job-search-harness

- The private jobs cockpit, its APIs, GitHub sign-in, local jobdesk, migrations, and jobs tests now live in [Arcadesys/job-search-harness](https://github.com/Arcadesys/job-search-harness), split with filtered history. The local jobdesk already runs from that repo; this site no longer serves `/jobs` or `/api/jobs`.
- Removed the discovery cron, the jobs-only dependencies and scripts, the CI jobdesk step, and the truth-seed parity check (the harness keeps those seeds as a frozen snapshot).
- Kept the `/jobs` robots disallow and the analytics rules that drop jobs paths, so old URLs stay unindexed and untracked.
- The cockpit case study and its markdown edition now link to the harness repository.

### 2026-09-30 — Builder origin story, following #85

- The author's latest direction supersedes the September 25 enablement-led framing: program ownership was a route toward making things; AI now lets them carry more of the work directly from prototype to working system. The approved introduction lands on “I’m hooked.”
- Lead with hands-on AI building across hero, contact, résumé, search/social metadata, services-role copy, and `llms.txt`. Put Bunch and the cockpit before the ActiveCampaign case while retaining its attributed adoption result and all employment evidence.
- Keep the distinction between AI expanding building capacity and starting from no coding experience: the Guaranteed Rate JavaScript story remains intact. Do not invent production-scale numbers or tailor to an unconfirmed employer role.
- Regenerate the two-page résumé from the same factual record. This is a narrative revision, not a rewritten employment history or a production-release request.

### 2026-09-30 — Hiring path and evidence clarity

- Kept the approved “AI enablement leader who builds” lane and made it the visible hero headline. Adoption proof, selected work, the technical tour, and résumé are grouped at the top; collapsed navigation keeps hiring shortcuts available.
- Promoted Bunch's existing demo and technical tour, clarified public source rights without changing a licence, and added role/context/system summaries across the case studies.
- Restored the author-confirmed Senior Program Owner title at ActiveCampaign, expanded concrete responsibilities from the author's career account, and preserved the limits on shared outcomes and personal observations.
- Reworked the public résumé into a two-page PDF with recent experience on page 1 and linked AI builds. Full underlying résumé-claim arrays stay ordered to protect private claim identities.
- Moved role contact before writing/newsletter material and curated the enablement case study's related reading. Private routes, analytics boundaries, and subscription behavior are unchanged.
- Rationale, source boundaries, and remaining evidence gaps: [`docs/hiring-portfolio-review.md`](docs/hiring-portfolio-review.md). Exact checks and browser QA limits are recorded in the draft PR; publication remains separate.

### 2026-09-25 — Job-search cockpit case study; blog dates audited

- **Metric and budget:** (1) blog posts show their real original publication dates, with nothing invented; (2) one new case study at `/work/job-search-cockpit`, every claim traceable to code, tests, or docs in this repo; no private data. One PR.
- **Blog dates — no change, by evidence:** the nine posts sharing `2026-09-12T16:55:26.466Z` were unpublished drafts in `Arcadesys/writing-archive` (`sourceStatus: draft` in `content/blog-sources.json`); `content/README.md` records that they received their first publication date on this site. The shared timestamp is their true publication history, and `AGENTS.md` forbids rewriting it.
- **Case study:** `lib/content.ts` `cockpit-case`, rendered by the existing `/work/[slug]` page. Evidence items are checked against `lib/job-drafting.ts` (the model returns claim IDs only; drafts are assembled from exact reviewed claim text; verified postings required; monthly budget closes on unmeasured calls), `docs/jobs-mcp-api.md` (hashed 90-day tokens, no submit endpoint, idempotent receipts), `lib/resume-truth.ts` (append-only claim versions), and the jobs tests. It makes no outcome claims. Linked from the homepage (third card), `llms.txt`, and the sitemap (automatic).
- **Tests:** `lib/metadata.test.ts` now checks the new study's search title, self-canonical, and heading.
- **Passed:** lint (3 pre-existing warnings, 0 errors), `npm test` 101/101, production build. Local production server at 1440px and 390px: canonical and `og:url` are `https://work.thearcades.me/work/job-search-cockpit`, 0px overflow, homepage order enablement → Bunch → cockpit → Guaranteed Rate, sitemap and `llms.txt` list the page.

### 2026-09-25 — Lane 1 positioning: AI enablement leader who builds

- **Decision (Austen):** lead with "AI enablement leader who builds" instead of "hands-on AI engineer". The strongest proof (2% → 43% agentic-coding adoption, three-continent roadshow, Devin KPIs) is enablement-leader proof; the builds (Bunch, Wavelength, evals, this site) are the differentiator.
- **Metric and budget:** every headline surface leads with the new lane, no new factual claims, one PR.
- **Changed:** homepage H1, hero intro, CTAs, contact copy and work-section heading; homepage and OG metadata; résumé title line, summary, description and CTAs; `/work-with-me` role line, role CTA and search title; `llms.txt` heading. `public/resume.pdf` regenerated from `lib/resume.ts`.
- **Homepage order:** the ActiveCampaign enablement case now leads, then Bunch, then Guaranteed Rate, each as a full-width row (`.case-wide`) so no card sits alone in a half-width column.
- **Deliberately unchanged:** blog and newsletter copy still say "AI engineering" as a topic — they are build logs, and they prove the "who builds" half. No bracketed official job title was added to the ActiveCampaign role because the formal title is not in the source record.
- **Passed:** lint (3 pre-existing warnings, 0 errors), `npm test` 101/101, production build. Local production server at 1440px and 390px: new H1/title rendered, three full-width case cards, 0px horizontal overflow; résumé renders the new title line and description.

### 2026-09-19 — Builder positioning and practical image guide

- Aligned the homepage, default résumé, consulting page, and search metadata around hands-on AI engineering work and focused consulting while retaining leadership accomplishments as evidence.
- Published `/guides/how-to-make-ai-generated-pictures-that-arent-slop`, linked it from the blog, and gave it a canonical URL, structured data, sitemap entry, and route-specific social card.
- Rebuilt `public/resume.pdf` from `lib/resume.ts` with `python3 scripts/generate-resume-pdf.py`; refresh the PDF whenever the shared résumé source changes.
- `/journeys` now returns 404 because it contains internal working notes. Its historical source remains in `lib/journeys.ts` and it remains excluded from the sitemap and blocked in `robots.txt`.

### 2026-09-14 — Customer journeys design brief + three-lane fixes

- **Origin:** a Claude Design mockup (`Customer Journeys.dc.html`, handed off via a coding-agent bundle) mapped three audiences — blog readers, hiring managers, AI-consulting leads — as a four-stage journey each. It was built from a chat, without checking the live site, and got some things wrong as a result.
- **Metric and budget:** reconcile the mockup against the real site, ship the journey map as an internal design brief plus the mechanical fixes it justified, and flag the copy/positioning calls that are Austen's to make, not code to guess at. One bounded pass, one PR.
- **`/journeys` (new, unlisted):** the three-lane brief, rebuilt on the site's real design tokens (not a copy of the mockup's standalone dark-only CSS), with each stage marked already-true / fixed-this-pass / needs-your-call instead of restating the mockup's original guesses. Deliberately kept out of nav and out of search (`robots: noindex`) — it's a working brief, not a credibility piece, until that's a decision someone makes on purpose.
- **Reconciliation found the mockup wrong twice:** it assumed no services page existed (`/work-with-me` has covered this since September 12) and that fiction competes with role framing on this domain (it doesn't — separate domain, one outbound footer link). Both lanes needed zero code change; the brief says so plainly rather than "fixing" things that already work.
- **Lane 01 (blog reader) — fixed:** post pages had no subscribe ask before the very end and almost no related-content links (only the 2–3 posts tied to a case study got one). Added an inline build-notes card partway through each post (`lib/blog.ts#splitAtReadingPeak`, a paragraph-boundary split near the 60% character mark) and a "More like this" block (`lib/blog.ts#relatedReading`) — same named project first, shared topic tags after. Series matching uses the existing `projectTags` mapping by slug, not tag-string overlap, because a generic tag can coincidentally equal a project name (`ai-enablement` shows up as both a real project association and a plain topic tag) — see the standing comment on `projectTags` in `lib/blog.ts`. Left the actual send-cadence claim alone: the form still doesn't say how often build notes go out, and I'm not inventing a cadence on Austen's behalf.
- **Lane 03 (AI consulting lead) — fixed:** `/work-with-me`'s case-study links were framed for employers (same links the hiring-manager lane uses) with no result stated up front. Each service panel now carries a one-line proof quote pulled from the case study's own published `principle` field — no new claims, existing approved copy reused in a new spot. Link text changed from a bare title to "See how it played out" (not "client result" — neither example is a paid client engagement, and the site doesn't claim they are).
- **Explicitly not done — needs Austen, not code:** per-talk landing pages (no talk to name yet — tell me the next one and I'll wire up the route) and whether to add a single named fixed-price starter package on top of the sliding-scale pricing already live (a pricing-model decision, not a bug).
- **Passed:** lint, production build (all 51 routes including `/journeys`), `lib/blog.test.ts`. Manually verified in a local production server: `/journeys` renders correctly in both light and dark (screenshot-checked at desktop and 390px), the inline subscribe card and related-reading block appear on a real post, and the `/work-with-me` proof line renders under each service.
- **Boundary:** this is a design brief and the three fixes it justified — not the full redesign the brief points at. No pricing or new-page copy was invented. Production release is separate from this review.

### 2026-09-12 — Native professional résumé

- **Download button refinement:** promoted the PDF link to the existing gradient button style, with 18px text, a minimum 48px target, keyboard focus, and native download behavior. Lint/build passed; preview measured 51px button height and 18px text with visible keyboard focus.

- **Metric/budget:** one focused pass; Résumé navigation displays the résumé directly at `/resume` on this site, with no redirect or intermediary page.
- **Source:** verified the live `https://www.thearcades.me/resume` against `Arcadesys/arcadeprofile` commit `fffd951ead7911d71e6c83b48ac462aa50164424`, `lib/resume.ts` and its résumé page. The older `content/resume/resume.md` is stale and was not copied. Structured factual content is preserved verbatim; a script checked parity. The existing PDF was downloaded from the live `/resume/pdf` endpoint and is served as `/resume.pdf` here. It is a snapshot and should be refreshed alongside future résumé edits.
- **Keep:** static server-rendered résumé, portfolio header/footer and light/dark tokens, 18px body text, persistent underlined links, 48px link targets, local canonical URL, and same-tab local Résumé navigation on homepage, services and case studies. Case-study links now lead to this portfolio; existing project links retain their original destination.
- **Passed:** lint, production build, whitespace check, preview homepage/services/Bunch navigation to `/resume`, keyboard skip link and 3px focus, dark desktop and light 320px rendering (document 305px, viewport 320px; no overflow). All résumé paragraphs/list items measured 18px. Authenticated Vercel requests return HTTP 200 for `/resume` and HTTP 200/application-pdf for `/resume.pdf`; unauthenticated preview requests encounter Vercel deployment protection rather than an application redirect.
- **Preview:** https://work-thearcades-cmi3m61xi-austen-tuckers-projects.vercel.app/resume
- **Boundary:** review only; production release and removing the original résumé remain separate. No essays migrated. The résumé retains its canonical source contact details; the rest of the site's contact settings are unchanged.

### 2026-09-12 — Work with me

- **Metric and budget:** one bounded implementation pass; visitors can discover both services and reach the existing 30-minute calendar. Deliver one PR and preview; production release is separate.
- **Keep:** static `/work-with-me` page with the approved AI enablement and website/app offers, negotiable sliding-scale pricing, current case-study examples, and three booking links from `site.bookingUrl`. Copy lives in `lib/content.ts`. Header and Contact entries preserve the newsletter-focused homepage.
- **Passed:** lint and production build (new route prerendered); exact title, description and canonical; homepage header and Contact navigation; both case-study links and their return navigation. All three booking buttons opened the existing Cal.com 30-minute meeting page in Chrome; no booking submitted.
- **Accessibility checks:** light/dark desktop and 320 CSS-pixel rendering; two panels on wide screens and one on narrow screens; no horizontal document overflow or hidden navigation. Actual Chrome zoom was set to 200% and confirmed in the browser toolbar (devicePixelRatio 2, viewport 932px, document 924px); navigation remained visible. Keyboard Tab traversal reached the header and booking action with visible 3px focus outlines. Main paragraphs/list items measure 18px; navigation, examples and booking controls have minimum 48px targets. Reduced-motion emulation reports automatic scrolling and no animations in the new content.
- **Targeted contrast:** resolved colors give body/panel contrast 11.03:1 dark and 13.44:1 light. Gradient endpoint minima: button text 6.09:1 dark / 5.26:1 light; button boundaries 5.58:1 dark / 5.50:1 light. Links are underlined and current navigation uses `aria-current` plus an underline.
- **Limits:** these are targeted rendered checks, not a full site accessibility certification. Existing newsletter behavior and its earlier acceptance record are outside this change. Production has not been released.
- **Preview:** https://work-thearcades-9xo44polg-austen-tuckers-projects.vercel.app/work-with-me — ready; homepage-to-page navigation, rendered layout, title and canonical verified on the deployment.

### 2026-09-12 — AI practice newsletter funnel

- **Keep:** clearer build-notes promise, signup before comments and after every case study, visible email label, 48px controls, readable feedback, and sticky-header anchor clearance. Personal hero and system appearance retained.
- **Integration:** dedicated ActiveCampaign form 11, `work.thearcades.me — AI / Career`, subscribes only to list 20 with opt-in confirmation enabled. Routing fields copied from the generated full embed. The site uses its native POST action rather than the embed's JSONP enhancement; ActiveCampaign owns the resulting confirmation/error page. No API key, custom endpoint, or simulated success state. A cancelled navigation unlocks retry after 20 seconds without claiming whether the provider received the request.
- **Provider configuration:** confirmation campaign 262/message 302 names the build notes, preserves the existing sender and confirmation tokens in HTML/plain text. Form acknowledgment distinguishes request from confirmed subscription. Native email designer adds a duplicate address footer; cosmetic cleanup remains.
- **Automation audit:** active automation 19 notifies the administrator for any list; 28 targets the Parties form; 29 targets the Mabon list. No subscriber drip applies to the new form/list. Existing automations were not modified.
- **Passed:** lint, production build, TypeScript, whitespace checks; local light/dark desktop and 320px signup rendering; homepage anchor visibility; invalid email; deployed preview homepage-to-case navigation and keyboard empty-field validation.
- **Double opt-in verified:** authorized test inbox submitted through the homepage preview on September 12. Provider acknowledgment correctly requested email confirmation; contact 1/list membership 308 was status 0 (unconfirmed), attributed to form 11/list 20. Confirmation email arrived in Mail with the correct subject and link. Following the link changed that same membership to status 1 (active). Repeat submission through the AI-enablement case study returned the confirmed page and retained contact 1 with one active list-20 membership; the provider replaced membership 308 with 309.

### Newsletter contacts and confirmation

Work build notes use Resend Contacts. Signup first checks the exact address against the contact, topic preference, and suppression APIs. The site sends a first-party confirmation email and creates or updates the `Work / AI` topic subscription only after the reader explicitly confirms. This preserves the existing site consent step and replaces Kit’s second confirmation with the site’s existing first-party verification. Contacts that are unsubscribed or present in Resend suppression records are never resubscribed. The visible unsubscribe page and RFC 8058 one-click endpoint mark the Resend contact and its `Work / AI` topic unsubscribed.

`gh pr list --repo Arcadesys/arcadeprofile --state all --search "Kit Resend"` found no Kit-removal PR. The topic label assumption is `Work / AI`, matching the existing source label in the companion site checkout; confirm that exact topic name and ID against its migration PR before merge. Resend now calls these preferences Topics; Audiences is deprecated.

Required Vercel Production variables (also see `.env.example`):

- `RESEND_API_KEY`: Sending-access key restricted to the verified `mail.thearcades.me` domain; it can send email only.
- `RESEND_CONTACTS_API_KEY`: Full-access key for contact reads/writes, topic subscriptions, and suppression lookup; Resend currently offers only `full_access` or `sending_access`, so contact operations require a full-access key.
- `RESEND_FROM_EMAIL=austen@mail.thearcades.me`.
- `RESEND_WORK_AI_TOPIC_ID`: UUID of the `Work / AI` topic in Resend.
- `KIT_LEGACY_UNSUBSCRIBE_API_KEY`: temporary, unsubscribe-only compatibility for Kit welcome emails delivered before this migration. It keeps their old RFC 8058 endpoint and visible link working. Do not use it for signup or sending; remove it and `/api/kit/unsubscribe` after those old links no longer need support.
- `SIGNUP_LINK_SECRET`: at least 32 UTF-8 bytes.
- Redis REST credentials: either `UPSTASH_REDIS_REST_URL` plus `UPSTASH_REDIS_REST_TOKEN`, or `KV_REST_API_URL` plus `KV_REST_API_TOKEN`; a complete Upstash pair takes precedence.
- `WORK_WELCOME_ENABLED=true` is optional and remains unset by default; signup verification email delivery does not depend on it. `VERCEL_ENV` and `VERCEL_URL` are supplied by Vercel and are used only to validate preview links.

Merge order is gated: the owner imports the existing Kit list into Resend first using the runbook in the companion `thearcades.me` migration PR, confirms the `Work / AI` topic and required Vercel variables, then merges this PR. Do not merge this PR before that import is complete. Keep `KIT_LEGACY_UNSUBSCRIBE_API_KEY` available until previously delivered Kit welcome-email links no longer need support; it is used only to unsubscribe legacy subscriber IDs. No live provider calls, email, environment changes, or deployment are part of this change.

Resend references: [Create Contact](https://resend.com/docs/api-reference/contacts/create-contact), [Retrieve Contact](https://resend.com/docs/api-reference/contacts/get-contact), [Update Contact](https://resend.com/docs/api-reference/contacts/update-contact), [Retrieve Contact Topics](https://resend.com/docs/api-reference/contacts/get-contact-topics), [Update Contact Topics](https://resend.com/docs/api-reference/contacts/update-contact-topics), [Retrieve Suppression](https://resend.com/docs/api-reference/suppressions/get-suppression), [Send Email](https://resend.com/docs/api-reference/emails/send-email), [API keys](https://resend.com/docs/api-reference/api-keys/create-api-key), [Topics](https://resend.com/docs/api-reference/topics/create-topic), [Audiences deprecation](https://resend.com/blog/new-contacts-experience).
1. **Keep:** warm-paper/dark-text/indigo editorial implementation, typed local content, accessible navigation, and verified external links.
2. **Revise then keep:** the initial mobile breakpoint hid section navigation. The final breakpoint keeps Work, About, Notes, Contact, and View résumé visible with 48px targets.
3. **Keep:** the approved self-description quote and footer. The real Bunch diagram now appears in the related case study, so the selected-work section has a visual break without treating it as an unrelated gallery item.
