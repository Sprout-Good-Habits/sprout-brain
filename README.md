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
└── canvas/
    └── sdk.md    # the window.sprout.* contract for Sprout-served canvases
```

Future siblings: `mcp/`, `design/`, `voice/`, `skill-authoring/` — same shape.

## How agents consume it

`llms.md` at the root is the machine entry point. An agent reads `llms.md`
first, scans the one-liners to find the doc it needs, then fetches that doc
directly. This follows the emerging `llms.txt` convention (we use `.md` so it
renders on GitHub).

A doc URL is its raw GitHub path, e.g.:

```
https://raw.githubusercontent.com/Sprout-Good-Habits/sprout-brain/main/canvas/sdk.md
```

## Contributing

- One folder per domain. Don't nest beyond two levels without a reason.
- Every new doc gets a line in `llms.md` — URL plus a one-sentence summary.
- Docs are the contract. If behavior and the doc disagree, fix one of them.

## Status

Private during initial build-out. Goes public once the first wave of docs is
complete.
