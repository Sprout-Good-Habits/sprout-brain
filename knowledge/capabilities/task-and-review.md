# Task and Review Capability

Agents can create scheduled or one-time tasks assigned to children. Reviews are
the clean path for parent-approved gem awards.

Last verified: 2026-07-12

## Tools

- `task_create`
- `task_describe`
- `task_list`
- `task_update`
- `task_delete`
- `task_complete`
- `task_review`
- `task_runs_list` / `task_runs_get` - a task's canvas-run history over time,
  keyed on the stable task id (full run incl. the journey `log` on get).
  Replaces the DEPRECATED `canvas_runs_list` / `canvas_runs_get` (those
  fragment one task's history across rotated canvas ids).
- `quest_create` - mint ONE extra bonus earning slot on a task
  (`mintType: "extra"`), always clamped to the room the parent configured in
  `policy.extras`. Scheduled quests are never minted by hand.

## Run modes

- `self_check` - checklist-style completion.
- `conversation` - Sprout asks the child to share, explain, debate, or
  practice.
- `canvas` - child interacts with a linked canvas.

`runMode` is passed explicitly on `task_create` — there is no default.

## Earning vs playing (quests + free play)

A task has two independent axes; conflating them is the most common planning
mistake.

- **Earning is carried by quests — offers, not payments.** A scheduled task
  mints its earning quests lazily on each covered day (at the child's first
  home-read, or at completion time if that comes first); the gem price
  **freezes onto the quest at mint**, so a mid-day `rewardSpec` edit never
  reprices today's offer. Bonus earning beyond the schedule is `quest_create`
  (bounded by `policy.extras`: a per-day gem budget you size grants within, OR
  a fixed price capped at N grants/day — the server clamps; an
  exhausted-room refusal carries `remaining` so a budget-mode grant can be
  counter-offered smaller).
- **Free play is unpaid replay.** `policy.freePlay.enabled` lets the child
  replay the task when nothing is earnable (off-schedule, or after today's
  quests settle) for ZERO gems, always. A live earning quest wins over free
  play — the child earns before they free-play. A zero-gem completion is
  usually a free replay by design, not a missing payout (it can also be a
  zero-gem quest settling, or a quest that expired mid-play) — never a bug on
  its own.
- **Fit heuristic for freePlay:** ON when repetition is the value (practice
  drills, creative/sandbox play, replayable games); OFF when pacing is the
  value (progression courses metered by the schedule; conversation tasks
  unless open-ended repeats are wanted — each replay costs an LLM turn).
  Cross-day progress does NOT depend on this switch either way.

## Durable per-child state

Every (task, child) pair carries durable state: the canvas's journey
checkpoint (see `canvas.md`) plus a bounded record of recent settled
completions and play/paid counters. `task_describe` surfaces it per child as
the `state` block (`lastResult`, `recent[]`, `counters`, opaque `progress`)
and a `lastRun` aggregate (most recent settled run + its journey `log`,
capped ~16 KB). These blocks appear only when the family's `task_quests`
feature is enabled (rollout in progress) AND a child is resolved — pass
`childId` on `task_describe` for a multi-child task (single-child tasks
auto-resolve). Absence means flag-off or unresolved child scope, not
"no data ever".

## Content rotation — the task id owns the journey

Because progress and run history live on the task id:

- **Rolling task (default for continuing journeys):** rotate content in place
  with `task_update` (swap `canvasSpec.canvasId` — the new canvas must already
  be linked to the task's `assignmentSkillId`, or the swap is rejected;
  replace conversation `guidance`). The task IS the journey's identity; its
  state accumulates.
- **Sequential tasks:** one `task_create` per genuinely DISTINCT stage whose
  history stands alone (staged curricula).
- The journey-count test: one continuing journey → one rolling task; N
  independent stages → N tasks. Creating a new task per rotation ORPHANS the
  child's progress; cramming distinct stages onto one task collapses their
  histories.

## Constraints

- Canvas tasks require `assignmentSkillId` and a linked `canvasId`.
- `rewardSpec` awards on a SCHEDULED completion (the quest's frozen price);
  extra earning room is `policy.extras`, not a bigger `rewardSpec`.
- Do not use `rewardSpec` when completion is only a low-trust claim.
- For parent-approved rewards: `task_complete` creates the submission, then
  `task_review({ action, gemsAwarded })` approves/rejects. Flag-off (family
  without `task_quests`): `gemsAwarded` is **optional** — omit it to record
  approval without crediting gems; gems are never awarded automatically.
  Flag-on: approval is the DEFERRED settlement clock — credit comes ONLY from
  the consumed quest's frozen reward (with grace for a quest that expired
  between completion and approval); `gemsAwarded` is IGNORED, so a free-play
  receipt can never be parent-credited. Rejection consumes nothing — the
  quest stays available only while unexpired (the post-expiry grace applies
  to approval only).
- The MCP server's `initialize` instructions do NOT carry this earning/replay
  model (a planned addition was reverted for size budget; a rewrite is
  pending). Do not assume instructions-level awareness — read
  `sprout://task/authoring-guide` before authoring against quests, policy, or
  free play.
