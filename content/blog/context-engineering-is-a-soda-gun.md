---
id: archive-context-engineering-is-a-soda-gun
title: Context Engineering Is a Soda Gun
slug: context-engineering-is-a-soda-gun
group: work-notes
publishDate: '2026-09-12T16:55:26.466Z'
excerpt: Context layers, useful constraints, and evals explained through the drinks people actually order.
tags:
  - context-engineering
  - evals
  - ai-enablement
---

# Context Engineering Is a Soda Gun

*On buzzwords, bar equipment, and why your AI keeps serving the wrong drink.*

---

I spent two weeks trying to understand context engineering.

Not because the material was hard. Because the word was empty. It's everywhere right now — conference talks, LinkedIn thinkpieces, job postings — and every definition I found was a different shape of fog. My brain doesn't run on fog. I think in stories. If I can't build the metaphor, the concept doesn't stick, and no amount of rereading fixes that.

Then it hit me all at once: context engineering is a soda gun.

---

A soda gun exists for one reason. You need to deliver a lot of different liquids to a glass, quickly, through a single nozzle. Cola, tonic, soda water, 7Up, the syrups. It's all in there, all pressurized, all one button-press away.

You *could* press every button at once. Bartenders have a name for that drink: the suicide. Every syrup, every base, all at the same time. It is exactly as disgusting as it sounds.

But press the right buttons in the right combination — 7Up, then cherry syrup — and the gun does precisely what it was built to do.

That's context engineering. The model is the gun. It's plumbing — capable, pressurized, completely indifferent to what you ask of it. The skill isn't in the hardware. The skill is knowing which buttons to press, in what order, for the drink in front of you.

Most people who complain that AI gives them mush are making suicides. They dump everything into the prompt — the full style guide, nine examples, every edge case, a Slack thread for flavor — and wonder why the output tastes like all of it at once. The model didn't fail. You pressed every button.

---

The soda gun is the starter metaphor. The honest version is the Coke Freestyle machine.

A Freestyle doesn't give you one row of buttons. It gives you dimensions: base liquids, sugar levels, flavor shots — cherry, lime, vanilla. You're not picking a drink, you're composing one across categories, and the machine handles the permutations because it was *designed* for permutations.

That's what context layering actually looks like. You're not writing one magic prompt. You're tuning across several dimensions at once — instructions, examples, constraints, output format, domain knowledge — and the combinations either pour clean or they choke the nozzle.

Two more pieces, and the metaphor pays for itself.

**Your use cases are your drinks.** Context engineering is not one-size-fits-all. You're building a menu for what people actually order, not a machine that makes every theoretical beverage equally well. Teams get stuck here constantly. They want one context that does everything, and they end up serving the suicide — to everyone, at scale.

**Your evals are your regulars.** This is the part nobody told me. Evals sound abstract — test cases, benchmarks, dashboards. Forget that. Evals are the customers who know their drink by heart. Regulars who order the same thing every visit. Secret shoppers checking whether you nail it when you don't know you're being watched. They know *exactly* what they want, and they will know if they didn't get it. You don't get to argue with a regular about whether the drink is right. The drink is right or it isn't.

That's the stakes. You're not making one perfect drink. You're building a system that serves hundreds of regulars, every day, and every one of them expects their exact combination.

---

So here's the trap, because there's always a trap.

The Freestyle has a failure mode, and it isn't the syrup. It's the touchscreen. Give people a hundred options and they freeze at the machine, or they invent combinations no human should drink. More knobs doesn't mean more capability. Past a certain point it means paralysis and weird drinks.

The same thing kills context systems. Every layer you add, every knob you expose, is another way to pour wrong. The design question isn't "how much context can we give it?" It's "how many knobs do we let people turn before the whole thing breaks?"

At my company, we're investigating context layers right now — separate stations tuned for separate orders instead of one gun trying to pour everything. We didn't get there through theory. We got there because our regulars told us. The evals kept coming back with the same complaint: inconsistent drinks.

---

So if the buzzword is fogging up on you the way it fogged up on me, throw out the fog and keep the bar.

Know your menu. Know your regulars. Press the buttons on purpose.

And whatever you do, don't serve the suicide.
