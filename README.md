# Sprout Brain

Canonical reference docs for agents building on Sprout.

This repo is the single place where Sprout's machine-facing contracts live —
SDK surfaces, design language, voice, skill-authoring conventions. When an
agent (a Claude session, a code assistant, an automation) needs to know how
some part of Sprout works, it reads from here.

## What lives here

Each domain gets its own folder so new docs slot in without reshuffling:

```
sprout-brain/
├── README.md     # this file — human-facing orientation
├── llms.md       # agent index — every doc as a URL + one-liner
├── .claude-plugin/   # Claude Code plugin-marketplace manifests
├── canvas/
│   └── sdk.md    # the window.sprout.* contract for Sprout-served canvases
├── design/       # the kid design language for canvases
│   ├── README.md         # freshness contract + reading order
│   ├── checklist.md      # ship gate (mirrors the server analyzer)
│   ├── components.md     # injected component API
│   ├── tokens.md         # GENERATED token reference
│   ├── layout.md · motion.md · age-tiers.md
│   ├── archetypes/       # copy-paste screen skeletons (quiz, sorting, …)
│   └── generated/        # GENERATED class/token inventory (lint target)
├── scripts/
│   └── sync-design-inventory.mjs  # generate tokens/inventory + lint design docs
├── skills/
│   ├── README.md
│   ├── sprout-solutions-architect/
│   │   └── SKILL.md
│   └── platforms/
├── knowledge/
│   ├── capabilities/
│   ├── anti-patterns/
│   ├── primitives/
│   ├── patterns/
│   └── sequences/
├── examples/
└── evals/
```

Future siblings: `mcp/`, `voice/`, `skill-authoring/` — same shape.

## Install Sprout Brain skills

This repo is public — no GitHub account, no clone needed. The only real
prerequisite is the agent app itself. Pick the path for your tool:

### Any agent, one command (recommended)

Works for Claude Code, Codex, Cursor, Gemini CLI, Windsurf, Copilot, and
~50 other tools. Needs Node.js (and git) installed:

```bash
npx skills add Sprout-Good-Habits/sprout-brain
```

The CLI detects which agents you have and installs into each one's skill
directory. Update later with `npx skills update`.

### Claude Code (no terminal)

Type inside Claude Code:

```text
/plugin marketplace add Sprout-Good-Habits/sprout-brain
/plugin install sprout-skills@sprout-brain
```

This installs the skills together with the knowledge docs they load, so they
work fully offline. Update later with `/plugin marketplace update sprout-brain`
— or enable auto-update for the `sprout-brain` marketplace in the `/plugin`
menu once, and updates install themselves whenever Claude Code starts.

### Hermes

Hermes installs single skills straight from any public GitHub repo
([docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)):

```bash
hermes skills install Sprout-Good-Habits/sprout-brain/skills/sprout-solutions-architect
hermes skills install Sprout-Good-Habits/sprout-brain/skills/canvas-planner
```

### OpenClaw

OpenClaw's `git:` installer expects `SKILL.md` at the repo root, which doesn't
match this repo's layout — use the fallback prompt below instead (skills go in
`<workspace>/skills/`, or `~/.openclaw/skills/` for all agents).

### Fallback: any agent, zero prerequisites (Windows-friendly)

If a command above complains about git, Node, or anything else, paste this
into your agent instead — it needs nothing but the agent:

```text
Download https://github.com/Sprout-Good-Habits/sprout-brain/archive/refs/heads/main.zip,
extract it, and copy each folder under skills/ that contains a SKILL.md into
your own user-level skills directory (Claude Code: ~/.claude/skills/,
Codex and agentskills-standard tools: ~/.agents/skills/, Cursor: ~/.cursor/skills/,
Hermes: ~/.hermes/skills/, OpenClaw: ~/.openclaw/skills/; on Windows the same
paths under %USERPROFILE%). Tell me what you installed.
```

### From a clone (contributors)

If you already work in this repo, the original installer still works and needs
Python 3:

```bash
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target all --dry-run
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target all
```

It copies skill folders into `~/.claude/skills/` and `~/.codex/skills/`,
backing up anything it replaces.

### After installing

Start a new session in your agent so skill metadata reloads, then try:

```text
Use sprout-solutions-architect to help me plan a Sprout activity.
```

## How agents consume it

`llms.md` at the root is the machine entry point. An agent reads `llms.md`
first, scans the one-liners to find the doc it needs, then fetches that doc
directly. This follows the emerging `llms.txt` convention (we use `.md` so it
renders on GitHub).

Docs should support lazy loading. Prefer small standalone files with clear
titles over large omnibus references. Keep aggregate files as indexes that
point to leaf docs; do not rely on an agent remembering details from a broad
context dump.

A doc URL is its raw GitHub path, e.g.:

```
https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/canvas/sdk.md
```

## Contributing

- One folder per domain. Don't nest beyond two levels without a reason.
- Every new doc gets a line in `llms.md` — URL plus a one-sentence summary.
- Large domains should have an index file plus small leaf docs so agents can
  search and load only the needed pattern, primitive, capability, example, or
  anti-pattern.
- Docs are the contract. If behavior and the doc disagree, fix one of them.

## Status

Private during initial build-out. Goes public once the first wave of docs is
complete.
