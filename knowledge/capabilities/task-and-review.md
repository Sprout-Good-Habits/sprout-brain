# Task and Review Capability

Agents can create scheduled or one-time tasks assigned to children. Reviews are
the clean path for parent-approved gem awards.

Last verified: 2026-07-01

## Tools

- `task_create`
- `task_describe`
- `task_list`
- `task_update`
- `task_delete`
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
- For parent-approved rewards: `task_complete` creates the submission, then
  `task_review({ action, gemsAwarded })` approves/rejects. `gemsAwarded` is
  **optional** — omit it to record approval without crediting gems; gems are
  never awarded automatically on approval.
