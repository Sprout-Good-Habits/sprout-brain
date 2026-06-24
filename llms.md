# Sprout Brain — Agent Index

Machine entry point for Sprout's reference docs. Each entry is a doc URL plus
a one-line summary. Scan the summaries, then fetch the doc you need.

URLs are raw GitHub paths on the `main` branch.

## Canvas

- [canvas/sdk.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/canvas/sdk.md) — The `window.sprout.*` SDK contract for Sprout-served canvases: identity reads, asset I/O, signals, completion (`sprout.complete(opts)` canonical), buddy voice (`sprout.tts.speak` — kid device only), Canvas Memory (`sprout.state` auto-persist + resume), error handling.
- [canvas/artifact-kit.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/canvas/artifact-kit.md) — The Sprout design system for canvas artifacts: CSS component classes, layout helpers, design tokens, typography, animations.

## Skills

- [skills/README.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/skills/README.md) — What Sprout Brain skills do, how core architect skills differ from platform skills, and local/public install guidance.
- [skills/install-sprout-partner-skills/SKILL.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/skills/install-sprout-partner-skills/SKILL.md) — Installable skill for installing or updating Sprout Brain skills into Codex and Claude Code local skill directories.
- [skills/sprout-solutions-architect/SKILL.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/skills/sprout-solutions-architect/SKILL.md) — Installable skill for planning Sprout-shaped kid programs, parent activities, external home-agent integrations, rewards, and marketplace adoption/remix.

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
- [knowledge/anti-patterns/platform-chrome-in-canvas.md](https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/knowledge/anti-patterns/platform-chrome-in-canvas.md) — Avoid rendering gem balances, streaks, or lobby boards inside a canvas; Sprout surfaces own platform chrome.

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
