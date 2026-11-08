# Pattern: Parent-reviewed Claim

Use when the child can claim completion, but the parent must approve before
reward.

Last verified: 2026-11-07, against sprout-app contract `2026.11.07-1`.

## Current Sprout shape

- Child task or canvas creates a low-trust completion.
- Parent or agent creates a reviewable submission.
- Parent approves or rejects.
- Gems are awarded only on approval, and the amount is fixed by the task's
  policy.

## Tool path

- `task_create({ ..., policy: { rewards: [{ trigger: { type: "completion" }, rewards: [{ type: "gems", gems: N }] }] } })`
  — the reward is frozen on the task.
- `task_complete` — creates the reviewable submission.
- `task_review({ submissionId })` — inspect first (proof, acceptance criteria).
- `task_review({ submissionId, action: "approve" })` — settles the frozen reward
  in full; `"reject"` pays nothing.

`task_review` takes no gem amount: `gemsAwarded` was removed in contract
`2026.08.17-10`, and the `task_review` description says the caller cannot choose
one. To pay a different amount for one submission, freeze a low task reward,
approve it, then call `gems_adjust` for the rest with
`Idempotency-Key: mission-award-<submissionId>` (contract `2026.09.24-6`).

## Avoid

- A reward that settles without review when completion is not proof: a Canvas
  graded `finish` or `attempt` with no `activityVerification` pays an early
  exit the same as the work. Use `canvasSpec.grading.required: "pass"` with a
  `passThreshold`, or keep the reward behind parent review (`task_create`
  description).
- `photo_proof` with `onVerified: "auto_approve"` for a claim that matters; the
  default `"parent_review"` keeps the gems behind the parent (contract
  `2026.09.24-5`).
