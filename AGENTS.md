# AGENTS.md

## Cross-imprint canonical publishing policy

This policy is shared by `Arcadesys/work-thearcades-me` and
`Arcadesys/arcadeprofile`. Keep both root `AGENTS.md` files aligned when changing it.

**`https://www.thearcades.me` always owns original provenance. When the same or
substantially duplicated piece exists on both sites, the thearcades.me original
is canonical and the work copy is marked "Originally published on" it.** This
applies to imports, syndication, migrations, and republication. Decision record:
`Arcadesys/arcadeprofile/docs/seo/canonical-policy.md` (map v2, 2026-10-03).

- Compare the actual editions before classifying them as duplicates. A personal
  Bunch essay and a distinct technical Bunch case study may each be canonical to
  themselves. Shared subject matter alone is not duplication; fiction and other
  content unique to the creative site stay independently canonical there.
- Maintain an explicit per-piece mapping from each work copy to the exact
  thearcades.me original URL (work `content/blog-sources.json` `url`). Verify the
  original is live, public, and indexable before pointing a copy at it. Never
  guess a matching slug or point every page at the creative homepage.
- The thearcades.me original declares its own absolute URL as canonical. A
  retained work copy declares that exact original URL as its cross-domain
  canonical. Keep `og:url` and structured-data document identity, including
  `mainEntityOfPage`, consistent with the original.
- Include the original in the creative sitemap and exclude the work copy from
  the work sitemap. Discovery links recommending the definitive edition lead to
  the original; contextual links to genuinely distinct pieces stay intact.
- Ship the creative self-canonical before the work cross-domain canonical, so
  the two editions never point at each other.
- Preserve original publication dates, source attribution, and provenance. A
  preferred canonical edition does not rewrite publication history.
- A canonical preference is not permission to delete, redirect, or retire the
  work copy. Those actions require explicit authorization for the affected
  URLs. Existing release gates, including the resume cutover gate in
  `Arcadesys/arcadeprofile/docs/resume-domain-cutover.md`, remain in force.
- Preserve private, draft, unlisted, and intentionally `noindex` behavior. Do not
  expose protected pages through sitemaps, feeds, or discovery links as part of
  an SEO cleanup.
- When implementing canonical mappings or changing metadata, publishing, or
  import pipelines, add or update tests for creative self-canonicals, work
  cross-domain canonicals, sitemap exclusions, and distinct pieces retaining
  their own canonicals. Check emitted HTML metadata, not only source config.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
