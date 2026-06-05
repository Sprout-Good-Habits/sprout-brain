# Primitive: Canvas

A canvas is a kid-facing HTML artifact.

Last verified: 2026-06-05

## Use for

- Games.
- Mission lobbies.
- Interactive explorers.
- Visual check-ins.
- Resumable activities — `sprout.state` persists run progress so the child
  continues where they left off on reopen.

## Do not use for

- Fetching third-party data.
- Proving offscreen work happened.
- Storing long-lived external state.

## Tools

- `canvas_create`
- `canvas_update`
- `canvas_list`
- `canvas_get`
