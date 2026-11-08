# Example: Screen Time Without Gems (Approval Mode)

Last verified: 2026-11-07, against sprout-app contract `2026.11.07-1`.

## User prompt

```text
I don't want screen time tied to gems. I just want to approve or deny it from my phone when he asks.
```

## Route

Screen-time management — configure the two settings axes, then handle the
request queue.

## Recommended Sprout shape

**First choice: adopt the official Screen Time Goalie skill** — it interviews
the parent, drafts a policy they approve, then decides requests and watches for
bypass, which is exactly this "approve/deny when he asks" flow (see
`official-skills.md`). Fall back to hand-wiring the settings below only if the
family wants full manual control.

The two axes are independent:

- `unlockRequiresGems: false` — unlocking costs no gems.
- `unlockMode: 'approval'` — each child unlock request waits for the parent
  instead of unlocking immediately.

Together: the child asks, the parent approves/denies, no gems change hands.
These settings cover the hours between schedules; a blocking schedule with its
own `unlockRequiresGems` / `unlockMode` unset is already a free ask.

An approval makes the time **ready**, not running: he taps Start when he wants
it (`request.waitingForStart: true`). If his time is already running, the
approval adds the minutes at once.

## Good current plan

```text
1. family_query_overview → resolve the child's id.
2. screentime_update_settings({ childId, unlockRequiresGems: false, unlockMode: 'approval' })
3. When the child requests time, surface the queue:
   screentime_list_requests({ childId })
   → screentime_review_request({ requestId, action: 'approve' })  // or 'deny'
   → if request.waitingForStart, tell the parent the time is ready for him to start.
4. To give time without an ask, screentime_unlock({ childId, minutes }) is free
   (at least the per-child minimum). It is a queued command: keep the itemId and
   call screentime_describe_command; only `applied` means the device opened.
```

## Avoid

- Telling the parent gems are required — with `unlockRequiresGems: false` they
  are not.
- Promising a bespoke phone approval UI; the approval is the standard review of
  a pending request.
- Saying an approval or `screentime_unlock` has opened the device. An approval
  waits for his Start; an unlock is confirmed only by `describe_command`.
- Conflating `unlockMode` (immediate vs approval) with `unlockRequiresGems`
  (free vs gem-metered) — they are separate settings.
