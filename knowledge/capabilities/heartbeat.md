# Heartbeat Capability

Heartbeats schedule skill runs on a cadence. They are different from recurring
child tasks.

Last verified: 2026-07-01

## Tools

- `heartbeat_describe`
- `heartbeat_list`
- `heartbeat_create`
- `heartbeat_update`

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

## Content-refresh loops are HOME-AGENT-side — canvas.update is NOT possible from a heartbeat

A heartbeat fire runs in Sprout's scheduled executor, which has **no canvas
tools**: `canvas.update` / `canvas.create` cannot run on a fire, and
`heartbeat.create` refuses a run skill whose `handsReferenced` declares them
(`AUTHORING_AS_RUN_SKILL`). Do not design a heartbeat that "reviews progress
and updates the canvas" — it will be rejected, and the executor could not do
it anyway.

The correct shape for a progress-review + content-update loop:

1. Author the loop as a `category: "home_agent"` skill (`skill.write`) whose
   procedure reads runs (`canvas.runs.list/get`), decides progression, and
   calls `canvas.update` with regenerated content.
2. The skill's instructions tell the INVOKING home agent to schedule the loop
   on the agent's OWN cron (Claude Code cron, launchd, etc.).
3. Each scheduled run: `skill.invoke` over MCP → follow the procedure →
   `canvas.update` with parent authority, in-session, auditable.

Division of labor: **heartbeats deliver kid-facing activity on a cadence; the
home agent maintains and evolves the content those activities render.**
