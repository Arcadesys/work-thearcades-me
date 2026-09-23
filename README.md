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

### 2026-09-23 — Kit Work build notes verification flow

- **Two explicit confirmations:** `/api/kit/subscribe` checks the exact address against Kit's all-status lookup to suppress bounced, cancelled, and complained addresses, then records an expiring challenge in Upstash and requests a one-time Postmark verification email. This preflight sends the address to Kit's lookup API but makes no subscriber, form, or tag writes. The message link puts the signed token in the URL fragment; page load clears it from browser history, and only the visitor's explicit button submits it. After verification, an already-active subscriber is added to the Work form and `Interest: Work / AI` tag. A new/inactive subscriber is added to the double-opt-in Work form and enters the private delayed-tag queue; Kit can send a second confirmation email. A Work welcome is sent only after the explicit link and Kit reports the subscriber as active, and only when `WORK_WELCOME_ENABLED=true`; the gate defaults off even if reconciliation is enabled. Imported contacts alone are never mailed. A keyed digest in Redis guards one welcome attempt per address across repeat signup requests; if Postmark definitively rejects the message, the claim can be retried, while an uncertain result is retained permanently to prevent a duplicate. The welcome message includes RFC 8058 `List-Unsubscribe` headers that POST to Kit's subscriber-unsubscribe API, plus a visible fallback link to a page that requires an explicit button; GET never changes Kit state. Both paths use a signed subscriber-ID/email-digest token and no email address in the link. The required Kit referrer is the fixed canonical `https://work.thearcades.me/blog`, with no visitor URL or query values. Kit's 200 already-added response counts as accepted for idempotent retries. Definite verification-email rejection cancels the challenge and allows retry; a network or malformed-response uncertainty keeps the challenge usable because Postmark may already have accepted the message. The generic response asks the visitor to retry after ten minutes if no email arrives.
- **Private challenge state:** server-only configuration is `KIT_API_KEY`, `KIT_FORM_ID` (Work form 9953061), `KIT_WORK_TAG_ID` (Work tag 23806915), `SIGNUP_LINK_SECRET` (at least 32 UTF-8 bytes), `POSTMARK_SERVER_TOKEN`, `POSTMARK_FROM_EMAIL`, `POSTMARK_TRANSACTIONAL_STREAM=outbound`, and Upstash Redis REST credentials. `WORK_WELCOME_ENABLED=true` is a separate default-off gate for welcome mail in both immediate and delayed activation; keep it unset until authorized preview acceptance. Setting `KIT_RECONCILE_ENABLED=true` does not enable welcomes. Configure either `UPSTASH_REDIS_REST_URL` plus `UPSTASH_REDIS_REST_TOKEN`, or the Vercel Marketplace pair `KV_REST_API_URL` plus `KV_REST_API_TOKEN`; a complete `UPSTASH_REDIS_REST_*` pair takes precedence. Preview verification mail uses `VERCEL_URL` only when `VERCEL_ENV=preview` and the value is a validated `*.vercel.app` hostname; production links always use `https://work.thearcades.me`. Redis holds an HMAC email lookup key, AES-GCM encrypted email only until explicit verification, a token digest, and then only a Kit subscriber ID for delayed confirmation. A persistent keyed email digest prevents repeated welcome sends without storing the address. Links expire after 24 hours. A 10-minute per-address mail cooldown and an hourly coarse IP request limit use keyed digests only; raw IP addresses are not written to Redis. Verified DOI records remain for up to 30 days; retries are idempotent. Provider credentials and responses are never logged.
- **Delayed tag reconciliation:** Vercel cron `/api/kit/reconcile-confirmations` consumes only subscriber IDs enqueued by the explicit verification POST. It never reads raw active form membership as proof of confirmation. It tags only when Kit's subscriber endpoint reports `active`, and suppresses terminal bounced/cancelled/complained states. The cron is fail-closed unless `KIT_RECONCILE_ENABLED=true` and requires `CRON_SECRET`. Keep the gate unset until Upstash and all server env are provisioned and the operator intentionally enables reconciliation; while disabled, a contact who completes Kit's second DOI can remain untagged. Do not use the old form-membership reconciliation logic.
- **Analytics and privacy:** `subscribe_submit_intent` measures submission intent. `subscribe_request_accepted` fires only after Kit accepts the form-add or tag request following the explicit verification click. Events include no email, link token, form values, full URL, or query. Existing PostHog policy allows production collection only on exact host `work.thearcades.me` and strips unknown URL paths. Postmark link tracking is disabled.
- **Checks and limits:** focused tests cover challenge privacy/replay shape, request-vs-confirm ordering, blocked states, verified queue boundaries, idempotent retry, and default-off reconciliation. Browser tests cover keyboard signup, fragment removal, inert page load, second Kit confirmation copy, and mobile/200%-equivalent reflow. No live email, Kit call, Upstash provision, PostHog receipt, or deployment was performed for this code change. The integration fails closed until its env is present.
- **References:** [Kit create subscriber](https://developers.kit.com/api-reference/subscribers/create-a-subscriber), [Kit exact subscriber lookup](https://developers.kit.com/api-reference/subscribers/list-subscribers), [Kit add form member](https://developers.kit.com/api-reference/forms/add-subscriber-to-form), [Kit tag subscriber](https://developers.kit.com/api-reference/tags/tag-a-subscriber), [Kit unsubscribe subscriber](https://developers.kit.com/api-reference/subscribers/unsubscribe-subscriber), [Postmark email API](https://postmarkapp.com/developer/api/email-api), [Postmark List-Unsubscribe setup](https://postmarkapp.com/support/article/1299-how-to-include-a-list-unsubscribe-header), [Upstash Redis scripts](https://upstash.com/docs/redis/sdks/ts/commands/scripts/eval).

1. **Keep:** warm-paper/dark-text/indigo editorial implementation, typed local content, accessible navigation, and verified external links.
2. **Revise then keep:** the initial mobile breakpoint hid section navigation. The final breakpoint keeps Work, About, Notes, Contact, and View résumé visible with 48px targets.
3. **Keep:** the approved self-description quote and footer. The real Bunch diagram now appears in the related case study, so the selected-work section has a visual break without treating it as an unrelated gallery item.
