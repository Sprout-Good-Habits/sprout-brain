# Example: Screen Time Without Gems (Approval Mode)

Last verified: 2026-07-01

## User prompt

```text
I don't want screen time tied to gems. I just want to approve or deny it from my phone when he asks.
```

## Route

Screen-time management — configure the two settings axes, then handle the
request queue.

## Recommended Sprout shape

The two axes are independent:

- `unlockRequiresGems: false` — unlocking costs no gems.
- `unlockMode: 'approval'` — each child unlock request waits for the parent
  instead of unlocking immediately.

Together: the child asks, the parent approves/denies, no gems change hands.

## Good current plan

```text
1. family_query_overview → resolve the child's id.
2. screentime_update_settings({ childId, unlockRequiresGems: false, unlockMode: 'approval' })
3. When the child requests time, surface the queue:
   screentime_list_requests({ childId })
   → screentime_review_request({ requestId, action: 'approve' })  // or 'deny'
4. For a one-off parent-granted block, screentime_unlock({ childId, minutes }) is
   free and immediate (respects the per-child minimum).
```

## Avoid

- Telling the parent gems are required — with `unlockRequiresGems: false` they
  are not.
- Promising a bespoke phone approval UI; the approval is the standard review of
  a pending request.
- Conflating `unlockMode` (immediate vs approval) with `unlockRequiresGems`
  (free vs gem-metered) — they are separate settings.
