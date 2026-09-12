---
id: archive-this-is-what-ai-assisted-actually-looks-like
title: This Is What “AI-Assisted” Actually Looks Like
slug: this-is-what-ai-assisted-actually-looks-like
group: work-notes
publishDate: '2026-09-12T16:55:26.466Z'
excerpt: Manuscripts as codebases, narrow editing skills, and reviewable changes.
tags:
  - writing-harness
  - agentic-ai
  - human-review
---

# This Is What “AI-Assisted” Actually Looks Like

This week I reviewed and merged a 10,000-line diff on my novel. No, I didn’t have AI write it. I had it do the boring parts better than I ever could.

---

## The Boringness Trap

Editing is repetition.

Read.
Evaluate.
Adjust.
Re-read.
Re-evaluate.
Adjust again.

By the third pass, your brain is lying to you. You skim. You assume. You stop noticing drift—the line that contradicted something in Chapter 3, the emotional beat you already landed two scenes ago, the paragraph that’s doing the same work as the one above it. You’re tired of your own sentences.

And here’s the uncomfortable truth: editing is the most important phase of writing. It’s also the least stimulating. Humans are not built to do the same thing over and over again without degradation. That’s the trap. You either:

* Rush it.
* Avoid it. (Hi!)
* Or burn out doing it.

So here’s the question that finally clicked for me:

Why am I manually doing the first-pass repetition work when AI can do it for pennies on the dollar, and do it better than I can?

---

## What “AI-Assisted” Actually Means

Inside Cursor, I treat my manuscript like a codebase. Each scene is its own file. I wrote a simple program to hydrate a novel draft via a YAML (a config file that lists the scenes in order). I can diff. I can search. I can point an agent at a single file or the whole project.

I’ve run a linter on intimate scenes; the juxtaposition has not gotten old.

Then I don’t ask the model to “make this better.” I create skills—very narrow, repeatable review behaviors:

* Continuity auditor.
* Emotional momentum tracker.
* Emotional punch evaluator.
* Tone drift detector.
* Setup/payoff checker.
* Redundancy flagger.
* Scene purpose summarizer.

Each skill has rules. Continuity Auditor compares character motivations across chapters, flags contradictions, does not rewrite prose, and outputs structured notes only. Tone Drift Detector compares chapter voice against a style anchor, identifies passages that deviate, provides a confidence score, and does no stylistic rewrites. Concrete unit test: "Does Fenton's refusal to help in Chapter 3 contradict his stated motivation in Chapter 7?" Output: [Ch3:42] vs [Ch7:18] — motivation drift — "wants to protect the family" vs "won't lift a finger."

This matters. You are not outsourcing taste; you are outsourcing repetition—the kind that makes you glaze over by pass two and miss the thing that would have been obvious at pass one. The agent performs the first mechanical pass. You perform the judgment pass.

---

## The First Pass Is Boring. That’s Fine.

This week’s PR was +10,398 / −6,317 lines. The machine flagged patterns I would have eventually found… after three exhausting rereads. Maybe four. Maybe never, because I’d have given up and shipped the mess. Redundant exposition. Undermined emotional escalation. Scenes that repeated the same internal beat.

I could have done it myself. But the AI saves hours, each and every time, and surfaces issues I'd have missed—so I can fix them.

---

## Skills and Rules > Vibes and Prompts

Moving away from “Write this for me” and toward “Perform this constrained cognitive task repeatedly” opens up a new world of creativity. The difference is discipline.

If you rely on vibes and long prompts, you get messy output—inconsistent voice, overwritten suggestions, the model guessing what you meant instead of doing the one thing you asked. If you define skills with constraints and output formats, you get reliable tools. That’s the shift to agents—tools that do one constrained job over and over.

You build a project brief—in my setup, a file called AGENTS.md—which anchors the style, states the rules of engagement with the text, defines output formatting, and scopes boundaries. Then you run audits like you would run tests—same skill, same rules, same output shape every time.

The result is not a finished manuscript. The result is a list of high-signal revision targets. You open the list. You decide what’s right. You make the cut.

And it's _still work_. In fact, I have never worked harder at my writing. AI doesn't make it easier; it lets me reach higher.

A starter skill you can steal:

Hat Problem Linter  
- Input: Current scene + previous two scene summaries.  
- Constraint: Do not suggest rewrites. Do not comment on prose quality.  
- Task: Flag any repetition where a character's "hat" (motivation, secret, or key emotional state) is revealed or explained again in the current scene, after already being established in one of the two previous scenes.  
- Output: [File:Line] — [Redundancy Type: Hat Repeat] — [Evidence, e.g., "Olivia removes her hat to reveal she's been protecting her brother" is stated in both Scene 5 and Scene 7.]  

---

## Why This Matters

Humans are creative. Humans are intuitive. Humans are terrible at sustained, low-stimulation repetition. Machines are the opposite. So why not combine them?

Especially if: you’re neurodivergent, you burn hot, you lose energy halfway through revision, or you avoid editing because it drains you. The machine doesn’t get bored. You don’t have to burn out on it—you can spend that energy on the part that actually needs you.

---

## From Highlighters to Linters

Fatigue, more than anything else, is the writer-killer.

Two years ago, this workflow wasn’t viable. Now I can: audit a 70k-word manuscript in seconds, trace character motivations across files, score tonal variance, and surface structural weaknesses without rereading everything manually.

Two years ago I would have printed the thing out and gone through it with a highlighter, and it'd take my blind ass an eternity to get through a revision. But now? I can create at speed, crappy eyes be damned.

---

## What This Is Not

It’s not auto-generation.
It’s not ghostwriting.
It’s not a creativity shortcut.
It’s not “prompt and pray.”

It’s structured assistance. It’s version control for narrative thinking. You still make the cuts. You still shape the prose. You still own the voice. But you stop pretending that doing the same mechanical check ten times is a moral virtue—it’s just fatigue with a halo.

---

The novel isn’t finished. But the structural audit is complete. And that alone moved the project forward faster than any burst of inspiration could have.

This is what AI-assisted actually looks like. Not magic. Not replacement. Just refusing to waste human energy on the boring parts.