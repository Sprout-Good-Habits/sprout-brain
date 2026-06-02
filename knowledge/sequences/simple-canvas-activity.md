# Sequence: Simple Canvas Activity

Use for a parent-builder request like "make a six-year-old an anatomy
explorer."

Last verified: 2026-06-02

## Steps

1. `family_query_overview` to resolve the child.
2. `canvas_create({ dryRun: true })` to preview the activity.
3. Parent confirms preview.
4. `canvas_create({ dryRun: false, specHash })` to commit the canvas.
5. `skill_write({ dryRun: true, canvasIds: [canvasId] })` to preview the
   skill.
6. Parent confirms skill.
7. `skill_write({ dryRun: false, specHash })` to commit the skill.
8. `task_create` to assign or schedule it.

Do not say the activity is live before step 8.
