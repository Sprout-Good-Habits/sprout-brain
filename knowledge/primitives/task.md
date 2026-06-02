# Primitive: Task

A task is the delivery mechanism for a child activity.

Last verified: 2026-06-02

## Tools

- `task_create`
- `task_describe`
- `task_complete`
- `task_review`

## Run modes

- `self_check` - checklist-style completion.
- `conversation` - Sprout asks the child to share, explain, debate, or
  practice.
- `canvas` - child interacts with a linked canvas.

## Rule

Canvas tasks require `assignmentSkillId` and a linked `canvasId`.
