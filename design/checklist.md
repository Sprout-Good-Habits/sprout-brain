# Canvas Polish Checklist — the ship gate

Run this checklist on every canvas BEFORE `canvas.create`. It mirrors, rule for
rule, the server-side analyzer (`analyzeArtifact.ts` in sprout-app) plus the kid
design system's golden rules — so passing here means the server's design pass
comes back clean instead of teaching you the same lesson as warnings.

Last verified against sprout-app `77ada1b8e` (analyzer stable since 2026-05-31).

## Analyzer rules (the server checks these — errors in strict mode)

Functional:

- [ ] **Exactly one completion call** exists: `sprout.complete(...)` (or legacy
      `sprout.score`/`sprout.timed`). A canvas with no completion call is
      rejected.
- [ ] **Every `getElementById` target exists** in the markup.
- [ ] **Every `onclick` function is defined** in a script block.
- [ ] **No duplicate `id` attributes.**
- [ ] **Feedback banners start hidden** (`display:none` or `hidden` class) — a
      visible-by-default `.feedback-banner` is an error.
- [ ] **Multiple `.screen` divs ⇒ switching logic exists** (a `showScreen`
      helper or `classList` toggling). Every `.screen` has real content.
- [ ] **Buttons have handlers** — every `<button>` is wired via `onclick` or
      `addEventListener` (the analyzer warns on missing `onclick`; listeners
      added in JS are fine — expect and accept that advisory).

Design (category `design` — hard errors in the in-app authoring path):

- [ ] **Zero hardcoded hex colors** in your `<style>` blocks. Every color is
      `var(--token)` (see `tokens.md`). Mappings the analyzer suggests:
      blue→`--brand-500`, green→`--green-500`, red→`--red-500`, dark
      text→`--text-primary`, light bg→`--bg-primary`, gray bg→`--bg-secondary`.
- [ ] **No `body { background: ... }` override.** The design system owns the
      body background (`--bg-primary`). Tint sections with wrappers, not body.
- [ ] **No `body { font-family: ... }` override.** Inter + TossFace come from
      the system.
- [ ] **Every `<button>` uses kit classes** — one of `btn` (+ variant + size),
      `btn-util`, `btn-social`. A classless or custom-only button is an error.
- [ ] **No custom CSS targeting kit component classes** (`btn`, `card`,
      `list-item`, `input`, `progress-*`, `badge`, `toast`, `feedback-banner`,
      `sheet`, `checkbox`, `radio`, `switch`, `spinner`, `empty-state`,
      `top-toolbar`, `tab-bar`, `action-prompt`). Extend with your own `x-`
      class alongside, never restyle the kit class.
- [ ] **No custom class that duplicates a kit component** (a custom `*card*`,
      `*modal*`, `*toast*`, `*progress*`, `*badge*`, `*spinner*`, `*toggle*`
      class). Use the kit component instead (`card`, `sheet`, `toast`,
      `progress-bar`, `badge`, `spinner`, `switch`).

## Golden rules (kid design system — the analyzer can't check taste)

- [ ] **One primary CTA per screen** (`btn btn-primary btn-lg`, full-width, at
      the bottom of the flow). Secondary actions are `btn-secondary`.
- [ ] **Visible submit/finish button always**, even when completion auto-fires
      (the SDK guards double-fire).
- [ ] **Feedback banner owns its Continue button** — while it's shown, no other
      primary CTA competes; hide it before the next question.
- [ ] **Touch targets ≥ 44px** (kit buttons are 44-48px; keep custom tap areas
      at least 44px square for tier1, bigger is better).
- [ ] **Hero emoji are sized explicitly** — `font-size` + `line-height: 1` +
      explicit `height` (TossFace glyphs overflow their font-size box
      otherwise). Inline emoji need nothing.
- [ ] **Progress lives in the `top-toolbar`** for any multi-step activity.
- [ ] **`sprout.state` is wired** — merge-defaults (`S.x ??=`), never wholesale
      assignment; the kid resumes exactly where they left off (see
      `canvas/sdk.md` → Canvas Memory).
- [ ] **Signals at meaningful moments** — `attempt-successful` /
      `attempt-failed` per answer, `milestone-reached` at streaks,
      `celebration` at the big finish. Pick the most specific one, not several.
- [ ] **TTS for pre-readers** — tier1 canvases read prompts aloud
      (`sprout.tts.speak` in try/catch; on-screen text stays the source of
      truth), and apply the full Speak-Then-Act layer — auto-spoken prompt,
      staged actions, whole-card replay, idle re-prompt (`early-readers.md`).
- [ ] **Celebrate the finish** — result screen uses the big-emoji + spark
      pattern (`archetypes/result-celebration.md`), not a bare score line.
- [ ] **Age-tier adaptation applied** (`age-tiers.md`): tier1 ⇒ ≤3 choices,
      read-aloud, minimal text.

## How to self-verify like the server does

If you are working in a session with repo access, run the real analyzer before
creating the canvas:

```bash
cd <sprout-app>/apps/server && npx tsx -e "
import { analyzeArtifact } from './src/services/mastra/tools/analyzeArtifact';
import fs from 'node:fs';
console.log(JSON.stringify(analyzeArtifact(fs.readFileSync(process.argv[1],'utf8')), null, 2));
" /path/to/canvas.html
```

Otherwise `canvas.create { dryRun: true }` returns the same findings as
`analyzerIssues` without persisting anything — read them, fix, re-dry-run until
only known-false-positive advisories remain (buttons wired via
`addEventListener`, screens filled at runtime).
