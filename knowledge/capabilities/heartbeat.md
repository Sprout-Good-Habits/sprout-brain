# Heartbeat Capability

Heartbeats schedule skill runs on a cadence. They are different from recurring
child tasks.

Last verified: 2026-06-02

## Tools

- `heartbeat_describe`
- `heartbeat_create` when available
- `heartbeat_update` when available

## Use when

- An agent routine should run periodically.
- A parent-facing result should be posted on a cadence.
- A skill needs to inspect or react to state over time.

## Avoid when

- A simple recurring task delivers the child activity.
- The cadence would exceed current platform limits.

## Default recommendation

Use ordinary recurring tasks for recurring kid activities. Use heartbeats for
scheduled agent work or parent-facing result generation.
