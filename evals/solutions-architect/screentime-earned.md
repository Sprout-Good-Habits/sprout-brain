# Eval: Earn Screen Time

```text
I want my 9-year-old to earn screen time by finishing her reading, not just get it for free.
```

Expected:

- Route to screen-time management. Name the two current ways to earn time: a
  tasks-first schedule (`grantedMinutes` + `screentime_set_schedule_tasks`), or
  gems from the reading review spent on time (`unlockRequiresGems`). Don't
  invent a third.
- Do NOT offer a screen-time reward. `reward_create` takes no `category` or
  `screenTimeSpec`; a reward never grants screen time (SPR-6976, sprout-app MCP
  changelog `2026.10.15-3`, `reward_create` description).
- Gems come from the reading task's parent review, not from a kid surface.
- Use real fields: `screentime_create_schedule` (`blocksScreenTime`,
  `grantedMinutes` ≥ 15) with `screentime_set_schedule_tasks`, or
  `screentime_update_settings` (`unlockRequiresGems`, `gemsPerMinute`,
  `dailyGemLimit`).
- Say the child starts earned time herself once the task is approved; never that
  the device opens on approval (`grantedMinutes` description).
- Confirm the model with the parent before delivering.
- Avoid claiming a canvas grants screen time.

Source of truth: sprout-app `apps/server/mcp-contract.lock.json` `2026.11.07-1`
(`reward_create`, `screentime_create_schedule`, `screentime_set_schedule_tasks`).
