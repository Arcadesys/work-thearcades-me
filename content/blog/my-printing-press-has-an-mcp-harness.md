---
id: archive-my-printing-press-has-an-mcp-harness
title: My Printing Press Has an MCP Harness
slug: my-printing-press-has-an-mcp-harness
group: work-notes
publishDate: '2026-09-12T16:55:26.466Z'
excerpt: Giving a publishing system explicit tools, schemas, and an agent-accessible workflow.
tags:
  - arcadeprofile
  - mcp
  - publishing-systems
---

# My Printing Press Has an MCP Harness

*How I wired payload-mcp so I could serialize an entire novel on my blog in a single sitting.*

I built a printing press.

Then I gave it an MCP harness.

Which is a dramatic way of saying: I wired my Payload CMS so Claude can publish to it through tools instead of making me click around like a medieval clerk with Wi-Fi.

Here is the part that is actually interesting. It is not "I built a blog." Anyone can build a blog. It is that the publishing actions — create a post, set a slug, add tags, schedule it for next Wednesday at 9am, suppress the newsletter send because this one is part of an import batch — are now first-class tools an agent can call. The CMS has handles. The handles have schemas. The agent can grab them.

That changes what the blog is.

## What I actually built

The MCP server runs in two transports: stdio for local Claude Code sessions, and HTTP for things that need to call it across the network. Both speak the same tool set. The publishing tool schema looks something like this (abbreviated — real schema lives in the repo):

```ts
{
  name: "create_post",
  inputSchema: {
    title: "string",
    slug: "string",
    body: "richtext",
    tags: "string[]",
    author: "string",
    publish_status: "draft" | "scheduled" | "published",
    scheduled_publish_at: "ISO8601 string",
    newsletter_heading: "string",
    newsletter_description: "string",
    skipNewsletter: "boolean",
    metadata: "object",
    discoverable: "boolean"
  }
}
```

Most of those fields are obvious. The two that earned their keep are `publish_status` and `skipNewsletter`.

`publish_status` is the workflow field. Draft means the post exists but is invisible. Scheduled means the post will publish itself at the timestamp. Published means it is live. There is no separate Payload "draft version" branching — that path created version-table weirdness that I did not enjoy debugging — so this single field is the source of truth for where a post is in its life cycle.

`skipNewsletter` is the safety latch. The newsletter send hook normally fires when a post transitions to published. During an import — say, dumping forty short stories into the CMS — you do not want to detonate forty separate emails into your readers' inboxes. `skipNewsletter: true` tells the post to publish without telling ActiveCampaign about it.

## The actual workflow

With those two fields wired, the conversation now goes like this.

I hand Claude a folder of stories. I say: serialize this. Monday, Wednesday, Friday at 9am Central, starting next Monday. Skip the newsletter on the import — I will turn that back on for new posts going forward.

Claude does this:

1. Splits the file into individual posts.
2. Generates slugs from titles.
3. Writes a short newsletter description for each, even though those won't fire today.
4. Calls `create_post` once per story with `publish_status: "scheduled"` and `skipNewsletter: true`.
5. Reports back which posts went where on the calendar.

What used to be "copy, paste, format, save, copy, paste, format, save, die" is now one prompt. The medieval clerk has been replaced by something that does not get tired and does not skip a metadata field at 11pm.

## Why this is different from "AI writes the blog post"

I want to be specific about this, because the framing matters.

I am not asking Claude to generate the writing. The writing is mine. The stories existed before this pipeline existed. What Claude is doing is operating the publishing machinery — under rules I set, against a tool schema I defined, with a workflow field that gives me a single point of control.

That is the difference between a ghost in your CMS and a printing press operator. The press operator does not write the book. The press operator runs the press while you write the next one.

## What this unlocks

Once the CMS has handles, every other piece of the pipeline can grab them too. Scheduled jobs in GitHub Actions can call `update_post` to flip `scheduled` posts to `published` at the right time. The newsletter renderer can pull a post by slug and turn it into HTML email. A future "republish with corrections" workflow can update body and bump a metadata field without touching publish status.

The CMS stopped being a destination. It became an interface.

## The real win is not technical

The real win is that I get to write the way I love to write.

Live.

Not live as in livestreamed. Live as in alive.

A chapter goes out. People read it. They can hit reply. They can tell me what landed, what hurt, what made them laugh, what made them feel seen. And then I keep writing.

That feedback does not control the story. The audience does not get the steering wheel. But the room gets to breathe with me.

That is the thing I missed about email lists. The porousness. The sense that the work was not sealed behind glass. The author was there. The readers were there. The mailbox had a pulse.

Now my printing press has an MCP harness. Now my blog can serialize a novel. Now the work can leave my hands and still have a way back.

That is not just a publishing pipeline. That is a living circuit.

## The line

The blog is not a place I paste writing anymore. It is a machine I can hand writing to.

The inbox is not a funnel. It is a return path.
