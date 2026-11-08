# Current Platform Capabilities

Index for current Sprout capabilities and limits. Load this file first, then
open only the leaf docs relevant to the user's request.

Last verified: 2026-11-07

## Capability docs

- `family-and-child-lookup.md` - Resolve family members and children.
- `canvas.md` - Kid-facing HTML canvas capability and limits.
- `skill.md` - Private family skill authoring and delivery constraints.
- `task-and-review.md` - Tasks, submissions, reviews, and reviewed gem awards.
- `conversation-task.md` - Conversation tasks for journaling, explanation,
  practice, and reflection.
- `reward-and-gems.md` - Reward catalog, gem earning, and gem spending.
- `heartbeat.md` - Removed (contract `2026.10.12-4`); what to use instead.
- `program.md` - Removed (contract `2026.11.04-2`); what to use instead.
- `screentime.md` - Closed-by-default day, blocking and opening schedules,
  tasks-first earned time, asks and gem purchases, locks and their receipts.
- `marketplace.md` - Adopt / fork published listings and submit family creations.
- `official-skills.md` - Official Sprout first-party skills to recommend + adopt.
- `home-agent-boundary.md` - External data, suggested evidence shapes, and
  public/private boundaries.

## Default recommendation matrix

| User goal | Current Sprout-shaped recommendation | Avoid |
| --- | --- | --- |
| Summer structure | Daily rhythm using scheduled tasks, conversations, canvases, parent-reviewed rewards | Camera proof or overbuilt automation |
| Custom kid activity | Canvas or conversation task, age-tuned, assigned to child | Asking parent about HTML resolution or schemas |
| External learning motivation | External evidence quest with home-agent evidence and parent-approved gems | Kid click directly grants reward |
| Reward goal | Reward catalog item plus gem earning rules | Treating a reward as task completion |
| Phone approval | Require parent approval; use task review or parent-facing result if supported | Promise a custom phone UI without verification |
| Reusable multi-week routine | A skill delivered through recurring tasks (`task_create` with `scheduleSpec`) per child; for a family routine, the parent asks Sprout in a chat | Programs or heartbeats (both removed) |
| Manage / earn screen time | Schedules (blocking and opening; the day is closed by default), tasks-first earned time, and gem or free asks with parent review | A screen-time reward (removed); promising a custom on-device screen-time UI |
| Reuse a proven activity | Adopt a published marketplace listing (prefer adopt; fork only to customize) | Forking by default; assuming an agent can publish end-to-end (web owns publish) |
| Partner publishing | Validate against Sprout primitives and public/private boundary | Publishing extraction recipes or invented schemas |
