# Worked Example — Cross-Day Journey Canvas

One complete canvas demonstrating the durable journey contract from
`../../../canvas/sdk.md` ("Durable journey" + "Journey log"): a leveled math
drill where the kid's level carries across sittings and DAYS on the same
task. Finish Tuesday on level 3; Wednesday's play opens at level 3.

| File | Shows |
| --- | --- |
| `leveled-drill.html` | The full three-line model in one canvas: `sprout.journey.get()` with default-fill on boot, level-up logic, `sprout.log` for the attempt trail, `await sprout.journey.save(next)` BEFORE `sprout.complete(...)`, and graceful degradation on a typed save refusal. `sprout.state` still handles the within-sitting resume. |

The contract points this example is pinned to:

- **Default-fill on read.** `journey.get()` resolves `{}` on a first run AND
  when the family's durable-state feature is off — the two are
  indistinguishable by design, so every field is `??`-defaulted.
- **Replace-only save, before complete.** The whole checkpoint is written
  back in one `save(next)`, awaited, and only then does the canvas call
  `sprout.complete(...)` — the checkpoint must be durable before the run
  freezes.
- **History goes to `log`, never `journey`.** Per-attempt events stream via
  `sprout.log(...)`; the journey stays a small "where are they" blob.
- **Typed refusals degrade, never break.** `{ok:false, error}` on save
  ('too-large' | 'disabled' | 'not-task-linked') leaves the canvas fully
  playable — just without cross-day carry.

Deliver it like any canvas: `canvas_create` → `skill_write {canvasIds}` →
`task_create {assignmentSkillId}`. When rotating drill content later,
`task_update` the SAME task, linking the new canvas to the task's skill
before the swap (the journey lives on the task id — see
`knowledge/primitives/task-state.md`).
