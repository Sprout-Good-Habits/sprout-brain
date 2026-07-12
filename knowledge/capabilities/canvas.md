# Canvas Capability

Agents can author custom HTML canvases and attach them to skills.

Engine-structure patterns proven in production (content-update seam, state
schema, analyzable completion, resume, QA) live in
`../../canvas/worked-patterns.md`.

Last verified: 2026-07-12

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
- `canvas.update` content-refresh loops run on the HOME AGENT's own cron
  (home_agent skill + `skill.invoke`), never on a heartbeat — the scheduled
  executor has no canvas tools (see heartbeat.md).
- Canvases persist run state across reopens via `sprout.state` (auto-saved); the
  child resumes where they left off. Durable run state only — no PII, JSON-serializable.
- Canvases HAVE cross-day memory: `sprout.journey.get()` / `.save(next)` is a
  durable per-(task, child) checkpoint that survives across runs and DAYS —
  plans MAY assume progression (Tuesday's level 3 resumes Wednesday). The
  three-line model: `sprout.state` = this sitting, `sprout.journey` = this
  kid's journey, `sprout.log` = append-only record. `get()` resolves `{}` on a
  first run AND when the family's durable-state feature is off — always
  default-fill; `save()` is replace-only (≤ 64 KB), always resolves
  `{ok, error?}`, and must resolve BEFORE `sprout.complete()`. See
  `../../canvas/sdk.md` → "Durable journey".
- The journey lives on the TASK, so content rotation must `task_update` the
  existing task in place — recreating a task orphans the checkpoint (see
  `task-and-review.md`). A swapped-in canvas must already be linked to the
  task's `assignmentSkillId` or the swap is rejected. A bare canvas run with no task attached gets
  `{ok:false, error:'not-task-linked'}` on save; `sprout.log` still works.
- The agent reads the checkpoint + recent results back via `task_describe`
  (`state` / `lastRun` blocks) and full run history via `task_runs_list` /
  `task_runs_get` — see `task-and-review.md` for the earning/replay model.
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
