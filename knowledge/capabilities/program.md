# Program Capability

A program is a reusable, parent-authored template — a tree of units and tasks
(with schedules, rewards, and canvas/conversation specs) that an agent authors
once and assigns to one or more children. Assigning it stamps out concrete,
dated tasks for that child.

Last verified: 2026-07-02

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

## Surfacing on the kid lobby (structure doctrine)

Write-side success is NOT kid-visible. The kid lobby resolves a program
assignment via its `current_unit_id` and renders **that unit plus ONE level of
child units**; an assignment with no visible task content today is **omitted
from the lobby entirely** — no empty card, no hint it exists. Structure your
program so this renderer always has something to show:

- **Author exactly ONE root umbrella unit per program.** It is the entry point
  the lobby resolves to. Nest parallel tracks as child units under it; put
  tasks on the child units.

  ```
  program
  └── root umbrella unit        ← current_unit_id resolves here
      ├── child unit A          ← rendered (one level down)
      │   └── tasks
      └── child unit B          ← rendered
          └── tasks
  ```

  `program → root unit → child units → tasks` is the V1 depth cap (3 levels of
  structure). **Multiple root units = invisible siblings**: the lobby resolves
  to one root and never renders the others (real production incident,
  SPR-1944).
- **Schedule so weekdays are non-empty.** At least one daily task guarantees
  the assignment surfaces every day; a program whose tasks all fall on
  weekends vanishes from the lobby Monday-Friday.
- **Verify on the KID surface** (lobby / assignment view), not just
  `task.list`. Tasks existing in the database does not mean the kid can see
  the program today.
- Known read-surface caveat: the `program.getAssignment` tree currently
  mis-renders canvas tasks as `self_check` — `task.describe` is ground truth
  for a task's real shape (fix in flight).
