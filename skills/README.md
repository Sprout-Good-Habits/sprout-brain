# Sprout Brain Skills

Installable skills are the agent-facing entry points for Sprout Brain.

The docs under `knowledge/`, `examples/`, and `evals/` are the source of
truth. Skills are thin wrappers that tell an agent when to use that knowledge,
which docs to load, and how to apply it.

## Skill types

### Core architect skill

`sprout-solutions-architect` is the general planner/router.

Use it when a parent or partner asks how to make something happen with Sprout:

- kid programs and routines
- custom activities
- rewards and gems
- skills marketplace adoption/remix
- external home-agent integrations
- Sprout MCP implementation plans

It decides which pattern, primitive, capability, anti-pattern, example, or eval
doc to load. It should not load the entire brain into context.

### Canvas skill

`canvas-planner` plans a canvas's design before it is authored, so the resulting
kid-facing HTML follows the Sprout child design language instead of ad-hoc
styling. It stages the `design/` domain docs — always `design/checklist.md` +
one `design/archetypes/*.md` skeleton (+ `canvas/sdk.md` for behavior) — and
produces a slot-fill plan: archetype, the skeleton to copy, data-block content,
tier adaptations, and the polish-checklist commitment.

Use it before building any canvas activity.

### Platform skills

Platform skills live under `skills/platforms/`.

A platform skill captures what people expect from that external platform and
how those expectations should map into Sprout.

Examples:

- Khan Academy: learning consistency, mastery, weak-area review, parent-visible
  progress, reward motivation.
- Duolingo: language practice consistency, streaks, lesson completion,
  fluency progress, parent encouragement.
- Amazon or shopping platforms: parent-curated rewards, wishlists, prices,
  item availability, child-visible savings goals.
- Google Classroom or school systems: assignments, due dates, grades,
  missing-work alerts, parent action prompts.

Platform skills should be playbooks, not magic. They should describe:

- common parent expectations
- useful progress or evidence signals
- preferred Sprout patterns
- suggested home-agent evidence shapes
- setup interview questions
- what Sprout should not promise
- what the home agent is responsible for

Platform skills must not publish scraping recipes, credential automation,
selectors, bypass instructions, or terms-sensitive extraction details.

## Installation

See "Install Sprout Brain skills" in the [root README](../README.md) — it
covers the one-command install (`npx skills add Sprout-Good-Habits/sprout-brain`),
the Claude Code plugin marketplace, Hermes, OpenClaw, a zero-prerequisite
fallback for any agent, and the clone-based Python installer for contributors.

## Expected user experience

A parent should be able to ask:

```text
Hey Sprout, I wish my child would do learning platform math work more
consistently. How do I make that happen with you?
```

The architect skill should:

1. classify the request
2. load the relevant pattern and platform docs
3. explain the current Sprout-shaped version
4. name unavailable/future behavior honestly
5. ask only for choices that affect setup
6. map the plan to Sprout entities and tools when needed

It should not imply that Sprout owns the external platform connection. For
external services, the public skill defines expectations and suggested evidence
shapes; the parent-controlled home agent decides how to produce evidence.
