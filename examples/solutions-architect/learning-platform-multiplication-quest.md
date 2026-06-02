# Example: Learning Platform Multiplication Quest

Last verified: 2026-06-02

## User prompt

```text
Hey Sprout, I wish my child would do learning platform math work more
consistently. How do I make that happen with you?
```

## Collected details

- The child is 11.
- Focus: multiplication.
- Reward: $50 Switch game.
- Reward style: both consistency and mastery, but learning-platform evidence
  only.
- Schedule: Monday, Wednesday, Friday.
- Starting mode: manual evidence mode.
- Parent wants approval before gems.
- Parent wants review from phone if possible.

## Route

External evidence program.

## Recommended Sprout shape

- Mission lobby canvas for the child.
- Private family skill wrapping the canvas.
- Scheduled M/W/F task.
- Switch game reward at 50 gems.
- No direct reward on canvas completion.
- Manual evidence review starts agent-mediated or parent-facing result based on
  current product surface.
- Gems awarded only after parent approval.

## Kid-facing canvas

```text
Today's Quest: Multiplication Training

Do 10-15 minutes of multiplication practice. Try to finish one
activity, quiz, or review set.

Switch Game Goal: 0 / 50 gems

When you are done, ask your parent to check the learning platform.
```

## Parent-facing result

```text
Learning platform evidence:
- Multiplication practice
- 14 minutes
- Quiz score: 86%

Suggested reward:
- 1 consistency gem
- 3 mastery gems

Approve 4 gems?
```

## Likely setup tools

- `family_query_overview`
- `reward_create`
- `canvas_create`
- `skill_write`
- `task_create`

## Likely review tools later

- `task_complete`
- `task_review`

## Important nuance

- The suggested evidence shape is illustrative. It tells the home agent what
  kind of information is useful, not the exact schema it must use.
- Public docs should not tell the parent how to scrape a third-party platform.
