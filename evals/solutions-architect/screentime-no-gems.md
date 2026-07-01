# Eval: Screen Time Without Gems (Approval Mode)

```text
I don't want screen time tied to gems. I just want to approve or deny it from my phone when he asks.
```

Expected:

- Set the two independent axes: `unlockRequiresGems: false` and
  `unlockMode: 'approval'` via `screentime_update_settings`.
- Handle requests through `screentime_list_requests` → `screentime_review_request`.
- Mention `screentime_unlock` as the free, immediate parent-granted path.
- Do not claim gems are required, and do not promise a bespoke phone UI.
- Keep `unlockMode` (immediate vs approval) distinct from `unlockRequiresGems`.
