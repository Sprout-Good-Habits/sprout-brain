# Canvas Design Patterns

How to author a canvas in the Sprout child design language. `artifact-kit.md` is
the **component API** (which classes exist and their markup); this doc is the
**design + behavior layer** on top of it — page archetypes, button placement,
the component-default decision table, per-component behavior, and age-tier
adaptation. Use both, plus `sdk.md` for behavior.

> **Use the current SDK.** The completion API is `sprout.complete(opts)` (see
> `sdk.md`). Some `artifact-kit.md` examples still show the legacy
> `SproutBridge.postMessage` bridge — treat those as legacy and call
> `sprout.complete()` instead.

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

## Component behavior

The design system specifies how each component *behaves*, not just how it looks —
reproduce the behavior with the kit class + minimal inline JS. Transitions below
are built into the injected CSS and are disabled automatically under
`prefers-reduced-motion`, so you never opt out in canvas code.

- **Button** (`btn`, 48px, one primary/screen) — press dips ~100ms
  (`translateY`), releases back; disabled via `btn-disabled`. Wire the action to
  `sprout.complete(...)` (it guards double-fire), not `SproutBridge`.
- **Input** (`input`, 56px) — blue focus border (150ms); add `input-error` for the
  red state and show `input-error-text` below only when invalid.
- **List item** (`list-item`) — tap toggles `checked` (blue). **Single-select:** an
  `onclick` that clears siblings' `checked` then sets this one. **Multi-select:**
  `onclick="this.classList.toggle('checked')"` per row.
- **Checkbox / Radio** (`checkbox` / `radio`, 24px) — checkbox toggles independently;
  radio sets `checked` on itself and clears its group. Marks draw via CSS `::after`.
- **Switch** (`switch`, 44×24) — tap toggles `checked`; thumb slides ~200ms. Disable
  with `opacity:.5; pointer-events:none`.
- **Feedback banner** (`feedback-banner fb-*`) — start `display:none`, pinned bottom;
  reveal via JS and it slides up ~300ms. It **owns its Continue/Retry button** —
  hide it before the next question. `aria-live="polite"` to announce.
- **Progress bar** (`progress-bar`) — set `.progress-fill` width in JS; it animates
  ~400ms spring automatically. Live in the `top-toolbar`.
- **Toast** (`toast` + `toast-countdown`) — springy enter ~350ms, auto-dismiss ~4s
  with a countdown bar; show/hide via `display`.
- **Sheet** (`sheet` + scrim) — slides up ~300ms over a dim scrim; tap the scrim to
  dismiss (`event.stopPropagation()` on the sheet body).
- **Spinner** (`spinner` / `spinner-sm`) — continuous rotation; show during async
  work, remove when done.
- **Card / Badge / Empty state** — presentational (no interaction). Pair a result
  badge with `animate-bounce-in`; size empty-state hero emoji explicitly.

Touch targets stay ≥44px (buttons 48, inputs 56). Use semantic elements
(`<button>`, `<input>`, `<label>`) so focus/disabled states come for free.

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

## Third-party libraries — research a good fit

Don't rebuild rich interactions from scratch. For a specialized activity, **look
for a popular, well-maintained JS library** and bring it in through the
canvas-CDN proxy. Example: **Hanzi Writer** for Chinese character stroke-order
and writing practice; others by domain — music/rhythm, physics, drawing, data
viz, math rendering. Search for the best fit for the activity, then vet it.

**How to load one** (see `sdk.md` → Rules for the full contract):

- Only via the canvas-CDN proxy, **relative + version-pinned**:
  `/api/canvas-cdn/jsdelivr/npm/<pkg>@<exact-version>/<file>`. Any npm package on
  jsdelivr works; no ranges, no `latest`, no other origins.
- Static imports only (or a static import map for a bare transitive specifier).

**Vetting checklist — a library is canvas-safe only if:**

- It's published on npm and served by jsdelivr, at a pinned version.
- It runs **fully client-side with no external network at runtime** — the sandbox
  CSP is `connect-src 'self'`, so any data the library fetches from an outside
  origin is blocked. If the library loads data at runtime, route that data
  through the **same-origin** proxy (fetching `/api/canvas-cdn/...` is allowed).
- It uses **no web workers** (`worker-src 'none'`) and no WASM except Rive via
  `sprout.rive` (raw `WebAssembly.*` / foreign `.wasm` is rejected).
- It's reasonably sized and its license permits use.

**Worked example — Hanzi Writer (data via the proxy).** Its default loader
fetches character data from jsdelivr directly, which the CSP blocks — so supply a
`charDataLoader` that fetches the data package through the same-origin proxy
(illustrative; pin the current versions and confirm the data file path):

```html
<script src="/api/canvas-cdn/jsdelivr/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js"></script>
<script>
  const writer = HanziWriter.create('target', '人', {
    width: 260, height: 260, showOutline: true,
    charDataLoader: (char, onComplete) =>
      fetch(`/api/canvas-cdn/jsdelivr/npm/hanzi-writer-data@2.0.1/${char}.json`)
        .then((r) => r.json())
        .then(onComplete),
  });
  writer.quiz({ onComplete: () => sprout.complete({ score: 1, total: 1 }) });
</script>
```

That pattern — load the lib via the proxy, then feed its runtime data from the
same-origin proxy — is how any data-loading library works inside a canvas.

## Anti-patterns

- Hand-rolling buttons/cards/inputs instead of using `artifact-kit` classes.
- Hardcoding hex colors or pixel spacing where a token exists.
- Linking the child app's design-system CDN or any external stylesheet (blocked).
- Pulling a library from any origin other than the pinned canvas-CDN proxy, or
  assuming a library that fetches data from an external CDN at runtime will work —
  the CSP blocks it; route its data through the same-origin proxy or pick a
  self-contained library.
- Hiding the submit button because completion auto-fires.
- More than one primary CTA on a screen.
- Walls of text or many simultaneous choices for tier1.
