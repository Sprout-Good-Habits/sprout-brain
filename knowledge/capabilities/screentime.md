# Screen Time Capability

Screen time is the gem-funded reward of unlocking a child's device. Parents set
the policy; kids spend gems (or request time) to unlock; schedules and manual
locks constrain when the device is usable.

Last verified: 2026-07-01

## Tools

- `screentime_query_state` — a child's current lock state, active-unlock expiry,
  today's gem spend vs daily limit, and active schedule.
- `screentime_get_settings` / `screentime_update_settings` — read / partially
  update policy (daily gem limit, gems-per-minute, min unlock minutes, unlock
  mode, whether unlocks require gems, day-time window).
- `screentime_list_requests` / `screentime_review_request` — the parent approval
  queue for child unlock requests; review approves (deduct gems + grant unlock)
  or denies.
- `screentime_lock` / `screentime_unlock` — immediate parent lock; parent-granted
  unlock for N minutes (free, bypasses the gem cost and approval).
- `screentime_list_schedules` / `screentime_create_schedule` /
  `screentime_update_schedule` / `screentime_delete_schedule` — recurring lock
  windows (focus hours, bedtime) by weekday + time.
- `screentime_list_devices` — registered devices with auth status, last-seen,
  push-enabled, and lock-ack summary.

## Current use

- Surface the parent's approval queue (`list_requests`) and let them review each
  child unlock request.
- Show a live status read (`query_state`) before recommending an action.
- Set up recurring locks (`create_schedule`) for focus hours or bedtime.
- Manual override: `lock` to restrict now, `unlock` to grant free time.
- Tune the gem economy (`update_settings`) — daily limit, gems-per-minute, or
  turn the gem requirement off for a child.

## Constraints

- Family-scoped. A `childId` outside the caller's family is denied, not
  disclosed — read state first; never assume an id is valid.
- Only `review_request` (approve) deducts gems. Parent `unlock` is free and
  immediate. This is the only path a kid spends gems on screen time.
- `lock` takes effect on the device's next sync; `unlock` grants access until an
  expiry timestamp. Schedules and the day-time window run independently and can
  re-lock during an active unlock.
- Unlock has a per-child minimum (`minUnlockMinutes`, default 15).
- Schedules cannot overlap on the same weekday (overlap is rejected). Deleting a
  schedule is permanent (hard delete).
- No custom device UI. The agent configures policy and reviews requests; the
  enforcement happens on the registered device.
