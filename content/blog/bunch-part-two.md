---
id: archive-bunch-part-two
title: 'Bunch, Part II: After MVP'
slug: bunch-part-two
group: work-notes
publishDate: '2026-09-12T16:55:26.466Z'
excerpt: 'After MVP: building handoffs, testing accommodations, and improving Bunch from evidence.'
tags:
  - bunch
  - accessibility
  - mcp
  - evals
---

# Bunch, Part II: After MVP

Getting Bunch to MVP was not the end of the work. It was the moment the work became real enough to test. Once a tool is deployed, the question changes from "can I build this?" to "does it actually accommodate the life it was built for?" Part two is about that next loop: evaluate what happens, harden what breaks, and keep building from evidence instead of intention.

## The handoff

The first step in productionizing the slice was to ask what would make it useful to another human being. The first killer feature was obvious: when someone returns to the front, the harness should be able to provide a summary of what happened while they were away. I have amnesic barriers. When different alters have been out, I may not remember having a conversation with you at all. That is not a snub, a judgment, or a lack of care. It is simply a gap in continuity that needs context on the other side.

The idea arrived through a mistake in testing. I switched in, and the system helpfully updated me on everything I had done with ChatGPT in the previous twenty-four hours. It was accidental, but it was the first time I could feel what a real handoff might be like. That was when I realized Bunch could be something special: not just a record of activity, but a way to return to my own life with context.

Part two is about building that feature on top of a plugin, and how surprisingly direct that turned out to be. At first, I tried to make it a separate skill: summarize my ChatGPT history from one date to another, then pass that result through the tool. It worked, but it put the accommodation in the wrong place. The simpler design was to have ChatGPT compose the summary when I explicitly recorded a switch. The return event is when I need the context, so that is where the work belongs.

The summary does not just appear and vanish in the conversation. Once I have reviewed it, Bunch writes it back as part of the return record. That closes the loop: the next alter can begin with saved context instead of reconstructing the same gap from scratch.

That sounds small until you ask what the alternative is. The old version of the problem was opening a conversation and trying to reconstruct what I had agreed to, who I had spoken to, and what mattered from a pile of partial memory. The new version is an explicit arrival followed by a handoff: here is what changed, here is what needs attention, and here is what you can do next. The difference is not that Bunch has made my memory perfect. It has made the gap less punishing.

## Constraints are the accommodation

This is where the second half of the work begins. An MVP proves that a useful thing can exist. Productionizing asks whether it remains useful when the ordinary world happens: people overlap, an episode ends independently, a previous conversation contains something important, a return window is long, an image upload fails, or a review needs to be retried. I do not want a system that guesses its way through those moments. I want one that says what it knows, preserves what it does not, and lets the person using it correct the record.

So the rules are load-bearing. Bunch does not infer who is fronting from silence, time passing, or a change in host. A saved return review does not rewrite the notes, to-dos, or decisions it drew from. Important conversation context needs human confirmation before it becomes part of a later handoff. Every mutation carries an idempotency key, because a retry that quietly creates a second arrival is worse than a retry that fails loudly.

These are not implementation footnotes. They are the rules that keep a context tool from telling a persuasive lie about someone's life. A confident wrong answer about where I was on Tuesday is not a bug I can shrug at. It is a false memory with a database behind it.

## The picture has to be right

Here is the part I did not expect to be hard.

The alter lineup is not decoration. It is the recognition surface. When we cannot name who is out—and often we cannot, because ten names is a lot of names when you are dissociated and tired—we pull up the pictures and ask which one appeals. Usually somebody looks and goes *oh, that's me*. The image does the work the name could not.

Which means a bad portrait is not a cosmetic problem. It is a broken accommodation.

The model will happily make an Addie. It will not necessarily make *my* Addie. It gets the hair and loses the eyes. It nails the face and puts her in someone else's jacket. It gives me something perfectly good that I look at and feel nothing about, because recognition is not the same as accuracy and I only have access to one of those from the inside.

I have been chasing this exact problem in another project. I built an image studio to make cartoons of myself and my characters, and I wrote about what came out of that in [The Fox and the Eval](the-fox-and-the-eval-publishing.md): three different kinds of judgment, stacked, because one is never enough.

The **code grader** asks whether I defined the character well enough to test at all. Required fields. Locked traits. Deterministic validation. This is the step that turns "she looks like herself" from a feeling into a contract. It is also the step that keeps embarrassing me, because half the time the honest answer is that I never wrote down the thing I am upset about losing.

The **model grader** asks whether the image honored the contract. Glasses warp. Hands do what hands do. The background quietly becomes a different room. A model can produce the right character and still fail the brief in four places.

The **human grader** asks whether the alter recognizes themselves. That one I cannot automate, and I would not want to. It is the entire point of the tool. Nobody else gets a vote on whether a picture of Lucy reads as Lucy.

[image placeholder: The alter lineup at large size, using staged or approved profiles, shown beside the recorded feedback on one portrait. The point is to show a picture being *judged*, not just displayed.]

Bringing that stack to Bunch changes what a profile picture *is*. It stops being a file attached to a row. It becomes a claim about identity that somebody has to sign off on.

## A thumbs-down is a claim, not a mood

The machinery I built for this in the image studio is the part I actually want to talk about, because it generalizes and it is the thing I am now porting into Bunch.

When I rate a generated image—up or down, with a note—the system does not just store a rating. It captures an *eval claim*: the composed prompt exactly as it was sent, the character profile as it existed at generation time, every reference image that fed the generation, the provider settings, and a content hash of the output. All of it, frozen, at the moment of judgment.

That last detail matters more than it sounds. A profile that changes next Tuesday would otherwise make last Tuesday's verdict unreadable. If I do not snapshot the character as it was, I have a thumbs-down attached to a description that no longer exists, which is worth roughly nothing. Evals rot when the thing they judged is allowed to drift out from under them.

Then it ships. The claim goes out to an eval trace service over MCP, artifacts and all, with the sources and the output uploaded as manifests—content hash, mime type, byte size, dimensions—rather than as loose files with names attached to them.

The failure handling is the part I am proudest of, and it is entirely unglamorous:

- If I revise my rating, the new claim **supersedes** the old one. It does not overwrite it. The record of having changed my mind is itself data.
- If there were no source references, the claim is marked **ineligible**—not delivered, not silently dropped, not guessed at. A judgment with nothing to compare against is honest about being unjudgeable.
- Delivery runs through an outbox with exponential backoff, capped at an hour, eight attempts. Then it goes to **permanently failed** and stays there where I can see it.

Nothing here is clever. All of it exists because I will not remember. If a delivery quietly fails at 2 a.m. and nobody records that it failed, then three weeks later I am looking at an eval corpus with holes in it and no way to know which holes are real. The system has to hold what I cannot. That is the same sentence I would write about the return summary, which is how I know it is the right architecture and not just an architecture.

## Tracing in situ

Here is my whole opinion about benchmarks: mine would be useless.

I could build a clean synthetic eval set for Bunch. Fake alters, fake switches, tidy return windows with a beginning and an end. It would pass. It would tell me nothing, because the failure modes I care about do not occur in clean conditions. They occur at midnight when a switch was messy, the previous episode was never closed, the host is not the person fronting, and the human involved has maybe ninety seconds of executive function left.

So the corpus is the life. I run the evals in situ—on my own real usage, on the traces of what actually happened—and I read the traces to find where the system guessed.

That is the specific thing I look for. Not errors. Errors are easy; they announce themselves. I am hunting for the places where the harness filled a gap smoothly and I did not notice. Where a tool got called with an inferred value instead of a stated one. Where a long silence turned into an assumption. Where a retry got treated as a new event. Where hosting and fronting collapsed back into each other because the model found it more natural to think of them as one thing.

A trace makes that visible in a way that using the tool never does. When I am inside the conversation, a smooth answer feels like the system working. In the trace, I can see it was working from something nobody told it.

And there is a real tension here I have not fully solved. The trace of a DID accommodation tool is about as sensitive a document as exists. It is my medical reality, my relationships, my worst weeks, in structured form. So what leaves stays narrow—manifests, hashes, settings, the shape of a decision—and the life itself stays put. An eval pipeline that requires me to hand over my continuity in order to improve my continuity has failed a test I care about more than any of the ones it runs.

## The loop

I am learning to treat every new feature as a claim I can test. Does a return summary cover the full recorded interval? Does it preserve uncertainty instead of inventing continuity? Can it survive a retry without duplicating a record? Does a portrait get recognized by the person it is supposed to be? Does the information stay readable when the screen is small, the text is large, and the person using it has only a few minutes of attention?

A tool built for disability has to be tested in the conditions disability actually creates. Not in the clean demo where every record is present and every user remembers the setup. In the dark, tired, half-here conditions where the accommodation is load-bearing—which is the only time anyone needs it.

So: build the smallest useful thing. Put it in the world. Use it. Trace what it did. Keep the parts that make a return gentler and replace the parts that create more work.

Bunch is not done and should not pretend to be. But I know the difference now between a tool that works and a tool I can prove works, and only one of those is safe to hand somebody their own life with.
