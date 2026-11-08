# Screen Time Capability

Screen time is the child's device being open. The server decides every rule
(when it is open, what time costs, who may end it) and every client — the kid
app, the parent app, Sprout's own agent and you over MCP — gets the same answer.
Never add a refusal or a rule of your own on top of what a tool returns.

Last verified: 2026-11-07, against sprout-app `apps/server/mcp-contract.lock.json`
contract `2026.11.07-1` and `docs/design/native-screen-time-handoff.md` §2.

## The model

1. **The day is closed.** An hour no schedule covers is locked (SPR-5518). The
   device never opens by itself.
2. **A schedule either blocks or opens.** `blocksScreenTime` defaults to `true`
   (bedtime, homework). `blocksScreenTime: false` opens those hours.
3. **Schedules may overlap.** Where two cover the same minutes, the later start
   wins, then the earlier end, then the later-created one. A create or update
   returns the schedules it overlaps under `shadowing`, with `wins` saying which
   one the device shows. That is expected, not an error to undo.
4. **A blocking schedule can be tasks first.** `screentime_set_schedule_tasks`
   names the tasks it waits on; once every one is approved for the day the child
   has *earned* `grantedMinutes`, which the **child starts**. Nothing opens until
   the child presses Start, and only a review marks a task done.
5. **A parent's lock stands above the schedules** until a grown-up lifts it.
   While it holds, no schedule opens the device and earned time cannot start
   (the tasks still count). `screentime_back_to_schedule` hands the device back
   to the schedules, with the parent's yes.
6. **Every given or bought time ends.** A grant runs to its deadline, then the
   schedules decide again.
7. **A block does not cut a grown-up's time** (#7055, Han 2026-09-24). A
   blocking schedule that starts while time a parent gave (or a parent-approved
   ask) is running does not end it. A kid's own gem purchase still cannot buy
   into a block unless that schedule allows buying (below).

`screentime_query_state.control` says who holds the device right now: `plan`
(the schedules decide), `lock` (a grown-up's lock), or `grant` (time is running).
`paused` is set when the kid paused their own paid time: the device is shielded,
but tell the parent it is paused, not locked.

## How the child gets more time

Two settings decide it, and they apply in two places:

- **Between schedules** (the closed gaps): the child's app setting,
  `screentime_update_settings`.
- **During a blocking schedule:** that schedule's own `unlockRequiresGems` /
  `unlockMode`. Not set (`null`) means a free ask.

The settings:

- `unlockRequiresGems` — `true`: time costs `minutes × gemsPerMinute` gems,
  capped by `dailyGemLimit`. `false`: the child asks for free.
- `unlockMode` — `immediate`: with gems on, the child buys on their own, **even
  under a parent's lock**. `approval`: every ask goes to a parent first, at the
  price when gems are on.

A parent's approval of a whole-device ask makes the time **ready** (contract
`2026.10.14-10`): nothing is granted or charged until the child taps Start
(`request.waitingForStart: true`, `gems.charged: 0`). If time is already
running, the approval adds the minutes at once and charges then. An ask for one
app (`appLabel` set) opens that app at once and charges at once.

There is no screen-time reward. `reward_create` cannot grant minutes (refused
since SPR-6976, contract `2026.10.15-3`). To let a child earn screen time, pay
gems for reviewed tasks and let them buy time, or make a schedule tasks first.

## Tools

Reads:

- `screentime_query_state` — `desiredState` (what the server ordered) and
  `servedState` (what to tell the parent, with `provenance`); `control`,
  `paused`, `activeSchedule` (its tasks, `remainingToday`, `earned`). When the
  two states disagree, the command has not landed: say so.
- `screentime_day_plan` — one local day with every schedule combined: when
  screens are off, which schedule applies from each moment, and `now`. Read this,
  not `list_schedules`, to answer "is she blocked now" or "do these overlap".
  Quote its clock strings; never recompute them.
- `screentime_list_schedules` — the authored schedules (`blocksScreenTime`,
  `grantedMinutes`, `skippedToday`, task ids).
- `screentime_get_settings` — the app setting. Creates the default row on first
  read (60 gem daily limit, 1 gem/min, 15 min minimum, `immediate`, gems off).
- `screentime_list_requests` — the child's pending asks.
- `screentime_list_devices` — the enforcement evidence: `screenTimeAuthStatus`,
  `lastSeenAt`, `pushEnabled`, `lastAcknowledgement`, `readiness` (native app),
  `needsRelink`. Call it before promising a parent a lock or unlock will land.
- `screentime_describe_command` — what became of one queued command, by `itemId`.

Queued commands (return an `itemId`; only `applied` means it happened):

- `screentime_lock` — lock now. Ends any running time; gems for paid time left
  go back to the kid. Refused only with `no_authorized_device` or
  `no_block_list`, and never while the kid holds paid time.
- `screentime_unlock` — give time. `minutes` is optional; leaving it out gives
  the rest of the child's local day. There is no open-ended unlock. An unlock
  while time is running extends it.
- `screentime_review_request` — approve or deny an ask (see above). Its
  `command` is null on a deny, a per-app approval, and a whole-device approval
  waiting for Start.

Standing config (saved at once; the device converges at its next reconcile;
nothing to track):

- `screentime_update_settings`
- `screentime_create_schedule` / `screentime_update_schedule` /
  `screentime_delete_schedule` (hard delete) — `weekdays` (1=Mon..7=Sun) or one
  `scheduledDate`, `startMinutes` 0..1439, `durationMinutes` ≥ 15,
  `blocksScreenTime`, `grantedMinutes` ≥ 15, and the schedule's own
  `unlockRequiresGems` / `unlockMode`. Send an `Idempotency-Key` on create.
- `screentime_set_schedule_tasks` — the tasks a blocking schedule waits on
  (replaces the list; at most 10).
- `screentime_skip_schedule_today` / `screentime_unskip_schedule_today` — one
  schedule off for today only. A skip does not open screens: the hours become an
  ordinary locked gap.
- `screentime_back_to_schedule` — lift a parent's lock so the schedules decide.
  Not an unlock; ask the parent first.

## Current use

- **Official skill first (pending a product decision, SPR-12611).** For a family
  that wants managed enforcement, recommend adopting the official **Screen Time
  Goalie** skill before hand-wiring settings and schedules. See
  `official-skills.md`.
- Read `query_state` and `day_plan` before recommending anything.
- Surface the parent's queue (`list_requests`) and review each ask.
- Bedtime and homework: blocking schedules. Free time after school: an opening
  schedule (`blocksScreenTime: false`), or let the child ask or buy.
- "Screens after chores": a tasks-first schedule (`grantedMinutes` plus
  `set_schedule_tasks`).
- "No bedtime tonight": `skip_schedule_today`, never `isEnabled: false`, which
  stops every future run. Offer to give time too if the parent wants screens on.
- Manual override: `lock` now; `unlock` to give time; `back_to_schedule` to undo
  a lock.
- Tune the price: `update_settings` (daily limit, gems per minute, unlock mode,
  or gems off).

## Constraints

- Family-scoped. A `childId` outside the caller's family is denied, not
  disclosed. Resolve ids first; never assume one.
- A lock or unlock is not confirmed until `describe_command` reports `applied`.
  `pending` means keep checking; `expired` is terminal and must be re-sent. Never
  tell a parent the device is locked or open on the strength of the call alone.
- A schedule or setting change is saved at once but reaches the device at its
  next reconcile. `list_devices` cannot prove a device has it.
- The minimum unlock is `minUnlockMinutes` (default and floor 15).
- No custom device UI. The kid asks and buys in the kid app; the agent sets
  policy and reviews asks; the device enforces.
