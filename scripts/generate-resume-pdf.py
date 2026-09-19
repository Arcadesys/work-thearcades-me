#!/usr/bin/env python3
"""Render public/resume.pdf from the canonical lib/resume.ts data."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "resume.pdf"


def load_resume() -> dict:
    program = """
import {
  RESUME_ACCOMPLISHMENTS, RESUME_COMMUNITY, RESUME_EARLIER, RESUME_EDUCATION,
  RESUME_EXPERIENCE, RESUME_PROFILE, RESUME_SKILLS, RESUME_SUMMARY,
} from './lib/resume.ts';
console.log(JSON.stringify({ RESUME_ACCOMPLISHMENTS, RESUME_COMMUNITY, RESUME_EARLIER, RESUME_EDUCATION, RESUME_EXPERIENCE, RESUME_PROFILE, RESUME_SKILLS, RESUME_SUMMARY }));
"""
    result = subprocess.run(
        [str(ROOT / "node_modules" / ".bin" / "tsx"), "--eval", program],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=True,
    )
    return json.loads(result.stdout)


def render() -> None:
    resume = load_resume()
    palette = {"ink": colors.HexColor("#111827"), "muted": colors.HexColor("#374151"), "rule": colors.HexColor("#374151")}
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("ResumeName", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=21, leading=25, textColor=palette["ink"], spaceAfter=3))
    styles.add(ParagraphStyle("ResumeTitle", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=palette["ink"], spaceAfter=3))
    styles.add(ParagraphStyle("ResumeContact", parent=styles["Normal"], fontName="Helvetica", fontSize=10.5, leading=14, textColor=palette["muted"], spaceAfter=16))
    styles.add(ParagraphStyle("ResumeSection", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=13, leading=17, textColor=palette["ink"], spaceBefore=12, spaceAfter=6, keepWithNext=True))
    styles.add(ParagraphStyle("ResumeBody", parent=styles["Normal"], fontName="Helvetica", fontSize=10.25, leading=14.2, textColor=palette["ink"], spaceAfter=5))
    styles.add(ParagraphStyle("ResumeBullet", parent=styles["ResumeBody"], leftIndent=14, firstLineIndent=-8, bulletIndent=4, spaceAfter=2))
    styles.add(ParagraphStyle("ResumeRole", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=11.25, leading=15, textColor=palette["ink"], spaceBefore=10, spaceAfter=1, keepWithNext=True))
    styles.add(ParagraphStyle("ResumeRoleMeta", parent=styles["Normal"], fontName="Helvetica", fontSize=9.75, leading=13, textColor=palette["muted"], spaceAfter=4, keepWithNext=True))

    def paragraph(text: str, style: str = "ResumeBody") -> Paragraph:
        return Paragraph(escape(text), styles[style])

    def bullet(text: str) -> Paragraph:
        return Paragraph(escape(text), styles["ResumeBullet"], bulletText="•")

    profile = resume["RESUME_PROFILE"]
    story = [
        paragraph(profile["name"], "ResumeName"),
        paragraph(profile["titleLine"], "ResumeTitle"),
        paragraph(f'{profile["location"]} · {profile["email"]} · {profile["site"]} · {profile["github"]}', "ResumeContact"),
        paragraph("Summary", "ResumeSection"),
        paragraph(resume["RESUME_SUMMARY"]),
        paragraph("Key Accomplishments", "ResumeSection"),
    ]
    story.extend(bullet(item["text"]) for item in resume["RESUME_ACCOMPLISHMENTS"])
    story.append(PageBreak())
    story.append(paragraph("Experience", "ResumeSection"))

    for role in resume["RESUME_EXPERIENCE"]:
        header = [
            paragraph(f'{role["company"]} — {role["title"]}', "ResumeRole"),
            paragraph(f'{role["location"]} · {role["dates"]}', "ResumeRoleMeta"),
        ]
        story.append(KeepTogether(header))
        story.extend(bullet(item) for item in role["bullets"])

    story.append(paragraph("Earlier Experience", "ResumeSection"))
    story.extend(bullet(f'{item["org"]} — {item["role"]} ({item["dates"]})') for item in resume["RESUME_EARLIER"])
    community = resume["RESUME_COMMUNITY"]
    story.extend([
        paragraph("Community & Volunteer Work", "ResumeSection"),
        paragraph(f'{community["organization"]} — {community["title"]}, {community["location"]}', "ResumeRole"),
        paragraph(community["description"]),
        paragraph("Tools & Skills", "ResumeSection"),
    ])
    story.extend(bullet(f'{item["label"]}: {item["skills"]}') for item in resume["RESUME_SKILLS"])
    story.append(paragraph("Education & Certifications", "ResumeSection"))
    story.extend(bullet(item) for item in resume["RESUME_EDUCATION"])

    def footer(canvas, document):
        canvas.saveState()
        canvas.setStrokeColor(palette["rule"])
        canvas.setLineWidth(0.5)
        canvas.line(document.leftMargin, 43, letter[0] - document.rightMargin, 43)
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(palette["muted"])
        canvas.drawString(document.leftMargin, 30, "Austen Tucker-Crowder · work.thearcades.me")
        canvas.drawRightString(letter[0] - document.rightMargin, 30, f"Page {document.page}")
        canvas.restoreState()

    document = SimpleDocTemplate(
        str(OUTPUT), pagesize=letter, leftMargin=0.72 * inch, rightMargin=0.72 * inch,
        topMargin=0.62 * inch, bottomMargin=0.9 * inch, title="Résumé — Austen Tucker-Crowder",
        author="Austen Tucker-Crowder",
    )
    document.build(story, onFirstPage=footer, onLaterPages=footer)


if __name__ == "__main__":
    render()
