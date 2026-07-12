# Primitive: Quest

A quest is the reified "this play EARNS" grant on a task — an offer, not a
payment. Quests separate WHEN a task pays (earning) from WHETHER it can be
played (delivery + free play).

Last verified: 2026-07-12

## Tools

- `quest_create` - mint ONE extra bonus quest (`mintType: "extra"`) on a task.
- `task_describe` - the task's `policy` projection shows the earning slots.

## Shape

- **Scheduled quests** are minted lazily and idempotently at the child's
  first home-read of a covered day (or at completion time when a completion
  beats the home-read) — the per-day paid-play count comes from
  `conversationSpec.dailyTarget` (conversation) or
  `canvasSpec.grading.attemptsPerDay` (canvas); default 1. Agents never mint
  these by hand.
- **Extra quests** are minted on ask via `quest_create`, always WITHIN the
  per-task `policy.extras` room the parent configured: a per-kid-per-day gem
  BUDGET (you size each grant), or a FIXED menu (forced price, capped count).
  The server clamps every grant; an exhausted-room refusal carries
  `remaining`, and in budget mode the agent can counter-offer a smaller
  grant (other refusals — no extras configured, wrong fixed price, archived
  task — are not negotiable).
- **The reward freezes at mint.** Each quest carries the gem price captured
  when it was minted — a later `rewardSpec` edit changes tomorrow's mint, not
  today's live offer.
- A quest is scoped to the kid-local earning day (`window`, `expiresAt`). An
  unsettled quest past expiry is dead, not owed — with one grace exception: a
  completion submitted BEFORE expiry that lands in `pending_review` can still
  consume it at parent approval (see Settlement below).
- Settlement: an auto-approved (or proxy) completion consumes the
  lowest-sequence live quest at completion time and pays its frozen reward;
  with no live quest it settles unpaid (free play, if the task allows it). A
  `pending_review` completion defers settlement to parent approval — the quest
  stays unlinked until then (approval settles with grace for mid-wait expiry;
  rejection consumes nothing — the quest stays available only while
  unexpired).

## Rules

- Minting is NOT paying — the child still has to do the task to collect.
- Never promise earning capacity beyond `policy.extras`; the server clamps.
- A completed task with a live unlinked quest is never simultaneously
  free-playable — earning always wins (the platform enforces this invariant).
