---
name: canvas-planner
description: "Use before authoring a Sprout canvas (a kid-facing HTML activity) to plan its design in the Sprout child design language. Picks a page archetype, names the copy-paste skeleton to start from, and produces a slot-fill plan — data block, copy, tier adaptations, SDK behavior hooks, and the polish checklist — so the canvas you then build looks and behaves like a native Sprout child screen even when authored by a small model."
---

# Canvas Planner

## Purpose

Plan a canvas's design **before** you write its HTML, so the result follows the
Sprout child design system instead of ad-hoc styling. A canvas is authored HTML
running in a locked sandbox; it reproduces the design language in its own markup
(it cannot import the child component library).

The core move: **do not compose screens from scratch — start from an archetype
skeleton and fill its slots.** The skeletons in `design/archetypes/` are
complete, analyzer-clean, SDK-wired canvases with marked content slots. Polish
lives in the skeleton; the plan's job is choosing the right one and specifying
what goes in the slots.

Use it for prompts like:

- "Design a multiplication quiz canvas for my 7-year-old."
- "Plan a reading check-in activity."
- "I want a mission-lobby screen that shows reward progress."
- "Make a matching game that feels like the Sprout app."

## Archetype catalog (pick one)

| Archetype | Skeleton | Pick when |
| --- | --- | --- |
| Quiz / question flow | `design/archetypes/quiz.md` | N questions, right/wrong answers, score at the end |
| Sorting / matching game | `design/archetypes/sorting-matching.md` | tap-in-order or match-pairs mechanics, tile grid |
| Reading / passage | `design/archetypes/reading.md` | read-along pages, read-aloud, time-based completion |
| Journal / reflection | `design/archetypes/journal.md` | open-ended prompts, sentence starters, share-back |
| Mission lobby / dashboard | `design/archetypes/mission-lobby.md` | progress toward a goal, step checklist, single CTA |
| Result / celebration | `design/archetypes/result-celebration.md` | the finish screen of ANY of the above (drop-in) |

A novel mechanic still starts from the nearest archetype (usually quiz or
sorting-matching) and swaps the interaction zone — chrome, state, feedback,
and completion carry over unchanged.

## Docs to load — staged, not all at once

1. **Always:** `design/checklist.md` (the ship gate) + the ONE chosen
   `design/archetypes/*.md` + `design/age-tiers.md` (short).
2. **Only if the plan goes beyond the skeleton:** `design/components.md`
   (full component API), `design/layout.md` (screen anatomy, custom
   containers), `design/motion.md` (custom animation, sparkles, Rive).
3. **Only for custom `x-` styling:** `design/tokens.md` (generated token
   reference; `design/generated/inventory.json` is the machine-checked list of
   every class/token that exists at runtime).
4. **For behavior beyond the skeleton's wiring:** `canvas/sdk.md`
   (`whoami`, `state` resume rules, `signal`, `complete`, `tts`, `rive`,
   library loading via the canvas-CDN proxy).

Do not pour the whole design system into context — the skeleton already
embodies most of it.

## What this skill does

1. **Clarify intent** — activity type, subject, age tier (or read via `whoami`
   at runtime), completion type (scored / timed / open-ended), reward context.
2. **Pick the archetype** from the catalog. Name it and why it fits.
3. **Slot-fill plan** — for the chosen skeleton, specify exactly:
   - the **data block** content (questions/rounds/pages/steps — the actual
     items, themed to the child's interests; short, speakable prompts)
   - intro copy + hero emoji; result copy + score bands
   - any interaction-zone swap (e.g. tile grid instead of list-items) and
     which `x-` rebuild from the archetype library it uses
   - anything intentionally NOT changed (default: everything else)
4. **Age-tier adaptation** — the tier1/2/3 deltas per `design/age-tiers.md`
   (choice counts, read-aloud, rounds).
5. **Behavior hooks** — confirm the skeleton's SDK wiring covers it (state
   resume, signals, one completion, tts); plan additions only for novel
   behavior. For dynamic content, generate INTO `sprout.state` so resume
   replays the same round.
6. **Research a library if the mechanic needs one** — for specialized
   interactions (character writing, music, physics, drawing), find a
   well-maintained JS library and vet it against the canvas rules
   (`canvas/sdk.md` → Rules): npm + jsdelivr, version-pinned, loaded only via
   `/api/canvas-cdn/jsdelivr/npm/<pkg>@<version>/<file>`, no external network
   at runtime (route data through the same-origin proxy), no workers, no WASM
   outside `sprout.rive`.
7. **Checklist acknowledgment** — the plan ends by committing to
   `design/checklist.md`: build → self-check → `canvas.create { dryRun: true }`
   → fix every analyzer finding except the two documented false positives
   (runtime-filled screens, addEventListener-wired buttons) → commit.

## Output shape

A short plan: archetype + skeleton path + slot-fill spec (the data block
written out, not gestured at) + tier deltas + any beyond-skeleton components
with their `x-` rebuild source + checklist commitment. An ASCII mock only when
the layout deviates from the skeleton — otherwise the skeleton IS the mock.
Concrete enough that the builder's only creative work is content.

## What this skill does not do

- It does not write the final canvas HTML — it plans it. (Author separately,
  then deliver via a skill + task; authoring ≠ delivery — see `canvas/sdk.md`.)
- It does not invent components. If a need isn't in `design/components.md`,
  it plans an `x-` rebuild from `design/tokens.md` tokens — never an external
  stylesheet, never a restyle of a kit class.
- It does not load external UI or the child app's design-system CDN (blocked
  by the sandbox); the design system is a spec to follow, not a stylesheet to
  link.
- It does not deliver anything to a kid.
