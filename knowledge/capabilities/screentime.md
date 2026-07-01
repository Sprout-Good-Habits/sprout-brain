# Screen Time Capability

Screen time is unlocking a child's device. Parents set the policy; schedules and
manual locks constrain when the device is usable. How an unlock is funded and
gated is **configurable per child**, not fixed.

**Two independent settings axes:**
- `unlockRequiresGems` (on/off) — the gem-required vs free duality. On: an
  unlock costs `minutes × gemsPerMinute` from the child's gem balance. Off:
  unlocking does not spend gems.
- `unlockMode` (`immediate` | `approval`) — whether an unlock takes effect right
  away or must be approved by a parent (`screentime_review_request`).

**Two ways screen time relates to gems:**
1. **Metered unlock** — under `unlockRequiresGems`, a request debits
   `minutes × gemsPerMinute` (capped by the daily gem limit).
2. **Screen-time reward** — `reward_create` with `category: 'screen_time'` and
   `screenTimeSpec: { minutes }`, priced in `gemsRequired`; the child claims it
   and, on approval, gets those minutes. See `reward-and-gems.md`.

Last verified: 2026-07-01

## Tools

- `screentime_query_state` — a child's current lock state, active-unlock expiry,
  today's gem spend vs daily limit, and active schedule.
- `screentime_get_settings` / `screentime_update_settings` — read / partially
  update policy: `dailyGemLimit`, `gemsPerMinute`, `minUnlockMinutes`,
  `unlockMode` (`immediate` | `approval`), `unlockRequiresGems` (on/off), and the
  day-time window.
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

- **Prefer the official skill for hands-off setup.** For a family that wants
  managed enforcement, recommend adopting the official **Screen Time Goalie**
  skill (it interviews the parent, drafts a policy, then decides requests and
  watches for bypass) before hand-wiring settings and schedules. See
  `official-skills.md`.
- Surface the parent's approval queue (`list_requests`) and let them review each
  child unlock request.
- Show a live status read (`query_state`) before recommending an action.
- Set up recurring locks (`create_schedule`) for focus hours or bedtime.
- Manual override: `lock` to restrict now, `unlock` to grant free time.
- Tune the gem economy (`update_settings`) — daily limit, gems-per-minute, unlock
  mode, or turn the gem requirement off for a child.
- Offer screen time as a purchasable reward: create a `screen_time` reward with a
  `minutes` grant priced in gems (a reward-domain action — see
  `reward-and-gems.md`).

## Constraints

- Family-scoped. A `childId` outside the caller's family is denied, not
  disclosed — read state first; never assume an id is valid.
- Gems are debited only on a **metered unlock** (`unlockRequiresGems` on):
  immediately in `immediate` mode, or on `review_request` approval in `approval`
  mode. Parent direct `unlock` is always free. With `unlockRequiresGems` off,
  unlocking spends no gems at all.
- `lock` takes effect on the device's next sync; `unlock` grants access until an
  expiry timestamp. Schedules and the day-time window run independently and can
  re-lock during an active unlock.
- Unlock has a per-child minimum (`minUnlockMinutes`, default 15).
- Schedules cannot overlap on the same weekday (overlap is rejected). Deleting a
  schedule is permanent (hard delete).
- No custom device UI. The agent configures policy and reviews requests; the
  enforcement happens on the registered device.
