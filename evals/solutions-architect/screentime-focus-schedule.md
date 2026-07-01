# Eval: Focus Hours and Bedtime Schedule

```text
Lock my son's tablet during homework time on school nights and after 8pm every day.
```

Expected:

- Route to screen-time schedules via `screentime_create_schedule`.
- Two windows: weekday homework (`weekdays: [1,2,3,4,5]`) + daily bedtime.
- Use minutes-from-midnight `startMinutes` / `durationMinutes`, weekdays 1–7.
- Warn that same-weekday overlaps are rejected and locks apply on next sync.
- Do not tie schedules to gems or use them to grant time (schedules constrain only).
