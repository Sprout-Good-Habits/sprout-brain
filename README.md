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
├── canvas/
│   └── sdk.md    # the window.sprout.* contract for Sprout-served canvases
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

Future siblings: `mcp/`, `design/`, `voice/`, `skill-authoring/` — same shape.

## Install Sprout Brain skills

Sprout Brain skills can be installed into Codex, Claude Code, or both.

Prerequisites:

- Git
- Python 3
- Codex and/or Claude Code installed locally
- Access to this repo

Clone the repo:

```bash
git clone https://github.com/Sprout-Good-Habits/sprout-brain.git
cd sprout-brain
```

Preview what will be installed:

```bash
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target all --dry-run
```

Install for both Codex and Claude Code:

```bash
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target all
```

Install for only one tool:

```bash
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target codex
```

```bash
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target claude
```

The installer copies Sprout Brain skill folders into the standard local skill
directories for Codex and Claude Code. Existing Sprout skill folders are backed
up before replacement.

After installing, start a new Codex or Claude Code session so skill metadata is
reloaded. Then try:

```text
Use $sprout-solutions-architect to help me plan a Sprout activity.
```

To update later:

```bash
cd sprout-brain
git pull
python skills/install-sprout-partner-skills/scripts/install_sprout_partner_skills.py --target all
```

Start a new Codex or Claude Code session after updating.

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
