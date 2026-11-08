# Eval: Focus Hours and Bedtime Schedule

```text
Lock my son's tablet during homework time on school nights and after 8pm every day.
```

Expected:

- Route to screen-time schedules via `screentime_create_schedule`.
- Two blocking schedules: weekday homework (`weekdays: [1,2,3,4,5]`) + daily
  bedtime.
- Use minutes-from-midnight `startMinutes` / `durationMinutes` (≥ 15), weekdays
  1–7.
- Tell the parent the day is closed: hours no schedule opens are already locked,
  so ask when he should have screens and offer an opening schedule
  (`blocksScreenTime: false`) for them (`screentime_day_plan` description;
  sprout-app `PLAN_DEFAULT_RULE = 'blocked'`, SPR-5518).
- Do NOT say overlapping schedules are rejected. They may overlap; the later
  start wins, and the response lists the overlaps under `shadowing`
  (`screentime_create_schedule` description; MCP changelog `2026.10.08-1`
  retired the pilot that once limited this).
- Say the schedules are saved and reach the device at its next sync, not that
  the tablet is locked now (standing config, `screentime_create_schedule`
  description).
- Prefer `screentime_day_plan` to read back what applies, quoting its clock
  strings.
- Do not tie the schedules to gems or rewards.

Source of truth: sprout-app `apps/server/mcp-contract.lock.json` `2026.11.07-1`
(`screentime_create_schedule`, `screentime_day_plan`).
