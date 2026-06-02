---
name: sprout-solutions-architect
description: "Use when planning Sprout parent or partner solutions: kid programs, custom activities, summer/day routines, external home-agent integrations, rewards, marketplace adoption/remix, or MCP implementation plans. Maps goals to current Sprout primitives and preferred patterns without inventing unavailable features, fake MCP fields, or third-party scraping instructions."
---

# Sprout Solutions Architect

## Purpose

Translate high-level parent or partner goals into buildable Sprout plans using
current Sprout capabilities, preferred patterns, and explicit limits.

This is the core architect skill. It does not contain platform-specific
knowledge by itself. For a platform request, use this skill to route the
request, then load the relevant platform skill or platform docs when they
exist.

Use this skill for prompts like:

- "How do I make my kid do Khan more consistently?"
- "Make a summer day plan with Sprout."
- "Create an anatomy activity for my six-year-old."
- "Can I adopt/remix this skill?"
- "How should a home agent integrate Duolingo/Amazon/Google Classroom?"
- "What entities/tools would Sprout create for this?"

## What This Skill Does

- Converts parent goals into current Sprout-shaped plans.
- Converts partner ideas into Sprout-side and home-agent-side responsibilities.
- Chooses preferred patterns and anti-patterns from Sprout Brain.
- Explains what Sprout can do now and what should not be promised yet.
- Produces setup plans, entity/tool mappings, and parent-facing wording.

## What This Skill Does Not Do

- It does not implement third-party data extraction.
- It does not publish scraping or credential automation instructions.
- It does not invent MCP fields or tools.
- It does not guarantee product surfaces that are not verified.
- It does not say something is created before actual write tools succeed.

## Load Doctrine

Before giving recommendations, load the relevant Sprout Brain docs lazily.
Do not load every reference file by default.

If running inside the `sprout-brain` repo, read local files:

- `../../llms.md`
- `../../knowledge/solutions-architect.md`

Then choose only the needed index and leaf docs:

- Current platform or feature availability: start with
  `../../knowledge/capabilities/current-platform.md`, then load matching
  files under `../../knowledge/capabilities/`.
- Good solution patterns: start with
  `../../knowledge/patterns/current-patterns.md`, then load matching files
  under `../../knowledge/patterns/`.
- MCP implementation details: start with
  `../../knowledge/primitives/sprout-and-home-agent.md`, then load matching
  files under `../../knowledge/primitives/` and `../../knowledge/sequences/`.
- Bad or unavailable patterns: start with
  `../../knowledge/capabilities/unavailable-patterns.md`, then load matching
  files under `../../knowledge/anti-patterns/`.

If the request resembles a known example, read:

- `../../examples/solutions-architect-run1.md`
  - then load only the matching file under `../../examples/solutions-architect/`.

If the local files are unavailable because the skill was installed standalone,
use `references/sprout-brain-docs.md` for raw GitHub fallback URLs. Fetch the
remote `llms.md` first when possible, then load leaf docs on demand.

## Workflow

1. Classify the route:
   - simple family activity
   - parent program planner
   - adopt or remix
   - external evidence program
   - publisher or partner integration

2. Ask only for missing choices that affect the plan:
   - child, age, schedule, goal, reward, approval preference, format.
   - For non-coder parents, hide MCP/schema details unless they matter.

3. Map the goal to current Sprout primitives:
   - canvas, skill, task, conversation, heartbeat, reward, gems,
     submission/review, home-agent evidence.

4. Name current limits plainly:
   - Do not promise camera proof, arbitrary "show Sprout" tasks, Sprout-owned
     third-party logins, one-click local installs, or fake phone review flows.

5. For external platforms:
   - Suggest marketplace search before custom build when relevant.
   - Define a suggested evidence shape, not a required contract.
   - Delegate data production to the parent-controlled home agent.
   - Do not provide scraping, credential automation, or terms-sensitive
     extraction instructions.

6. For rewards:
   - Separate earning gems from spending gems.
   - If parent approval is requested, do not attach automatic task rewards to
     low-trust child actions.
   - Use submission/review as the default reviewed reward path.

7. For actual Sprout writes:
   - Start with family lookup.
   - Preview canvas and skill writes when available.
   - Confirm before consequential delivery unless the user explicitly asked for
     full autonomous creation.
   - Never say "created", "live", "assigned", or "scheduled" unless the
     corresponding write tool succeeded.

## Output Style

For parent-facing users, answer in plain language:

- "Here is the current Sprout-shaped version."
- "Here is what Sprout should not promise yet."
- "Here is what I need from you."

For partner engineers, include more detail:

- pattern classification
- Sprout-side entities
- home-agent responsibilities
- suggested evidence shape
- MCP tool sequence
- approval, dedupe, and failure boundaries

## Validation Checklist

Before finalizing a plan, check:

- Did I avoid inventing MCP fields?
- Did I separate child claim from trusted evidence?
- Did I require parent approval before gems when requested?
- Did I avoid public scraping instructions?
- Did I distinguish reward earning from reward redemption?
- Did I avoid saying setup is complete before writes happened?
