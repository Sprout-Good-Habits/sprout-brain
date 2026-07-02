# Canvas Motion — animation API + timing

All motion below ships in the injected stylesheet. `prefers-reduced-motion` is
respected automatically — never opt out or re-implement it.

## Built-in component motion (free — do not rebuild)

| Component | Motion |
| --- | --- |
| `.btn` | 150ms color/shadow transition; press dips 4px (tactile 3D) |
| `.progress-fill` | width animates ~400ms `cubic-bezier(0.22,1,0.36,1)` on `style.width` change |
| `.feedback-banner` | slides up 300ms ease-out on reveal |
| `.sheet` | slide-up enter 300ms; scrim fade |
| `.toast` | springy enter 350ms `cubic-bezier(0.34,1.56,0.64,1)`; `.toast-countdown` bar drains over `--toast-duration` (default 4s) |
| `.switch` | thumb slides 200ms |
| `.input` / `.checkbox` / `.radio` | 150ms border/background transitions |
| `.spinner` | 0.8s linear infinite |

## Utility classes (add to any element)

| Class | Use for |
| --- | --- |
| `.animate-in` | soft fade-in on mount (300ms) |
| `.animate-bounce-in` | score reveal, badge entrance |
| `.animate-pop` | emoji entrances, small rewards |
| `.animate-slide-up` | content arriving from below |
| `.animate-shake` | wrong answer (add, then remove after ~350ms so it can re-fire) |
| `.animate-pulse` | gentle attention ("tap me") |

Re-triggering: these are keyframe classes — remove the class, force reflow or
wait a frame, re-add.

## Sparkle overlay (celebrations)

The runtime ships a particle set: `.spark-overlay` (positioned container) with
`.sparkle` and `.sparkle-shimmer-el` children (keyframes `sparkle-pop`,
`sparkle-shimmer`). Scatter 6-10 absolutely-positioned sparkles with staggered
`animation-delay` over the result screen — see
`archetypes/result-celebration.md` for a ready-made block.

## Character motion — Rive

For the mascot or a reactive scene use `sprout.rive` with the curated assets
(`sprout-mascot`, `village-scene`) driven through the ordinary
`@rive-app/canvas` API — full contract and lifecycle teardown rules in
`canvas/sdk.md` → Rive. Always poster-first with a static fallback: preview
hosts have no Rive.

## Timing reference

- Fast feedback (hover, border, press): **150ms**
- Toggle (switch): **200ms**
- Enter animations (banner, sheet, toast): **300-350ms**
- Dynamic fills (progress): **400ms** spring
- Between-round pause after a correct answer: **~900ms** (long enough for the
  flash + signal, short enough to keep momentum); after a revealed answer:
  **~1300ms** (kid needs time to see the reveal).

## Signals drive host motion too

The buddy avatar reacts to `sprout.signal(...)` — that's motion you get outside
your iframe for free. Fire the most specific one per moment:
`attempt-successful` / `attempt-failed` routinely, `milestone-reached` at a
3-streak, `celebration` at a 5-streak or the finish, `user-stuck` after
repeated misses, `hint-requested` on a help tap.
