#!/usr/bin/env python3
"""Lay out one resolved résumé edition as a PDF (#51).

    python3 scripts/generate-resume-pdf.py <resolved.json> <output.pdf>

Input is the composer's resolved document (lib/resume/compose.ts). This script
owns layout only: it never selects, rewrites, drops, or shrinks content. Use
`npm run resume:build`, which composes each edition, calls this script,
enforces page budgets, and publishes atomically. Prints one JSON line with the
page count and renderer version.
"""

from __future__ import annotations

from io import BytesIO
import json
import re
import sys
from pathlib import Path
from xml.sax.saxutils import escape

import reportlab
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate

ROOT = Path(__file__).resolve().parents[1]
SAFE_LINK = re.compile(r"^(https://\S+|mailto:[^\s@]+@[^\s@]+)$")


def absolute_link(href: str, site_url: str) -> str:
    url = f"{site_url}{href}" if href.startswith("/") and not href.startswith("//") else href
    if not SAFE_LINK.match(url):
        raise ValueError(f"Refusing unsafe link: {href!r}")
    return url


def build_styles() -> tuple[dict, dict]:
    # Embed the site's accessibility-focused font so readers do not substitute
    # platform fonts (which can alter spacing). It covers the Unicode punctuation
    # used in the record, so dashes and quotes are kept as written.
    for suffix in ("Regular", "Bold"):
        name = "ResumeSans" if suffix == "Regular" else "ResumeSans-Bold"
        pdfmetrics.registerFont(TTFont(name, str(ROOT / "assets" / "fonts" / f"AtkinsonHyperlegible-{suffix}.ttf")))
    pdfmetrics.registerFontFamily("ResumeSans", normal="ResumeSans", bold="ResumeSans-Bold")
    palette = {"ink": colors.HexColor("#111827"), "muted": colors.HexColor("#374151")}
    styles = getSampleStyleSheet()
    add = lambda name, **kw: styles.add(ParagraphStyle(name, parent=styles[kw.pop("parent", "Normal")], **kw))
    add("ResumeName", fontName="ResumeSans-Bold", fontSize=21, leading=25, textColor=palette["ink"], spaceAfter=3)
    add("ResumeTitle", fontName="ResumeSans-Bold", fontSize=12, leading=16, textColor=palette["ink"], spaceAfter=5)
    add("ResumeContact", fontName="ResumeSans", fontSize=10, leading=13.5, textColor=palette["muted"], spaceAfter=6)
    add("ResumeSection", fontName="ResumeSans-Bold", fontSize=12, leading=16, textColor=palette["ink"], spaceBefore=12, spaceAfter=6, keepWithNext=True)
    add("ResumeBody", fontName="ResumeSans", fontSize=10.25, leading=14, textColor=palette["ink"], spaceAfter=4)
    add("ResumeBullet", parent="ResumeBody", leftIndent=12, firstLineIndent=0, bulletIndent=1, spaceAfter=3)
    add("ResumeRole", fontName="ResumeSans-Bold", fontSize=11, leading=14.5, textColor=palette["ink"], spaceBefore=8, spaceAfter=2, keepWithNext=True)
    add("ResumeRoleMeta", fontName="ResumeSans", fontSize=9.75, leading=13, textColor=palette["muted"], spaceAfter=5, keepWithNext=True)
    add("ResumeLink", parent="ResumeBody", fontSize=9.5, leading=12, spaceAfter=3)
    return styles, palette


def story_for(doc: dict, styles: dict) -> list:
    clean = lambda text: escape(text)
    paragraph = lambda text, style="ResumeBody": Paragraph(clean(text), styles[style])
    bullet = lambda text: Paragraph(clean(text), styles["ResumeBullet"], bulletText="-")
    link = lambda url, label: f'<link href="{escape(url, {chr(34): "&quot;"})}"><u>{clean(label)}</u></link>'
    identity = doc["identity"]
    site_url = identity["siteUrl"]

    story = [
        paragraph(identity["name"], "ResumeName"),
        paragraph(doc["headline"], "ResumeTitle"),
        Paragraph(
            f'{clean(identity["location"])} | {link(absolute_link("mailto:" + identity["email"], site_url), identity["email"])}<br/>'
            f'{link(absolute_link(identity["siteUrl"], site_url), identity["site"])} | '
            f'{link(absolute_link(identity["githubUrl"], site_url), identity["github"])}',
            styles["ResumeContact"],
        ),
        paragraph("Summary", "ResumeSection"),
        paragraph(doc["summary"]),
    ]

    for section in doc["sections"]:
        items = section.get("roles", section.get("items", section.get("groups", [])))
        if not items:
            continue  # Empty optional sections disappear cleanly.
        story.append(paragraph(section["title"], "ResumeSection"))
        kind = section["kind"]
        if kind == "experience":
            for role in items:
                meta = " | ".join(part for part in (role.get("location"), role["dates"]) if part)
                story.append(KeepTogether([
                    paragraph(f'{role["employer"]} — {role["title"]}', "ResumeRole"),
                    *([paragraph(role["scope"], "ResumeRoleMeta")] if role.get("scope") else []),
                    paragraph(meta, "ResumeRoleMeta"),
                    *(bullet(item["text"]) for item in role["items"]),
                ]))
        elif kind == "earlier":
            story.extend(paragraph(f'{role["employer"]} — {role["title"]} ({role["dates"]})') for role in items)
        elif kind == "highlights":
            story.extend(bullet(item["text"]) for item in items)
        elif kind == "projects":
            for item in items:
                url = absolute_link(item["proofHref"], site_url)
                story.append(KeepTogether([
                    paragraph(item["name"], "ResumeRole"),
                    paragraph(item["description"]),
                    Paragraph(f'{clean(item["proofLabel"])}: {link(url, url.removeprefix("https://"))}', styles["ResumeLink"]),
                ]))
        elif kind == "skills":
            story.extend(Paragraph(f'<b>{clean(group["label"])}:</b> {clean(group["skills"])}', styles["ResumeBody"]) for group in items)
        elif kind == "education":
            story.extend(paragraph(item["text"]) for item in items)
        elif kind in ("publications", "talks"):
            for item in items:
                text = " — ".join(part for part in (item["title"], item.get("venue"), item.get("date")) if part)
                story.append(Paragraph(clean(text) + (f' {link(absolute_link(item["url"], site_url), "Link")}' if item.get("url") else ""), styles["ResumeBody"]))
        elif kind == "community":
            for item in items:
                story.append(KeepTogether([
                    paragraph(f'{item["organization"]} — {item["title"]}', "ResumeRole"),
                    paragraph(item["description"]),
                ]))
        else:
            raise ValueError(f"Unsupported section kind: {kind!r}")
    return story


def render(doc: dict, total_pages: int | None, styles: dict, palette: dict) -> tuple[bytes, int]:
    identity = doc["identity"]

    def footer(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(palette["muted"])
        canvas.setLineWidth(0.5)
        canvas.line(document.leftMargin, 43, letter[0] - document.rightMargin, 43)
        canvas.setFont("ResumeSans", 8)
        canvas.setFillColor(palette["muted"])
        canvas.drawString(document.leftMargin, 30, f'{identity["name"]} | {identity["site"]}')
        canvas.drawRightString(letter[0] - document.rightMargin, 30, f"{document.page} / {total_pages or '?'}")
        canvas.restoreState()

    output = BytesIO()
    document = SimpleDocTemplate(
        output, pagesize=letter, leftMargin=0.7 * inch, rightMargin=0.7 * inch,
        topMargin=0.55 * inch, bottomMargin=0.8 * inch,
        title=f'Resume - {identity["name"]} ({doc["profileLabel"]})', author=identity["name"],
        subject=doc["headline"], invariant=1,
    )
    document.build(story_for(doc, styles), onFirstPage=footer, onLaterPages=footer)
    return output.getvalue(), document.page


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print(__doc__.strip(), file=sys.stderr)
        return 2
    doc = json.loads(Path(argv[1]).read_text(encoding="utf-8"))
    if doc.get("errors"):
        raise ValueError("Refusing to render a document with composition errors")
    styles, palette = build_styles()
    # Two passes: the first counts pages so the footer can show "n / total".
    _, pages = render(doc, None, styles, palette)
    data, final_pages = render(doc, pages, styles, palette)
    if final_pages != pages:
        raise RuntimeError(f"Page count changed between passes ({pages} → {final_pages})")
    Path(argv[2]).write_bytes(data)
    print(json.dumps({"pages": pages, "renderer": f"reportlab {reportlab.Version}"}))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
