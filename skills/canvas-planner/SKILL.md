---
name: canvas-planner
description: "Use before authoring a Sprout canvas (a kid-facing HTML activity) to plan its design in the Sprout child design language. Produces a layout plan — page archetype, an ASCII mock, the artifact-kit components to use and where, tokens, age-tier adaptation, and the SDK behavior hooks — so the canvas you then build looks and behaves like a native Sprout child screen instead of generic HTML."
---

# Canvas Planner

## Purpose

Plan a canvas's design **before** you write its HTML, so the result follows the
Sprout child design system instead of ad-hoc styling. A canvas is authored HTML
that runs in a locked sandbox; it reproduces the design language in its own
markup (it cannot import the child component library). This skill turns a canvas
idea into a concrete, buildable design plan.

Use it for prompts like:

- "Design a multiplication quiz canvas for my 7-year-old."
- "Plan a reading check-in activity."
- "I want a mission-lobby screen that shows reward progress."
- "Make a journal canvas that feels like the Sprout app."

## Docs to load

Load only what the plan needs — do not pour the whole brain into context:

- `canvas/design-patterns.md` — page archetypes, button placement, the
  component-default decision table, age-tier adaptation. **Start here.**
- `canvas/artifact-kit.md` — the component API (exact classes + markup) and
  design tokens. Load when choosing/placing components.
- `canvas/sdk.md` — behavior: `whoami` (identity + `ageTier`), `state` (resume),
  `signal`, `complete`, `tts`, `rive`. Load when wiring behavior hooks.

## What this skill does

Walks the canvas idea through a design plan:

1. **Clarify intent** — activity type, subject, `ageTier` (or read it via
   `whoami` at runtime), and the completion type (scored / timed / open-ended).
2. **Pick a page archetype** from `design-patterns.md` (quiz, reading, journal,
   mission lobby, sorting/matching, result). Name it and why it fits.
3. **ASCII layout mock** — a text sketch of the screen(s), top to bottom. This is
   the alignment artifact: agree on layout in text before writing HTML.
4. **Component plan** — for each region, the artifact-kit component to use and its
   placement (from the decision table). One primary CTA per screen; visible
   submit always; feedback banners pinned bottom.
5. **Tokens & spacing** — the tokens for color/spacing/radius/type; single-column,
   mobile-first, 44px touch targets. No hardcoded hex.
6. **Behavior hooks** — which SDK calls: `whoami` for personalization + tier,
   `state` for resume, `signal` at meaningful moments, exactly one `complete`,
   `tts` for read-aloud, `rive` for character/motion.
7. **Age-tier adaptation** — how the layout changes for tier1 vs tier3 (target
   size, choice count, text density, read-aloud).
8. **Handoff** — the plan feeds canvas authoring (`canvas.create` →
   `skill.write` → `task.create`). Remind that the build must stay in the
   artifact-kit envelope and the sandbox safety rules (`sdk.md` → Rules).

## Output shape

A short design plan: archetype + ASCII mock + a component/placement list + tokens
+ behavior hooks + tier notes. Concrete enough to author from directly; it is a
plan, not the final HTML.

## What this skill does not do

- It does not write the final canvas HTML — it plans it. (Author separately, then
  deliver via a skill + task.)
- It does not invent components. If a need isn't in `artifact-kit.md`, it plans a
  rebuild in the design language using tokens — never an external stylesheet.
- It does not load external UI or the child app's design-system CDN (blocked by
  the sandbox); the design system is a spec to follow, not a stylesheet to link.
- It does not deliver anything to a kid (authoring ≠ delivery — see `sdk.md`).
