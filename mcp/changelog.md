# Agent contract changelog

> **Canonical editing home.** This is the source of truth for the Sprout MCP
> agent-contract changelog. `sprout-app` vendors a copy at
> `apps/server/mcp/changelog.md` and bakes it into the server image, where it is
> served (newest first) as the `sprout://changelog` MCP resource. Edit here
> first, then mirror the change into the sprout-app copy in the same change.
> **Sync is manual today** — there is no automation (SPR-3120). When you add or
> change an entry, update BOTH files so the vendored copy stays byte-current.

Machine-readable, append-only log of agent-visible contract changes. Each entry
is keyed to the `contractVersion` in the sprout-app contract lockfile
(`apps/server/mcp-contract.lock.json`) it ships with. Entry format + worked
examples live with the sprout-app design notes (agent-contract project).

Conventions:

- Entries are stored **newest first** (prepend a new entry at the top of the
  list); the `sprout://changelog` resource serves them in that order.
- Same-day **backfill** entries (changes that predate the lockfile mechanism)
  carry a `-B<n>` suffix so they never collide with a real lockfile head.
- `action` routes the whoami nudge (PR-3): `none` (visible only), `reauth`
  (reconnect for a new scope), `refetch_tools`, `update_calls`.

## Entries

- version: 2026.07.24-1
  surface: resource
  change: new resource sprout://changelog serves the agent-contract changelog (newest first)
  action: none
  agent_guidance: >-
    Read sprout://changelog when a tool refuses unexpectedly, a capability is
    missing, or your model of a tool may be stale — each entry says what changed
    in the contract and what to do differently.

- version: 2026.07.23-2
  surface: tool
  change: >-
    loop.claim now returns queued parent feedback as read-only compatibility
    guidance to runners whose cached contract predates feedback_resolution_v1;
    loop.listDue now tells runners missing current semantic protocols to
    truthfully re-register before claiming.
  action: none
  agent_guidance: >-
    Review pendingFeedback from every granted claim before running the focal
    loop. Legacy contracts may apply that guidance without submitting structured
    feedback resolutions; do not claim a resolution state you cannot report.
    Follow loop.listDue's re-registration instruction when your live contracts
    can honor the named protocols.
  details_diff: |
    ~ tool changed: loop.claim (description, output behavior)
    ~ tool changed: loop.listDue (description, instructions behavior)

- version: 2026.07.22-4
  surface: tool
  change: >-
    marketplace.submit drops the retired setupInstructions field from
    submission metadata; setup guidance now travels via the setup recipe.
  action: none
  agent_guidance: >-
    Stop sending setupInstructions in marketplace.submit metadata — it is no
    longer accepted; convey setup guidance through the setup recipe instead.
  details_diff: |
    ~ tool changed: marketplace.submit (inputSchema)

- version: 2026.07.22-3
  surface: tool
  change: >-
    runner.register clarifies semantic protocol obligations and guides legacy
    runners through same-wake protocol self-upgrade.
  action: none
  agent_guidance: >-
    Advertise only protocols you can honor; when registration reports missing
    protocols, assess support and re-register during the same wake without
    asking the user to configure anything.
  details_diff: |
    ~ tool changed: runner.register (description, inputSchema)

- version: 2026.07.22-B2
  surface: tool
  change: task.create and task.update refuse dailyTarget > 10 when gems > 0
  action: update_calls
  agent_guidance: >-
    For unlimited replays set policy.freePlay {enabled: true} instead of a large
    dailyTarget; the refusal code DAILY_TARGET_GUARDRAIL carries
    {dailyTarget, gems, maxPaidDailyTarget, dailyPayout} for self-correction.

- version: 2026.07.22-B1
  surface: behavior
  feature_key: task_quests
  change: scheduled quests mint for today's window only; past windows never mint
  action: none
  agent_guidance: >-
    Do not expect quest rows for days the child never opened the app; misses are
    derived from schedule vs receipts, not from quest rows.

- version: 2026.07.15-1
  surface: scope
  feature_key: task_quests
  change: new tool quest.create requires scope quest:write
  action: reauth
  reauth:
    scopes_added: ["quest:write"]
    grants_before: "2026-07-15"
    how: >-
      Reconnect the Sprout connector, or mint a fresh connection token with
      quest:write. Existing tokens keep working but cannot see or call
      quest.create.
  agent_guidance: >-
    quest.create grants a child a bonus (extra) quest on a task within the
    parent's extras policy; refusals are typed with the remaining budget for
    counter-offers.
