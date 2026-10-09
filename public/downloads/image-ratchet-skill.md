---
name: image-ratchet
description: Improve an AI-generated image by changing one visible thing without losing accepted parts of the current best. Use when generating, transforming, evaluating, or repairing an image where identity, composition, objects, or earlier wins must survive.
---

# Image Ratchet

Improve one visible thing while preserving everything the user has already accepted.

## Establish the current best

Before generating or editing, identify:

- The current-best image or actual visual reference.
- The picture's job: what the viewer should understand first.
- The keep-list: identity, composition, pose, objects, setting, lighting, text, or other accepted traits that may not drift.
- One observable win for this pass.
- The job of every reference. A source may own composition, identity, pose, or rendering style; do not collapse them into vague inspiration.

If a required identity or composition reference is missing, return `NEEDS_INFORMATION` or exclude the unsupported subject. Do not invent a confident substitute.

## Make one focused pass

Generate or repair from the current best and the references that actually carry the protected information.

- Name one defect or desired change.
- Describe anatomy and contact with physical relationships: where a tail attaches, which hand holds an object, what supports a pair of glasses, or where feet meet the floor.
- Say what must remain unchanged.
- Do not bundle unrelated improvements into the same repair.

For a new character in a photographic backplate, consider a human-first checkpoint: choose the pose, insert a human stand-in, check scale and physical contact, convert only that person, then compare with both the checkpoint and original backplate. Treat this as a useful option, not a universal rule.

## Judge with the ratchet

Inspect the visible result in this order:

1. Did the named change improve?
2. Did every item on the keep-list survive?
3. Does the picture retain its dominant story beat and first eye landing?
4. Do anatomy, object contact, perspective, lighting, and occlusion remain physically convincing?
5. If a person or recurring character is represented, do they recognize the result?

Use one verdict:

- **Keep:** The named change improved and the prior wins survived. Promote this candidate to current best.
- **Revise:** The direction is promising, but a named defect or regression remains. Keep the prior current best and attempt one narrower repair.
- **Discard:** The pass fixed the defect by making a different picture or losing an essential constraint. Keep the prior current best.

Do not treat technical correctness as human approval. Code can validate a contract and a model can compare references; the represented person owns the final recognition test. If no creator score or acceptance was recorded, leave it unknown.

## Report the pass

Return a compact ratchet log:

- **Current best:** the baseline used for comparison.
- **Named win:** the one change attempted.
- **Keep-list:** the accepted traits protected in this pass.
- **Verdict:** Keep, Revise, or Discard.
- **Visible evidence:** what changed and what survived or regressed.
- **Next decision:** one small question only when taste or intent must come from the user.

Keep generated, uploaded, saved, selected, and approved as separate states. A candidate is not canon until the appropriate person accepts it.

---

Adapted from *How to make ai generated pictures that aren't slop* — [work.thearcades.me/guides/how-to-make-ai-generated-pictures-that-arent-slop](https://work.thearcades.me/guides/how-to-make-ai-generated-pictures-that-arent-slop)
