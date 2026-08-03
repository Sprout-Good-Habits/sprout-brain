# Agent contract changelog

Machine-readable, append-only log of agent-visible contract changes. Consumed by
agents (not humans) — served as the `sprout://changelog` MCP resource (newest
first). Canonical editing home is **sprout-brain** (`mcp/changelog.md`); this
file is the vendored copy the server bakes into its image and reads at boot.
Keep the two in sync when editing (no automation yet — SPR-3120).

Each entry is keyed to the `contractVersion` in `apps/server/mcp-contract.lock.json`
it ships with. Regenerate the lockfile with `npm run mcp:contract`, then add an
entry here whose `version:` equals the new lockfile `contractVersion`. Entry
format + worked examples: `projects/agent-contract/changelog-template.md`.

Rules the CI gate enforces:

- Every lockfile change (any delta) needs a matching entry here (STRICT).
- Entries are append-only — once merged, an entry must stay byte-identical.

Conventions for this file:

- Entries are stored **newest first** (prepend a new entry at the top of the
  list); the `sprout://changelog` resource serves them in that order.
- Name tools by their `tools/list` wire form (underscores, e.g. `mcp_whoami`);
  dotted spellings remain permanent dispatch aliases (see 2026.07.24-3).
  Pre-existing dotted mentions are append-only history.
- **Backfill** entries document already-shipped changes that predate the
  lockfile and were never coupled to a lockfile hash — the gate only couples
  the *new head* of each PR to an entry, so historical labels are free.
  Same-day backfills (2026.07.22-B1/-B2) carry a `-B<n>` suffix so they can
  never collide with a real lockfile head.

## Entries

- version: 2026.08.03-1
  surface: tool
  change: >-
    mcp_whoami accepts sinceVersion and changelogLimit and returns a contract
    block (contractVersion + capped changelog delta, default 3 entries); the
    sprout://changelog payload now carries contractVersion
  action: none
  agent_guidance: >-
    Pass the contractVersion you last saw as mcp_whoami sinceVersion to receive
    only the entries newer than it — empty means nothing changed, and reauth
    entries are always included. When truncated is true, older entries were
    omitted; you already have the newest plus every reauth entry, and you can
    pass changelogLimit (up to 20) to page deeper, or read sprout://changelog
    if your client supports MCP resources. Remember the returned
    contractVersion for your next session.
  details_diff: |
    ~ tool changed: mcp_whoami (description, inputSchema, outputSchema; output adds contract block)
    ~ resource changed: sprout://changelog (description; payload adds contractVersion)

- version: 2026.07.31-2
  surface: tool
  change: >-
    Every MCP tool now advertises its structured success outputSchema through
    tools/list, instead of only canvas.prepare_upload. All published schemas
    are object-rooted for strict MCP clients; all-object union roots retain
    their branches and gain type "object". Date values validated internally as
    Zod Date are advertised as the ISO date-time strings JSON puts on the wire.
    Tool execution and response payloads are unchanged.
  action: none
  agent_guidance: >-
    Use each tool's advertised outputSchema to plan from its structuredContent
    fields and status variants. Do not infer fields that the schema does not
    declare. This is a discovery-contract improvement only; call inputs,
    permissions, and runtime response payloads have not changed.
  details_diff: |
    ~ tools/list: outputSchema added to 114 tools (115/115 now advertised)
    ~ program.get / program.list: Date outputs advertised as ISO date-time strings
    = canvas.prepare_upload: existing object-root union remains advertised

- version: 2026.07.31-1
  surface: tool
  change: >-
    screentime.lock and screentime.unlock may now return an optional
    enforceabilityWarning: "no_enforceable_config". It means the server holds
    no screen-time configuration for that child — no block list assigned and
    no schedules — so nothing server-side can confirm the command has anything
    to act on. The command still ran and the lock state still changed; this is
    never a refusal. The field is omitted entirely when the child is
    configured, so existing integrations see an unchanged payload.
    screentime.create_schedule and screentime.update_schedule now refuse an
    appRestrictionId that does not exist or belongs to another family as
    BAD_INPUT, instead of failing opaquely or silently writing a schedule that
    points at a list the family cannot see.
  action: none
  agent_guidance: >-
    On enforceabilityWarning, tell the parent their screen-time setup is
    incomplete (assign a block list or add a schedule) — do NOT report the lock
    or unlock as failed, and do not retry it. The shield itself is chosen on
    the child's device and the server cannot see it, so a warned command may
    still be enforcing normally. For schedules, only pass appRestrictionId
    values returned by the caller's own family; a foreign or unknown id is
    refused identically.
  details_diff: |
    ~ tool changed: screentime.lock (outputSchema — optional enforceabilityWarning added; description)
    ~ tool changed: screentime.unlock (outputSchema — optional enforceabilityWarning added; description)

- version: 2026.07.30-1
  surface: tool
  change: >-
    Adds the parent golden-reference intake pair task.prepare_reference_upload
    and task.finalize_reference_upload — the prepare then PUT then finalize
    handshake that deposits a "done right" (golden) or "not like this" (negative)
    REFERENCE photo for a task your family owns, coming back as a durable,
    moderated, family-owned assetId the photo-proof judge resolves. prepare takes
    taskId, a per-photo operationKey (letters, digits, and . _ : - only),
    mimeType, and sizeBytes and returns the assetId plus a one-shot PUT transfer
    envelope; you upload the bytes, then finalize normalizes + moderates (adult
    strictness) and marks the asset ready. image/jpeg and image/png only. Behind
    the family canvas_uploads gate. No storage URLs or paths cross the surface
    beyond the transfer envelope.
  action: none
  agent_guidance: >-
    To supply reference photos for a golden_compare task, call
    task.prepare_reference_upload with a per-photo operationKey (never derived
    from taskId alone — two photos for one task need two keys), PUT the bytes to
    transfer.url, then task.finalize_reference_upload with the returned assetId.
    Transcode HEIC (the iOS library default) to JPEG or PNG client-side first —
    HEIC is refused as REFERENCE_UNSUPPORTED_MEDIA. A foreign-family or unknown
    task is REFERENCE_TASK_NOT_FOUND (indistinguishable); a moderation block is
    REFERENCE_MODERATION_BLOCKED (pick a different photo); finalizing an
    already-ready asset is an idempotent success. Then name the ready assetId in
    the task's golden_compare references via task.create / task.update.
  details_diff: |
    + tool added: task.prepare_reference_upload
    + tool added: task.finalize_reference_upload

- version: 2026.07.29-2
  surface: tool
  change: >-
    task.create and task.update accept a golden_compare (photo proof)
    verification config in canvasSpec.activityVerification, alongside the
    existing count-me (video) intent: closed profile golden_compare_v1,
    child-visible instruction, model-facing criteria, and 1-6 role-tagged
    reference assetIds (golden | negative). The server compiles and freezes
    the plan at authoring; capture mode, audio policy, and limits stay
    server-owned. Requires the family to be under the canvas_uploads gate and
    every reference assetId to resolve as a ready image asset in the authoring
    family — otherwise the create/update is refused as BAD_INPUT.
  action: none
  agent_guidance: >-
    To author a photo-proof canvas task, pass canvasSpec.activityVerification
    with activity golden_compare and reference assetIds owned by the family
    (upload rails produce them). Do not invent assetIds: a foreign-family or
    unknown assetId is refused identically (reference not found). An unknown
    profile is refused, never defaulted. Video (count-me) authoring is
    unchanged.
  details_diff: |
    ~ tool changed: task.create (inputSchema — canvasSpec.activityVerification widened to config union)
    ~ tool changed: task.update (inputSchema — canvasSpec.activityVerification widened to config union)

- version: 2026.07.29-1
  surface: tool
  change: >-
    board.post `payload` is now declared `type: "object"` in the advertised
    input schema instead of an untyped (empty) schema. All object payloads
    (including `{}` for a headline-only move) parse exactly as before. A bare
    string / number / array / null payload is now refused at input validation
    as INVALID_INPUT instead of reaching the broker (previously a null
    payload was accepted as the empty contribution — send `{}` for that —
    and, while the board-auditable-payload lever is off, other non-object
    payloads landed verbatim). The server instructions' "Error codes drive
    your retries" list now also defines INVALID_INPUT: the call didn't match
    the tool's tools/list schema — fix the arguments and retry.
  action: none
  agent_guidance: >-
    Always send board.post payload as a JSON object. For a headline-only
    move send `{}`. For auditable boards keep to
    `{ text?: string, assetId?: string }`. On INVALID_INPUT from any tool,
    fix the arguments to match the advertised schema and retry.
  details_diff: |
    ~ tool changed: board.post (input payload: {} -> type object; description)
    ~ instructions changed: + INVALID_INPUT in the error-code retry list

- version: 2026.07.27-2
  surface: tool
  change: >-
    mcp.whoami now returns family_consent_status — the same family-eligibility
    verdict that gates every non-exempt tool call (ok | not_onboarded |
    consent_incomplete | consent_version_stale | no_family | unknown). Family
    ineligibility refusals (MCP_FAMILY_NOT_ELIGIBLE) now distinguish
    consent_version_stale in details.reason and carry a reason-specific
    message.
  action: none
  agent_guidance: >-
    When a tool call fails with MCP_FAMILY_NOT_ELIGIBLE, call mcp.whoami
    (requires family:read) to diagnose. family_consent_status of consent_version_stale means Sprout's
    privacy policy / consent disclosure was updated and a parent must
    re-consent in the Sprout parent app or on the Sprout web app; relay that
    to the parent and retry after they re-consent — no data or setup is lost.
    Do not tell an established family to redo onboarding for this state.
  details_diff: |
    ~ tool changed: mcp.whoami (description; output adds family_consent_status)

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
