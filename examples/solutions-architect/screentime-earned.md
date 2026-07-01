# Example: Earn Screen Time

Last verified: 2026-07-01

## User prompt

```text
I want my 9-year-old to earn screen time by finishing her reading, not just get it for free.
```

## Route

Screen-time management. Two funding models exist — pick per the parent's intent,
don't invent a third.

## Recommended Sprout shape

Screen time can be gem-funded two ways:

- **Metered unlock** — turn on `unlockRequiresGems`; each unlock costs
  `minutes × gemsPerMinute` from the child's gem balance, capped by the daily gem
  limit. The child earns gems from reviewed tasks, then spends them on time.
- **Screen-time reward** — a `screen_time` reward (a fixed minutes grant priced
  in gems) the child claims like any other reward.

For "earn by finishing reading," gems come from the reading task's review; the
child then converts gems to time by either model.

## Good current plan

```text
1. family_query_overview → resolve the child's id.
2. Reading task that pays gems on parent review:
   task_create({ childId, runMode: 'conversation', conversationSpec: { goalType: 'explain', ... }, scheduleSpec, assignmentSkillId })
   → on task_complete, task_review({ action: 'approve', gemsAwarded: 10 }).
3. Let her spend gems on time — pick ONE:
   a. Metered: screentime_update_settings({ childId, unlockRequiresGems: true, gemsPerMinute: 1, dailyGemLimit: 60 }).
   b. Reward SKU: reward_create({ childId, name: '30 min screen time', gemsRequired: 30, category: 'screen_time', screenTimeSpec: { minutes: 30 } }).
4. Confirm the shape (which model, gem rate) with the parent before delivering.
```

## Also consider

- The official **Screen Time Goalie** skill for managed enforcement on top of the
  earning model (see `official-skills.md`) — adopt it rather than rebuilding the
  policy/enforcement loop.

## Avoid

- Awarding gems from a kid-facing surface without parent review.
- Promising a custom on-device screen-time UI.
- Claiming a canvas can grant screen time — grants come from the reward/unlock
  path, not canvas JS.
