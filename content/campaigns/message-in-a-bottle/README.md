# Message in a Bottle: free fan edition

Authoring sources are `introduction.md`, `sessions.mjs`, `appendix.md`, and `handouts.md`. The 24 scene cards, essential clues, outcomes, and clocks are generated from the same session data for the printable module and GM runner. The static runner and its styling live in `public/campaigns/message-in-a-bottle-module/`.

Run `npm run campaign:build` to regenerate the Markdown, HTML, and JSON. The ordinary site build also does this. With Playwright Chromium installed, run `node scripts/build-campaign.mjs --pdf --output-dir=../../outputs` to regenerate tagged PDFs and copy them into `public/downloads/`. Then run `python3 scripts/package-campaign.py` to rebuild the offline ZIP. Commit the generated documents and PDFs together with their sources.

The original campaign bible and eight session plans establish the arc. This edition adds Seasoned-rank calibration, original supporting names and NPC profiles, a node map, task targets, pressure clocks, a fictional accelerator, route stops, handouts, and alternate outcomes. The source novel's cosmology remains separate from the Ink and Paint books; this is a tabletop remix. Do not add private player correspondence, personal disclosures, or real-person biography.

The illustrated source notebook at `/campaigns/message-in-a-bottle/` is retained as a receipt of the earlier plan, with its uncertainties labelled. Its three images are the existing campaign illustrations; no new images were invented for the essay. The article's linked excerpts come from the rendered 21-page walkthrough PDF.

The GM runner adapts the author's Dread at the Wooden Shoe guide's interaction pattern, not its private content, audio, or game mechanics. It stores progress only in a dedicated browser-local namespace, starts no audio automatically, and distinguishes reading ahead from starting a gathering. The timer never controls fictional pressure. Static HTML and PDFs remain usable without the runner.

This is a free, unplaytested, unofficial fan edition requiring the SWADE core rules. It reproduces no core rulebook text and uses no licensed setting. The supplied Fan logo is used without altering its image; the required notice appears in the GM module, handouts, and runner. Free Fan License publication terms: https://shop.peginc.com/pages/licensing . This is not a SWAG marketplace submission or a pay-what-you-want release. Do not introduce a payment or signup gate without revisiting the license.
