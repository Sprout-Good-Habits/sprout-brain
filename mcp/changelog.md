# Agent contract changelog

Machine-readable, append-only log of agent-visible contract changes. Consumed by
agents (not humans) — served as the `sprout://changelog` MCP resource (newest
first). This is the canonical editing home; `apps/server/mcp/changelog.md` in sprout-app
is the vendored copy the server bakes into its image and reads at boot.
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

- version: 2026.08.16-1
  surface: tool
  change: >-
    task_prepare_reference_upload's advertised input schema now matches its
    actual contract: the mode oneOf gained the localBytes branch (operationKey +
    localBytes, excluding file/mimeType/sizeBytes), and taskId is no longer
    advertised as required in the two server-ingest branches (file, localBytes)
    — it was always optional there since taskless authoring shipped. The
    signed-PUT branch still requires taskId. No runtime validation changed;
    calls the server accepted before are accepted unchanged.
  action: refetch_tools
  agent_guidance: >-
    If your cached schema rejected localBytes calls (no oneOf branch admitted
    them) or forced a taskId onto a taskless ingest prepare, refetch tools/list
    — the advertised oneOf now admits exactly what the server accepts. Authoring
    a new golden_compare task still works taskless: upload references first via
    file or localBytes with no taskId, then pass the returned assetIds to
    task_create.
  details_diff: |
    + task_prepare_reference_upload input oneOf branch: operationKey + localBytes (excludes file/mimeType/sizeBytes)
    ~ task_prepare_reference_upload input oneOf file branch: taskId removed from required (optional since SPR-4471)
    ~ task_prepare_reference_upload input oneOf signed-PUT branch: unchanged fields, now also excludes localBytes

- version: 2026.08.14-2
  surface: tool
  change: >-
    family_query_overview now labels every parents[] entry with a required
    `role`: owner, co_parent, villager, or concierge. A concierge entry is the
    Sprout Concierge, Sprout's own support account that a parent can seat in
    their family, and it is not one of the family's own grown-ups.
  action: refetch_tools
  agent_guidance: >-
    Read `role` on every parents[] entry. A concierge entry has the same reach
    as a parent in the family, so never assume it can only read. Two things not
    to do with it: do not address it as one of the family's grown-ups, greet
    it, or suggest the user talk to it; and never attribute a family member's
    actions, decisions, or preferences to it. When you tell the user how many
    grown-ups the family has, count only the entries whose role is owner,
    co_parent, or villager.
  details_diff: |
    + family_query_overview parents[].role (required): owner | co_parent | villager | concierge
    ~ family_query_overview description: role vocabulary + concierge reach and the two prohibitions

- version: 2026.08.14-1
  surface: tool
  change: >-
    Canvas review vocabulary moved to version 2: canvases may now declare a
    server-proxied web fetch (the WEB_FETCH disclosure, backing sprout.net.fetch
    against a platform allowlist that starts with Open Library), and the
    disclosure vocabulary a review summary can carry grew accordingly. A
    client-authored adoption approval must echo reviewVocabularyVersion 2 —
    echoing 1 is refused, because an approval must attest to the vocabulary the
    parent actually reviewed under. Stored evidence written under version 1
    stays complete and readable; nothing about durable receipts changes.
  action: update_calls
  agent_guidance: >-
    When you build a marketplace.adopt / marketplace.fork approval object, copy
    reviewVocabularyVersion from the review summary you just received rather
    than hardcoding it — the summary always carries the version the review was
    rendered under, and echoing that value is forward-compatible with future
    vocabulary bumps. If an adopt call starts refusing on the approval's
    reviewVocabularyVersion, re-run the review step and rebuild the approval
    from the fresh summary instead of patching the number.
  details_diff: |
    ~ schema changed: marketplace adopt/fork approval reviewVocabularyVersion (echo-pinned to 2)
    ~ schema changed: review summaries may include the WEB_FETCH disclosure
    + capability: sprout.net.fetch (consent-gated, allowlist-proxied; server-side)

- version: 2026.08.13-3
  surface: behavior
  change: >-
    screentime_unlock no longer mints an unlock that never ends, and now tells
    you when the one you minted ends. minutes stays OPTIONAL and nothing about a
    call that supplies it changes; a call that OMITS it now grants the rest of
    the child's local day instead of an open-ended unlock with no deadline at
    all. The response reports both what was minted (minutes) and the instant it
    ends (unlockUntil, ISO-8601), so an omitted duration comes back fully
    described rather than as nothing. The per-child minUnlockMinutes floor still
    applies to a duration you supply and does not apply to the computed one, so
    a call late at night is honoured rather than rounded up past midnight.
  action: update_calls
  agent_guidance: >-
    Read unlockUntil rather than adding minutes to your own clock. The two
    disagree in two ordinary cases: a grant issued while time is still running
    STACKS onto the remainder, and an omitted minutes is coerced to the end of
    the child's local day. Omitting minutes is safe and is the right call when
    you genuinely mean "the rest of today" — the server resolves it in the
    child's own timezone, which is more accurate than anything you can compute.
    Do not send a very large minutes to approximate an unbounded unlock: there
    is no unbounded unlock any more, and a large number will be honoured
    literally and keep the kid's device open past the day. unlockUntil is null
    when the command minted no window and absent on a refusal.
  details_diff: |
    ~ tool changed: screentime_unlock (minutes optional-with-end-of-day default)
    + screentime_unlock.result.unlockUntil (string | null, optional)

- version: 2026.08.13-2
  surface: tool
  change: >-
    task_prepare_reference_upload no longer requires taskId in the file and
    localBytes ingest modes, closing the circular dependency 2026.08.13-1
    shipped with: golden_compare authoring needed reference assetIds from an
    upload tool that itself demanded an already-existing task, so a family's
    FIRST photo-proof task could not be authored. A prepare without taskId
    mints an UNBOUND reference owned by your family; the task_create that
    lists its assetId adopts it. An unadopted reference expires roughly 24
    hours after upload. Signed-PUT mode (mimeType + sizeBytes) still requires
    taskId — its transfer route is task-scoped — and now refuses its absence
    with a taskId-pathed validation error. Also tightened at authoring, for
    golden_compare on task_create: references must be parent-uploaded assets
    (a kid's camera capture is refused as not found), the reference set must
    fit the runtime byte budget the kid's device can be served, and every
    selected child needs a compatible registered iOS host — the same check
    count_me always ran.
  action: update_calls
  agent_guidance: >-
    Authoring a NEW golden_compare task: call task_prepare_reference_upload
    WITHOUT taskId once per photo (file or localBytes mode), collect each
    returned assetId, then call task_create with those assetIds in
    canvasSpec.activityVerification.references — promptly, within the ~24h
    unadopted-reference window. Only pass taskId when depositing an additional
    reference for a task that already exists. If task_create refuses with a
    budget message, use fewer or recompressed reference photos; if it refuses
    naming a child's device, that child needs a current iOS Sprout app before
    the task can be assigned.
  details_diff: |
    ~ task_prepare_reference_upload.taskId: required -> optional (file/localBytes modes)
    + unbound references: family-owned, adopted by task_create, ~24h bind-or-expire
    ~ task_create golden_compare preflight: + reference provenance (upload-lane only)
    ~ task_create golden_compare preflight: + aggregate reference byte budget
    ~ task_create golden_compare preflight: + per-child device compatibility

- version: 2026.08.13-1
  surface: tool
  change: >-
    task_create accepts canvasSpec.activityVerification again, for both
    evaluator families. The 2026-08-05 canonical cutover hid the field and the
    2026-08-07 task_update cutover refused it, leaving camera-counted and
    photo-proof tasks unauthorable while their runtimes kept executing. The
    count_me config is now spelled like golden_compare: activity names the
    evaluator family and profile names the closed registry member, so the
    legacy activity:"piano_passage_repetition" | "hand_clap_repetition"
    spelling is no longer accepted for new tasks. Stored tasks in the legacy
    shape keep working and are still returned verbatim by task_describe and
    task_list. task_update refuses the field as CREATE_ONLY_FIELD, and Program
    templates continue to refuse it entirely.
  action: update_calls
  agent_guidance: >-
    To author a count_me task send canvasSpec.activityVerification with
    version:"activity_verification_intent_v1", activity:"count_me",
    profile:"piano_passage_repetition_v1" or "hand_clap_repetition_v1",
    instruction, and target. For golden_compare send activity:"golden_compare",
    profile:"golden_compare_v1", instruction, criteria, and references, where
    every references[].assetId comes from task_prepare_reference_upload
    followed by task_finalize_reference_upload — never a URL or storage path.
    Do not send captureMode, audio, unit, checkMode, timed, or any other field
    the profile derives; the server owns them and rejects them as UNKNOWN_FIELD.
    An unknown profile is refused, never defaulted. golden_compare references
    must be distinct and include at least one role:"golden" — both are checked
    at preview, so those shape errors surface on dryRun instead of only at
    commit. Preview also runs the family-gate, Canvas-capability, device and
    reference-asset preflight, but commit re-runs it: those depend on mutable
    state, so a successful preview is not a guarantee that a later commit
    lands. On a commit-time refusal, refresh state and preview again rather
    than retrying the same payload. To change verification on an existing task,
    create a new task — task_update returns CREATE_ONLY_FIELD with a
    remove-create-only-field recovery step.
  details_diff: |
    + task_create.canvasSpec.activityVerification (count_me | golden_compare)
    + task_describe/task_list canvasSpec.activityVerification (read, legacy-tolerant)
    ~ count_me config: activity is now "count_me"; profile carries the registry member
    ~ task_update canvasSpec.activityVerification: UNSUPPORTED_FIELD -> CREATE_ONLY_FIELD

- version: 2026.08.12-12
  surface: tool
  change: >-
    Marketplace Canvas approval reviews and confirmations now include the
    immutable listingId as well as listingVersionId and the reviewed hashes.
    This keeps a parent-approved operation bound to the same listing even when
    a public slug is renamed, reused, or delisted before recovery.
  action: update_calls
  agent_guidance: >-
    When marketplace_adopt or marketplace_fork returns APPROVAL_REQUIRED, copy
    review.listingId unchanged into approval.listingId alongside the existing
    review-bound fields. Never infer listingId from a later slug lookup.
  details_diff: |
    + APPROVAL_REQUIRED.review.listingId
    + approval.listingId (required)

- version: 2026.08.12-11
  surface: tool
  change: >-
    Canvas approval readiness now explains the non-actionable support flow in
    its live tool description, not only in this changelog.
  action: update_calls
  agent_guidance: >-
    For every nonActionableIssues item, preserve and present its opaque
    supportReference to the parent or support workflow. Never decode it or
    substitute a repairKey, and stop automated repair for that item.
  details_diff: |
    ~ marketplace_canvas_approval_readiness description: preserve supportReference and stop automated repair

- version: 2026.08.12-10
  surface: tool
  change: >-
    Canvas approval readiness now gives every non-actionable install issue an
    opaque, family-bound supportReference. The reference identifies the exact
    damaged copy without exposing its install or listing id.
  action: update_calls
  agent_guidance: >-
    Preserve supportReference when presenting a nonActionableIssue to a parent
    or support workflow. Do not decode it or substitute a repairKey; the issue
    is intentionally outside automated approval repair.
  details_diff: |
    + marketplace_canvas_approval_readiness nonActionableIssues[].supportReference

- version: 2026.08.12-9
  surface: tool
  change: >-
    Canvas approval readiness now routes AUTHORING_EDITOR repair targets to
    marketplace_review_canvas_authoring. Only nonActionableIssues require the
    agent to stop and ask the parent to repair or remove content in Sprout.
  action: update_calls
  agent_guidance: >-
    Send MARKETPLACE_INSTALL_REVIEW targets to
    marketplace_review_canvas_install and AUTHORING_EDITOR targets to
    marketplace_review_canvas_authoring, preserving each target's cursor. Stop
    and escalate through the parent UI only for nonActionableIssues.
  details_diff: |
    ~ marketplace_canvas_approval_readiness description: AUTHORING_EDITOR routes to marketplace_review_canvas_authoring
    ~ stop/escalation guidance now applies only to nonActionableIssues

- version: 2026.08.12-8
  surface: tool
  change: >-
    Canvas marketplace adoption, fork, and installed-package repair now use
    one exact content-free approval object: listingVersionId, packageHash,
    profileHash, and reviewVocabularyVersion. Readiness also isolates stale or
    incomplete install provenance as a non-actionable issue instead of
    aborting the family's bounded page.
  action: update_calls
  agent_guidance: >-
    Preflight without approval and show the returned review to an active
    parent. After explicit approval, resend the exact returned binding. Keep
    one Idempotency-Key through adopt or fork preflight, confirmation, and
    unchanged replay; a stale no-write confirmation releases that key so you
    can preflight again. For marketplace_review_canvas_install, use the target
    and cursor from readiness, then confirm with the exact approval object.
    AUTHORING_EDITOR and nonActionableIssues are handled in Sprout's parent UI.
  details_diff: |
    ~ marketplace_adopt approval and APPROVAL_REQUIRED output are exact-review bound
    ~ marketplace_fork approval and APPROVAL_REQUIRED output are exact-review bound
    ~ marketplace_review_canvas_install approval is now the exact object, not a string
    + readiness reason: MARKETPLACE_INSTALL_BINDING_STALE
    ~ stale no-write adopt/fork confirmations release their idempotency reservation

- version: 2026.08.12-7
  surface: tool
  feature_key: canvas_execution_approval_v1
  change: >-
    Canvas create and update commit responses may omit previewUrl when the
    persisted execution identity is not exactly approved for the family.
  action: update_calls
  agent_guidance: >-
    Treat a missing commit previewUrl as review-required, not as a failed save.
    Use the parent Canvas approval surface before requesting runnable content.
  details_diff: |
    ~ tool changed: canvas_create (outputSchema)
    ~ tool changed: canvas_update (outputSchema)

- version: 2026.08.12-6
  surface: tool
  change: >-
    marketplace_review_canvas_authoring now reviews and repairs one opaque
    AUTHORING_EDITOR target. Its confirmation is bound to the exact current
    artifact version, execution fingerprint, review profile, and repair key.
  action: update_calls
  agent_guidance: >-
    Discover the target with marketplace_canvas_approval_readiness. Call
    marketplace_review_canvas_authoring without approval, show the returned
    review to the parent, then resend the returned approvalBinding unchanged
    with the same Idempotency-Key. Navigate to editorPath only after REPAIRED.
    If confirmation is stale, preflight again and ask the parent to review the
    new warning. Do not approve automatically.
  details_diff: |
    + tool added: marketplace_review_canvas_authoring
    + output field added: editorPath (internal /create route or /library)
    ~ AUTHORING_EDITOR targets now have a dedicated approval repair tool

- version: 2026.08.12-5
  surface: tool
  change: >-
    marketplace_canvas_approval_readiness now isolates a damaged or missing
    immutable marketplace binding as the non-actionable reason
    MARKETPLACE_INSTALL_BINDING_STALE instead of aborting the whole readiness
    page.
  action: update_calls
  agent_guidance: >-
    Keep paginating and present any later actionable review targets. A
    MARKETPLACE_INSTALL_BINDING_STALE issue has no repair key because its
    published-to-private provenance cannot be proven safely; direct the parent
    to remove and reinstall that marketplace item rather than inventing an
    approval binding.
  details_diff: |
    ~ tool changed: marketplace_canvas_approval_readiness (nonActionableIssues reason enum)

- version: 2026.08.12-4
  surface: tool
  change: >-
    marketplace_adopt and marketplace_fork now release a no-write stale Canvas
    confirmation so the same Idempotency-Key can restart preflight. An exact
    parent confirmation remains valid if family enrollment changes after
    preflight and still writes the required approval receipts.
  action: update_calls
  agent_guidance: >-
    If Canvas confirmation returns MARKETPLACE_VERSION_STALE, remove the old
    approval and rerun preflight with the same Idempotency-Key. Present the new
    review before confirming again. Do not switch keys unless the parent intends
    a separate adoption or remix.
  details_diff: |
    ~ tool changed: marketplace_adopt (description, stale-result idempotency release)
    ~ tool changed: marketplace_fork (description, stale-result idempotency release)

- version: 2026.08.12-3
  surface: tool
  change: >-
    marketplace_adopt now treats Canvas approval preflight and confirmation as
    one idempotent operation: its no-write APPROVAL_REQUIRED result releases
    the reservation so confirmation can reuse the same Idempotency-Key.
  action: update_calls
  agent_guidance: >-
    For Canvas adoption, keep one Idempotency-Key from the first call through
    explicit parent confirmation. On APPROVAL_REQUIRED, add the exact returned
    approval binding and resend with that same key. After commit, replay only
    the confirmed input unchanged with the same key.
  details_diff: |
    ~ tool changed: marketplace_adopt (description, idempotency transition)

- version: 2026.08.12-2
  surface: tool
  change: >-
    Canvas marketplace adoption and fork confirmation now bind the parent's
    approval to the exact review profileHash as well as the listing version and
    packageHash. Re-adopting an unchanged installed package with damaged
    approval evidence now repairs that same install after confirmation.
  action: update_calls
  agent_guidance: >-
    On APPROVAL_REQUIRED, show the returned review and resend listingVersionId,
    packageHash, and profileHash unchanged with approval.status APPROVED. Reuse
    the same Idempotency-Key. Installed-package repair still confirms the opaque
    repair target with approval APPROVED after showing its returned profileHash.
  details_diff: |
    ~ marketplace_adopt approval input: profileHash is required
    ~ marketplace_fork approval input: profileHash is required
    ~ marketplace_review_canvas_install description: identifies profileHash

- version: 2026.08.12-1
  surface: tool
  change: >-
    marketplace_adopt and marketplace_review_canvas_install now release a keyed
    APPROVAL_REQUIRED preflight so the parent-confirmed call can reuse the same
    Idempotency-Key. A completed adoption or repair remains cached for exact
    replay of the confirmed input.
  action: update_calls
  agent_guidance: >-
    For a Canvas adoption or installed-package repair, first call without the
    approval field. On APPROVAL_REQUIRED, add the returned approval binding and
    resend with the same Idempotency-Key. After the write commits, recover the
    result by replaying that confirmed input unchanged.
  details_diff: |
    ~ tool changed: marketplace_adopt (description, idempotency behavior)
    ~ tool changed: marketplace_review_canvas_install (description, idempotency behavior)

- version: 2026.08.11-5
  surface: tool
  change: >-
    Every entry in family_query_overview's parents list now carries a required
    memberType field. The value is one of owner, co_parent, or villager. The
    list has always included every adult on the family, not only the parents;
    the field says which is which, so a trusted helper is no longer
    indistinguishable from a parent.
  action: none
  agent_guidance: >-
    No call changes are required. When you name or address the adults on a
    family, read memberType rather than assuming every entry is a parent. The
    list is the family's own grown-ups only.
  details_diff: |
    + family_query_overview output: parents[].memberType (required; enum owner,
      co_parent, villager, sprout_team)
    ~ family_query_overview description: documents the parents[].memberType
      vocabulary

- version: 2026.08.11-4
  surface: tool
  change: >-
    marketplace_canvas_approval_readiness now separates work by the action that
    can actually resolve it. Publication-identical installs remain marketplace
    review targets. Parent-edited linked Canvases appear as AUTHORING_EDITOR
    targets. Incomplete install closures appear in nonActionableIssues without
    a repair key because approval cannot restore a missing copy.
  action: update_calls
  agent_guidance: >-
    Send only MARKETPLACE_INSTALL_REVIEW targets to
    marketplace_review_canvas_install. Open AUTHORING_EDITOR targets in the
    normal Canvas editor so the parent can approve the current bytes. For
    MARKETPLACE_INSTALL_CLOSURE_INCOMPLETE, explain that the install must be
    reinstalled or removed; do not invent a repair call.
  details_diff: |
    ~ tool changed: marketplace_canvas_approval_readiness (outputSchema)
    + output field added: nonActionableIssues
    + non-actionable reason added: MARKETPLACE_INSTALL_CLOSURE_INCOMPLETE

- version: 2026.08.11-3
  surface: tool
  change: >-
    marketplace_adopt and marketplace_fork can now return APPROVAL_REQUIRED
    before copying a Canvas package. The review envelope contains the exact
    listing version, package hash, and bounded capability profile a parent must
    accept; confirmation reuses those server-issued values. Two new parent-only
    tools expose pre-enrollment repair work: marketplace_canvas_approval_readiness
    lists bounded opaque repair targets, and marketplace_review_canvas_install
    reviews or repairs one unchanged installed marketplace package.
  action: update_calls
  agent_guidance: >-
    Treat APPROVAL_REQUIRED as an intermediate outcome, show its review profile
    to the parent, and call marketplace_adopt or marketplace_fork again with the
    returned listingVersionId, packageHash, and profileHash only after explicit approval. For
    an existing install, discover opaque targets with
    marketplace_canvas_approval_readiness, then preflight and confirm each
    marketplace target with marketplace_review_canvas_install. Never invent or
    retain private Canvas bytes from these content-free envelopes.
  details_diff: |
    ~ tool changed: marketplace_adopt (inputSchema, outputSchema)
    + output variant added: marketplace_adopt APPROVAL_REQUIRED
    ~ tool changed: marketplace_fork (inputSchema, outputSchema)
    + output variant added: marketplace_fork APPROVAL_REQUIRED
    + tool added: marketplace_canvas_approval_readiness
    + tool added: marketplace_review_canvas_install

- version: 2026.08.11-2
  surface: tool
  change: >-
    Canvas create and update dry runs now return a deterministic execution
    fingerprint, normalized review summary and profile, predicted approval
    disposition, and the restricted authoring preview host mode. These fields
    describe the exact executable closure that the server reconstructed; they
    do not grant approval or authorize a later commit.
  action: none
  agent_guidance: >-
    Use the new fields to explain whether a proposed Canvas is unchanged,
    covered by current authority, eligible for legacy continuity, or expected
    to require approval. Always commit with the intended source bytes; never
    treat dry-run evidence as an approval receipt because the server recomputes
    it at commit time.
  details_diff: |
    + canvas_create dry-run fields: executionFingerprint, reviewSummary, reviewProfile, approvalDisposition, previewHostMode
    + canvas_update dry-run fields: executionFingerprint, reviewSummary, reviewProfile, approvalDisposition, previewHostMode

- version: 2026.08.11-1
  surface: tool
  change: >-
    The memberType enum in family_list and family_select_context gained an
    additive value, sprout_team. It marks a Sprout staff membership seat on a
    family. Zero such memberships exist today and nothing can create one yet, so
    no response can carry the value until a family separately opts in to Sprout
    team access.
  action: none
  agent_guidance: >-
    No call changes are required. Keep treating memberType as an open-ended
    label and do not branch on sprout_team; if you ever receive it, the
    membership belongs to Sprout staff, not to a member of the family.
  details_diff: |
    + memberType enum value added: sprout_team (family_list, family_select_context)

- version: 2026.08.10-3
  surface: tool
  change: >-
    task_list's canonical (non-Program) list-item shape now accepts an
    optional submissions array of pending-review canvas proof submissions,
    matching what task_describe already returns for a single task.
  action: none
  agent_guidance: >-
    A task_list row may now carry submissions — check it the same way you
    already check task_describe's submissions when deciding whether a task
    has proof awaiting parent review; absence still means no pending
    submissions, not that the field was never populated.
  details_diff: |
    ~ tool changed: task_list (outputSchema)

- version: 2026.08.10-2
  surface: behavior
  change: >-
    task_list, task_describe, and task_update read-backs are now permissive on
    the stored emoji field: legacy rows whose emoji is a word (e.g. "star"),
    blank, or a denylisted glyph serialize verbatim instead of failing the
    whole call with INTERNAL_ERROR. task_list additionally degrades per row —
    a stored row that cannot be projected at all is omitted from the page
    (and logged server-side) instead of failing the entire list. Input
    validation is unchanged: task_create and task_update still reject
    non-glyph emoji values.
  action: none
  agent_guidance: >-
    Treat emoji on read as a display hint, not a validated glyph — render it
    only if it is a real emoji. Never copy a word emoji you read back into a
    new write; task_create and task_update refuse non-glyph values.

- version: 2026.08.10-1
  surface: tool
  change: >-
    canvas_create and canvas_update can now return a
    parent-approved-canvas warning when an authenticated family owner or
    co-parent commits a private Canvas that uses both microphone input and
    spoken audio. The approval applies only inside that family; sharing and
    marketplace publication still require separate review.
  action: none
  agent_guidance: >-
    No call changes are required. Treat parent-approved-canvas as confirmation
    that the private family Canvas was approved for microphone input and spoken
    audio. Do not describe it as approved for sharing or marketplace
    publication.
  details_diff: |
    + hint kind added: parent-approved-canvas

- version: 2026.08.09-1
  surface: tool
  change: >-
    screentime_get_settings and screentime_update_settings no longer carry the
    structured dayTime policy ({ enabled, startMinutes, endMinutes }). The field
    is removed from both envelopes and from the tool descriptions. It described
    a window nothing ever enforced: no code compared the current time against
    it, so an agent could read the policy, reason about it and write it back
    with zero effect on what any device blocked, while the tool description
    promised a structured day-time policy.
  action: update_calls
  agent_guidance: >-
    Stop sending dayTime in screentime_update_settings — it is now rejected as
    an unknown field. Stop reading dayTime from screentime_get_settings. To make
    screens unavailable during a window, call screentime_create_schedule
    instead; named schedules are the surface that actually reaches devices.
- version: 2026.08.08-5
  surface: tool
  change: >-
    tools/list now represents reused schema components with standard local
    JSON Schema references instead of repeating the same component inline.
    The accepted inputs and validated outputs are unchanged; the full catalog
    is smaller and remains below the 750 KB discovery limit.
  action: none
  agent_guidance: >-
    No call changes are required. Clients should resolve local $ref entries in
    inputSchema and outputSchema using the accompanying $defs in that tool's
    schema document. Apps SDK file parameters remain expanded at their declared
    property so clients can inspect required attachment metadata directly.
  details_diff: |
    ~ tool schemas changed: repeated components use local $ref / $defs encoding

- version: 2026.08.08-3
  surface: tool
  change: >-
    The Program tool family now uses one canonical definition and Task language
    across create, read, update, assignment, and lifecycle operations. New
    program_archive and program_updateAssignment verbs replace overloaded
    delete/update behavior. program_delete is no longer advertised. The other
    eight Program schemas changed together, including Task policy, Canvas setup,
    reviewed specHash/baseHash commits, TaskSimple assignment reads, and bounded
    list cursors.
  action: update_calls
  agent_guidance: >-
    Refresh tools before the next Program call. Do not reuse mode, type, node,
    tether, per-entity patch, or delete payloads. Build program_create from one
    definition; use program_update with programId, mergeFrom, and baseHash;
    program_assign with programId/childId; program_updateAssignment to pause or
    resume; program_unassign to abandon; and program_archive for terminal
    template lifecycle. A cached retired payload returns
    PROGRAM_CONTRACT_CHANGED with writeDisposition:none and writes nothing.
  details_diff: |
    + tool added: program_archive
    + tool added: program_updateAssignment
    - tool removed: program_delete
    ~ tool changed: program_create (description, inputSchema, outputSchema)
    ~ tool changed: program_get (description, inputSchema, outputSchema)
    ~ tool changed: program_list (description, inputSchema, outputSchema)
    ~ tool changed: program_update (description, inputSchema, outputSchema)
    ~ tool changed: program_assign (description, inputSchema, outputSchema)
    ~ tool changed: program_getAssignment (description, inputSchema, outputSchema)
    ~ tool changed: program_listAssignments (description, inputSchema, outputSchema)
    ~ tool changed: program_unassign (description, inputSchema, outputSchema)

- version: 2026.08.07-11
  surface: tool
  change: >-
    task_prepare_reference_upload now supports local byte uploads directly on
    the same call path as file-ingest. MCP agents can pass Base64 bytes via
    `localBytes` — optional and mutually exclusive with `file` and signed-PUT
    mode — validated with strict base64 round-trip checks that deterministically
    reject malformed input and still enforce the runtime image byte cap. A
    successful call returns an immediate `mode: "ingest", ingest.state:
    "complete"` result. Existing file-ingest and signed-PUT modes are unchanged.
  action: none
  agent_guidance: >-
    MCP callers may choose one upload mode per request: signed-PUT (`mimeType` +
    `sizeBytes`), remote file ingest (`file`), or local-bytes ingest
    (`localBytes`) when the agent already holds the bytes. `localBytes` is
    optional in the schema and validated with strict base64 round-trip checks,
    so oversized or malformed payloads fail at the boundary as BAD_INPUT. On
    success, no PUT follows — `task_prepare_reference_upload` returns an
    ingest-complete result directly.
  details_diff: |
    ~ tool changed: task_prepare_reference_upload (description, inputSchema)

- version: 2026.08.07-10
  surface: behavior
  change: >-
    Program-materialized Tasks now apply rewarded-completion targets and retry
    caps using the cadence in scheduleSpec. Recurring Program Tasks reset those
    limits each local calendar day; one-time Program Tasks keep one lifetime
    occurrence. Program create/update now reject recurring scheduleSpec without
    at least one weekday and reject days on one-time intent.
  action: update_calls
  agent_guidance: >-
    Treat scheduleSpec as the cadence source for Program Tasks. A Program Task
    with scheduleSpec.taskType "schedule" and at least one weekday in days can
    be completed again on another local calendar day without being recreated.
    days/startMinutes/durationMinutes are scheduling hints, not completion
    gates; recurring limits reset even on weekdays omitted from days.
    A Program Task with scheduleSpec.taskType "onetime" must omit days and
    remains lifetime-scoped. Omit scheduleSpec entirely for an anytime Task.
    Use policy.freePlay for additional unpaid replay after the rewarded target.
  details_diff: |
    ~ task completion behavior changed for recurring Program materializations
    ~ program.create/program.update schedule intent now enforces taskType↔days
    ~ tool schemas changed: program_create, program_get, program_getAssignment, program_list,
      task_describe, task_list, task_update (shared cadence descriptions)

- version: 2026.08.07-9
  surface: tool
  change: >-
    task_update now publishes a compact, non-duplicative result schema during
    tools/list discovery while retaining the canonical reward-policy and free-play
    fields. The Task authoring guide now points reviewed callers at the returned
    nextSteps[0].input tool-call payload.
  action: none
  agent_guidance: >-
    Keep handling refused, ready, review_required, no_change, and updated
    outcomes exactly as before. Execute reviewed and stale-preview recovery calls
    using nextSteps[0].tool with nextSteps[0].input. Inspect candidate, readback,
    warnings, effects, issues, and currentPreview when those fields are present.
  details_diff: |
    ~ tool changed: task_update (compact discovery-only output projection; runtime contract unchanged)
    ~ resource changed: task authoring guide (reviewed-call field name corrected)

- version: 2026.08.07-8
  surface: tool
  change: >-
    task_update refusals now return one executable aggregate repair for a
    compound retired-shape request. The authoring guide includes the complete
    direct-edit, reviewed stale-preview, and compound-repair traces.
  action: update_calls
  agent_guidance: >-
    Apply every listed repair through the single aggregate next call. Remove
    immutable fields instead of moving them under mergeFrom. When an acknowledged
    preview is stale, review the replacement preview and use its corrected call
    with a new Idempotency-Key.
  details_diff: |
    ~ tool changed: task_update (aggregate executable repair guidance)
    ~ resource changed: task authoring guide (review, stale-preview, and compound-invalid traces)

- version: 2026.08.07-7
  surface: tool
  change: >-
    task_update now uses one strict create-derived merge contract and one
    transactional writer. It accepts taskId plus mergeFrom and optional dry-run,
    preview-hash, and warning-acknowledgement controls. It no longer accepts the
    retired top-level patch fields or changes Task identity, assignment, run mode,
    task type, Canvas identity, activity verification, or progress settings.
  action: update_calls
  agent_guidance: >-
    Put authored changes under mergeFrom using the task_create field names. Call
    safe edits directly. Use dryRun when you want a preview or expect reward-policy
    review, then follow nextSteps[0] exactly. Already-minted rewards stay frozen.
    If a preview is stale, use the returned replacement call with a new
    Idempotency-Key. Use task_pause or task_resume for lifecycle changes.
  details_diff: |
    ~ tool changed: task_update (strict {taskId,mergeFrom,dryRun?,specHash?,acknowledgedWarnings?} input)
    ~ tool changed: task_update (transactional result outcomes, warnings, effects, and committed readback)
    ~ resource changed: task authoring guide (create-derived update merge, review, stale-preview, and immutable identity guidance)
    ~ resource changed: server instructions (task_update mergeFrom and identity boundary)

- version: 2026.08.07-6
  surface: tool
  change: >-
    Authenticated ChatGPT catalogs no longer advertise the compatibility-only
    family_select_context tool. General OAuth clients retain that door, and
    direct calls still run the existing scope and family checks. The retired
    project_get and project_list tools are no longer registered or taught in
    server instructions; internal Canvas project persistence is unchanged.
  action: update_calls
  agent_guidance: >-
    In ChatGPT, use the family already bound to the connection and begin with
    family_query_overview. If the connection is linked to multiple families,
    finish family selection outside the MCP call before retrying; do not invent
    or call family_select_context. General MCP clients may keep using the
    compatibility selector while it remains listed. Use Canvas, Skill, and Task
    authoring instead of project_get or project_list.
  details_diff: |
    - tools removed: project_get, project_list
    ~ tool availability changed: family_select_context (general clients only)
    ~ server instructions changed: Project browsing and internal routing claims removed

- version: 2026.08.07-5
  surface: behavior
  change: >-
    Canvas grading is now documented and reported wherever it is decided. The
    Task authoring guide describes the pass / finish / attempt rule, its
    passThreshold, and what the server picks when you omit the rule.
    program_create persists an authored canvas grading rule and now returns a
    grading-defaulted-from-canvas hint when the server picks the rule for you;
    task_create returns no hints and instead echoes the applied rule in
    canvasSpec.grading. Adopting a marketplace listing now derives a canvas's
    completion capability from the adopted content instead of the publisher's
    declared value, so the grading default matches what the canvas really emits.
  action: none
  agent_guidance: >-
    Read sprout://task/authoring-guide before setting canvasSpec.grading, and set
    it deliberately whenever the Task pays gems: attempt is satisfied by opening
    the Canvas, finish needs a terminal signal, pass needs a score at
    passThreshold. When you omit it, read back the rule that was applied rather
    than assuming the one you sent. task_create does NOT return hints — its
    response echoes the applied rule in canvasSpec.grading, and that echo is the
    answer. program_create does return a grading-defaulted-from-canvas hint, one
    per plan task that defaulted, with the task's clientId in details. Never tell
    a Canvas to call sprout.complete() from an error handler — a Canvas that
    failed to load has not been played, and completing pays for nothing.
  details_diff: |
    ~ tool changed: program_create (adds optional hints)
    ~ resource changed: sprout://task/authoring-guide (canvas grading section)
    ~ resource changed: sprout://canvas/sdk (error-handling guidance)

- version: 2026.08.07-4
  surface: resource
  change: >-
    The server instruction summary for off-server loops and runner truth is now
    shorter while preserving the lifecycle and lease contract introduced in
    2026.08.07-2 and 2026.08.07-3. The contract lock was regenerated after the
    canonical Program assignment work landed on main; no tool input, output,
    annotation, or availability changed in this entry.
  action: none
  agent_guidance: >-
    Keep the same call sequence: register on wake, use loop_listDue as the
    authenticated check-in, claim before execution, and treat loop_resume as a
    lifecycle change rather than an immediate run.
  details_diff: |
    ~ resource changed: server instructions (compact runner/loop summary; behavior unchanged)

- version: 2026.08.07-3
  surface: tool
  change: >-
    skill_invoke now truthfully advertises its lease-backed runner-presence update
    as a non-destructive operational write. A loop render issues execution guidance
    only when the current lease holder is active and belongs to both the selected
    family and caller grant. loop_checkIn now family-scopes lease renewals and
    commits a successful renewal with its presence update atomically.
  action: update_calls
  agent_guidance: >-
    Do not call skill_invoke speculatively as a read-only probe. For claimed loop
    work, pass the exact current leaseId; a valid proof refreshes that runner's
    last-known activity. If the lease holder is paused, foreign-family, expired,
    or otherwise unauthorized, the recipe may still render but its instructions
    remain claim-first/read-only. Treat a loop_checkIn renewal refusal as proof
    that no requested lease was extended.
  details_diff: |
    ~ tool changed: skill_invoke (non-destructive operational write; grant + family + lifecycle execution authority)
    ~ tool changed: loop_checkIn (family-scoped renewal and atomic presence commit)

- version: 2026.08.07-2
  surface: tool
  change: >-
    Runner and loop tools now describe and enforce the same lifecycle contract.
    Runner ids are grant-bound receipts within one family, presence is explicitly
    last-known activity, loop_listDue is an operational check-in, and authenticated
    loop actions refresh presence. loop_promoteFeedback is no longer advertised to
    ChatGPT. loop_resume only changes lifecycle state; it does not execute a run.
  action: update_calls
  agent_guidance: >-
    Re-register the same family-specific runner handle on every wake, then call
    loop_listDue and loop_claim. Treat lastKnownPresence as a recovery hint, not
    proof that a process is reachable. Render claimed work with skill_invoke using
    both loopId and the current leaseId, and close it with loop_submitResult.
    Schedule an immediate retry separately after loop_resume when needed.
  details_diff: |
    ~ tools changed: runner_register, runner_list, runner_status (grant/family receipt and last-known presence semantics)
    ~ tools changed: loop_listDue, loop_claim, loop_checkIn, loop_bind, loop_submitResult (authenticated actions refresh presence)
    ~ tool changed: skill_invoke (current lease-backed loop render refreshes presence)
    ~ tool changed: loop_resume (clarifies lifecycle-only behavior)
    ~ tool availability changed: loop_promoteFeedback (general clients only)

- version: 2026.08.07-1
  surface: tool
  change: >-
    marketplace_submit is now the final-submit step for an already-authored
    Marketplace draft. It accepts only draftId and specHash, rechecks the stored
    draft and preview bytes, and reports whether the listing published, entered
    review, stayed blocked or stale, was rejected, or failed retryably.
  action: update_calls
  agent_guidance: >-
    Finish authoring with marketplace_get_draft and marketplace_update_draft.
    When the draft is ready, call marketplace_submit with that draftId and its
    latest specHash plus one stable Idempotency-Key. Reuse the same key only for
    an exact retry. Treat submitted_for_review as pending review, not publication;
    follow every returned issue and read the draft again before a new submit.
  details_diff: |
    + tool advertised: marketplace_submit
    ~ tool changed: marketplace_submit (canonical final submit replaces hidden draft/update alias)

- version: 2026.08.06-12
  surface: tool
  change: >-
    Marketplace preview authoring now works directly with ChatGPT image
    attachments. Preview writes are revision-bound, return the complete refreshed
    draft, and have a separate collection verb for exact reorder and remove
    operations. HTTP-capable clients can keep using the signed-upload mode.
  action: update_calls
  agent_guidance: >-
    Read marketplace_get_draft first and pass its revision as expectedRevision.
    In ChatGPT, call marketplace_prepare_preview_upload with the top-level file;
    do not fetch its download URL or PUT to Supabase. Use
    marketplace_update_preview_assets to reorder every current preview id exactly
    once or remove one preview. On a stale result, use the returned draft and
    reapply the intended change.
  details_diff: |
    ~ tool changed: marketplace_prepare_preview_upload (direct file mode, revision guard, refreshed draft)
    + tool added: marketplace_update_preview_assets

- version: 2026.08.06-11
  surface: tool
  change: >-
    Gem transactions can now carry a refund for a screen-time unlock the child's
    device never applied. A refunded unlock appears as an additive entry keyed to
    the original debit, so a balance that goes back up is legible rather than
    unexplained. Existing transaction shapes are unchanged; only the set of
    possible entries widens.
  action: none
  agent_guidance: >-
    When reporting a child's gem history, a positive screen-time entry is a
    refund, not a spend: the command it paid for never reached the device. Do not
    describe it as earning. It is bounded by the original debit and written at
    most once per command, so it will never appear twice for the same unlock.

- version: 2026.08.06-10
  surface: tool
  change: >-
    Marketplace draft authoring now has separate create, get, and update tools.
    The update tool uses create-derived mergeFrom fields, supports dry-run, and
    binds a commit to the returned specHash and revision. Draft reads return
    complete resumable state without exposing package or Canvas content. The
    former marketplace_submit action envelope remains callable for one contract
    version but is no longer advertised in tools/list.
  action: update_calls
  agent_guidance: >-
    Start with marketplace_create_draft, then use marketplace_get_draft whenever
    you need current server state. Dry-run marketplace_update_draft with the
    desired mergeFrom, repair every validation issue, and commit the same edit
    with the returned specHash and expectedRevision. Use different
    Idempotency-Keys for preview and commit because their payloads differ. An
    incomplete draft may be saved; draft.submissionEligible says whether it is
    ready for the later final-submit step. Do not start new work with the hidden
    marketplace_submit compatibility alias.
  details_diff: |
    + tool added: marketplace_create_draft
    + tool added: marketplace_get_draft
    + tool added: marketplace_update_draft
    - tool hidden from discovery: marketplace_submit (one-version compatibility only)
    ~ tool changed: marketplace_submit_preview (guidance points to explicit draft doors)
    ~ tool changed: marketplace_prepare_preview_upload (guidance points to create/get/update)
    ~ tool changed: marketplace_submission_status (lifecycle reader separated from draft authoring)

- version: 2026.08.06-9
  surface: tool
  change: >-
    The complete diagnostics tool family is now advertised only when the
    diagnostics_enabled deployment flag is active. Flag-off, resolver-error,
    and pre-auth catalogs omit every diagnostics tool. Existing scope
    filtering and direct-call handler gates remain authoritative.
  action: none
  agent_guidance: >-
    Treat tools/list as the current availability authority. Use diagnostics
    tools only when they are listed. If deployment availability changes during
    the session, list tools again or reconnect before planning the next step.
  details_diff: |
    ~ tool changed: diagnostics_assign (diagnostics_enabled discovery gate)
    ~ tool changed: diagnostics_get (diagnostics_enabled discovery gate)
    ~ tool changed: diagnostics_list (diagnostics_enabled discovery gate)
    ~ tool changed: diagnostics_merge (diagnostics_enabled discovery gate)
    ~ tool changed: diagnostics_prepare_upload (diagnostics_enabled discovery gate)
    ~ tool changed: diagnostics_promote (diagnostics_enabled discovery gate)
    ~ tool changed: diagnostics_report (diagnostics_enabled discovery gate)
    ~ tool changed: diagnostics_set_severity (diagnostics_enabled discovery gate)
    ~ tool changed: diagnostics_set_status (diagnostics_enabled discovery gate)

- version: 2026.08.06-8
  surface: resource
  change: >-
    Every static doc resource is now also readable over plain, unauthenticated
    HTTPS on this server. GET /guides indexes what is published, naming each
    doc's MCP URI and its URL; a doc's path is its URI minus the scheme, so
    sprout://task/authoring-guide serves at /guides/task/authoring-guide.md.
    Markdown guides are served raw and sprout://changelog is served as JSON,
    byte-identical to what resources/read returns because both come from the
    same registry in the same process. Responses carry the contract version,
    the serving revision, and an ETag. The server instructions and the RFC
    9728 protected-resource document point at the index. The guide namespace
    is normalized to domain/doc in the same change — three resources renamed:
    sprout://guides/loop-authoring is now sprout://loop/authoring-guide,
    sprout://guides/loop-runner is now sprout://loop/runner-guide, and
    sprout://resource/wait-guide is now sprout://mcp/wait-guide (catalog name
    mcp-wait-guide). Old URIs keep resolving in resources/read for a
    compatibility window but no longer appear in resources/list. One new
    resource ships too — sprout://canvas/design, where to read the Sprout kid
    design language: a pointer to the maintained doc set plus how to install
    those docs locally with the Sprout agent plugin. No tool or scope changed.
  action: update_calls
  agent_guidance: >-
    Use the new URIs — loop/authoring-guide, loop/runner-guide, mcp/wait-guide
    — when reading or citing these guides; the old spellings still read for
    now but are absent from the catalog and will eventually stop resolving.
    Read sprout://canvas/design alongside sprout://canvas/sdk before authoring
    canvas HTML: the SDK covers behavior, this covers appearance, and skipping
    it is the usual reason a canvas looks wrong or trips the analyzer. If your
    client cannot call resources/read, fetch the guides over HTTPS instead of
    proceeding without them — start at GET /guides rather than guessing a
    path. Each deployment publishes its own contract, so read from the server
    you are connected to rather than a copy elsewhere.
  details_diff: |
    + resource added: sprout://canvas/design (canvas-design-language)
    + public route added: GET /guides (index)
    + public route added: GET /guides/* (one doc per static resource)
    ~ resource renamed: sprout://guides/loop-authoring -> sprout://loop/authoring-guide (old URI reads for a window)
    ~ resource renamed: sprout://guides/loop-runner -> sprout://loop/runner-guide (old URI reads for a window)
    ~ resource renamed: sprout://resource/wait-guide -> sprout://mcp/wait-guide (catalog name mcp-wait-guide; old URI reads for a window)
    ~ instructions changed: names /guides as the fallback when a client
      cannot call resources/read; guide pointers use the new URIs
    ~ well-known changed: oauth-protected-resource gains resource_documentation

- version: 2026.08.06-7
  surface: tool
  change: >-
    The complete board tool family is now advertised only after Sprout can
    resolve an authenticated family whose family_boards feature is active.
    Flag-off, unresolved-family, resolver-error, and pre-auth catalogs omit
    every board tool. Direct calls keep their existing handler-level checks.
  action: none
  agent_guidance: >-
    Treat tools/list as the current availability authority. Use board tools
    only when they are listed. If a parent changes Board availability during
    the session, list tools again or reconnect before planning the next step.
  details_diff: |
    ~ tool changed: board_add_canvas (family_boards discovery gate)
    ~ tool changed: board_create (family_boards discovery gate)
    ~ tool changed: board_data (family_boards discovery gate)
    ~ tool changed: board_get (family_boards discovery gate)
    ~ tool changed: board_list (family_boards discovery gate)
    ~ tool changed: board_post (family_boards discovery gate)
    ~ tool changed: board_remove_canvas (family_boards discovery gate)
    ~ server instructions changed: Board guidance now applies only when board.* is listed

- version: 2026.08.06-6
  surface: instructions
  change: >-
    The server's ChatGPT attachment and retry guidance is now shorter while
    preserving the same behavior. ChatGPT still passes attachments through a
    tool's advertised file field and leaves signed uploads to HTTP-capable
    clients. Retry decisions still follow typed error codes.
  action: none
  agent_guidance: >-
    No call shape changed. For tools advertising openai/fileParams, pass the
    attachment in the named field; do not fetch download_url or PUT to a signed
    URL from ChatGPT. Fix BAD_INPUT or INVALID_INPUT, stop on permission or
    visibility errors, and retry INTERNAL_ERROR with backoff.
  details_diff: |
    ~ server instructions changed: equivalent ChatGPT-file and retry guidance in a smaller prompt budget

- version: 2026.08.06-5
  surface: tool
  change: >-
    reward_prepare_photo_upload can now ingest one ChatGPT attachment through
    its top-level file field. Sprout downloads and validates the image, stores
    it in the existing family-scoped pending-photo path, and returns the same
    uploadId used by reward_create and reward_update. The existing
    contentType-plus-byteSize signed-upload form remains available. Results now
    say whether bytes are stored and whether the caller should upload first or
    attach immediately.
  action: update_calls
  agent_guidance: >-
    In ChatGPT, pass one image in the top-level file field. Do not fetch its
    download_url yourself and do not PUT to Supabase. When nextAction is attach,
    pass uploadId to reward_create or reward_update. Clients that can perform a
    raw HTTPS PUT may continue to send contentType and byteSize; when nextAction
    is put_then_attach, upload through signedUrl before attaching the uploadId.
    Never combine file with the signed-upload fields.
  details_diff: |
    ~ tool changed: reward_prepare_photo_upload (ChatGPT file ingestion, XOR input modes, discriminated transfer result)
    ~ server instructions changed: top-level ChatGPT file parameters are Sprout-downloaded and signed PUT URLs are raw-HTTP only

- version: 2026.08.06-4
  surface: tool
  change: >-
    Reward photo uploads now have durable cleanup ownership when the
    pending-photo lifecycle is enabled. A signed URL's five-minute expiry ends
    only the PUT capability; it does not delete stored bytes or expire the
    upload handle. Reward create and update coordinate consumption with the
    cleanup worker, so a handle being consumed or cleaned refuses before
    canonical photo storage work.
  action: update_calls
  agent_guidance: >-
    If a signed PUT does not finish before expiry, call
    reward_prepare_photo_upload again, upload through the new URL, and attach
    the uploadId from the latest successful response. On PENDING_BUSY, retry
    the same idempotent Reward call and inspect the Reward if the earlier
    outcome was ambiguous. On PENDING_NOT_FOUND, prepare and upload a new photo
    instead of reusing the old handle.
  details_diff: |
    ~ tool changed: reward_prepare_photo_upload (capability-expiry and latest-handle guidance)
    ~ tools changed: reward_create, reward_update (durable cleanup ownership and typed consume/cleanup recovery)

- version: 2026.08.06-3
  surface: tool
  change: >-
    quest_create_extra is the canonical fixed-policy command for one additional
    rewarded play. It accepts only taskId and childId, requires an
    Idempotency-Key, and reads the live Task's extras cap and completion
    rewardRule. Its typed result reports rewarded plays remaining, free-play
    availability, and recovery steps. The legacy quest_create tool remains a
    compatibility adapter whose reward is only an exact-policy assertion.
  action: update_calls
  agent_guidance: >-
    Use quest_create_extra for new calls. Retry unchanged intent with the same
    Idempotency-Key; use a new key only when the family deliberately wants
    another rewarded play. Never send reward, budget, mode, or generic any
    fields. When the cap is exhausted, follow the returned nextSteps: use free
    play when available or ask the parent to increase policy.extras.maxPerDay.
  details_diff: |
    + tool added: quest_create_extra (fixed Task-policy reward, durable replay, typed capacity recovery)
    ~ tool changed: quest_create (legacy reward is an equality assertion, not caller-selected pricing)
    ~ resource changed: sprout://task/authoring-guide (canonical extra-play flow and policy ownership)

- version: 2026.08.06-2
  surface: tool
  change: >-
    task_create now refuses a new retained Canvas assignment when childId,
    canvasId, and the server-validated setup hash match an existing Task.
    Existing twins remain grandfathered. Paused Tasks keep the signature;
    tombstoned Tasks release it for replacement.
  action: update_calls
  agent_guidance: >-
    A new Idempotency-Key does not bypass Canvas assignment convergence. When
    TASK_CANVAS_ALREADY_ASSIGNED returns the retained taskId, add plays by
    raising policy.rewardedCompletions or enabling policy.freePlay, change the
    Canvas setup or Canvas for a separate assignment, or update the existing
    schedule. Tombstone the retained Task before creating a replacement; its
    old key still replays the original response.
  details_diff: |
    ~ tool changed: task_create (exact retained child/Canvas/setup twins refuse with repair directions)
    ~ resource changed: sprout://task/authoring-guide (new-key, pause, and tombstone convergence semantics)

- version: 2026.08.06-1
  surface: tool
  change: >-
    marketplace_get_adoption is now the discoverable name for reading one
    family-owned adoption or fork setup record. The previous dotted spelling,
    marketplace.adoption_get, remains callable for one compatibility window but
    is hidden from tools/list. marketplace_fork now requires an Idempotency-Key.
    A retry with the same key and arguments returns the original private graph,
    even after transport replay data expires. Reusing the key with different
    arguments returns IDEMPOTENCY_CONFLICT. If the original private graph was
    removed, the old key returns MARKETPLACE_FORK_RESULT_REMOVED instead of
    creating a replacement.
  action: update_calls
  agent_guidance: >-
    Call marketplace_get_adoption with an installId when setup state needs to
    be read again. For marketplace_fork, keep the same Idempotency-Key only for
    an unchanged retry. Use a new key when the family deliberately wants a
    second editable remix. If a prior fork result was removed, start a new fork
    with a new key only after confirming that intent with the user.
  details_diff: |
    ~ tool renamed: marketplace_adoption_get -> marketplace_get_adoption (old dotted spelling remains a hidden call alias)
    ~ tool changed: marketplace_fork (required key, durable same-operation convergence, removed-result tombstone)
    + error added: IDEMPOTENCY_KEY_REQUIRED
    + error added: MARKETPLACE_FORK_RESULT_REMOVED

- version: 2026.08.05-13
  surface: tool
  change: >-
    task_list and task_describe now make programAssignment a structurally
    required discriminator on their retained legacy Program projection. The
    generated contract no longer presents Program-only progressSpec or Canvas
    activity-verification fields as possible standalone Task fields. The
    canonical standalone projection introduced in 2026.08.05-12 is unchanged.
  action: update_calls
  agent_guidance: >-
    Treat a legacy read branch as a Program Task only when programAssignment is
    present. For standalone Tasks, continue using the canonical childId,
    policy, mode-specific spec, assignmentState, and availability fields. Do
    not send or expect progressSpec or activityVerification on a standalone
    Task.
  details_diff: |
    ~ tool changed: task_list (legacy Program arm structurally requires programAssignment)
    ~ tool changed: task_describe (legacy Program arm structurally requires programAssignment)

- version: 2026.08.05-12
  surface: tool
  change: >-
    task_create now creates one standalone Task for one child through a
    singular canonical contract. It replaces childIds with childId, requires
    displayable instructions for self-check Tasks, keeps conversation and
    Canvas settings in their matching specs, and moves rewarded completion
    count, completion rewards, free play, and fixed extras into policy. Canvas
    assignment values come from the selected Canvas manifest and successful
    writes return server-derived setup and canvasDataHash receipts. dryRun
    previews make no writes and return the normalized spec, warnings, and a
    specHash used to acknowledge review-required warnings. Invalid requests
    return all independent issues with field paths, reasons, and repair steps.
    Standalone task_list and task_describe now use the same canonical Task
    projection; describe adds current rewarded plays remaining, free-play
    availability, and paused-state recovery. Direct reads no longer expose
    progressSpec, activity-verification authoring, or live-run state. Program
    rows and task_update keep their released contracts for their separate
    migrations.
  action: update_calls
  agent_guidance: >-
    Call task_create once per child with childId and a distinct Idempotency-Key.
    Choose exactly one runMode and its matching fields. Use policy.rewards with
    a completion trigger, policy.rewardedCompletions for rewarded capacity,
    and policy.freePlay for unrewarded play after that capacity is exhausted.
    Put only manifest-requested assignment values in canvasSpec.setup; never
    send canvasDataHash or a setup receipt. Preview with dryRun true. If the
    preview requires review, commit the same authored spec with its specHash
    and exact warning codes. Reuse a key only for an unchanged commit retry.
    Use a new key for a changed intent, a sibling Task, or a replacement after
    tombstoning. Read task_list or task_describe for settings and availability;
    use task_runs_list with taskId for live Canvas-run state. Do not copy this
    shape into task_update or Program calls yet.
  details_diff: |
    ~ tool changed: task_create (singular childId, canonical mode specs and policy, preview/review, Canvas receipts, directional validation)
    ~ tool changed: task_list (canonical standalone Task projection; Program projection retained)
    ~ tool changed: task_describe (canonical standalone Task plus availability; Program projection retained)
    ~ instructions changed: direct Task run state moves from task_describe to task_runs_list
- version: 2026.08.05-11
  surface: tool
  change: >-
    heartbeat_update now rejects dryRun and preview controls on legacy
    pause/resume/cancel action payloads instead of executing a lifecycle write
    during preview. Heartbeat names must contain a non-whitespace character.
    Canonical create serializes with Skill archival, and execution uses the
    stored routine family as its authority. The authoring guidance now matches
    the supported single-skill default: assignmentSkillId is optional.
  action: update_calls
  agent_guidance: >-
    Use heartbeat_pause, heartbeat_resume, or heartbeat_cancel for lifecycle
    changes; do not send dryRun, specHash, or acknowledgedWarnings with legacy
    lifecycle actions. Give every Heartbeat a visible non-blank name. For the
    simplest Heartbeat, supply runContext.runSkillId and omit
    assignmentSkillId; add a distinct assignment-shaped skill only when it
    needs to own the recurring lifecycle.
  details_diff: |
    ~ tool changed: heartbeat_create (non-blank names, archive-safe dependency commit, corrected single-skill guidance)
    ~ tool changed: heartbeat_update (non-blank names, lifecycle preview controls refused)
    ~ tool changed: skill_write (corrected optional assignmentSkillId guidance)
    ~ resource changed: sprout://heartbeat/authoring-guide

- version: 2026.08.05-10
  surface: tool
  change: >-
    heartbeat_create and heartbeat_update now preview one canonical definition
    and bind commits to its specHash. Definition edits use mergeFrom. New
    heartbeat_pause, heartbeat_resume, and terminal heartbeat_cancel tools own
    lifecycle changes. Heartbeat reads now return child scope, skill/run
    context, and lifecycle status.
  action: update_calls
  agent_guidance: >-
    Dry-run heartbeat_create or heartbeat_update, repair every issue, then
    commit the same effective definition with the returned specHash. Preview
    and commit are different payloads because dryRun/specHash change, so they
    must use different Idempotency-Keys; reuse a key only for an unchanged
    retry. Use mergeFrom for sparse definition edits. Use heartbeat_pause,
    heartbeat_resume, and heartbeat_cancel for lifecycle; cancelled Heartbeats
    cannot be edited or resumed.
  details_diff: |
    + tool added: heartbeat_pause
    + tool added: heartbeat_resume
    + tool added: heartbeat_cancel
    ~ tool changed: heartbeat_create (canonical definition dry-run/specHash commit)
    ~ tool changed: heartbeat_update (sparse mergeFrom dry-run/specHash commit)
    ~ tool changed: heartbeat_describe (delegates canonical create/update preview)
    ~ tool changed: heartbeat_list (full definition and lifecycle readback)
    ~ resource changed: sprout://heartbeat/authoring-guide

- version: 2026.08.05-9
  surface: tool
  change: >-
    reward_update now uses a create-derived mergeFrom object. Omitted fields
    preserve current values, supported nullable fields clear with null, and a
    dry run returns the complete effective Reward with its revision and
    specHash. A commit can echo that hash to reject a stale preview. Category,
    screen-time, and quantity edits refuse while claims are pending. The prior
    flat request remains a one-version compatibility parser. Photo placement
    is now explicit: reward_create accepts top-level photoUploadId, while
    reward_update uses mergeFrom.photoUploadId and null clears it. The current
    reward_prepare_photo_upload transfer mode still requires a client capable
    of issuing the returned raw HTTPS PUT; ChatGPT and MCP-only callers cannot
    complete that mode yet.
  action: update_calls
  agent_guidance: >-
    For a new edit, call reward_update with { rewardId, mergeFrom: { ... },
    dryRun: true }. Review the full Reward and issues, then commit the same
    mergeFrom with dryRun: false and the returned specHash. Preview and commit
    are different payloads, so use different Idempotency-Keys; reuse a key only
    for an unchanged retry. Resolve pending claims before changing category,
    screenTimeSpec, or quantity. Keep child-specific policy changes on
    reward_update_child_claim_policy. A capable raw-HTTP client may PUT photo
    bytes and then use photoUploadId as described above. ChatGPT should omit
    the photo until reward_prepare_photo_upload gains a file-ingestion mode.
  details_diff: |
    ~ tool changed: reward_update (create-derived mergeFrom, dry-run/hash/revision controls, complete readback, pending-claim guard, one-version flat compatibility)
    ~ tool changed: reward_prepare_photo_upload (canonical create/update/clear placement and capable-client-only transfer guidance)

- version: 2026.08.05-8
  surface: behavior
  change: >-
    Every shared idempotent MCP call now binds its Idempotency-Key to the
    request's canonical JSON arguments and resolved family. Reusing the same
    caller/tool/key slot for changed input or a different selected family
    returns IDEMPOTENCY_CONFLICT before replay probing, validation, rate
    limiting, or handler execution. Matching retries keep their existing
    in-flight and cached-replay behavior. Legacy cache records without a request
    fingerprint are handled conservatively until their existing 24-hour TTL
    expires. The ephemeral cache still fails open when its substrate is
    unavailable, so domain convergence remains the authority for costly effects.
  action: update_calls
  agent_guidance: >-
    Reuse an Idempotency-Key only when retrying the exact same command for the
    same family. If the arguments or selected family intentionally change, send
    a new key. On IDEMPOTENCY_IN_FLIGHT, wait and retry the same input and key.
    On IDEMPOTENCY_CONFLICT, do not retry the changed command with that key; use
    a new key for the new intent. A conflict means the changed command was not
    evaluated or applied.
  details_diff: |
    ~ policy changed: all shared idempotent MCP calls bind key reuse to request arguments and resolved family
    + error added: IDEMPOTENCY_CONFLICT (same key reused for different intent)

- version: 2026.08.05-7
  surface: tool
  change: >-
    task_prepare_reference_upload gains a `file` input mode: supply
    `{download_url, file_id, mime_type?, file_name?}` and the server downloads,
    normalizes, and moderates the reference photo itself, returning
    `{assetId, ingest: {state: "complete"}}` — no further call needed. This
    fixes the only path an MCP agent could previously use to finish a
    golden_compare reference upload: the prior signed-PUT transfer route needs
    the caller to issue a raw HTTPS PUT, which an MCP agent — able only to
    call declared MCP tools — structurally cannot do.
    `file` is mutually exclusive with the existing `mimeType`/`sizeBytes`
    signed-PUT fields; that mode is unchanged for any caller that does hold a
    session, but it is now documented as DO-NOT for an MCP agent, which by
    definition cannot complete it. The result is now discriminated on a `mode`
    field ("ingest" | "transfer") so a caller can tell the branches apart
    without probing for key presence. `annotations.openWorldHint` is now true
    (the tool fetches an external HTTPS origin in file mode) and the tool is
    now rate limited per user; task_finalize_reference_upload is unaffected and
    stays closed-world.
  action: update_calls
  agent_guidance: >-
    Switch to `file`: the signed-PUT fields return a PUT envelope that an MCP
    agent has no way to actually issue (it can only call declared MCP tools),
    so that mode cannot be completed from this surface — calls that still use
    it never produce a finalized reference. If you hold the bytes but no
    download_url, you cannot complete this tool at all; obtain a fetchable
    HTTPS download_url (the ChatGPT file param supplies one) rather than
    falling back to mimeType/sizeBytes. Branch on the response's `mode`:
    "ingest" is already finalized, "transfer" still needs the PUT plus
    task.finalize_reference_upload. `operationKey` is still required in both
    modes and still governs idempotency: a retry with the same key and the
    SAME photo returns the same completed assetId; the same key with a
    DIFFERENT photo is refused with REFERENCE_ALREADY_FINALIZED rather than
    silently keeping the first photo. Errors on `details.reason` are the
    signed-PUT vocabulary (REFERENCE_UNSUPPORTED_MEDIA,
    REFERENCE_MODERATION_BLOCKED, REFERENCE_TASK_NOT_FOUND,
    REFERENCE_UPLOAD_EXPIRED, REFERENCE_ALREADY_FINALIZED,
    REFERENCE_OPERATION_KEY_CONFLICT, REFERENCE_RATE_LIMITED) plus three
    file-mode additions: REFERENCE_DOWNLOAD_FAILED (retryable transport fault
    — retry the same call), REFERENCE_DOWNLOAD_REJECTED (the URL/destination
    /payload was refused — supply a different download_url),
    REFERENCE_STORAGE_FAILURE (retryable server-side persistence fault), and
    REFERENCE_INGEST_IN_PROGRESS (an earlier attempt on this operationKey is
    still transferring/moderating — retry the SAME call with the SAME
    operationKey shortly). The tool is now also rate limited per user: a
    per-user throttle can refuse
    BEFORE the handler runs with code RATE_LIMITED and
    `details.retry_after_ms` (no `details.reason` — this is a different
    refusal shape from the list above); wait that interval, then retry the
    same call.
  details_diff: |
    ~ tool changed: task_prepare_reference_upload (description, inputSchema, outputSchema, annotations.openWorldHint: false -> true, _meta['openai/fileParams'] added, rate limited per user, inputSchema publishes a `oneOf` mode-XOR constraint mirroring canvas_prepare_upload's)

- version: 2026.08.05-6
  surface: tool
  change: >-
    task_create accepts optional Canvas-owned assignment values at
    canvasSpec.setup for direct Canvas tasks. The selected Canvas defines the
    allowed fields and constraints. Invalid setup returns all repairable issues
    together, while successful setup is frozen into the child's Canvas run.
  action: update_calls
  agent_guidance: >-
    Put only the values requested by the selected Canvas under
    canvasSpec.setup. Do not send a profile, instructionId, schema, prompt, or
    canvasDataHash there; those belong to the Canvas or server. Repair every
    returned issue before retrying. Program tasks and task_update do not accept
    setup yet.
  details_diff: |
    ~ tool changed: task_create (direct Canvas tasks add optional canvasSpec.setup)
    ~ resource changed: sprout://canvas/sdk (adds the read-only sprout.values runtime surface)

- version: 2026.08.05-5
  surface: tool
  change: >-
    Successful gems_adjust responses now include both previousBalance and
    newBalance. Adjustments are serialized, but this release keeps the legacy
    balance-floor behavior: a removal can still succeed with a negative
    newBalance until the separate enforcement activation is complete.
  action: none
  agent_guidance: >-
    Read previousBalance and newBalance from every successful gems_adjust call;
    do not assume an overdraw was refused. If GEM_WRITES_PAUSED is returned,
    retry the same full command with the same idempotency key after the advised
    delay. Non-negative-floor enforcement will be announced separately.
  details_diff: |
    ~ tool changed: gems_adjust (adds previousBalance; serialized legacy behavior remains active)

- version: 2026.08.05-4
  surface: tool
  change: >-
    Screen-time verbs stop reporting intent as enforcement, and stop accepting
    commands they can prove will not land. screentime_lock and screentime_unlock
    DROP isLocked and enforceabilityWarning and now either ACCEPT
    ({commandAccepted: true, itemId, deviceAcknowledgement}) or REFUSE
    ({commandAccepted: false, refusedReason, deviceAcknowledgement}) and mint
    nothing. Refusal happens only on positive knowledge that nothing can apply
    the command (no device has approved Screen Time authorization, or no
    server-side configuration exists); a dark or stale device still accepts. screentime_query_state is restructured into
    desiredState (what the server ordered) and servedState (what it will tell
    you, with a provenance of device_evidence, last_confirmed or legacy and an
    evidence age), plus budget, deviceAcknowledgement, activeScheduleId and
    screenTimeAuthStatus. screentime_review_request is restructured into
    {request, gems, command, deviceAcknowledgement}, where command is null when
    the review queued nothing device-wide. reward_review_claim adds screenTime
    {granted, minutes, itemId} or null, disclosing that approving a claim can
    hand a child device time. New tool screentime_describe_command reads one
    command's true lifecycle from its delivery receipts. Settings and schedule
    writes return propagation {mechanism, appliesAt} and their descriptions
    teach that standing config is not a queued command. screentime_get_settings
    is no longer annotated read-only, because it creates a default settings row.
  action: update_calls
  agent_guidance: >-
    Check commandAccepted first. FALSE means the command was refused and nothing
    was queued: refusedReason names the one thing to fix (no_authorized_device =
    no device has granted Screen Time authorization; no_block_list = nothing is
    configured to enforce). Tell the parent that specific thing and re-send once
    it is done; do not retry blindly. TRUE means a command was QUEUED with a
    deadline, never that a device obeyed. Keep the itemId and call screentime_describe_command
    for the real outcome. Only applied means the change happened; expired is
    terminal and needs a re-send; apply_failed is still inside its deadline and
    may yet succeed; superseded means a newer command took the lane. When a
    command both failed on the device and expired the status is expired, and
    error.code still carries what the device said.
    Do not tell a parent a device is locked or unlocked until the status is
    applied. On screentime_query_state, read desiredState and servedState
    together: when they disagree the command has not landed, and say that rather
    than picking one. Trust servedState only as far as its provenance allows;
    legacy means no device confirmed anything. Check deviceAcknowledgement.ageSeconds
    before promising anything about a family whose devices may be dark, and use
    screentime_list_devices as the enforcement-evidence read. Before approving a
    reward claim, check screenTime: a non-null value means you are handing over
    device time, not only gems, and the parent should be told so. Settings and
    schedule edits are standing config: they have no itemId, cannot expire, and
    converge at the device's next reconcile, so never poll
    screentime_describe_command for them. Send an Idempotency-Key when creating a
    schedule so a retry cannot duplicate it.
  details_diff: |
    + tool added: screentime_describe_command
    ~ tool changed: screentime_lock (description, outputSchema)
    ~ tool changed: screentime_unlock (description, outputSchema)
    ~ tool changed: screentime_query_state (description, outputSchema)
    ~ tool changed: screentime_review_request (description, outputSchema)
    ~ tool changed: reward_review_claim (description, outputSchema)
    ~ tool changed: screentime_get_settings (description, annotations)
    ~ tool changed: screentime_update_settings (description, outputSchema)
    ~ tool changed: screentime_create_schedule (description, outputSchema)
    ~ tool changed: screentime_update_schedule (description, outputSchema)
    ~ tool changed: screentime_delete_schedule (description, outputSchema)
    ~ tool changed: screentime_list_devices (description, outputSchema)
- version: 2026.08.05-3
  surface: tool
  change: >-
    marketplace_inspect now returns packageIncludes with the public-safe title,
    summary, kind, root flag, and package-local node key for every Skill,
    Program, or Canvas in the published package. It does not expose source ids
    or node snapshots.
  action: none
  agent_guidance: >-
    Use packageIncludes to show the parent the exact reusable package contents
    before asking to adopt a Marketplace listing. Continue to use
    packageContents only for aggregate kind counts.
  details_diff: |
    ~ tool changed: marketplace_inspect (adds public-safe packageIncludes identities)
- version: 2026.08.05-2
  surface: tool
  change: >-
    Successful gems_adjust responses now include both previousBalance and
    newBalance. Adjustments are serialized, but this release keeps the legacy
    balance-floor behavior: a removal can still succeed with a negative
    newBalance until the separate enforcement activation is complete.
  action: none
  agent_guidance: >-
    Read previousBalance and newBalance from every successful gems_adjust call;
    do not assume an overdraw was refused. If GEM_WRITES_PAUSED is returned,
    retry the same full command with the same idempotency key after the advised
    delay. Non-negative-floor enforcement will be announced separately.
  details_diff: |
    ~ tool changed: gems_adjust (adds previousBalance; serialized legacy behavior remains active)

- version: 2026.08.05-1
  surface: tool
  change: >-
    task_update now supports a separate Living Canvas values write for one
    assigned child. The call accepts values with expectedValuesVersion and
    returns the committed values and new version. task_describe exposes the
    current values region only when the family has Living Canvas enabled.
  action: update_calls
  agent_guidance: >-
    Read task_describe first, then send task_update with values and the current
    valuesVersion (use 0 when the task has no assignment values). Include
    childId when the task has more than one assigned child. Keep values writes
    separate from metadata edits. A version conflict returns the current
    version so you can re-read, merge, and retry.
  details_diff: |
    ~ tool changed: task_update (adds values, expectedValuesVersion, reason, and childId for the values-only lane)
    ~ tool changed: task_describe (adds gated state.values and state.valuesVersion)

- version: 2026.08.04-7
  surface: tool
  change: >-
    mcp_health now reports every protocol request method accepted by the MCP
    router. The methods list adds resources/list, resources/templates/list,
    resources/read, resources/subscribe, and resources/unsubscribe. It remains
    fixed server metadata and does not expose tool availability, feature flags,
    resource identifiers, or caller authorization state.
  action: none
  agent_guidance: >-
    Treat mcp_health.methods as the server's protocol request-method surface.
    Discover callable tools through tools/list and discover visible resources
    through resources/list plus resources/templates/list; each call still
    applies its normal authentication, scope, and family checks.
  details_diff: |
    ~ tool changed: mcp_health (methods now derives from the router authority and includes resource request methods)

- version: 2026.08.04-6
  surface: tool
  change: >-
    canvas_create and canvas_update now advertise living-canvas values and
    playbook inputs as JSON objects. Strict MCP clients no longer hide or flag
    those parameters as typeless. Server-side validation is unchanged: an
    invalid document still returns the guided living-canvas rejection with the
    reason and a valid example.
  action: none
  agent_guidance: >-
    Author values and playbook as JSON objects. Use values for the canvas's
    runtime content document and playbook for its field meanings, initialization,
    update instructions, constraints, and stable-id rule. If the write is
    rejected, correct the reported issue using the returned valid example.
  details_diff: |
    ~ tool changed: canvas_create (values/playbook advertised as object parameters)
    ~ tool changed: canvas_update (values/playbook advertised as object parameters)

- version: 2026.08.04-5
  surface: tool
  change: >-
    task_pause and task_resume now change one child-owned task's assignment
    availability without editing its schedule or specification. Both calls
    request an absolute state, so repeating the same call returns changed:false
    instead of toggling. task_update now rejects unknown top-level fields rather
    than silently dropping them, including active, paused, assignmentState, and
    childId.
  action: none
  agent_guidance: >-
    Use task_pause {taskId} to make a task unavailable and task_resume {taskId}
    to restore eligibility. Do not send lifecycle fields through task_update or
    scheduleSpec. Pause preserves runs, submissions, progress, history, Quest
    rows, and rewards. If unresolved work exists, follow the returned
    IN_FLIGHT_WORK_BLOCKED warning and resume before completing or approving it.
  details_diff: |
    + tool added: task_pause
    + tool added: task_resume
    ~ tool changed: task_update (strict unknown-field rejection and lifecycle guidance)
    ~ resource changed: sprout://task/authoring-guide (pause/resume lifecycle guidance)

- version: 2026.08.04-2
  surface: tool
  change: >-
    task_create and task_update now describe dailyTarget and
    canvasSpec.grading.attemptsPerDay as legacy names for the rewarded
    completion target of one occurrence. A schedule task counts the target per
    covered day; onetime and program tasks count it over the task lifetime.
    Runtime completion checks now follow that same rule instead of completing
    every onetime or program task after its first approval.
  action: none
  agent_guidance: >-
    Use one onetime task when a child should earn several approved completions
    toward one dated occurrence, and one recurring schedule task when that
    target should reset on covered days. Paid targets above the safety cap are
    refused; lower the rewarded target to the cap or fewer, and optionally
    enable policy.freePlay for additional unrewarded plays.
  details_diff: |
    ~ tool changed: task_create (description and field descriptions)
    ~ tool changed: task_update (description and field descriptions)
    ~ resource changed: sprout://task/authoring-guide (occurrence and replay guidance)

- version: 2026.08.04-1
  surface: tool
  change: >-
    task_describe / task_runs_get tool descriptions now state the
    no-retain/no-forward/no-train instruction for a fetched proof image
    directly, not only in sprout://task/authoring-guide and this changelog's
    agent_guidance — the tool's own description is the one surface every
    caller is guaranteed to see on every call.
  action: none
  agent_guidance: >-
    Do not retain, forward, or train on a fetched proof image beyond the
    current turn — treat it as ephemeral child-image data. This guidance
    already applied; it is now stated in the tool description itself too.
  details_diff: |
    ~ tool changed: task_describe (description)
    ~ tool changed: task_runs_get (description)

- version: 2026.08.03-3
  surface: tool
  change: >-
    task.describe / task.runs.get: proof.url/expiresAt additionally require
    the caller hold canvas:read alongside task:read (a task:read-only caller
    now sees proof.assetId only — the tool descriptions and
    sprout://task/authoring-guide, which now also lists task.runs.get as
    required reading, both say so). Both tools are rate-limited server-side.
    Doc correction: the prior entry's "storage paths and provider details
    never cross MCP" overstated it — the signed URL does carry a storage
    path and provider host.
  action: reauth
  reauth:
    scopes_added: ["canvas:read"]
    grants_before: "2026-08-03"
    how: >-
      Reconnect the Sprout connector, or mint a fresh connection token that
      includes canvas:read alongside task:read. Existing task:read-only grants
      keep working — task.describe and task.runs.get still return every other
      field — but proof.url/expiresAt are withheld and you will see
      proof.assetId alone.
  agent_guidance: >-
    Never cache a proof URL past expiresAt; call the tool again for a fresh
    one, and don't retry a stale URL or speculate about why a proof is
    unavailable. Do not retain, forward, or train on a fetched proof image
    beyond the current review turn — treat it as ephemeral child-image data.
  details_diff: |
    ~ tool changed: task.describe (description — canvas:read requirement + anti-speculation guidance)
    ~ tool changed: task.runs.get (description — canvas:read requirement + anti-speculation guidance)
    ~ resource changed: sprout://task/authoring-guide (description lists task.runs.get; proof section corrected + data-minimization guidance)

- version: 2026.08.03-2
  surface: tool
  change: >-
    task.describe pending runtime-photo submissions and settled state entries,
    plus task.runs.get proof-bearing runs, now return an expiring, family-scoped
    proof.url plus expiresAt alongside the durable proof.assetId while the
    moderated asset is active, retained, and currently authorized. Each pending
    task.describe submission carries its own proof association so multiple
    attempts remain unambiguous before parent review. The URL lasts five minutes.
    Blocked, deleted, expired, swept, or policy-revoked proofs remain
    identity-only; storage paths and provider details never cross MCP.
  action: none
  agent_guidance: >-
    Fetch proof.url promptly when independently checking a child's photo, and
    treat expiresAt as authoritative. Never cache or persist the URL; call
    task.describe or task.runs.get again to obtain a fresh one. If proof contains
    only assetId, the proof identity still exists but its bytes are not currently
    readable—do not retry the stale URL or infer why it is unavailable.
  details_diff: |
    ~ tool changed: task.describe (outputSchema — pending submissions and state proof may add url + expiresAt)
    ~ tool changed: task.runs.get (outputSchema — optional proof added)
    ~ resource changed: sprout://task/authoring-guide (proof read/expiry guidance)

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
