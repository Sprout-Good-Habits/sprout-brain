# Reward and Gems Capability

Rewards are spending goals. Tasks and reviews are how kids earn gems.

Last verified: 2026-06-02

## Reward tools

- `reward_create`
- `reward_update`
- `reward_list`
- `reward_update_child_claim_policy`
- `reward_list_pending_claims`
- `reward_review_claim`
- `reward_list_pending_requests`
- `reward_review_request`

## Gem tools and paths

- `gems_query_balance`
- `task_review({ gemsAwarded })`
- `gems.adjust` when available and appropriate

## Default rule

For evidence-based programs, award gems through `task_review` after parent
approval. Do not grant gems from a kid-facing canvas when the canvas only
records a claim.

## Example

- Create "Switch game" at 50 gems.
- The child earns gems through reviewed learning-platform evidence.
- The child later claims the reward.
- Parent approves the reward claim.
