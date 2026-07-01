# Example: Focus Hours and Bedtime Schedule

Last verified: 2026-07-01

## User prompt

```text
Lock my son's tablet during homework time on school nights and after 8pm every day.
```

## Route

Screen-time management — recurring lock schedules (not gems, not rewards).

## Recommended Sprout shape

Two recurring lock windows via `screentime_create_schedule`. Schedules are
independent of the gem/unlock economy — they constrain WHEN the device is usable
regardless of gem balance. Times are minutes-from-midnight; weekdays are 1–7.

## Good current plan

```text
1. family_query_overview → resolve the child's id.
2. Homework lock, school nights (Mon–Fri, 4:00–6:00pm):
   screentime_create_schedule({ childId, name: 'Homework', emoji: '📚',
     startMinutes: 960, durationMinutes: 120, weekdays: [1,2,3,4,5] })
3. Bedtime lock, every day (8:00pm–midnight):
   screentime_create_schedule({ childId, name: 'Bedtime', emoji: '🌙',
     startMinutes: 1200, durationMinutes: 240, weekdays: [1,2,3,4,5,6,7] })
4. screentime_list_schedules({ childId }) to confirm no overlaps.
```

## Avoid

- Overlapping schedules on the same weekday — the create is rejected.
- Assuming a lock is instantaneous everywhere; it applies on the device's next
  sync.
- Using a schedule to *grant* time — schedules only constrain; unlocks and
  rewards grant.
