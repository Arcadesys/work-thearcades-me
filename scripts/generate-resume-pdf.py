#!/usr/bin/env python3
"""Render the two-page hiring edition from lib/resume.ts (content/resume/career.json).

The complete employment claim arrays stay available to private truth review.
The website and PDF use the same selected bullets; this renderer only owns layout.
"""

from __future__ import annotations

from io import BytesIO
import json
import subprocess
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "resume.pdf"


def load_resume() -> dict:
    program = """
import {
  RESUME_BUILDS, RESUME_COMMUNITY, RESUME_EARLIER, RESUME_EDUCATION,
  RESUME_HIRING_EXPERIENCE, RESUME_HIRING_SKILLS, RESUME_PROFILE, RESUME_SUMMARY,
} from './lib/resume';
console.log(JSON.stringify({ RESUME_BUILDS, RESUME_COMMUNITY, RESUME_EARLIER, RESUME_EDUCATION, RESUME_HIRING_EXPERIENCE, RESUME_HIRING_SKILLS, RESUME_PROFILE, RESUME_SUMMARY }));
"""
    result = subprocess.run(
        # The tsx CLI resolves lib/resume.ts and its JSON career record; Node's
        # ESM loader cannot see the named exports of a transpiled module.
        [str(ROOT / "node_modules" / ".bin" / "tsx"), "--eval", program],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=True,
    )
    return json.loads(result.stdout)


def render() -> None:
    resume = load_resume()
    # Embed the site's licensed, accessibility-focused fonts so PDF readers do
    # not need to substitute platform fonts (which can alter spacing).
    for suffix in ("Regular", "Bold"):
        name = "ResumeSans" if suffix == "Regular" else "ResumeSans-Bold"
        pdfmetrics.registerFont(TTFont(name, str(ROOT / "assets" / "fonts" / f"AtkinsonHyperlegible-{suffix}.ttf")))
    pdfmetrics.registerFontFamily("ResumeSans", normal="ResumeSans", bold="ResumeSans-Bold")
    palette = {"ink": colors.HexColor("#111827"), "muted": colors.HexColor("#374151")}
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("ResumeName", parent=styles["Normal"], fontName="ResumeSans-Bold", fontSize=21, leading=25, textColor=palette["ink"], spaceAfter=3))
    styles.add(ParagraphStyle("ResumeTitle", parent=styles["Normal"], fontName="ResumeSans-Bold", fontSize=12, leading=16, textColor=palette["ink"], spaceAfter=5))
    styles.add(ParagraphStyle("ResumeContact", parent=styles["Normal"], fontName="ResumeSans", fontSize=10, leading=13.5, textColor=palette["muted"], spaceAfter=6))
    styles.add(ParagraphStyle("ResumeSection", parent=styles["Normal"], fontName="ResumeSans-Bold", fontSize=12, leading=16, textColor=palette["ink"], spaceBefore=12, spaceAfter=6, keepWithNext=True))
    styles.add(ParagraphStyle("ResumeBody", parent=styles["Normal"], fontName="ResumeSans", fontSize=10.25, leading=14, textColor=palette["ink"], spaceAfter=4))
    styles.add(ParagraphStyle("ResumeBullet", parent=styles["ResumeBody"], leftIndent=12, firstLineIndent=0, bulletIndent=1, spaceAfter=3))
    styles.add(ParagraphStyle("ResumeRole", parent=styles["Normal"], fontName="ResumeSans-Bold", fontSize=11, leading=14.5, textColor=palette["ink"], spaceBefore=8, spaceAfter=2, keepWithNext=True))
    styles.add(ParagraphStyle("ResumeRoleMeta", parent=styles["Normal"], fontName="ResumeSans", fontSize=9.75, leading=13, textColor=palette["muted"], spaceAfter=5, keepWithNext=True))
    styles.add(ParagraphStyle("ResumeLink", parent=styles["ResumeBody"], fontSize=9.5, leading=12, spaceAfter=3))

    def clean(text: str) -> str:
        return escape(text.replace("\u2013", "-").replace("\u2014", "-"))

    def paragraph(text: str, style: str = "ResumeBody") -> Paragraph:
        return Paragraph(clean(text), styles[style])

    def bullet(text: str) -> Paragraph:
        return Paragraph(clean(text), styles["ResumeBullet"], bulletText="-")

    def link(url: str, label: str) -> str:
        return f'<link href="{escape(url, {chr(34): "&quot;"})}"><u>{clean(label)}</u></link>'

    def role_block(role: dict) -> KeepTogether:
        return KeepTogether([
            paragraph(f'{role["company"]} - {role["title"]}', "ResumeRole"),
            paragraph(f'{role["location"]} | {role["dates"]}', "ResumeRoleMeta"),
            *(bullet(item) for item in role["bullets"]),
        ])

    profile = resume["RESUME_PROFILE"]
    roles = resume["RESUME_HIRING_EXPERIENCE"]
    story = [
        paragraph(profile["name"], "ResumeName"),
        paragraph(profile["titleLine"], "ResumeTitle"),
        Paragraph(
            f'{clean(profile["location"])} | {link("mailto:" + profile["email"], profile["email"])}<br/>'
            f'{link(profile["siteUrl"], profile["site"])} | {link(profile["githubUrl"], profile["github"])}',
            styles["ResumeContact"],
        ),
        paragraph("Summary", "ResumeSection"),
        paragraph(resume["RESUME_SUMMARY"]),
        paragraph("Experience", "ResumeSection"),
    ]
    story.extend(role_block(role) for role in roles[:4])
    story.extend([
        PageBreak(),
        paragraph("Experience, continued", "ResumeSection"),
    ])
    story.extend(role_block(role) for role in roles[4:])
    story.append(paragraph("Earlier Experience", "ResumeSection"))
    story.extend(paragraph(f'{item["org"]} - {item["role"]} ({item["dates"]})') for item in resume["RESUME_EARLIER"])

    story.append(paragraph("Selected AI Builds", "ResumeSection"))
    for build in resume["RESUME_BUILDS"]:
        url = f'{profile["siteUrl"]}{build["proofHref"]}'
        story.append(KeepTogether([
            paragraph(build["name"], "ResumeRole"),
            paragraph(build["description"]),
            Paragraph(link(url, f'{profile["site"]}{build["proofHref"]}'), styles["ResumeLink"]),
        ]))

    story.append(paragraph("Tools & Skills", "ResumeSection"))
    story.extend(Paragraph(f'<b>{clean(item["label"])}:</b> {clean(item["skills"])}', styles["ResumeBody"]) for item in resume["RESUME_HIRING_SKILLS"])
    story.append(paragraph("Education & Certifications", "ResumeSection"))
    story.extend(paragraph(item) for item in resume["RESUME_EDUCATION"])
    community = resume["RESUME_COMMUNITY"]
    story.extend([
        paragraph("Community & Volunteer Work", "ResumeSection"),
        paragraph(f'{community["organization"]} - {community["title"]}', "ResumeRole"),
        paragraph(community["description"]),
    ])

    def footer(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(palette["muted"])
        canvas.setLineWidth(0.5)
        canvas.line(document.leftMargin, 43, letter[0] - document.rightMargin, 43)
        canvas.setFont("ResumeSans", 8)
        canvas.setFillColor(palette["muted"])
        canvas.drawString(document.leftMargin, 30, f'{profile["name"]} | {profile["site"]}')
        canvas.drawRightString(letter[0] - document.rightMargin, 30, f"{document.page} / 2")
        canvas.restoreState()

    # Refuse to replace the published file if content no longer fits the contract.
    output = BytesIO()
    document = SimpleDocTemplate(
        output, pagesize=letter, leftMargin=0.7 * inch, rightMargin=0.7 * inch,
        topMargin=0.55 * inch, bottomMargin=0.8 * inch,
        title="Resume - Austen Tucker-Crowder", author=profile["name"],
        subject=profile["titleLine"], invariant=1,
    )
    document.build(story, onFirstPage=footer, onLaterPages=footer)
    if document.page != 2:
        raise ValueError(f"Hiring resume must be exactly two pages; rendered {document.page}. Tighten the content before publishing.")
    OUTPUT.write_bytes(output.getvalue())
    print(f"Rendered {OUTPUT.relative_to(ROOT)} ({document.page} pages)")


if __name__ == "__main__":
    render()
