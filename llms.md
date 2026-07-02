# Sprout Brain — Agent Index

Machine entry point for Sprout's reference docs. Each entry is a doc URL plus
a one-line summary. Scan the summaries, then fetch the doc you need.

URLs are raw GitHub paths on the `main` branch.

## Canvas

- [canvas/sdk.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/canvas/sdk.md) — The `window.sprout.*` SDK contract for Sprout-served canvases: identity reads, external learning links (`openExternalUrl`), buddy voice (`sprout.tts`), Rive animations (`sprout.rive`), Canvas Memory (`sprout.state` auto-persist + resume), multiplayer sessions (`sprout.session`), signals, completion (`sprout.complete(opts)` canonical), upload flows, concurrency (`expectedVersion`), error handling, and the Released/Roadmap status legend.
- [canvas/worked-patterns.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/canvas/worked-patterns.md) — Engine patterns from six shipped production canvases: the LESSON data seam for content-update loops, ASCII-only state keys + canonical `S.done` schema, statically-analyzable `sprout.complete` (literal keys or grading silently downgrades), signal choreography, the four-case resume contract, one-engine multilingual split, interaction-engine recipes (flip-grid, coverage painting, syllable-block frame, HanziWriter tracing via canvas-CDN), and the headless QA harness with its minimum drive set.
- [canvas/artifact-kit.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/canvas/artifact-kit.md) — MOVED: superseded by the `design/` domain (pointer doc).
- [canvas/design-patterns.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/canvas/design-patterns.md) — MOVED: superseded by the `design/` domain (pointer doc).

## Design (kid design language for canvases)

- [design/README.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/README.md) — Orientation for the design domain: the generated-and-linted freshness contract with sprout-app's injected stylesheet, and reading order.
- [design/checklist.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/checklist.md) — The canvas ship gate: every server analyzer rule (functional + design) as a pass/fail checklist, plus the kid design system's golden rules and how to self-verify with a dry-run.
- [design/components.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/components.md) — The injected component API: every runtime class with specs and markup (buttons, cards, list items, feedback banners, progress, toolbar, sheet, toast, task cards, branded sky/grass scenes), plus what does NOT exist and how to rebuild it with tokens.
- [design/tokens.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/tokens.md) — GENERATED design-token reference (fonts, spacing, radius, color ramps, semantic tokens) extracted from the runtime stylesheet with the source commit stamped.
- [design/layout.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/layout.md) — Body defaults, the three-screen anatomy, spacing rhythm, branded scenes, and TossFace emoji sizing rules.
- [design/motion.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/motion.md) — Built-in component motion, animate-* utilities, sparkle celebrations, Rive, timing reference, and signal-driven buddy reactions.
- [design/age-tiers.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/age-tiers.md) — The tier1/2/3 adaptation table: choices, touch targets, text density, read-aloud, rounds, feedback style.
- [design/early-readers.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/early-readers.md) — The tier1 voice interaction layer: the Speak-Then-Act loop (screen speaks first, actions staged in time not space), whole-card replay, cued choices, and the research anchors behind them.
- [design/archetypes/quiz.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/archetypes/quiz.md) — Copy-paste quiz skeleton: N questions, list-item answers, feedback banners, scored completion.
- [design/archetypes/sorting-matching.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/archetypes/sorting-matching.md) — Copy-paste sort/match tile-game skeleton: tap-in-order and match-pairs rounds on a tile grid.
- [design/archetypes/reading.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/archetypes/reading.md) — Copy-paste read-along skeleton: paged passages, read-aloud, timed completion.
- [design/archetypes/journal.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/archetypes/journal.md) — Copy-paste journal/reflection skeleton: tier-branched sentence starters vs free input, summary completion.
- [design/archetypes/mission-lobby.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/archetypes/mission-lobby.md) — Copy-paste mission dashboard skeleton: goal progress, gems pill rebuild, step checklist, single CTA.
- [design/archetypes/result-celebration.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/design/archetypes/result-celebration.md) — The celebration result screen: branded sky/grass scene, sparkles, score bands — drop-in finish for any archetype.

## Skills

- [skills/README.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/skills/README.md) — What Sprout Brain skills do, how core architect skills differ from platform skills, and local/public install guidance.
- [skills/install-sprout-partner-skills/SKILL.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/skills/install-sprout-partner-skills/SKILL.md) — Installable skill for installing or updating Sprout Brain skills into Codex and Claude Code local skill directories.
- [skills/sprout-solutions-architect/SKILL.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/skills/sprout-solutions-architect/SKILL.md) — Installable skill for planning Sprout-shaped kid programs, parent activities, external home-agent integrations, rewards, and marketplace adoption/remix.
- [skills/canvas-planner/SKILL.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/skills/canvas-planner/SKILL.md) — Installable skill for planning a canvas's design before authoring it: picks a page archetype, names the copy-paste skeleton from design/archetypes/, and produces a slot-fill plan with tier adaptations and the polish-checklist commitment.

## Solutions Architect

- [knowledge/solutions-architect.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/solutions-architect.md) — Run 1 doctrine for mapping parent and partner goals to Sprout-shaped plans.
- [knowledge/capabilities/current-platform.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/current-platform.md) — Index of current platform capabilities and limits for lazy loading.
- [knowledge/primitives/sprout-and-home-agent.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/primitives/sprout-and-home-agent.md) — Index of Sprout and home-agent primitives plus canonical sequences.
- [knowledge/patterns/current-patterns.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/patterns/current-patterns.md) — Index of preferred solution patterns.
- [knowledge/capabilities/unavailable-patterns.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/unavailable-patterns.md) — Index of anti-patterns and unavailable recommendations.
- [examples/solutions-architect-run1.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/examples/solutions-architect-run1.md) — Index of worked solutions architect examples.
- [evals/solutions-architect-golden-prompts.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/evals/solutions-architect-golden-prompts.md) — Index of golden prompt evals and rubric.

## Solutions Architect — Capabilities

- [knowledge/capabilities/family-and-child-lookup.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/family-and-child-lookup.md) — Family lookup and child-name resolution rules.
- [knowledge/capabilities/canvas.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/canvas.md) — Current canvas capability and limits.
- [knowledge/capabilities/skill.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/skill.md) — Current skill authoring capability and constraints.
- [knowledge/capabilities/task-and-review.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/task-and-review.md) — Task, submission, review, and reviewed gem-award capability.
- [knowledge/capabilities/conversation-task.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/conversation-task.md) — Conversation task capability for journaling, explanation, practice, and reflection.
- [knowledge/capabilities/reward-and-gems.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/reward-and-gems.md) — Reward catalog and gem earning/spending capability.
- [knowledge/capabilities/heartbeat.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/heartbeat.md) — Heartbeat capability and when to prefer recurring tasks.
- [knowledge/capabilities/program.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/program.md) — Program templates: author a unit/task tree once, assign it to children (slot substitution, schedule resolution); kid-lobby surfacing doctrine (one root umbrella unit, one-level cascade, multi-root = invisible).
- [knowledge/capabilities/screentime.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/screentime.md) — Screen time: gem-funded device unlocking, recurring lock schedules, unlock-request review, policy settings.
- [knowledge/capabilities/marketplace.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/marketplace.md) — Marketplace: adopt/fork published listings and submit family creations (web owns final publish).
- [knowledge/capabilities/official-skills.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/official-skills.md) — Registry of official Sprout first-party skills (e.g. Screen Time Goalie); recommend adopting a matching one before building from scratch.
- [knowledge/capabilities/home-agent-boundary.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/capabilities/home-agent-boundary.md) — Home-agent evidence boundary and public/private extraction rules.

## Solutions Architect — Primitives and Sequences

- [knowledge/primitives/canvas.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/primitives/canvas.md) — Canvas primitive.
- [knowledge/primitives/skill.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/primitives/skill.md) — Skill primitive.
- [knowledge/primitives/task.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/primitives/task.md) — Task primitive.
- [knowledge/primitives/submission-review.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/primitives/submission-review.md) — Submission and parent review primitive.
- [knowledge/primitives/reward.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/primitives/reward.md) — Reward primitive.
- [knowledge/primitives/gems.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/primitives/gems.md) — Gem primitive.
- [knowledge/primitives/heartbeat.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/primitives/heartbeat.md) — Heartbeat primitive.
- [knowledge/primitives/home-agent-evidence.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/primitives/home-agent-evidence.md) — Suggested home-agent evidence shape and boundary.
- [knowledge/sequences/simple-canvas-activity.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/sequences/simple-canvas-activity.md) — Canvas activity authoring and delivery sequence.
- [knowledge/sequences/conversation-journal-activity.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/sequences/conversation-journal-activity.md) — Conversation or journal task sequence.
- [knowledge/sequences/external-evidence-quest.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/sequences/external-evidence-quest.md) — External evidence quest sequence.
- [knowledge/sequences/reward-savings-goal.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/sequences/reward-savings-goal.md) — Reward savings goal sequence.
- [knowledge/sequences/parent-facing-result-suggestion.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/sequences/parent-facing-result-suggestion.md) — Parent-facing result with suggested reward sequence.

## Solutions Architect — Patterns

- [knowledge/patterns/daily-rhythm.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/patterns/daily-rhythm.md) — Daily, weekly, and summer routine pattern.
- [knowledge/patterns/journal-together.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/patterns/journal-together.md) — Conversation-based journaling and reflection pattern.
- [knowledge/patterns/mission-lobby-canvas.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/patterns/mission-lobby-canvas.md) — Mission board or quest lobby canvas pattern.
- [knowledge/patterns/parent-reviewed-claim.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/patterns/parent-reviewed-claim.md) — Parent-reviewed child claim pattern.
- [knowledge/patterns/external-evidence-quest.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/patterns/external-evidence-quest.md) — External progress evidence quest pattern.
- [knowledge/patterns/manual-evidence-mode.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/patterns/manual-evidence-mode.md) — Manual evidence mode pattern.
- [knowledge/patterns/reward-savings-goal.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/patterns/reward-savings-goal.md) — Reward savings goal pattern.
- [knowledge/patterns/adopt-or-remix.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/patterns/adopt-or-remix.md) — Marketplace adopt, personalize, and remix pattern.
- [knowledge/patterns/parent-facing-skill-result.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/patterns/parent-facing-skill-result.md) — Parent-facing skill result with suggested approval pattern.

## Solutions Architect — Anti-patterns

- [knowledge/anti-patterns/camera-proof.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/camera-proof.md) — Avoid promising camera or video verification.
- [knowledge/anti-patterns/show-sprout.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/show-sprout.md) — Avoid "show Sprout" proof unless a real input exists.
- [knowledge/anti-patterns/public-scraping-instructions.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/public-scraping-instructions.md) — Avoid public scraping or credential automation instructions.
- [knowledge/anti-patterns/kid-click-awards-gems.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/kid-click-awards-gems.md) — Avoid awarding gems from low-trust child clicks.
- [knowledge/anti-patterns/task-rewards-for-evidence.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/task-rewards-for-evidence.md) — Avoid automatic task rewards for evidence-only external quests.
- [knowledge/anti-patterns/one-click-local-install.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/one-click-local-install.md) — Avoid one-click website-to-local-agent install promises.
- [knowledge/anti-patterns/canvas-fetches-external-data.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/canvas-fetches-external-data.md) — Avoid saying canvases fetch external progress.
- [knowledge/anti-patterns/created-before-writes.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/created-before-writes.md) — Avoid saying created before MCP writes succeed.
- [knowledge/anti-patterns/inventing-mcp-fields.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/inventing-mcp-fields.md) — Avoid inventing MCP fields.
- [knowledge/anti-patterns/phone-approval-guarantee.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/phone-approval-guarantee.md) — Avoid guaranteeing phone approval UI without verification.
- [knowledge/anti-patterns/overbuilding-non-coder-parent.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/overbuilding-non-coder-parent.md) — Avoid overbuilding or overexplaining to non-coder parents.

## Solutions Architect — Examples

- [examples/solutions-architect/parent-anatomy-explorer.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/examples/solutions-architect/parent-anatomy-explorer.md) — Parent-builder anatomy activity example.
- [examples/solutions-architect/learning-platform-multiplication-quest.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/examples/solutions-architect/learning-platform-multiplication-quest.md) — Partner-engineer learning platform multiplication quest example.
- [examples/solutions-architect/piano-left-right-practice.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/examples/solutions-architect/piano-left-right-practice.md) — Piano left/right practice example.
- [examples/solutions-architect/summer-routine.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/examples/solutions-architect/summer-routine.md) — Summer routine planning example.

## Solutions Architect — Evals

- [evals/solutions-architect/learning-platform-consistency.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/evals/solutions-architect/learning-platform-consistency.md) — Eval for initial external learning consistency prompt.
- [evals/solutions-architect/learning-platform-with-details.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/evals/solutions-architect/learning-platform-with-details.md) — Eval for external learning quest with reward and mastery details.
- [evals/solutions-architect/parent-phone-approval.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/evals/solutions-architect/parent-phone-approval.md) — Eval for parent phone approval request.
- [evals/solutions-architect/anatomy-activity.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/evals/solutions-architect/anatomy-activity.md) — Eval for simple anatomy activity.
- [evals/solutions-architect/camera-proof.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/evals/solutions-architect/camera-proof.md) — Eval for camera proof request.
- [evals/solutions-architect/marketplace-adopt.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/evals/solutions-architect/marketplace-adopt.md) — Eval for marketplace adoption.
- [evals/solutions-architect/publish-remix.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/evals/solutions-architect/publish-remix.md) — Eval for publishing a remix.
- [evals/solutions-architect/summer-routine.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/evals/solutions-architect/summer-routine.md) — Eval for summer routine planning.
- [evals/solutions-architect/external-platform-data.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/evals/solutions-architect/external-platform-data.md) — Eval for external platform data.
- [evals/solutions-architect/just-create-it.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/evals/solutions-architect/just-create-it.md) — Eval for "just create it" write-boundary behavior.
