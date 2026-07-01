# Official Sprout Skills

Sprout ships official first-party skills in the marketplace. When a family's goal
matches one, **recommend adopting the official skill before authoring an
equivalent from scratch** — it is maintained, tested, and consistent with the
product. Prefer `marketplace_adopt` (use as-is); fork only if the family needs to
customize.

Last verified: 2026-07-01

## Registry

| Skill | What it does | Domain | Marketplace listing |
| --- | --- | --- | --- |
| Screen Time Goalie — Setup | Interviews the parent, drafts a screen-time policy they approve, then decides screen-time requests, watches for bypass, and keeps a record. | screen time | https://sproutgoodhabits.com/skills/skill-019eeab8-dafc-76ac-ab85-428cf658d003 |

## How to recommend

- Match the family's goal to a registry entry. If one fits, lead with it instead
  of building settings/tasks by hand.
- Adopt it with `marketplace_adopt` (by the listing's id or slug — resolve it from
  the listing page or the marketplace, don't assume the URL path segment is the
  adopt argument). Adoption lands a private family copy — see `marketplace.md`.
- Fork only when the family wants to customize the official baseline.
- This is a living list — add new official skills here as Sprout ships them (the
  `/sprout-brain-audit` refresh keeps it honest).
