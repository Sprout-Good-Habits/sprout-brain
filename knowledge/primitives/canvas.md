# Primitive: Canvas

A canvas is a kid-facing HTML artifact.

Last verified: 2026-06-18

## Use for

- Games.
- Mission lobbies.
- Interactive explorers.
- Visual check-ins.
- Resumable activities — `sprout.state` persists run progress so the child
  continues where they left off on reopen.
- Buddy-voiced moments — `sprout.tts.speak({ text })` makes the Sprout buddy talk
  aloud on the kid's device (celebrate, read a prompt, nudge). Ends with one
  `sprout.complete(opts)` call (the canonical completion; `score` / `completed` /
  `timed` are aliases).

## Do not use for

- Fetching third-party data.
- Proving offscreen work happened.
- Storing long-lived external state.

## Tools

- `canvas_create`
- `canvas_update`
- `canvas_list`
- `canvas_get`
