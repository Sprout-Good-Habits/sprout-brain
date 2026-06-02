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

Manual local install for both Codex and Claude Code:

```bash
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target all
```

Install only Codex:

```bash
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target codex
```

Install only Claude Code:

```bash
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target claude
```

First-time bootstrap installs can copy or install this folder:

```text
Sprout-Good-Habits/sprout-brain/skills/install-sprout-partner-skills
```

After the installer skill is available, use it to install or update the rest of
the Sprout Brain skills for Codex, Claude Code, or both.

After installing, start a new Codex or Claude session so the skill metadata is
loaded.

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
