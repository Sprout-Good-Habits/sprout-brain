# Canvas Design Patterns

How to author a canvas in the Sprout child design language. `artifact-kit.md` is
the **component API** (which classes exist and their markup); this doc is the
**design layer** on top of it — page archetypes, button placement, the
component-default decision table, and age-tier adaptation. Use both, plus
`sdk.md` for behavior.

Last verified: 2026-07-01

## Principle — author with the design system, don't hand-roll

A canvas should look and behave like a native Sprout child screen. You are
authoring the canvas's own HTML, so you reproduce the design language — you do
not import the child component library (the sandbox can't load external UI).

- **Default to `artifact-kit` classes.** Use `btn`, `card`, `list-item`,
  `feedback-banner`, `progress-bar`, `input`, `badge`, `stack`/`row`, etc. before
  writing any custom markup.
- **When the kit lacks a component, rebuild it in the language** — match the
  tokens (radius, spacing, color), not an arbitrary style. Treat a reference
  screen as a visual spec and rebuild it with tokens; never hardcode hex/px where
  a token exists.
- **Tokens are the single source of visual truth.** Colors, spacing, radius, and
  font sizes come from `var(--token)` (see `artifact-kit.md` → Design Tokens).
  Never hardcode a color.
- **No external UI.** Third-party libraries load only via the pinned canvas-CDN
  proxy; the child app's design-system CDN is not reachable from a canvas. The
  design system is a spec you follow, not a stylesheet you link.

## Page archetypes

Canvases are single-column, mobile-first, one `.screen` at a time (toggle with
`.hidden`; see `artifact-kit.md` → App Structure Pattern). Pick the archetype
that fits, then fill it with kit components.

- **Quiz / question flow** — `top-toolbar` (progress) → question `card` → answer
  options as `list-item`s or `radio`/`checkbox` → bottom `feedback-banner`
  (`fb-success` / `fb-error`) with its own Continue button → next question. Emit
  `sprout.signal('attempt-successful' | 'attempt-failed')` per answer;
  `complete({ score, total })` at the end.
- **Reading / passage** — `top-toolbar` → passage `card` (generous line height) →
  optional read-aloud button (`sprout.tts.speak`) → done. `complete({ duration })`.
- **Journal / conversation companion** — hero prompt → `input` (or a few
  `list-item` sentence-starters for young tiers) → visible submit → `complete({})`.
- **Mission lobby / dashboard** — hero (emoji + title) → `progress-bar` toward a
  reward → `list-item` steps ("what counts") → one primary CTA
  ("Ask parent to check"). See `knowledge/patterns/mission-lobby-canvas.md`.
- **Sorting / matching game** — `scroll-row` or a grid of `card`s → drag/tap to
  place → `feedback-banner` → `complete({ score, total })`.
- **Result / summary** — big score `badge` (`animate-bounce-in`) → one-line
  summary → visible submit / "I'm done".

## Button placement

- **One primary per screen.** `btn btn-primary btn-lg`, full-width, at the bottom
  of the content flow. Secondary/alternate actions use `btn-secondary` above or
  inline.
- **Always show a visible submit/finish button**, even when the canvas
  auto-completes on a timer or last answer (SDK rule — the double-fire guard makes
  wiring both safe). Kids need the agency of tapping "done".
- **Feedback carries its own action.** The bottom `feedback-banner` includes the
  Continue button (`btn-success` / `btn-error`); don't stack a second primary
  elsewhere while it's shown.
- **Destructive actions are rare** in kid canvases; prefer a `btn-secondary`
  "Start over".

## Component-default decision table

| Need | Default (artifact-kit) |
| --- | --- |
| The one main action | `btn btn-primary btn-lg` (full-width, bottom) |
| Pick one of N | `list-item` (add `checked`) or `radio` |
| Pick several | `checkbox` or multi-select `list-item`s |
| On/off setting | `switch` |
| Correct / wrong feedback | bottom `feedback-banner` `fb-success` / `fb-error` |
| Progress through steps | `progress-bar` inside the `top-toolbar` |
| Status / count label | `badge` (`badge-brand` / `badge-success` / …) |
| Grouped content | `card` |
| Text entry | `input` (+ `input-wrapper` for label / error) |
| Nothing yet | `empty-state` |
| Vertical rhythm / horizontal group | `stack` / `row` · `row-between` |
| Loading | `spinner` |
| Character, celebration, reactive motion | `sprout.rive` (curated `sprout-mascot`) |
| Micro-motion (reveal, wrong-answer, pop) | `animate-bounce-in` / `animate-shake` / `animate-pop` |

## Age-tier adaptation

Read `sprout.whoami().ageTier` on load and adapt:

- **tier1 (4–6)** — bigger touch targets, ≤3 choices at once, hero emoji, minimal
  text, read prompts aloud with `sprout.tts.speak`, heavy positive feedback.
- **tier2 (7–9)** — the default balance.
- **tier3 (10+)** — denser layouts, more options per screen, less scaffolding,
  can read longer passages.

Personalize with `childName` from `whoami`. Persist progress with `sprout.state`
so a reopened canvas resumes (every canvas — see `sdk.md` → Canvas Memory).

## Motion & emoji

- Built-in `animate-*` classes cover most micro-motion; `prefers-reduced-motion`
  is respected automatically.
- Use `sprout.rive` for the character / celebratory motion (curated
  `sprout-mascot`, `village-scene`).
- Emoji are core to the Sprout look (TossFace, auto-loaded); size hero emoji
  explicitly (`font-size` + `line-height:1` + `height`) to avoid overflow.

## Anti-patterns

- Hand-rolling buttons/cards/inputs instead of using `artifact-kit` classes.
- Hardcoding hex colors or pixel spacing where a token exists.
- Linking the child app's design-system CDN or any external stylesheet (blocked).
- Hiding the submit button because completion auto-fires.
- More than one primary CTA on a screen.
- Walls of text or many simultaneous choices for tier1.
