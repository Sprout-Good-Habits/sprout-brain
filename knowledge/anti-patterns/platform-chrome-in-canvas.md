# Anti-pattern: Platform Chrome in Canvas

Bad recommendation:

"Show the kid's gem balance, streak, and a quest-board lobby inside the canvas."

Last verified: 2026-06-11

## Why bad

A canvas is one activity's world, not a copy of the Sprout app. Gem balances,
streaks, daily tallies, reward bounties, and lobbies/boards are platform
surfaces — the kid app and the program quest board own them. A canvas that
re-renders them:

- shows stale numbers (the canvas cannot read the live balance — no fetch,
  local-only state), so the "balance" is fiction;
- duplicates chrome the kid already sees one level up, shrinking the space
  for the actual activity;
- turns the canvas into a lobby, when Sprout's program/unit board IS the
  lobby. One giant hub canvas that "leads to" other activities cannot
  actually launch them (canvases are sandboxed, one per task) and competes
  with the kid app's own navigation.

## Use instead

- One canvas = one activity that starts in its own world immediately.
- Multiple activities = multiple small canvases under a program; the
  program's unit/quest board is the lobby.
- In-activity state is welcome and encouraged: level within this game,
  puzzle N of M, streak within this run, points for this session.
- Reward framing (gems earned, balance, bounty) lives on the task card and
  Sprout surfaces, never rendered inside the canvas.

## Boundary test

Before rendering any counter or board in a canvas, ask: "does this number
exist outside this activity?" If yes (gem balance, day streak, other
quests), it is platform chrome — leave it out. If it only exists inside
this run (vault level, seals earned this quest), it belongs to the canvas.
