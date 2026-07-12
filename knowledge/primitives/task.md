# Primitive: Task

A task is the delivery mechanism for a child activity.

Last verified: 2026-07-12

## Tools

- `task_create`
- `task_update`
- `task_describe`
- `task_complete`
- `task_review`

## Run modes

- `self_check` - checklist-style completion.
- `conversation` - Sprout asks the child to share, explain, debate, or
  practice.
- `canvas` - child interacts with a linked canvas.

## Rules

- Canvas tasks require `assignmentSkillId` and a linked `canvasId`.
- `runMode` is passed explicitly — no default.
- A task carries durable per-child progress (see `task-state.md`) and earns
  through quests (see `quest.md`); optional `policy` sets free-play/extras.
- Rotate content on a continuing journey with `task_update` in place — the
  task id owns the child's progress; recreating orphans it. A swapped canvas
  must be linked to the task's `assignmentSkillId` first.
