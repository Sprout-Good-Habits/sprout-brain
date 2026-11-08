# Example: Focus Hours and Bedtime Schedule

Last verified: 2026-11-07, against sprout-app contract `2026.11.07-1`.

## User prompt

```text
Lock my son's tablet during homework time on school nights and after 8pm every day.
```

## Route

Screen-time management — schedules (not gems, not rewards).

## Recommended Sprout shape

Two blocking schedules via `screentime_create_schedule` (`blocksScreenTime`
defaults to true). Times are minutes from midnight; weekdays are 1–7.

Tell the parent how the day works before creating anything: **the day is
closed**. An hour no schedule covers is already locked, and the device never
opens by itself (SPR-5518). So the two blocks alone leave the rest of the day
locked too. Ask when he should have screens; if it is, say, 6–8pm, add an
opening schedule (`blocksScreenTime: false`) for those hours. If he should only
get time by asking or buying, no opening schedule is needed.

The blocking schedules still matter in a closed day: they name why screens are
off, and each sets how he can get more time during it (`unlockRequiresGems` /
`unlockMode` on the schedule; unset is a free ask to the parent).

## Good current plan

```text
1. family_query_overview → resolve the child's id.
2. screentime_day_plan({ childId }) and screentime_list_schedules({ childId }) → see what already applies.
3. Homework block, school nights (Mon–Fri, 4:00–6:00pm):
   screentime_create_schedule({ childId, name: 'Homework', emoji: '📚',
     startMinutes: 960, durationMinutes: 120, weekdays: [1,2,3,4,5] })
4. Bedtime block, every day (8:00pm–midnight):
   screentime_create_schedule({ childId, name: 'Bedtime', emoji: '🌙',
     startMinutes: 1200, durationMinutes: 240, weekdays: [1,2,3,4,5,6,7] })
5. If the parent wants free time outside those hours, an opening schedule:
   screentime_create_schedule({ childId, name: 'Free time', startMinutes: 1080,
     durationMinutes: 120, weekdays: [1,2,3,4,5,6,7], blocksScreenTime: false })
6. Read `shadowing` on each response and tell the parent which schedule wins
   where two meet (later start wins). Overlap is allowed.
7. screentime_day_plan({ childId }) → read the day back to the parent, quoting its clock strings.
8. Say the schedules are saved and reach the tablet at its next sync.
```

## Avoid

- Saying overlapping schedules are rejected. They are allowed and resolved by
  precedence: later start, then earlier end, then later created.
- Saying the tablet is free outside the two blocks. Without an opening schedule
  it is locked.
- Saying the tablet is locked now. A schedule is standing config that reaches
  the device at its next sync; `screentime_list_devices` cannot prove a schedule
  is installed.
- Turning a schedule off (`isEnabled: false`) for a one-night exception; use
  `screentime_skip_schedule_today`.
