# Heartbeat Capability (removed)

The heartbeat tools are gone. `heartbeat_list`, `heartbeat_describe`,
`heartbeat_create`, `heartbeat_update`, `heartbeat_pause`, `heartbeat_resume`
and `heartbeat_cancel`, and the `sprout://heartbeat/authoring-guide` resource,
were removed from the Sprout MCP in contract `2026.10.12-4`. A call to one
returns `TOOL_NOT_FOUND`. Heartbeats made before then keep running; the parent
pauses or removes them in the app.

Last verified: 2026-11-07, against sprout-app `apps/server/mcp/changelog.md`.

## Use instead

- **Deliver to a kid with `task_create`**, one-off or recurring
  (`scheduleSpec.taskType: "schedule"`). It is the one delivery step.
- **For a routine, tell the parent to ask Sprout in a chat.** Routines are set up
  by Sprout in the chat the parent asks in, not over MCP.
- Drop `heartbeat_*` from a skill's `handsReferenced`; `skill_write` and
  `skill_update` drop them anyway.

## Content-refresh loops run on the home agent's own schedule

Sprout has no scheduled executor you can point at a canvas. A loop that reviews
progress and updates content runs on the home agent's side:

1. Author the loop as a `category: "home_agent"` skill (`skill_write`) whose
   procedure reads runs (`canvas_runs_list` / `canvas_runs_get`), decides
   progression, and calls `canvas_update` with regenerated content.
2. The skill's instructions tell the INVOKING home agent to schedule the loop
   on the agent's OWN cron (Claude Code cron, launchd, etc.).
3. Each scheduled run: `skill_invoke` over MCP → follow the procedure →
   `canvas_update` with parent authority, in-session, auditable.

Division of labor: **tasks deliver kid-facing activity on a cadence; the home
agent maintains and evolves the content those activities render.**
