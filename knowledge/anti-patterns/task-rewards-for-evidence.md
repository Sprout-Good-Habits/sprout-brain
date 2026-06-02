# Anti-pattern: Task Rewards for Evidence-only Work

Bad recommendation:

"Use task rewardSpec for an evidence-only external quest."

Last verified: 2026-06-02

## Why bad

`rewardSpec` pays on task completion. It is wrong when completion is only "I
did Khan" or "check my work."

## Use instead

- Omit `rewardSpec`.
- Use `task_complete` and `task_review({ gemsAwarded })` after evidence review.
