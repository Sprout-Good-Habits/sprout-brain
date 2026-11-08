# Primitive: Gems

Gems are the incentive currency.

Last verified: 2026-11-07, against sprout-app contract `2026.11.07-1`.

## Use

- A task's `policy.rewards` (set on `task_create`), settled when the parent
  approves the submission with `task_review({ submissionId, action: "approve" })`.
  The amount is fixed by the task's policy; `task_review` takes no gem amount
  (`gemsAwarded` was removed in contract `2026.08.17-10`).
- `gems_adjust` for manual adjustments, with a `reason` and the parent's yes.

## Avoid

- Auto-awarding gems from low-trust self-checks.
- Large manual adjustments without confirmation.
- Treating reward redemption as the same operation as gem earning.
