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

- version: 2026.07.27-1
  surface: resource
  change: new resource sprout://changelog serves the agent-contract changelog (newest first)
  action: none
  agent_guidance: >-
    Read sprout://changelog when a tool refuses unexpectedly, a capability is
    missing, or your model of a tool may be stale — each entry says what changed
    in the contract and what to do differently.

- version: 2026.07.26-1
  surface: tool
  change: >-
    Every tools/list entry now advertises Sprout OAuth through a top-level
    securitySchemes field and the Apps SDK compatibility mirror at
    _meta.securitySchemes. Unauthenticated tools/call requests return an
    mcp/www_authenticate challenge instead of invoking the requested tool.
  action: none
  agent_guidance: >-
    Clients may discover the full tool catalog before account linking. Start
    Sprout OAuth when a protected call returns mcp/www_authenticate, then retry
    the call with the issued credential. Do not treat the pre-auth challenge as
    a tool failure or as evidence that the handler ran.
  details_diff: |
    ~ every tool changed: + securitySchemes [{ type: "oauth2", scopes: ["openid"] }]
    ~ every tool _meta changed: + securitySchemes compatibility mirror

- version: 2026.07.25-1
  surface: tool
  change: >-
    task.create and task.update accept an optional
    canvasSpec.activityVerification intent for a Canvas assignment. The V1
    shape is { version:"activity_verification_intent_v1",
    activity:"piano_passage_repetition"|"hand_clap_repetition", instruction,
    target }; task.update also accepts null to clear the intent.
  action: none
  agent_guidance: >-
    Use canvasSpec.activityVerification only when the linked Canvas directly
    calls sprout.activity.verify/status and declares the required recording
    capability. Supply the child-facing instruction and repetition target; do
    not invent unit, audio, capture, verifier, provider, or proof-term fields,
    because the server compiles those into the trusted activity plan.
  details_diff: |
    ~ tool changed: task.create (inputSchema)
    ~ tool changed: task.update (inputSchema)

- version: 2026.07.24-5
  surface: tool
  change: >-
    task.create / task.update / program.create accept a new top-level
    progressSpec enforced-timer field ({ variant:"timer", targetSeconds,
    resumable? }), valid for any runMode (SPR-2971).
  action: none
  agent_guidance: >-
    To author an elapsed-time activity, set progressSpec:{ variant:"timer",
    targetSeconds } (e.g. a 15-minute workout is targetSeconds:900) — it renders
    a host countdown and blocks early completion for that duration. Prose like
    "15 minutes" in name/description/guidance is NOT enforced.
  details_diff: |
    ~ tool changed: program.create (inputSchema)
    ~ tool changed: task.create (inputSchema)
    ~ tool changed: task.update (inputSchema)

- version: 2026.07.24-4
  surface: tool
  change: >-
    canvas.prepare_upload's outputSchema root now carries type "object"
    alongside its anyOf branches. The MCP spec requires object-rooted output
    schemas and Claude clients reject the ENTIRE tools/list when any entry
    violates it, so the bare union root published since 2026.07.24-2 broke
    tool fetching for Claude Code / claude.ai.
  action: none
  agent_guidance: >-
    No call-shape change. The upload result envelope is unchanged; only the
    advertised outputSchema root gained the type keyword.
  details_diff: |
    ~ tool changed: canvas.prepare_upload (outputSchema root: + type "object")

- version: 2026.07.24-3
  surface: tool
  change: >-
    Every tools/list name is now published in wire form — dots replaced with
    underscores (canvas.prepare_upload → canvas_prepare_upload) — because
    Anthropic's remote-MCP client validates names against ^[a-zA-Z0-9_-]{1,64}$
    and rejects the entire tool list on one dotted entry. tools/call accepts
    BOTH spellings: the previous dotted names remain valid aliases forever.
  action: none
  agent_guidance: >-
    Call tools by the name tools/list advertises. If you hold a cached tool
    list or instructions with dotted names (task.create, skill.write), those
    spellings still dispatch identically — no migration required. New
    integrations should use the underscore names.
  details_diff: |
    ~ every tool renamed on the wire: dots → underscores (113 tools; scope map
      tool lists follow the same aliasing; no schema/description/annotation
      changes)

- version: 2026.07.24-2
  surface: tool
  change: >-
    canvas.prepare_upload now advertises ChatGPT file parameters plus its
    structured success branches, and accepts a generated HTML attachment for
    protected server-side ingestion into the existing family-scoped
    pending-canvas flow.
  action: none
  agent_guidance: >-
    In ChatGPT, pass the injected top-level file object by itself. When the
    response reports ingest.state as complete, do not upload again; pass the
    returned uploadId to canvas.create or canvas.update. Existing signed-upload
    and bundle callers may continue using contentType, byteSize, and assets.
  details_diff: |
    ~ tool changed: canvas.prepare_upload (_meta, description, inputSchema, outputSchema, openWorldHint)

- version: 2026.07.24-1
  surface: tool
  change: >-
    canvas.create and canvas.update dry runs no longer run the blocking
    content-moderation check; on a dry run performed while text moderation is
    armed, the anonymous previewUrl is withheld (previewUrlWithheldReason:
    'moderation-skipped') and the authenticated inline previewHtml remains the
    preview surface. Real commits are moderated exactly as before.
  action: none
  agent_guidance: >-
    Iterate with dryRun freely — drafts are not moderated and cost nothing.
    When a dry-run response carries previewUrlWithheldReason instead of
    previewUrl, use the inline previewHtml; the shareable preview link returns
    on the moderated commit. Expect moderation verdicts only at commit time.
  details_diff: |
    ~ tool changed: canvas.create (dryRun moderation behavior, previewUrl optional, previewUrlWithheldReason added)
    ~ tool changed: canvas.update (dryRun moderation behavior, previewUrl optional, previewUrlWithheldReason added)

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
