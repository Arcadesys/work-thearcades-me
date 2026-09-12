---
id: archive-bunch-part-three
title: 'Bunch, Part III: The Group Photo'
slug: bunch-part-three
group: work-notes
publishDate: '2026-09-12T16:55:26.466Z'
excerpt: Making an inspectable group-photo workflow that preserves the people in the picture.
tags:
  - bunch
  - ai-images
  - evals
  - accessibility
---

# Bunch, Part III: The Group Photo

The first killer feature I imagined for Bunch was not the handoff.

It was the group photo.

That sounds frivolous until you understand what the lineup is doing. The alter pictures are not profile decoration. They are a recognition surface. When I cannot reliably tell you which of ten names is present, I can look at a set of faces and ask which one feels like me. Sometimes the answer is immediate. Oh. That is me.

So I imagined the next step: not just a lineup of separate portraits, but a picture of us together. A real group photo. Everybody in one place, arranged like a family portrait or a cast shot. The image would make the invisible structure of our shared life visible. It would be a souvenir, a reference, and maybe a way to feel less like a collection of disconnected records.

I thought it would be a killer feature.

Then I tried to build it.

## The fantasy of the picture

The fantasy was easy to describe. Give the system the people, their pictures, and a scene. Put some of us in the front and some in the back. Let the tool make a coherent image that still looks like us.

The actual problem was that each part of that sentence hides a decision.

Which picture is authoritative? A gallery image is not necessarily an approved identity reference. A generated image can be beautiful and still fail to look like the person it is supposed to represent. A current profile picture can be selected for recognition without being suitable as a compositional reference. If the system does not know the difference, it will quietly turn a missing reference into an invented one.

Who belongs in the picture? The answer is not “everyone the database can find.” Some people may not have a ready reference. Someone may be intentionally left out of this particular scene. Someone else may have a profile that is still provisional. A group photo cannot solve those cases by pretending they are solved.

Where does everybody go? “Front row” and “back row” sound like understanding. Sometimes they are only placement hints. A system can store a depth value and still not know that one person is blocking another, or that the composition feels emotionally wrong.

The feature needed to be a little less magical than I first wanted. That was not a failure. It was the beginning of a usable contract.

## Make the composition inspectable

The useful version starts with staging. There is a private backplate: the place where the picture will happen. There is a scene map: the planned composition. There are explicit placements for each person, including position, depth, and a zone. There are relation hints, but those hints are not allowed to masquerade as perception.

That distinction matters. If the analysis says `PROVISIONAL`, then it is provisional. If a placement is called `front-row`, that records an instruction about the intended composition. It does not mean the system understands the visual relationship between people. The data is there to be inspected and corrected, not to lend confidence to a guess.

The project itself is private and owner-scoped. The backplate, scene map, version, and placements belong to the person who made the picture. Saving one person's placement updates the composition rather than creating a mysterious second copy. A new version tells me that the plan changed. That is ordinary software behavior, but ordinary software behavior is exactly what keeps a personal image from becoming an untraceable blob.

I started thinking of the composition as a little production rather than a single generation. First establish the stage. Then place the people. Then render. Then inspect. If something is wrong, repair the local part that is wrong instead of regenerating the whole group and hoping the new version is nicer.

That last part is important because group images are very good at hiding individual failures. A picture can look impressive at a glance while quietly turning one person into somebody else. The more people there are, the easier it is for a successful overall composition to conceal an identity failure.

## The eval is the feature

This is where the image studio work came back into Bunch.

I do not want to evaluate a group photo by asking whether it is pretty. Pretty is not the same as useful, and useful is not the same as recognizable. The evaluation has to ask a few separate questions.

First: did the composition use the right sources? Were the selected references actually approved for this person? Did the system leave somebody out when the person was not ready, rather than inventing an appearance to fill the empty space?

Second: did the render preserve the locked traits? Species, face, hair, glasses, clothing, body shape, and other identity details are not optional texture. A group photo is allowed to be stylized. It is not allowed to erase the reason the image matters.

Third: does the whole scene work? Are the people placed where the plan says they should be? Are they visible? Does the depth order hold? Does the background support the image instead of swallowing it?

And finally: does the person recognize themselves?

That last question is still mine. A code check can confirm that a placement exists. A model check can compare the output with the supplied references. Neither can decide whether I look at the picture and think, yes, that is me. The human judgment is not an embarrassing gap in the evaluation. It is the acceptance test.

The group photo also made the failure boundary more obvious. A missing reference is not a prompt-writing problem. It is a missing-information problem. The right result is `NEEDS_INFORMATION`, or a group picture that excludes only the unready person, not a confident substitute. A provisional scene map is not a verified understanding of the people in the scene. A generated candidate is not a saved profile picture. A prepared upload is not proof that the image persisted.

Those distinctions can feel fussy when all I want is a nice picture. They stop feeling fussy when the picture is supposed to help me recognize myself.

## What the picture is actually for

I was initially attracted to the group photo because it felt like a feature people would understand immediately. Here is the bunch. Here we all are.

But the deeper value is not that it makes a good announcement image. It is that the picture gives the shared life a visible shape without pretending the shape is simple. We are not one person split into decorative avatars. We are multiple people responsible for one body, one home, one set of commitments, and one history that we do not always experience continuously.

A group photo can hold that contradiction better than a table of records can. It can say: these people belong to the same life. It can also say: they are not interchangeable.

That makes the image unusually high stakes for something that began as a fun feature idea. If one person is consistently drawn wrong, the image is not just aesthetically off. It teaches the wrong recognition cue. If somebody is missing because their reference was not ready, that absence should be legible as a boundary, not quietly filled by the model. If the system claims to know a relationship it only guessed, it has turned composition into fiction.

The image has to be fun. I still want the beach, the ridiculous outfits, the peace signs, and the feeling that we made something together. But fun is allowed to sit on top of truthfulness. It cannot replace it.

## Current best

The group photo is not yet the effortless killer feature I imagined. It is a small composition system with explicit stages, private storage, placement records, provisional analysis, and a human acceptance gate.

That sounds less exciting. It is also more useful.

The current best is not “the model made a picture of everybody.” The current best is: I can define who is ready, choose the references that count, stage a private scene, inspect the placements, render a candidate, and judge whether the people in it still look like themselves. When the answer is no, the system has enough structure to tell me what kind of no it is.

That is what the eval bit changed. It turned the group photo from a magic trick into a process I can trust a little more. The process is slower than pressing a button. It is also much less likely to hand me a polished image that quietly loses somebody.

I still think the group photo could be a killer feature. I just mean something different by killer now. Not the feature that produces the most delightful demo. The feature that survives contact with the people it is supposed to represent.
