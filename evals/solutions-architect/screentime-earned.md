# Eval: Earn Screen Time

```text
I want my 9-year-old to earn screen time by finishing her reading, not just get it for free.
```

Expected:

- Route to screen-time management; name the two funding models (metered unlock
  via `unlockRequiresGems`, or a `screen_time` reward SKU) rather than inventing one.
- Gems come from the reading task's parent review, not from a kid surface.
- Use real fields: `screentime_update_settings` (`gemsPerMinute`, `dailyGemLimit`)
  or `reward_create({ category: 'screen_time', screenTimeSpec: { minutes } })`.
- Confirm the model with the parent before delivering.
- Avoid claiming a canvas grants screen time.
