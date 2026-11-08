# Anti-pattern: Task Rewards for Evidence-only Work

Bad recommendation:

"Put a reward that pays on completion on an evidence-only external quest."

Last verified: 2026-11-07, against sprout-app contract `2026.11.07-1`.

## Why bad

A reward that settles on completion pays a claim as if it were proof. It is
wrong when completion is only "I did Khan" or "check my work."

## Use instead

- Keep the reward on the task's `policy.rewards`, behind parent review: the
  submission lands in the review queue and pays nothing until the parent
  approves it.
- Create the submission with `task_complete`, inspect it with
  `task_review({ submissionId })`, then `task_review({ submissionId, action:
  "approve" })` after the evidence checks out. Approval settles the frozen
  reward in full.
- There is no per-review gem amount: `gemsAwarded` was removed in contract
  `2026.08.17-10`, and the `task_review` description says the caller cannot
  choose one. The amount is fixed by the task's policy. For a variable award,
  freeze a low reward and top up with `gems_adjust` after approval (contract
  `2026.09.24-6`).
- For a self-reported learning mission, use `task_create`'s `learningMission`
  (`runMode: "self_check"`); its submission goes to the same review queue
  (contract `2026.09.24-6`).
