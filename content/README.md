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
this slice. Newsletter delivery, comments, RSS and sitemap are not added here.
