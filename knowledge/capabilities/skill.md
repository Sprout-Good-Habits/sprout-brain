# Skill Capability

Agents can author private family skills that wrap kid-facing or agent-facing
behaviors.

Last verified: 2026-07-01

## Tools

- `skill_write` — author a skill (links canvases by `canvasIds`).
- `skill_update` — partially modify an existing skill.
- `skill_get` — full skill detail + canvas metadata.
- `skill_list` — the family skill library (paginated).
- `skill_invoke` — render the skill into the current conversation only.
- `skill_post_result` — submit a skill-run result.

## Constraints

- `skill_write` links canvases by `canvasIds`; there is no inline canvas HTML.
- `kidCallable: true` requires an `ageRange` (else `BAD_INPUT`).
- `handsReferenced` declares the MCP tools the skill's prompt uses. A skill
  passed as `task_create`'s `assignmentSkillId` must declare `task_create`
  (else `SKILL_NOT_ASSIGNMENT`). `heartbeat_*` hands are retired and dropped
  (contract `2026.10.12-4`).
- Skill dimensions are server-derived. Do not pass dimensions.
- `skill_invoke` is render-only for external callers. It does not deliver
  anything to a kid — no gems, no notification.
- Do not report a skill as surfaced until a task delivers it. `task_create` is
  the one delivery step.

## Home-agent category

`skill_write` supports `category: "home_agent"` for dependencies that live on
the home-agent side. A home-agent skill does not deliver a kid experience in
Sprout by itself, and is not run by `skill_invoke`.
