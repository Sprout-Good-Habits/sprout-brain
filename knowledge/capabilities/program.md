# Program Capability (removed)

Programs are gone. The twelve `program_*` tools and the
`sprout://program/authoring-guide` resource were removed from the Sprout MCP in
contract `2026.11.04-2` (hidden since 2026-10-26). A call to one gets the
unknown-tool answer, and the `program:read` / `program:write` scopes are no
longer granted.

Last verified: 2026-11-07, against sprout-app `apps/server/mcp/changelog.md`.

## Use instead

- To give a child structured work, create tasks with `task_create` (one-off or
  recurring with `scheduleSpec`). See `task-and-review.md`.
- For a reusable behavior across children, write a skill (`skill_write`) and
  deliver it through tasks. See `skill.md`.
- Read every `task_list` item and `task_describe` answer as the one Task shape:
  there is no `taskSource: 'program'` to branch on.

Do not recommend, author or assign a program.
