---
id: archive-building-my-own-publishing-pipeline-with-agents
title: Building My Own Publishing Pipeline With Agents
slug: building-my-own-publishing-pipeline-with-agents
group: work-notes
publishDate: '2026-09-12T16:55:26.466Z'
excerpt: Building a publishing and email pipeline, with several goblin traps along the way.
tags:
  - arcadeprofile
  - automation
  - publishing-systems
---

# Building My Own Publishing Pipeline With Agents

_From Payload to ActiveCampaign to the inbox, with several goblin traps in between._

A week ago, “I miss email lists” was just a sentence I said to friends over dinner. And it's true; I miss the intimacy, anonymity, and kindness of the pre-social media web. I longed to bring it back.

A week later, ActiveCampaign helped me achieve it. And sure, anyone can build a newsletter signup form. The weird part is that I built a publishing pipeline around the _feeling_ I wanted to recreate.

The old internet feeling.

You wrote a thing. It arrived in someone’s inbox. They read it because they had asked you to send it. No algorithmic fog machine. No engagement bait. No mystery about whether the post reached anyone. Just a writer, some readers, and the little dopamine thunderclap of “new story in my inbox.”

So I built that.

With agents.

In bursts.

And because I work at ActiveCampaign, I also got to dogfood the exact kind of workflow we talk about all the time: creator has an idea, creator wants to reach an audience, automation handles the boring connective tissue.

## What the pipeline does

End to end, the system works like this:

- **Payload** stores the posts: body, slug, tags, workflow state, newsletter copy, and metadata.
- `publish_status` tracks the workflow: draft, scheduled, published.
- A publishing process flips scheduled posts to published when their time arrives.
- On publish, a hook renders the post into HTML email.
- A local preview command lets me inspect the rendered email before anything touches a real audience.
- **ActiveCampaign** sends the campaign to the list.
- The reader gets fiction in their inbox, formatted and ready to read, with a link back to the post.

That tidy little summary took a week.

It also has at least four places where the pipeline tried to eat itself.

Let’s talk goblins.

## Goblin trap #1: choosing the right ActiveCampaign API path

My first instinct was to use the newer ActiveCampaign API path for campaign creation. It looks like the obvious choice. It is documented. It is REST-shaped. It feels like the road with fresh paint.

For my specific use case, though, I needed to create a campaign against a specific list with a specific message body and sender configuration. The newer path was not the cleanest fit for that job.

And this wasn't my idea; it was Active Intelligence's.

That was the product lesson hiding in the wiring: sometimes “newer” and “right for this workflow” are not the same thing. The workflow decides.

```
const params = new URLSearchParams({  api_action: "campaign_create",  api_output: "json",  type: "single",  name: campaignName,  list: String(listId),  // sender info, message html, fromemail, etc.});await fetch(`${AC_BASE}/admin/api.php?api_key=${AC_KEY}`, {  method: "POST",  body: params,});
```

Once I stopped trying to make the shiny path fit the workflow and used the API surface that matched the job, campaign creation worked.

That matters. Not just as an implementation note, but as a customer empathy note.

A customer does not care which API generation solved the problem. They care whether the story reached the inbox.

## Goblin trap #2: the cursed `fetch:` placeholder

At one point, the wrong constructor mode in my ActiveCampaign client wrapper produced a request body where the URL field contained the literal string `fetch:` instead of the actual fetch target.

The send “succeeded.”

The campaign rendered.

The body was cursed.

This is exactly the kind of bug that makes automated publishing feel dangerous. The system did not explode. It smiled politely and handed me a plate of spiders.

That is why the preview step became non-negotiable.

## Goblin trap #3: previewing through ActiveCampaign

For one regrettable afternoon, I previewed emails by creating a real draft campaign in ActiveCampaign, checking it in the preview pane, then deleting it.

That worked, technically.

It was also bad.

It was slow. It blurred ownership. Was I debugging my renderer, or ActiveCampaign’s preview behavior? And worst of all, it put me one clumsy click away from sending test sludge to real subscribers.

The fix was a local preview route.

The renderer takes a post, returns an HTML document, and opens it in my browser:

```
pnpm preview:newsletter --slug=chapter-one# writes ./tmp/preview.html and opens it
```

Now ActiveCampaign only sees email that is supposed to become a campaign.

I debug my code in my environment first. Then AC does what AC is good at: deliver the message.

## Goblin trap #4: Payload’s draft/version behavior

Payload has a real draft and version system. It is powerful. For a lot of publishing workflows, it makes sense.

For mine, it added too much state.

I wanted a flat publishing model: draft, scheduled, published. Instead, I kept ending up with version-table behavior that made the simple question “is this live?” require more thought than I wanted to spend.

So I replaced it with one field on the post itself.

```
type PublishStatus = "draft" | "scheduled" | "published";
```

The cron-style publishing job looked for scheduled posts whose publish time had arrived, then flipped them to published.

```
const due = await payload.find({  collection: "posts",  where: {    publish_status: { equals: "scheduled" },    scheduled_publish_at: { less_than_equal: new Date().toISOString() },  },});for (const post of due.docs) {  await payload.update({    collection: "posts",    id: post.id,    data: { publish_status: "published" },  });}
```

One field. One source of truth. The renderer, the publishing process, and the automation layer all agreed on the state of the post.

The version table stopped being load-bearing.

The mental model collapsed into a small state machine.

## The agentic angle

The reason this took a week instead of a month is that I did not debug alone.

Claude diagnosed the `fetch:` placeholder bug from a stack trace and a curl. Cursor wrote the migration that introduced the workflow field. Gemini reviewed the PR and caught two places where I checked `publish_status` against a loose string instead of the enum.

I still made the product decisions.

I still decided what I was building.

I still owned the taste, the architecture, and the “why.”

The agents helped me move through the parts where the system was lying to me about why it was broken.

That is the role I want agents in.

Not “write my software.”

More like: “stand next to me while I write my software and warn me before I walk into a glass door.”

## And then ActiveCampaign solved the cron problem

The final turn was the funniest one.

I had been thinking about scheduled jobs. GitHub Actions. Vercel cron. External orchestration. All the usual little gears.

Then I remembered: ActiveCampaign already knows how to watch an RSS feed.

That changed the shape of the whole system.

Instead of making my app responsible for every piece of timing and delivery, I can publish content, expose the feed, and let ActiveCampaign handle the recurring campaign behavior.

That is a better architecture.

It is also a better product story.

The app owns the content. ActiveCampaign owns the relationship with the reader. RSS becomes the handshake between them.

That is the old internet and the modern automation stack sitting at the same lunch table.

## The real thing I built

The pipeline matters, but the pipeline is not the point.

The point is that I wanted a feeling back.

I wanted the intimacy of email lists. I wanted serialized fiction delivered like a little paper boat across the digital river. I wanted readers to get the next chapter because they asked for it, not because an algorithm decided the post had enough heat.

So I built the door.

Payload holds the stories.

Agents helped wire the frame.

ActiveCampaign rings the bell.

And now, when I publish, the old internet gets one small hallway back.