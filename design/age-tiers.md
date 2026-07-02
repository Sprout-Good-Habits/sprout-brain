# Age-Tier Adaptation

Read the tier once on load and branch layout + content on it:

```js
let tier = 'tier2';
try { tier = (await sprout.whoami()).ageTier; } catch (e) {}
```

`whoami` also gives `childName` — greet with it on the intro screen.

## The table

| Aspect | tier1 (4-6) | tier2 (7-9) | tier3 (10+) |
| --- | --- | --- | --- |
| Choices on screen | ≤3 | 3-4 | 4-6 |
| Touch targets | ≥56px, generous gaps | ≥48px | ≥44px |
| Text per screen | one short line, emoji-first | 1-2 sentences | short paragraphs OK |
| Reading dependence | none — TTS reads every prompt aloud + speaker replay button | TTS on request (speaker button) | text-first |
| Rounds / session length | 5-8 rounds, ~3-5 min | 8-12 rounds | 10+ or timed |
| Difficulty ramp | start easiest, ramp only on streaks, drop fast on misses | balanced ramp | steeper ramp, streak bonuses |
| Feedback | heavy positive: flash + TTS praise + signals on every correct | standard banner flow | terser; streaks and stats carry the reward |
| Wrong answers | 2 tries then friendly reveal; never blocking | 1-2 tries then reveal | 1 try; show explanation |
| Hero emoji / mascot | big and frequent | present | sparing |
| Numbers/score UI | dots or stars, not digits | digits fine | digits + stats |

## Rules of thumb

- **Tier1 is the floor for polish** — if the canvas works for a pre-reader
  (speakable prompts, tap-only, nothing depends on reading), higher tiers only
  need denser content, not new mechanics.
- **Adapt content, not chrome** — the toolbar/progress/feedback skeleton stays
  identical across tiers; what changes is choice count, text density, rounds,
  and read-aloud.
- **Never gate completion on reading or typing for tier1.** Typing inputs are
  tier2+; tier1 answers are taps.
- **Session length beats difficulty** — a tier1 kid should finish in one
  sitting; `sprout.state` resume is the safety net, not the plan.
