# work.thearcades.me

An independent, static Next.js portfolio for Austen Tucker-Crowder’s AI leadership and building work. It deliberately links out to the existing public creative and publishing site rather than merging those audiences.

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

### 2026-09-12 — Native professional résumé

- **Metric/budget:** one focused pass; Résumé navigation displays the résumé directly at `/resume` on this site, with no redirect or intermediary page.
- **Source:** verified the live `https://www.thearcades.me/resume` against `Arcadesys/arcadeprofile` commit `fffd951ead7911d71e6c83b48ac462aa50164424`, `lib/resume.ts` and its résumé page. The older `content/resume/resume.md` is stale and was not copied. Structured factual content is preserved verbatim; a script checked parity. The existing PDF was downloaded from the live `/resume/pdf` endpoint and is served as `/resume.pdf` here. It is a snapshot and should be refreshed alongside future résumé edits.
- **Keep:** static server-rendered résumé, portfolio header/footer and light/dark tokens, 18px body text, persistent underlined links, 48px link targets, local canonical URL, and same-tab local Résumé navigation on homepage, services and case studies. Case-study links now lead to this portfolio; existing project links retain their original destination.
- **Passed:** lint, production build, whitespace check, preview homepage/services/Bunch navigation to `/resume`, keyboard skip link and 3px focus, dark desktop and light 320px rendering (document 305px, viewport 320px; no overflow). All résumé paragraphs/list items measured 18px. Authenticated Vercel requests return HTTP 200 for `/resume` and HTTP 200/application-pdf for `/resume.pdf`; unauthenticated preview requests encounter Vercel deployment protection rather than an application redirect.
- **Preview:** https://work-thearcades-ctsv6pq5h-austen-tuckers-projects.vercel.app/resume
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
- **Pending acceptance:** provider failure response, stalled-navigation runtime test, measured contrast audit and verified 200% zoom. Do not merge/release until these checks are resolved. Production has not been changed.
- **Measurement:** dedicated form identifies site signups. Report confirmed memberships separately from submissions; no conversion rate without a matching traffic denominator.
- **Preview:** https://work-thearcades-adwtijdha-austen-tuckers-projects.vercel.app

1. **Keep:** warm-paper/dark-text/indigo editorial implementation, typed local content, accessible navigation, and verified external links.
2. **Revise then keep:** the initial mobile breakpoint hid section navigation. The final breakpoint keeps Work, About, Notes, Contact, and View résumé visible with 48px targets.
3. **Keep:** the approved self-description quote and footer. The real Bunch diagram now appears in the related case study, so the selected-work section has a visual break without treating it as an unrelated gallery item.
