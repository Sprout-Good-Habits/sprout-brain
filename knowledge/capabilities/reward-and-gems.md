# Reward and Gems Capability

Rewards are spending goals. Tasks and reviews are how kids earn gems.

Last verified: 2026-11-07, against sprout-app contract `2026.11.07-1`.

## A reward never grants screen time

Rewards have no category and no minutes. `reward_create` and `reward_update`
refuse `category` and `screenTimeSpec` as unknown fields (SPR-6976, contract
`2026.10.15-3`). Screen time is bought with gems in the kid app at the price set
by `screentime_update_settings`, or earned through a tasks-first schedule. To
reward a child with screen time, give them gems. See `screentime.md`.

A claim made earlier for a retired screen-time reward closes declined with the
gems back, even on approve: after `reward_review_claim`, read `status`.

## Reward tools

- `reward_create`
- `reward_update`
- `reward_list`
- `reward_update_child_claim_policy`
- `reward_list_pending_claims`
- `reward_review_claim`
- `reward_list_pending_requests`
- `reward_review_request`
- `reward_prepare_photo_upload`

## Gem tools and paths

- `gems_query_balance`
- `gems_list_transactions`
- `task_review({ submissionId, action: 'approve' })` — settles the task's frozen
  `policy.rewards` in full; it takes no gem amount (`gemsAwarded` was removed in
  contract `2026.08.17-10`)
- `gems_adjust` — direct balance adjustment

## Default rule

For evidence-based tasks, set the gems in the task's `policy.rewards` and let
parent approval through `task_review` settle them. Do not grant gems from a kid-facing canvas when the canvas only
records a claim.

## Example

- Create "Switch game" at 50 gems.
- The child earns gems through reviewed learning-platform evidence.
- The child later claims the reward.
- Parent approves the reward claim.
