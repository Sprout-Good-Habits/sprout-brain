# Canvas Capability

Agents can author custom HTML canvases and attach them to skills.

Last verified: 2026-07-01

## Tools

- `canvas_create`
- `canvas_update`
- `canvas_list`
- `canvas_get`
- `canvas_prepare_upload` (out-of-band upload for large canvases; see the SDK doc's "Choosing an upload flow")

## Current use

Use canvases for:

- games
- mission lobbies
- interactive explorers
- visual check-ins
- kid-facing activity surfaces

## Constraints

- A canvas is invisible until linked to a skill and delivered through a task or
  heartbeat.
- The canvas SDK is auto-injected. Do not add arbitrary external scripts; the
  only sanctioned way to load a third-party library is a pinned relative
  canvas-CDN proxy URL (`/api/canvas-cdn/jsdelivr/npm/<pkg>@<version>/<file>`).
- Canvases cannot fetch external network data. Same-origin reads of
  manifest-declared bundle assets (e.g. `fetch('models/example.glb')`) are
  allowed for assets uploaded with the canvas.
- Canvases must emit exactly one terminal completion signal.
- Canvases persist run state across reopens via `sprout.state` (auto-saved); the
  child resumes where they left off. Durable run state only — no PII, JSON-serializable.
- A canvas can make the Sprout buddy speak aloud via `sprout.tts.speak({ text })`
  — kid's device only; rejects in the web preview (no buddy there).
- A canvas can render Rive animations via `sprout.rive.resolveAsset` — curated
  first-party assets by id (Released on device + web preview); a bring-your-own
  `.riv` bundle is device-only. It cannot text-generate a `.riv` (binary format).
- A canvas can request a launch of an allowlisted external learning URL (today:
  Khan Academy math paths and Duolingo ABC's next lesson) via
  `sprout.openExternalUrl` — kid's device only; the web preview always blocks.
  This launches a link; it does not fetch external progress data.
- A canvas can emit `sprout.signal(...)` for meaningful moments (celebration,
  milestone, stuck, hint); the host decides how to react.
- A canvas can motivate, orient, collect a kid claim, or run an in-canvas
  activity.
- A canvas should not be treated as proof of offscreen work.
