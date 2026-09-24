---
id: heinlein-2026-09-24
title: Why I Built Heinlein
slug: why-i-built-heinlein
group: work-notes
publishDate: '2026-09-24T22:37:28.000Z'
excerpt: How I turned repeatable book-layout rules into a five-format publishing pipeline, with AI helping me build and review it.
tags:
  - publishing-systems
  - writing
  - ai
  - markdown
hero:
  src: 'https://puhixbchomgvn0ti.public.blob.vercel-storage.com/images/heinlein/2026-09/07-scratch-cover-hero-october.png'
  alt: 'An early scratch cover idea for Estelle’s Children beside text identifying it as one of several cover ideas.'
seo:
  title: Why I Built Heinlein
  description: How I built a five-format publishing pipeline from Markdown and use AI readers, cross-model review, and my own judgment to make books.
---
# Why I Built Heinlein

I’ve been writing stories for about thirty years. I’ve also laid out books, edited submissions, and been an editor in chief. I know how much work sits between a manuscript and a book someone can actually read.

A lot of that work has meant wrestling with a Word document formatted in ways I can’t easily see. I’d rather work in Markdown, where the structure is in the text and I can tell what’s going on.

The same question kept coming up in production: which parts of getting a book made require someone’s judgment, and which parts am I checking over and over because they follow a rule?

![A reconstructed conversation card with the author's realization that much of layout is loops, followed by three example layout checks.](https://puhixbchomgvn0ti.public.blob.vercel-storage.com/images/heinlein/2026-09/02-layout-is-loops.png)

Start a chapter on a new page. Mark a scene break. Check whether a heading has been stranded without the paragraph beneath it. I’ve done those checks by hand. Eventually I realized how much of layout is a loop.

I couldn’t make book production perfect. But I could use the layout rules I already knew. So instead of saying, “I can’t make it perfect,” I said, “I can use these rules.”

That realization became [Heinlein](https://github.com/Arcadesys/heinlein). I started with a working prototype in my writing archive, wrote down what I needed from it, and built it into a reusable publishing pipeline. One person, five output formats, with AI helping me write and test the tool.

![The public La Ligne du Marais Markdown source beside the title page generated for its PDF edition.](https://puhixbchomgvn0ti.public.blob.vercel-storage.com/images/heinlein/2026-09/04-markdown-to-page.png)

A Markdown manuscript goes in; Heinlein produces PDF, EPUB, Word, HTML, and plain text editions using the same design rules. I can preview the result, find what looks wrong, change the source, and build it again.

![A real Heinlein PDF interior page beside the five supported output formats.](https://puhixbchomgvn0ti.public.blob.vercel-storage.com/images/heinlein/2026-09/05-five-formats.png)

The name nods to Robert Heinlein’s practical rules for working writers: write, finish, send the work out, and keep it in circulation. My tool helps with the part where the finished text has to become something people can open.

Heinlein doesn’t make every layout decision for me. I still inspect the editions and fix problems. But I can see what my book might look like without waiting until the end of the process. I can try a change and make another edition while the decision is fresh.

One refinement came from a print-specific rule: when an afterword is marked as a major section, I want a completely blank, unnumbered leaf before it. We made that instruction part of the Markdown and checked the actual rendered pages. The ebook keeps the heading without the print-only blank leaf.

![Three actual pages from Heinlein's regression fixture: the story ends, one unnumbered blank leaf follows, then the afterword begins.](https://puhixbchomgvn0ti.public.blob.vercel-storage.com/images/heinlein/2026-09/06-afterword-blank-leaf.png)

I’m also a [pantser, not a planner](https://www.publishersweekly.com/pw/by-topic/authors/pw-select/article/85267-pantser-or-planner.html). I find the story by writing it. I often keep scenes in separate pieces of roughly a thousand words so I can work on one section at a time. That gives me clean context for an edit. I can ask whether a reader who lands in that scene would want to keep going. Then I can put it back into the larger book.

None of this makes the writing quick. One pivotal chapter of my current novel took me about forty hours to draft. I’ve spent hundreds of hours on the book. I wrote it. I made the decisions about it.

That chapter carries a lot of weight, so I gave it a particularly close read. I also ran ten AI reader agents on Codex’s Luna model, each assigned a different sensitivity lens. That was a fast first pass. I may still hire a human sensitivity editor. I haven’t decided. What changed is that I can afford to do an early pass like this whenever the work calls for one, while I’m still close enough to the draft to act on what I find.

How do I catch hallucinations before I publish? I feed ChatGPT’s output to Claude, of course:

> You are a final review gate for this publication. Be ruthless. What is wrong?

Then I bring Claude’s feedback back to ChatGPT, make the fixes, and check the result myself. Another model can catch things I missed. It doesn’t get the final say.

That’s what AI help has given me across this work. I can bring in readers for a fast first pass. I can audit the production work. I can turn my Markdown into book formats while the work is still in progress. The writing still takes the time it takes.

I’m running FREE PLAY Publishing as a publishing company of one. I’m an artist making books, and I’ve built tools that let me keep making them.
