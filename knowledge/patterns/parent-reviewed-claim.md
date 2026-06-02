# Pattern: Parent-reviewed Claim

Use when the child can claim completion, but the parent must approve before
reward.

Last verified: 2026-06-02

## Current Sprout shape

- Child task or canvas creates a low-trust completion.
- Parent or agent creates a reviewable submission.
- Parent approves or rejects.
- Gems are awarded only on approval.

## Tool path

- `task_complete`
- `task_review({ action: "approve", gemsAwarded })`

## Avoid

- `rewardSpec` on the child task when completion is not proof.
- Auto-gem awards for self-checks that matter.
