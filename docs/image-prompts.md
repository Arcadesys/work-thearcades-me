# Image notes

The `/layoff-triage` hero is now finished artwork at
`public/images/layoff-triage-hero.svg`: a steaming mug beside a closed
laptop and notebook, using the site's indigo/pink/orange palette with no text.

## LinkedIn carousel/graphic for the "I'm overwhelmed" post (+3 days)

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
