# Conversation Task Capability

Conversation tasks let Sprout talk with the child — share, explain, debate, or
practice — without a custom canvas.

Last verified: 2026-07-01

## Tool shape

Use `task_create` with:

- `runMode: "conversation"`
- `childIds` and a `scheduleSpec` (when/how often the task fires — required)
- `conversationSpec.goalType` — one of `share` (journal / mood), `explain`
  (teach-back / homework), `debate` (argue a side), `practice` (language /
  social)
- concrete `conversationSpec.guidance` (what Sprout should draw out)
- optional `assignmentSkillId` (deliver through a skill — preferred)

Optional `conversationSpec` tuning: `minResponses` / `maxResponses`,
`dailyTarget`, `effort` (`lenient` | `balanced` | `strict`), `grading`
(`engagement` | `correctness`), and `outcomes` (evidence targets).

## Good for

- "Sprout and my kid journal together."
- "Explain what you practiced today."
- "Talk through what felt hard."
- "Practice asking for help when stuck."

## Avoid for

- Proving external work happened.
- Fetching third-party progress.
- Replacing parent approval when evidence matters.
