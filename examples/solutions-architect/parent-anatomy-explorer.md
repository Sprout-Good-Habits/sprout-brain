# Example: Parent-built Anatomy Explorer

Last verified: 2026-06-02

## User prompt

```text
I want to make a fun anatomy activity for a six-year-old. The child asked about
the brain and skull.
```

## Route

Simple family activity.

## Recommended Sprout shape

- Kid-facing canvas: "Anatomy Explorer."
- Age: 6.
- Device: iPad portrait-first unless otherwise known.
- Sprout helper/PIP: allowed if the current product supports it for the child.
- Completion: canvas `complete()`.
- Optional schedule or one-time task.
- No camera proof.
- No external data.

## Good parent-facing answer

```text
I would make this as a short visual Sprout canvas, not an external integration.
The child taps through brain, skull, heart, and lungs with simple "what does
this do?" moments. At the end, the child tells Sprout one thing they learned.

I can assign it once, or make it a summer science activity that appears weekly.
```

## Likely entities

- `canvas_create`
- `skill_write`
- `task_create`

## Avoid

- Asking the parent builder about HTML resolution.
- Asking the parent builder to write code.
- Saying Sprout can identify body parts from camera input.
