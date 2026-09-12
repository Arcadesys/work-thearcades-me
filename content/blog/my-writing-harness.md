---
id: archive-my-writing-harness
title: I Built a Writing Harness and It Actually Sings
slug: my-writing-harness
group: work-notes
publishDate: '2026-09-12T16:55:26.466Z'
excerpt: How tools, skills, and revision loops help me stay inside the story.
tags:
  - writing-harness
  - agentic-ai
  - accessibility
---

# I Built a Writing Harness and It Actually Sings

I think I'm finally finding my groove writing with an AI harness. The trick wasn't better prompting, or the next best skill chain. It was a simple set of rules refined over many turns of refinement.

The struggle was never finding prettier words. The words matter, of course. But the story matters first: rhythm, pressure, motion, the life a storyteller breathes into a world. AI doesn't have lived experience. It doesn't know what a story costs. But it can help with the work around the work. It can speed up the real work. And the real work is building a story that holds a tune.

Here's how I do it now.

## The Setup

Four tools, each doing one job:

- **Obsidian** for the actual writing. (I'm a sucker for their customization, and you can make it make typewriter sounds.)
- **Claude Cowork** for the revision loops.
- A **private GitHub repo** for document storage.
- **Claude Code** to clean up the git messes I make along the way.

Claude has access to a project with ~1,000,000 words of my hand-written fiction as both style guide and idea surfacing. I've instructed it to write like me, to find patterns from incomplete fragments that meet the moment I need while noveling.

That's the whole rig. Nothing exotic. I also created some skills based on the way I wanted to work, not the way some app forced me to work. I assumed everything was on the table. Some of those skills include:

/pantser-outline - takes a transcribed braindump and turns it into an outline I can follow in my writing environment. It splits the scenes into separate markdown files to maximize context efficiency and make the progress of the piece easier to track.

/refine-fiction - attempts, without overwriting existing prose, to finish whatever it can. If it notes a beat that needs extra room, it adds it. If I forget to add visual detail - which let's face it, the blind enby is _always going to miss the details_ - it covers for me.

That's it. Two skills, run over and over again, until the work is done.

---

## I Start by Talking

I open voice mode and just talk through the story with Claude. When I get stuck, I ask my assistant for ideas — like a writer in a writer's room, sometimes I just need somebody to bounce ideas off while the iron is hot and the well is dry.

I start from the beginning of whatever I'm reviewing. Claude Cowork has memory across the entire folder so it can remember past edits. So I start with something simple:

> It's a boy-meets-girl meet-cute, but the girl is actually a witch who is being hunted. How will the boy help out when the witch is overwhelmed?

And then I have Claude tell the story back to me.

I go again. And again. Until eventually I talk myself out. Then I tell the story to the assistant in full, one last time, as best I can in the moment. Something like:

> "An awkward boy asks a girl to prom, and on the way he discovers she's a witch — because some big magical *something* comes to hunt them down. They beat the monster with teamwork and have a great time at prom together."

Then I run `/pantser-outline`. It reviews the whole conversation and assembles a working outline out of exact quotes from what I actually said.

## Then the Loop

This is where I've stopped thinking in numbered drafts and started thinking in terms of *refinement.*

First I have Cowork ingest the outline and propose scenes. We go back and forth until I've got something worth writing start to finish. I used to think of writing as filling in the whole story at once, then rewriting and retelling until it sounds right. This is the same thing. It's just faster.

Cowork fills in a set of `scene.md` files. Each one holds a segment of the pantser outline. And here's the rule: **Claude does not replace my prose.** It augments. It asks questions. It fills in blanks. That's it.

From there I go scene by scene — reading, writing, revising as I need to.

Because the AI is tracking the *purpose* of each scene, I can jump around. Say I decide the boy should try to fight the magical thing, get dusted, and then drive the car into the creature at the last second. I can make those edits with a few clicks across the scenes. Or, if I'm in flow and don't want to break to do the bookkeeping, I tag Cowork to refine the outline while I keep writing the main line.

Then I just dance. Drafting in Obsidian, dropping notes as scenes come to me, and tagging in the agentic revision loop whenever I feel stuck.

> It had two point five minutes since Marcus discovered his girlfriend was a witch, so he was over the whole magic thing already.
> 
> The thing had her pinned against the gymnasium wall, all wrong angles and teeth, and Marcus was out of ideas. He had a Toyota Camry and a learner's permit. He had maybe six seconds.
>
> He floored it.
>
> The impact was biblical. Steam. Silence. The creature dissolved into smoke so thick that it was definitely going to give him cancer later.
>
> She crawled out from under the crumpled hood, dress ruined, corsage somehow intact. Looked at him. Looked at the car.
>
> "Nice driving."
>
> Marcus stared at the wreckage. "My parents are gonna kill me."
>
> She laughed. He decided that was worth it.

## Why It Works

It works because nothing in the harness pretends to be the author. The tools hold the scaffolding so I can hold the story. The AI tracks purpose and continuity — the stuff my brain drops on the floor — and I do the part only I can do: breathe the life in.

I didn't build a machine that writes for me. I built a machine that protects flow.

For the first time, I don't feel like I'm wrestling the machinery of a draft. I feel like I'm staying inside the story longer.

That's the real win. Not better prompts. Not more elaborate agents. Not some grand theory of AI creativity. It's a new way of working, where your brain gets to stay inside the story, the rhythm, the moment of creating instead of the words themselves.

In a way, it's become my pre-editor editor - one that knows my writing better than I do and can surface incredible, genuine, and unique ideas from which my stories can grow.

Taste, voice, prompts, and a harness will become a new way of writing, just like modern design systems allowed House of Leaves to happen, as typewriters made storytelling more acessible as both a hobby and a way of life, as computers made multimedia projects like "I Have No Mouth and I Must Scream" possible that still hold up today.