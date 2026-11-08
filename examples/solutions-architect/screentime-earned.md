# Example: Earn Screen Time

Last verified: 2026-11-07, against sprout-app contract `2026.11.07-1`.

## User prompt

```text
I want my 9-year-old to earn screen time by finishing her reading, not just get it for free.
```

## Route

Screen-time management. Two current ways to earn time — pick per the parent's
intent, and don't invent a third. There is no screen-time reward: a reward never
grants minutes (SPR-6976, contract `2026.10.15-3`).

## Recommended Sprout shape

- **Tasks first, then earned time** — a blocking schedule (for example after
  school) that waits on the reading task. Once the parent approves the task for
  the day, she has earned the schedule's `grantedMinutes`, and she starts them
  herself. Best fit for "earn by finishing reading": the time is tied to the
  task, not to a balance.
- **Gems buy time** — the reading task pays gems on review, and
  `unlockRequiresGems: true` lets her spend them on time at `gemsPerMinute`,
  capped by `dailyGemLimit`. Fits a family that wants one gem economy for
  rewards and time.

Either way the day stays closed outside schedules that open it, so she is not
getting time for free in the meantime.

## Good current plan

```text
1. family_query_overview → resolve the child's id.
2. Reading task, approved by the parent:
   task_create({ childId, runMode: 'conversation', conversationSpec: { goalType: 'explain', ... }, scheduleSpec, assignmentSkillId,
     policy: { rewards: [{ trigger: { type: 'completion' }, rewards: [{ type: 'gems', gems: 10 }] }] } })
   → on task_complete, task_review({ submissionId, action: 'approve' }) settles the task's frozen reward
     (the caller cannot choose a gem amount). For tasks first, the reward is optional.
3. Pick ONE:
   a. Tasks first:
      screentime_create_schedule({ childId, name: 'After school', startMinutes: 900,
        durationMinutes: 180, weekdays: [1,2,3,4,5], blocksScreenTime: true, grantedMinutes: 30 })
      → screentime_set_schedule_tasks({ childId, scheduleId, taskIds: [readingTaskId] }).
   b. Gems buy time:
      screentime_update_settings({ childId, unlockRequiresGems: true, gemsPerMinute: 1, dailyGemLimit: 60 }).
4. Confirm the shape (which model, how many minutes or what rate) with the parent before delivering.
5. Tell the parent the schedule or setting is saved and reaches the device at its next sync.
```

## Also consider

- The official **Screen Time Goalie** skill for managed enforcement on top of the
  earning model (see `official-skills.md`) — adopt it rather than rebuilding the
  policy/enforcement loop.
- `screentime_query_state.activeSchedule` shows where the day stands: tasks done
  or in review, and `earned` once all are approved.

## Avoid

- `reward_create` with `category: 'screen_time'` or `screenTimeSpec`: refused as
  unknown fields.
- Saying the device opens when the task is approved. The child presses Start.
- Marking the task done or starting the time for her: only a review marks it
  done, and only the child starts earned time.
- Awarding gems from a kid-facing surface without parent review.
- Claiming a canvas can grant screen time.
