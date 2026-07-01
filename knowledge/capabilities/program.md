# Program Capability

A program is a reusable, parent-authored template — a tree of units and tasks
(with schedules, rewards, and canvas/conversation specs) that an agent authors
once and assigns to one or more children. Assigning it stamps out concrete,
dated tasks for that child.

Last verified: 2026-07-01

## Tools

- `program_create` — author a program from a full plan (`mode:'plan'`), or tether
  one unit/task onto an existing published program (`mode:'node'`).
- `program_get` / `program_list` — read a program / unit / task (template shape);
  list is filtered per type (`programId` for units, `programUnitId` for tasks).
- `program_update` — patch a program's metadata / input variables, or a unit /
  task in the shared-task shape.
- `program_delete` — soft-delete (archive) a program; hard-delete a unit / task
  with cascade.
- `program_assign` / `program_unassign` — assign a published program to a child
  (whole tree, or a single-node tether); abandon that assignment.
- `program_getAssignment` / `program_listAssignments` — read a child's assigned
  instance (full substituted tree); list a child's active assignments (shallow).

## Current use

- Author a template once, assign it to several children with different slot
  values (`program_assign` + `input`).
- Validate the plan (all `input_variables` declared, task shapes valid) with
  `program_get` / `program_list` before assigning.
- Verify substitutions and resolved dates for a child via `program_listAssignments`
  → `program_getAssignment` before the kid sees anything.
- Refine a template (`program_update`) or archive it (`program_delete`).

## Constraints

- Family-scoped. A `childId` outside the caller's family is denied, not an empty
  list.
- A program is a **template, not delivery**. Creating or assigning a program does
  not invoke a skill or notify a kid — delivery still happens through the
  authored tasks the assignment stamps out.
- Personalization is the `{{input.X}}` slot contract: declare `input_variables`,
  reference them in string fields, pass values at `program_assign`. Undeclared or
  unfilled slots are rejected. (This is the program-level analogue of canvas
  env-var parametrization — data enters through declared slots only.)
- Each task's date-less schedule intent resolves to a concrete
  `scheduled_for_date` at assign time; optional `startOn` anchors it (defaults to
  today in the child's timezone).
- Validation is strict — unknown keys (typos) fail rather than silently drop.
  `assignmentSkillId` / `sourceSkillId` are immutable.
- Do not invent fields. Author within the shared-task shape the tools accept.
