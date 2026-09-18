# Image placeholders to fill in

Two spots ship with placeholder art in this change. Both are safe as-is — the
site works and reads fine with the placeholders — but real generated art
would make them land better for sharing.

## 1. `/layoff-triage` hero image

**Current placeholder:** `public/images/layoff-triage-hero.svg` — a flat
gradient card with a mug icon and a "placeholder" label, referenced from
`app/layoff-triage/page.tsx`.

**Suggested prompt:** "A single steaming mug of tea on a plain desk beside a
closed laptop, warm minimalist illustration, soft gradient background moving
from deep indigo (#0a0a14) to warm pink (#ff3cac) and orange (#ff8a00), flat
vector style, no text, calm and unhurried mood, 1200x630."

**To swap in:** save the generated file as
`public/images/layoff-triage-hero.png` and change the one `src` in
`app/layoff-triage/page.tsx` from the `.svg` placeholder to that path.

## 2. LinkedIn carousel/graphic for the "I'm overwhelmed" post (+3 days)

This one isn't part of the site — it's a standalone image for the launch-week
LinkedIn post described in the plan's distribution table (Part B). No
placeholder file exists for it; it's generated and posted directly to
LinkedIn, not committed here.

**Suggested prompt:** "A single-panel minimalist illustration of a phone
screen showing the text bubble 'I'm overwhelmed' with a calm reply bubble
below it, warm gradient background matching #ff8a00 to #ff3cac, clean sans
serif type, plenty of negative space, made for a LinkedIn post image
(1080x1080)."

Everything else in this change (the blog post's own social preview card, and
every existing post's) is generated automatically in code —
`app/blog/[slug]/opengraph-image.tsx` — so it needs no artwork at all.
