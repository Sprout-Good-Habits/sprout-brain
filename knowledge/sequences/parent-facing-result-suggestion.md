# Sequence: Parent-facing Result With Suggestion

Use when a parent wants approval from the phone or family activity context.

Last verified: 2026-06-02

## Steps

1. Home agent or parent enters evidence.
2. Architect or skill produces a parent-facing result:
   - evidence summary
   - suggested gems
   - reason
   - recommended action
3. Parent approves.
4. Agent or app calls `task_review` or the appropriate write path.

## Caveat

Do not promise a polished phone UI unless the parent app review surface is
verified. The pattern is still valid: result first, write only after approval.
