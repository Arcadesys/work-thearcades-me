---
id: demo-wizwor
title: WizWor
slug: wizwor
group: demos
publishDate: '2026-09-22T15:00:00.000-05:00'
buildDate: '2026-05'
kind: demo
demoNumber: 1
demoUrl: https://wizwor.vercel.app
excerpt: An 8-bit arcade wizard that interviews you, learns what you like, and recommends a classic game.
tags:
  - demo
  - agents
  - games
  - recommendations
---

# WizWor

*What if choosing an old game felt less like searching a database and more like asking the strange wizard who lives inside the arcade cabinet?*

WizWor is an agent-guided classic-game recommender wrapped in an 8-bit terminal. It interviews the player, learns their preferences, and turns that conversation into a recommendation from a local game catalog.

## The experiment

I wanted to find the useful boundary between language-model judgment and deterministic software.

The agent gets to do the fuzzy human part: talk to you, notice what you care about, and translate vibes like “something weird but not punishing” into useful preferences. The recommendation machinery gets the boring, dependable part: work from a known catalog and return something the product can actually stand behind.

The interface leans all the way into the bit. CRT wizard. Synthesized speech. Chiptune audio. A little creature in the machine who would very much like to know what you played when you were twelve.

## What worked

The conversation makes preference discovery feel playful instead of form-like. More importantly, the agent does not need to own the entire system to make the experience feel agentic.

That became the useful lesson: **give the model the part that benefits from judgment, and give ordinary software everything that benefits from certainty.**

## What I kept

WizWor became an early ratchet click for how I build agentic products: explicit tool contracts, bounded authority, deterministic seams, and an experience where the AI is visible because it is actually doing something worth seeing.

[Try WizWor](https://wizwor.vercel.app)
