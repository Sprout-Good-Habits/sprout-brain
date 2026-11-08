# Sequence: External Evidence Quest

Use when an outside source should influence the kid program, such as Khan
Academy, Duolingo, a reading app, or a school portal.

Last verified: 2026-11-07, against sprout-app contract `2026.11.07-1`.

## Steps

1. Create the kid mission surface with a canvas or conversation task. Set its
   gems in `policy.rewards`; they stay frozen until a parent approves.
2. Do not let gems settle on kid self-report alone: keep the task behind
   parent review.
3. Define a suggested evidence shape for the home agent.
4. Home agent or parent produces evidence.
5. Create a reviewable submission with `task_complete`.
6. Present the evidence and reasoning; inspect with `task_review({ submissionId })`.
7. Parent approves with `task_review({ submissionId, action: "approve" })`,
   which pays the task's frozen reward in full. `task_review` takes no gem
   amount (`gemsAwarded` removed in contract `2026.08.17-10`); for a different
   amount, freeze a low reward and top up with `gems_adjust` (contract
   `2026.09.24-6`).
8. Update the mission canvas or next mission if the evidence changes the state.

## Default rule

- Child action equals claim or request for check.
- Parent review equals reward decision.
