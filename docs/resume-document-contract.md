# Résumé career record and document contract

Issue #48 (epic #47). The résumé now has one public career record and four
editorial profiles. A pure compiler resolves a profile into a document that
web pages, PDFs, plain text, the CLI and a future MCP adapter all consume.

## Files

| File | Owns |
| --- | --- |
| `content/resume/career.json` | Public career facts: identity, headlines, summaries, roles, achievements, projects, skills, education, certifications, publications, talks, community |
| `content/resume/profiles/<id>.json` | Editorial selections for `ai-builder`, `technical-program-owner`, `program-owner`, `cv` |
| `lib/resume/schema.ts` | Strict zod schemas (unknown keys fail) |
| `lib/resume/compose.ts` | Validation and the pure composer |
| `lib/resume/index.ts` | Loads and validates content at import; `resolveResume(profileId)` |
| `lib/resume.ts` | Compatibility adapter that keeps the old exports for current consumers |
| `scripts/resume-compile.ts` | `npm run resume:compile -- <profile> [--revision <sha>]` prints the resolved JSON |
| `docs/resume-document-example.json` | Example output, kept current by a test |
| `lib/resume/artifacts.ts` | Export names, page budgets, plain-text renderer, freshness check |
| `scripts/generate-resume-pdf.py` | ReportLab layout of one resolved document (layout only) |
| `scripts/resume-build.ts`, `scripts/resume-check.ts` | `npm run resume:build` and `npm run resume:check` |

## Rules the record enforces

- **Employment facts are immutable from profiles.** A profile can only select
  role IDs, achievement IDs and named, approved wording variants. A profile
  that tries to set a title, date, employer or text fails the schema.
- **Title, headline and scope stay separate.** `role.title` is the source's
  wording. Positioning lives in `headlines`; optional `role.scope` explains it.
  The ActiveCampaign title combines a role with a scope label, so it is kept
  verbatim and flagged (`provenance.review: "flagged"`). The compiler emits a
  `flagged-for-review` warning wherever it is used. The formal title is not guessed.
- **Dates keep their precision.** `YYYY` or `YYYY-MM`. An end date is required;
  `"ongoing"` is the only way to say current, and it is an explicit approval.
  `sourceDates` keeps the source's display wording and must contain the years.
- **Qualified metrics.** `metric` records the value, denominator, approximation,
  attribution (`led`, `contributed`, `associated`) and qualifiers. `phrases`
  lists wording that every variant must keep. For example, "roughly 2% to 43%
  of merge requests" and "associated with $1.5B in locked loan volume". A
  variant that drops a phrase fails validation.
- **Provenance.** Each record has `source`, `review` and an optional https
  `url`. Evidence URLs are never invented; most records have none.
- **Public-safe only.** Strict objects reject unknown keys such as
  `privateNotes`. Private evidence, job descriptions and application notes stay
  outside this repository entirely.
- **Safe links.** `https:`, `mailto:` or a site-relative path. No `http:`,
  protocol-relative or script URLs.

Validation is structural. Passing it does not mean a claim is verified or current.

## Resolved document

```ts
type ResolvedResume = {
  profileId: 'ai-builder' | 'technical-program-owner' | 'program-owner' | 'cv';
  profileLabel: string;
  profileStatus: 'draft' | 'approved';   // only approved editions are published
  schemaVersion: 1;
  sourceRevision: string;                // git SHA when supplied, else 'unversioned'
  digest: string;                        // sha256 of the resolved content; excludes sourceRevision
  identity: { name; location; email; site; siteUrl; github; githubUrl };
  headline: string;
  summary: string;
  sections: Array<
    | { kind: 'experience' | 'earlier'; roles: Array<{ id; employer; location?; title; scope?; start; end; dates; items: Array<{ id; text }> }> }
    | { kind: 'highlights'; items: Array<{ id; achievementId; text }> }
    | { kind: 'projects'; items: Array<{ id; name; description; proofHref; proofLabel }> }
    | { kind: 'skills'; groups: Array<{ id; label; skills }> }
    | { kind: 'education'; items: Array<{ id; text }> }
    | { kind: 'publications' | 'talks'; items: Array<{ id; title; venue?; date?; url? }> }
    | { kind: 'community'; items: Array<{ id; organization; title; location?; description }> }
  >;
  warnings: Issue[];   // { level, code, path, message }
  errors: Issue[];     // any error → sections is []
};
```

- Sections appear in profile order. Items appear in profile order, except roles.
- **Ordering rule:** roles are always reverse chronological. Sort by end date,
  newest first (`ongoing` is newest), then by start date, then by ID. A
  year-only date sorts before every month of the same year.
- An item `id` with a variant is `achievementId#variant`.
- Exact duplicate text is suppressed and reported (`duplicate-text-suppressed`).
  A highlight and a detail bullet for the same achievement with different
  wording are both kept.
- No LLM calls, scoring, renderer-specific selection or truncation. Fitting a
  page budget is a renderer and editorial concern (#49–#51), never silent deletion.

Example: `docs/resume-document-example.json` (AI Builder, `sourceRevision: "example"`).

## Profile status

`ai-builder` is `approved` and reproduces the live hiring edition exactly. The
other three are `draft` fixtures that exercise the contract. Their selections
are placeholders for editorial curation in #49 and must not be published until
approved. The Full CV does not claim completeness until its source inventory
is reviewed.

## Migration parity report

`lib/resume/legacy-parity.fixture.json` captured every export of the old
`lib/resume.ts` and the 64 private truth-review seeds before migration.
`lib/resume/parity.test.ts` asserts that the adapter reproduces both exactly,
including key order, and a one-character edit to the record makes it fail.

| Old export | Now derived from |
| --- | --- |
| `RESUME_PROFILE` | `identity` + `headlines["headline.ai-builder"]` |
| `RESUME_SUMMARY` | `summaries["summary.ai-builder"]` |
| `RESUME_ACCOMPLISHMENTS` (8) | achievements with a `highlight` variant, in career order |
| `RESUME_EXPERIENCE` (10/3/2/3/3 bullets) | primary roles × all `achievementIds`, default wording |
| `RESUME_HIRING_EXPERIENCE` | resolved `ai-builder` experience section |
| `RESUME_EARLIER` | roles with `tier: "earlier"` (year precision kept) |
| `RESUME_BUILDS` | resolved `ai-builder` projects section |
| `RESUME_SKILLS` / `RESUME_HIRING_SKILLS` | `skills` / resolved `ai-builder` skills (same objects) |
| `RESUME_EDUCATION` | `education` then `certifications`, source text |
| `RESUME_COMMUNITY` | `community[0]` |
| `RESUME_CANONICAL_PATH`, `RESUME_PDF_PATH`, `RESUME_DESCRIPTION` | unchanged constants (web route config, not career facts) |

Wording, values, attribution and date precision are unchanged. Flagged for
owner review during #49: the ActiveCampaign title, and whether the CSM
certification is still current. Every other record is marked `unreviewed`, as
before. Migration does not verify claims.

## Exports (#51)

`npm run resume:build [-- <profile>...]` composes each edition, renders its PDF
with ReportLab, writes UTF-8 plain text, and verifies everything in a staging
directory before anything is published.

| Edition status | Output |
| --- | --- |
| `approved` | `public/resume/Austen-Tucker-Crowder-<Edition>.pdf` and `.txt`, listed in `public/resume/manifest.json` |
| `approved` AI Builder | also copied byte-for-byte to `public/resume.pdf`, the long-standing default download |
| `draft` | `.resume-drafts/` (git-ignored) for review; any previously published files for it are removed |

- **Page budgets:** AI Builder, Technical Program Owner and Program Owner must
  fit 2 pages; the CV is uncapped. Over budget is a build error for approved
  editions and a warning for drafts. Fonts are never shrunk and text is never
  dropped; fix it by editing the profile's selections.
- **Verification during the build:** page count via pdf-lib, and `pdftotext`
  extraction must contain every fact of the resolved document (footer lines
  removed, whitespace normalized).
- **Atomic:** any failure exits non-zero and changes nothing. Files are written
  via a temporary sibling and renamed.
- **Deterministic:** ReportLab runs with `invariant=1`; the same inputs rebuild
  byte-identical PDFs (checked 2026-10-04).
- **Layout:** single column, real selectable text, embedded Atkinson
  Hyperlegible (Unicode punctuation kept as written), links limited to
  `https:` and `mailto:`, empty sections omitted, no forced page breaks,
  footer `name | site` and `n / total`.

### Manifest and source revision

The manifest records, per published edition, the profile ID, label, content
digest, PDF path, sha256, page count and budget, and text path and sha256. It
also records the schema version and the renderer version. It deliberately has
no git SHA and no timestamp. A SHA of the commit that contains the artifacts
would be self-referential, and a timestamp would break determinism. The
relationship is this: **the commit that contains the manifest contains the
source it was built from.** `npm run resume:check` proves that by recomputing
each digest and text file from the committed source and comparing hashes.

`npm run resume:check` needs no Python. It runs in CI (with
`--require-pdf-text`) and as a test, and fails on stale or tampered artifacts,
a stale `/resume.pdf`, budget overruns, missing PDF text, or any unpublished
file in `public/resume/`.

**Clean checkout:** `npm ci && pip install -r requirements-resume.txt`, install
poppler (`pdftotext`), then `npm run resume:build`. Public downloads are static
files, so no Python or inference runs on a request. Vercel needs neither.

Limitations: no claim of universal ATS compatibility or accessibility
certification; the PDF is untagged ReportLab output with a simple reading order.

## Web editions (#50)

| URL | Behaviour |
| --- | --- |
| `/resume` | AI Builder, the default edition and its canonical URL (unchanged) |
| `/resume/ai-builder` | 308 → `/resume`, so the default has one address and no duplicate |
| `/resume/<id>` | Prerendered only for **approved** editions other than the default, with its own title, description, absolute self-canonical, `og:url` and sitemap entry |
| draft, unknown, or any other segment | Real 404 (`dynamicParams = false`); no arbitrary file selection |
| `/resume.pdf`, `/resume/<file>.pdf`, `/resume/<file>.txt` | Static exports from #51 |

**Why `/resume` stays canonical** rather than redirecting to `/resume/ai-builder`:
the creative site's permanent redirect, the cutover gate, the live audit and
existing links all point at `/resume`. Keeping it means one address, no
redirect chain, and no change to those gates. Switching later is a single
redirect swap plus a canonical change.

- `app/resume/resume-document.tsx` renders any resolved document. Selection
  never happens in the renderer. Headline, summary, sections, role evidence
  links, contact call to action and pitch all come from the document. Edition
  page copy (`page.description`, `page.cta`, `page.pitch`) lives in each profile.
- Downloads come from the manifest. The default keeps `/resume.pdf` (same
  bytes as its named PDF) with its existing `resume_click` / `resume_pdf`
  event; the plain-text link has no analytics. Any new event properties are
  proposed under #45.
- `<main data-resume-profile data-resume-digest>` exposes the edition and
  content digest. A rendered test asserts it equals the manifest's
  `contentDigest`.
- The edition switcher appears only when two or more editions are approved.
  The current edition is marked with `aria-current="page"`, bold text, a
  3px border and "(current)" in text, so color isn't the only cue.
- Pages are static files. They do not depend on MCP, editing services or
  credentials.

Verified 2026-10-04 with Technical Program Owner temporarily approved
(local only, then reverted). Checked `/resume` and the edition page at 1280px
light, 320px dark and 320px with 200% root text, with reduced motion: no
horizontal overflow, zero axe WCAG 2.1 A/AA violations, keyboard reached the
edition switcher and PDF download with a 3px focus ring, targets ≥ 48px.

## Rollback

Revert the #48 commit. `lib/resume.ts` returns to its literal constants. No
route, PDF, URL or stored data changes, and the truth-review seeds are identical
either way. Reverting #51 restores the previous `public/resume.pdf` layout and
removes `public/resume/`. Reverting #50 restores the hand-written `/resume`
page and removes the edition route and redirect.
