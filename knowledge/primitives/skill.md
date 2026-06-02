# Primitive: Skill

A skill is the authored wrapper around a canvas-backed or chat-output behavior.
It is not visible to a kid until delivered.

Last verified: 2026-06-02

## Tools

- `skill_write`
- `skill_invoke`

## Rules

- Link canvases with `canvasIds`.
- Use `kidCallable: true` and `ageRange` for kid-facing skills.
- Do not pass skill dimensions.
- Dry-run before commit when authoring.
- `skill.invoke` is render-only for external callers.
