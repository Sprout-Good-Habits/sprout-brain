# Anti-pattern: Canvas Fetches External Data

Bad recommendation:

"The canvas fetches Khan progress."

Last verified: 2026-07-01

## Why bad

- Sprout canvases cannot fetch external network data.
- Credentials and external state do not belong inside the kid canvas.

## Not this anti-pattern

- Same-origin reads of manifest-declared canvas bundle assets (e.g.
  `fetch('models/example.glb')`) are allowed — that is loading your own uploaded
  asset, not fetching external data.
- Launching an allowlisted external learning URL via `sprout.openExternalUrl`
  (Khan Academy math, Duolingo ABC) is a server-authorized *launch*, not a
  progress *fetch* — it hands off to the external app; no external data enters
  the canvas.

## Use instead

- Home agent produces progress evidence.
- Canvas renders the current mission and progress passed through Sprout-side
  setup or updates.
