# Canvas Capability

Agents can author custom HTML canvases and attach them to skills.

Last verified: 2026-06-02

## Tools

- `canvas_create`
- `canvas_update`
- `canvas_list`
- `canvas_get`

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
- The canvas SDK is auto-injected. Do not add external scripts.
- Canvases cannot fetch external data.
- Canvases must emit exactly one terminal completion signal.
- A canvas can motivate, orient, collect a kid claim, or run an in-canvas
  activity.
- A canvas should not be treated as proof of offscreen work.
