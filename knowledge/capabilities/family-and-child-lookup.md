# Family and Child Lookup

Agents can query the family and resolve children by name.

Last verified: 2026-07-01

## Tools

- `family_list` — the caller's active family memberships (the selectors a
  multi-family caller passes to `family_select_context`).
- `family_select_context` — bind the working family to the session. A
  multi-family caller must select a context before broad reads; on stateless
  transports the selection may not persist and must be repeated.
- `family_query_overview` — the family snapshot: children (`id`, `name`,
  `birthDate`, `grade`, `gems`, `status`) plus family preferences (screen-time
  stance, rewards philosophy, task categories).

## Rules

- Start with family lookup for non-trivial Sprout setup. A multi-family caller
  runs `family_list` → `family_select_context` before other reads.
- Resolve child names to ids yourself from `family_query_overview`.
- Do not ask parents for child UUIDs.
- Do not echo UUIDs to parents unless there is a technical debugging need.
