# Blog authoring

Publish a Markdown file in `content/blog/<slug>.md` through a branch and preview.
Required YAML: id, title, slug, group, publishDate (RFC3339 with timezone).
Optional: excerpt, tags, hero (src and alt), seo, updatedDate, order, buildDate (YYYY or YYYY-MM).
Unknown metadata is rejected. Markdown renders semantic HTML; raw HTML is disabled.
Keep drafts outside content/blog. Future dates are excluded at build time; publishing
requires a deployment at or after the date. There is no automatic scheduler or CMS.

Topic tags remain in the post. Exact project associations are in lib/blog.ts;
featured-work entries opt in with blogTags in lib/content.ts. Generic AI tags do
not imply a relationship. Imported Bunch is byte-identical to the commit recorded
in blog-sources.json. Its original page remains intact.

## Later migration inventory: user-supplied build dates

These are project/build-log dates, not exact original publication timestamps:

| Project | Build date | Precision |
| --- | --- | --- |
| ArcadeProfile | 2025 | year |
| Conductor | July 2026 | month |
| ToonTok | August 2026 | month |
| WizWor | May 2026 | month |

Preserve this precision in the later import. Do not fill missing month/day values.
The optional buildDate field displays exactly the supplied year/month precision;
the separate publishDate is the site's publication timestamp, not the build date.

Clear work/AI essays are in scope for later batches. Personal crossover pieces
remain subject to editorial review. No redirects or original-page retirement in
this slice. Newsletter delivery and comments are not added here.

## When in crisis, make tea (launch)

The first post written for this site rather than migrated from one. Its
Layoff Triage Skill download and `/layoff-triage` landing page ship in the
same change. Its finished tea hero is documented in `docs/image-prompts.md`. Sitemap (`app/sitemap.ts`), robots (`app/robots.ts`), and an RSS
feed (`app/feed.xml/route.ts`) are added in this pass; every post also gets an
automatic social-preview card from `app/blog/[slug]/opengraph-image.tsx`
unless it sets its own `hero`.

## September 12 archive batch

The user selected eleven articles, including the two previously held editorial
candidates. Nine archive manuscripts receive a first publication date on this
site; Four Stages and Novel T retain their exact published ArcadeProfile files
and dates. Original sources remain intact. This batch does not retire old URLs.

blog-sources.json records exact file hashes for published imports and exact
Markdown-body hashes for archive imports. Archive metadata is adapted to this
site; the prose remains unchanged. The page suppresses an identical leading title
to avoid duplicate h1s. Suggested topic/project tags are metadata only.

Bunch Part III uses the full Group Photo draft; its alternative outline is not
published. The Fox and the Eval keeps the Moxie image with a byte-identical local
copy. Its link to the unselected Photos Aren't Sticky draft renders as plain text;
Bunch II's handoff-document link resolves to the imported Fox and the Eval article.
The older publishing-pipeline accounts remain historical descriptions, not new
claims about the current site architecture. No email is sent by this import.
