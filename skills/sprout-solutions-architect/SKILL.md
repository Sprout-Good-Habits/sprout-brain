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
   - recurring home-agent loop (see Loops)
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

## Loops (recurring home-agent orchestration)

A **loop** is a `category: "home_agent"` skill of `mode: loop` plus **bound
inputs**, run recurringly by an external BYOA runner (the parent's Claude
Code / Codex / Cursor / custom agent) on the agent's own machine. Sprout is
the ledger, the review gate, and the kid surface — it never runs the loop.
Identity key is (family, skill, canonical inputs hash), so **per-kid loops are
the same skill adopted with different inputs** ("Khan Quest — Ben" and
"— Gabe" are one skill, two loops). This is the productized form of the
home-agent maintenance loop in
`../../knowledge/capabilities/home-agent-boundary.md`.

This is the SPR-2040 protocol. Design a loop when it fits, but verify ship
state against `../../knowledge/capabilities/current-platform.md` before
telling a partner the `loop.*` verbs are live, and never report a loop as
running until its write verbs actually succeed.

### When to recommend a loop vs a heartbeat vs a one-off task

- **Loop** — a recurring **freshness / maintenance** need (review progress,
  regenerate drills, bridge external evidence) AND a BYOA runner is present to
  do the off-server work. The agent owns cadence and intelligence; the work
  needs local capability (a logged-in browser, heavy models, files) Sprout
  cannot host.
- **Heartbeat** — Sprout runs the recurrence **server-side** for a kid:
  scheduled delivery or a parent-facing result post, ≤4/day, **no local
  dependencies and no `canvas.update`** (the scheduled executor has no canvas
  tools). See `../../knowledge/capabilities/heartbeat.md`.
- **One-off task** — a single kid activity with no recurrence.

Rule of thumb: recurring **delivery** → heartbeat / recurring task
(Sprout-side); recurring **maintenance that regenerates content or bridges
external state** → loop (home-agent-side).

### The lifecycle you may plan

1. **Author the skill** — `skill.write` a `mode: loop` `home_agent` skill with
   a `goal` (parent-set, supports `{{input.kid}}`), `inputVariables`, and the
   **rhythm as prose in the body + goal** ("every evening", "after Jay's
   lesson") — there is no structured cadence column.
2. **Adopt** — the runner calls `skill.invoke(skillId, input)`; the first
   invoke mints the loop record + `loopId`, idempotent per (family, skill,
   inputs hash). Render-only, no kid effect.
3. **Register the runner** — `runner.register(handle, kind, …)` returns a
   `runnerId`, idempotent per (grant, handle). **Reuse-first, server-first:**
   the adopt response's `runners[]` is authoritative — an online runner means
   its cron is definitionally firing; reuse it instead of standing up another.
4. **Bind** — `loop.bind(loopId, runnerId)` sets the intended manager before
   any wake races for it (bind where the loop's local dependencies live).
5. **Operate (per run)** — the runner wakes and follows the guided chain:
   `loop.listDue(runnerId)` → `loop.claim(loopId, runnerId)` (TTL lease) →
   `skill.invoke(loopId)` (renders with the loop's own inputs + goal) → do the
   work, landing **kid-visible writes through the existing gated verbs**
   (`task.create` / `canvas.update` / `gems.adjust`) → `loop.submitResult`
   (pure ledger close: status + stableHash + changeLog + declared `nextDueAt`).

Inputs are **immutable** — they are part of the identity key, so changing who a
loop is for = adopt a NEW loop, never an edit.

### What you must NEVER invent for a loop

- **Server-side scheduling.** Sprout schedules nothing; the agent's cron is the
  only clock, `listDue` is a pure query. Never design "Sprout will run this
  every night."
- **A parent-app agent maintaining a loop.** The in-app agent has no OAuth MCP
  surface (401 at `/mcp`), no durable runtime, and would move cost back onto
  Sprout. Only an external BYOA runner maintains a loop.
- **Un-gated kid writes.** Every kid-visible change still passes the normal
  publish / review gate. A loop proposes; Sprout decides what a child sees.
- **LLM-composed server responses.** All server strings (instructions, labels,
  refusals) are deterministic templates with slots. Don't promise "Sprout will
  summarize/decide."
- **Real-time connectivity / presence pings.** Liveness is a `lastActiveAt`
  timestamp with a derived `staleAfter`, not a live socket.
- **Parent thread replies steering a running loop.** Deferred
  (designed-not-dead). Do not promise in-app replies reach the runner yet.
- **Cadence below the server floor.** `nextDueAt` is agent-declared but clamped
  to `cadenceFloor`; don't design sub-floor loops.

### Where the parent steers (Option A)

The parent app is **read + bounded controls only** (status, pause, run-now). A
parent does not program a loop from the app — **steering happens through the
home agent** over MCP: "too hard" → the agent edits the goal / body and the
next render picks it up; "also for Ben" → a new loop (inputs are immutable);
"why did it stop?" → the agent reads `loop.status` / `loop.history` and
narrates the typed truth. Full playbooks live in the loop-authoring guide
(genesis interview + steering map) and the loop-runner guide (durable runner
construction).

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
- For a loop: did I keep scheduling on the agent's cron, never server-side?
- For a loop: did I treat inputs as immutable (new loop for a new kid, not an
  edit) and route kid-visible writes through the existing gated verbs?
- Did I avoid saying setup is complete before writes happened?
