# Task and Review Capability

Agents can create scheduled or one-time tasks assigned to children. Reviews are
the clean path for parent-approved gem awards.

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

## Constraints

- Canvas tasks require `assignmentSkillId` and a linked `canvasId`.
- `rewardSpec` awards on task completion.
- Do not use `rewardSpec` when completion is only a low-trust claim.
- For parent-approved rewards, prefer `task_complete` then
  `task_review({ gemsAwarded })`.
