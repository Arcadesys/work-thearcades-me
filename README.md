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
