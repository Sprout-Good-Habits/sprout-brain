# Home-agent Boundary

When a goal depends on an external platform, public Sprout planning should
describe what evidence is useful, not how to extract it.

Last verified: 2026-06-02

## Principle

The home agent is responsible for producing evidence in the parent's
environment. Sprout is responsible for mission rendering, parent review, gems,
rewards, and audit.

Use "suggested evidence shape" or "example home-agent output." Do not call it
a required contract unless it is an actual Sprout MCP schema.

## Public docs should not prescribe

- scraping
- credential automation
- bypassing access controls
- avoiding third-party platform limits
- terms-sensitive extraction methods

## Planner questions

The suggested evidence shape should help answer:

- What changed?
- Which child is this for?
- What should the kid see next?
- Is this rewardable?
- Has this evidence already been used?
- Does a parent need to approve?

## Loop ownership: content updates stay on the home-agent side of the boundary

Recurring **delivery** (kid sees an activity on a schedule) → Sprout-side
(recurring task `scheduleSpec`; heartbeats were removed in contract
`2026.10.12-4`). Recurring **maintenance** (review progress, regenerate lesson
data, `canvas_update`) → home-agent-side: a `category: "home_agent"` skill
invoked on the agent's own cron. Sprout has no scheduled executor that can
update a canvas.
