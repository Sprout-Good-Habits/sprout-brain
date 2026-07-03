---
name: install-sprout-partner-skills
description: "Use when installing or updating Sprout Brain partner engineering skills for local coding agents such as Codex and Claude Code. Supports choosing Codex, Claude, or all supported targets; installs Sprout skill folders from sprout-brain into each tool's local skills directory."
---

# Install Sprout Partner Skills

## Purpose

Install or update Sprout Brain skills for local agent tools.

Use this skill when the user says things like:

- "Install Sprout partner engineering skills."
- "Update my Sprout skills."
- "Install the Sprout architect skill for Claude and Codex."
- "Set up Sprout Brain skills on this machine."

## Targets

Supported local targets:

- Codex: `${CODEX_HOME:-$HOME/.codex}/skills`
- Claude Code: `${CLAUDE_HOME:-$HOME/.claude}/skills`

If the user does not specify a target, ask whether to install for:

- Codex only
- Claude only
- both Codex and Claude

Prefer both when the user says "all", "everything", "Claude and Codex", or
asks for a general local setup.

## What Gets Installed

Install all Sprout Brain skill folders under `skills/` that contain a
`SKILL.md`, including:

- `sprout-solutions-architect`
- `canvas-planner`
- `install-sprout-partner-skills`
- future platform skills under `skills/platforms/`

Do not install non-skill docs such as `knowledge/`, `examples/`, or `evals/`.
The skills reference those docs through `llms.md` and raw GitHub fallback URLs.

## Prefer the no-clone paths when there is no local repo

If there is no local `sprout-brain` checkout, do NOT clone just to install.
Use one of these instead (details in the repo README's "Install Sprout Brain
skills" section):

- Any agent with Node.js: `npx skills add Sprout-Good-Habits/sprout-brain`
- Claude Code: `/plugin marketplace add Sprout-Good-Habits/sprout-brain` then
  `/plugin install sprout-skills@sprout-brain`
- No prerequisites at all: download
  `https://github.com/Sprout-Good-Habits/sprout-brain/archive/refs/heads/main.zip`,
  extract, and copy each `skills/` folder containing a `SKILL.md` into the
  target tool's user-level skills directory.

The script workflow below is for machines that already have the repo cloned.

## Workflow

1. Resolve the `sprout-brain` repo root.
   - If running inside the repo, use the current working directory.
   - Otherwise, prefer a no-clone path above; fall back to asking the user for
     the local repo path.

2. Determine install target.
   - If the user named Codex, Claude, or both, use that.
   - If not, ask a short target question before installing.

3. Run the installer script.

Examples:

```bash
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target all
```

```bash
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target codex --skills sprout-solutions-architect
```

```bash
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target claude --dry-run
```

4. Tell the user what was installed and where.

5. Remind the user to start a new Codex or Claude session so skill metadata is
   reloaded.

## Safety

- Use `--dry-run` when the user wants to preview.
- Existing installed skill folders are moved to timestamped backups before
  replacement.
- Do not delete unrelated skill folders.
- Do not install platform credentials, private family data, or local automation
  scripts that are not part of the public Sprout Brain skill folders.
