# Skill Capability

Agents can author private family skills that wrap kid-facing or agent-facing
behaviors.

Last verified: 2026-06-02

## Tools

- `skill_write`
- `skill_invoke`

## Constraints

- `skill_write` links canvases by `canvasIds`; there is no inline canvas HTML.
- `kidCallable: true` requires an `ageRange`.
- Skill dimensions are server-derived. Do not pass dimensions.
- `skill.invoke` is render-only for external callers. It does not deliver
  anything to a kid.
- Do not report a skill as surfaced until a task or heartbeat delivers it.

## Home-agent category

`skill_write` supports `category: "home_agent"` for dependencies that live on
the home-agent side. A home-agent skill does not deliver a kid experience in
Sprout by itself.
