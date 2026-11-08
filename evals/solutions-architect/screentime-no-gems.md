# Eval: Screen Time Without Gems (Approval Mode)

```text
I don't want screen time tied to gems. I just want to approve or deny it from my phone when he asks.
```

Expected:

- Set the two independent axes: `unlockRequiresGems: false` and
  `unlockMode: 'approval'` via `screentime_update_settings`.
- Handle requests through `screentime_list_requests` → `screentime_review_request`.
- Mention `screentime_unlock` as the free parent-granted path, as a queued
  command confirmed by `screentime_describe_command` (`applied`), never as
  immediate (`screentime_unlock` description).
- Say an approved ask makes the time ready and the child starts it; nothing is
  granted until then (`screentime_review_request` description; MCP changelog
  `2026.10.14-10`, SPR-9417 and SPR-9418).
- Do not claim gems are required, and do not promise a bespoke phone UI.
- Keep `unlockMode` (immediate vs approval) distinct from `unlockRequiresGems`.

Source of truth: sprout-app `apps/server/mcp-contract.lock.json` `2026.11.07-1`
(`screentime_update_settings`, `screentime_review_request`, `screentime_unlock`,
`screentime_describe_command`).
