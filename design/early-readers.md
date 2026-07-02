# Early Readers — Voice + Many Buttons Without Clutter

How a canvas serves a kid who can't read (yet) when the screen needs a
read-aloud affordance PLUS per-activity action buttons. This is the tier1
interaction layer on top of the archetypes; `age-tiers.md` has the sizing
table, this doc has the behavior.

Grounded in the published research and shipped-app conventions (NN/g child UX
program, Sesame Workshop's preschool touch-tablet guidelines, WCAG 2.2, Khan
Academy Kids / Duolingo ABC / Starfall / Epic patterns). Evidence anchors at
the bottom; full reports in the workspace project `canvas-early-reader-ui`.

## The core rule

**Clutter is solved by staging actions in TIME, not arranging them in SPACE —
and narration is a BEHAVIOR, not a button.**

A pre-reader never *finds* audio: the screen speaks first, automatically. The
kid's affordance is *re-hearing* (tap the prompt again), not initiating.
Multiple actions coexist by appearing at the moment they're usable, one cued
at a time — never by crowding the screen.

## The Speak-Then-Act loop

Every tier1 screen with a prompt runs this cycle:

1. **Enter → auto-speak the prompt.** Short — one or two sentences, the
   actionable clause LAST ("To pick your answer, tap a card!"). Kids act on
   the last thing they hear.
2. **While speaking: actions dimmed.** Choices and CTA visible but muted
   (opacity + pointer-events off) — one thing happens at a time. The prompt
   card shows a speaking state.
3. **Speech over → activate + cue.** Un-dim, then give the expected next
   control ONE attention cue: `animate-pop` when there's a single right next
   step, a gentle `animate-pulse` when it's a free choice.
4. **Idle → re-prompt, don't wait.** 6–8s of no taps → re-speak a SHORT hint
   ("Tap the moon!") and pulse the target. This replaces a help button. Stop
   after 2 re-prompts.
5. **Tap a choice → speak its label + select it.** Selection is not
   submission — the primary CTA confirms. A wrong tap costs nothing.
6. **Tap the prompt card anytime → stop current speech, replay.**
7. **Feedback banner speaks its verdict** ("You got it! The moon comes out at
   night.") and, as always, owns the only active button while shown.

**Timing caveat:** `sprout.tts.speak` resolving means the host *accepted* the
request — NOT that audio finished (see `../canvas/sdk.md` → Buddy voice). Time
the dim window from a word-count estimate, capped, and un-dim immediately if
`speak` rejects (web preview). Audio must never be load-bearing: the screen is
fully usable with sound off.

## The zoning contract

Identical on every canvas — kids navigate by muscle memory, and moving a
control between screens breaks it.

```
┌─────────────────────────────────┐
│ 🔊?  ▓▓▓▓░░░ progress      ⭐ 5 │ ← top-toolbar: chrome only
│ ┌─────────────────────────────┐ │
│ │ 🔊  Which one is the moon?  │ │ ← PROMPT CARD: speaker chip + text.
│ └─────────────────────────────┘ │   The WHOLE CARD is the replay target.
│   [ 🌙  moon ]                  │
│   [ ☀️  sun  ]                  │ ← choices: ≤3 (tier1), big, isolated
│   [ ⭐  star ]                  │
│                                 │
│ [       I picked it! ✓        ] │ ← ONE primary, full-width, bottom
└─────────────────────────────────┘
```

- **Top toolbar = chrome only** (progress, score). Never an activity action.
  The archetypes' toolbar `btn-util` 🔊 is fine as a persistent signpost, but
  it must not be the *only* replay path.
- **Prompt card carries the voice.** 🔊 chip at the leading edge, prompt text
  beside it, whole card tappable (≥56px tall). Kids minesweep and tap the
  *text*, not a 44px icon — Starfall/Khan Kids tap-the-text convention. Card
  highlights while speech plays so audio always has a visual twin.
- **Choices in the center**, ≤3 for tier1 (working memory at 4–6 ≈ half an
  adult's), `list-item` rows or big `x-` tiles, generous gaps.
- **Exactly one primary CTA**, full-width at the bottom of the flow, inset by
  the body's padding. No *small* targets near the physical bottom edge —
  kids' wrists rest there (Sesame) — a full-width `btn-lg` with padding is
  fine, an icon row is not.
- **Secondary budget: one `btn-secondary`, visually quiet — or zero.**
  Anything else is staged (appears only in the state where it's usable, with
  a pop-in + spoken intro — its arrival is the tutorial) or belongs on
  another screen. A screen that "needs" 5+ peer buttons has an
  activity-design problem: split it into steps (one mechanic per screen,
  Duolingo-style).

**Banned for tier1:** overflow/hamburger menus, FAB/speed-dials, gesture
radial menus, idle-hiding of actionable chrome (hidden = nonexistent to a
kid), drag on the critical path, double-tap/long-press (except deliberate
friction gates), abstract icons, and any action whose meaning requires
reading.

## Read-aloud affordance spec

- **Icon:** 🔊 (TossFace), same slot on every screen (for a pre-reader the
  icon IS the label — it's learned once, so never vary it).
- **Targets:** whole prompt card ≥56px tall; any standalone speaker button
  ≥48px with ≥8px clearance from other targets.
- **States:** idle → speaking (card tinted `--brand-50` / border
  `--brand-300`, chip may `animate-pulse`) → idle. Block-level highlight only:
  the SDK has no word-timing callbacks, so word-by-word karaoke is not
  buildable today (roadmap candidate).
- **Single stream:** `try { await sprout.tts.stop() } catch {}` before every
  `speak`, on screen transitions, and before `complete`.
- **Spoken path for everything actionable:** prompt auto-speaks, choices
  speak on tap, feedback speaks its verdict. If a tier1 element has no spoken
  path, the kid can't act on it — cut it or speak it.
- **Autoplay is OK here:** the kid opening the activity is the consent
  moment, TTS routes through the host buddy (no browser gesture policy), and
  a tap anywhere interrupts. Keep entry narration ≤2 sentences.
- **Tier fade:** tier1 auto-speaks every prompt; tier2 speaks on request
  (speaker affordance stays); tier3 text-first, speaker available.

## Drop-in implementation

Analyzer-clean layer to paste into any archetype skeleton (uses only injected
classes/tokens; `say`/`el` helpers as in the archetypes):

```html
<style>
  .x-prompt { display: flex; gap: var(--spacing-lg); align-items: center;
    min-height: 56px; cursor: pointer; }
  .x-prompt-glyph { font-size: 28px; line-height: 1; }
  .x-prompt.x-speaking { background: var(--brand-50);
    border-color: var(--brand-300); }
  .x-frozen { opacity: 0.4; pointer-events: none;
    transition: opacity 200ms ease; }
</style>

<div class="card x-prompt" id="prompt-card" onclick="replayPrompt()">
  <span class="tf x-prompt-glyph">🔊</span>
  <h2 id="qtext" style="margin:0;">…</h2>
</div>
```

```js
let sttTimer = null, sttNags = 0, currentPrompt = '', currentHint = '';

function speakThenAct(text, hint, cueEl) {
  currentPrompt = text; currentHint = hint || text; sttNags = 0;
  freeze(true);
  el('prompt-card').classList.add('x-speaking');
  const estimate = Math.min(1200 + text.split(/\s+/).length * 320, 6000);
  let unfrozen = false;
  const unfreeze = () => {
    if (unfrozen) return; unfrozen = true;
    el('prompt-card').classList.remove('x-speaking');
    freeze(false);
    if (cueEl) cueEl.classList.add('animate-pop');
    armReprompt(cueEl);
  };
  try {
    sprout.tts.stop().catch(function(){});
    sprout.tts.speak({ text }).catch(unfreeze); // preview rejects → usable now
  } catch (e) { unfreeze(); }
  setTimeout(unfreeze, estimate); // resolve ≠ "audio done" — estimate rules
}

function freeze(on) {
  document.querySelectorAll('.x-actions')
    .forEach(n => n.classList.toggle('x-frozen', on));
}

function replayPrompt() { speakThenAct(currentPrompt, currentHint); }

function armReprompt(cueEl) {
  clearTimeout(sttTimer);
  if (sttNags >= 2) return; // don't nag forever
  sttTimer = setTimeout(() => {
    sttNags += 1;
    say(currentHint);
    if (cueEl) { cueEl.classList.remove('animate-pulse');
      void cueEl.offsetWidth; cueEl.classList.add('animate-pulse'); }
    armReprompt(cueEl);
  }, 7000);
}

document.addEventListener('pointerdown',
  () => { clearTimeout(sttTimer); }, true);
```

Wrap the choice container and CTA in `class="x-actions"`; call
`speakThenAct(q.prompt, 'Tap your answer!', el('answers'))` wherever the
archetype currently does `if (tier === 'tier1') say(q.prompt)`; keep `say()`
for one-shot lines (choice labels, feedback verdicts).

## Golden examples

`../examples/canvas/early-reader/` — complete, analyzer-clean canvases
demonstrating the pattern end-to-end:

- `quiz-tier1.html` — the canonical Speak-Then-Act quiz screen.
- `reading-tier1.html` — read-to-me passage, per-block replay + highlight.
- `lobby-multiaction.html` — the hard case: a lobby that genuinely needs
  several actions, handled by staging + one-primary discipline instead of a
  button pile.

## Evidence anchors

- Narration autoplays, never behind a button: Sesame Workshop 2012; Khan
  Kids; Duolingo ABC; Code.org pre-reader autoplay mode.
- Replay embedded in content, not chrome: Starfall tap-the-sentence; Khan
  Kids tap-anything; Endless Alphabet touch-the-letter.
- Freeze-then-glow, one action at a time: Sesame doctrine ("hot spots frozen
  until the page has been read", glow/sparkle cue after).
- Idle re-prompt replaces help: Sesame 3–5s (stories) / 6–8s (games).
- ≤3–5 choices: working memory at 4–6 ≈ half adult (Gathercole 2004);
  4-vs-16-toys engagement effect (Dauch 2018); Google kids guidance.
- 2cm targets, nothing small at the bottom edge: NN/g (a 5mm button defeated
  7-year-olds); Sesame wrist-rest finding.
- Audio never travels alone: only ~17% of 4–6s follow audio-only prompts
  (Yadav & Chakraborty 2020) — every utterance gets a synced visual.
- Speaker icon alone is unvalidated as discovery for pre-readers (research
  gap) — hence autoplay + whole-card target, icon as learned signpost.
- Hidden = nonexistent; kids navigate by spatial muscle memory: NN/g; hence
  the fixed zoning contract and no overflow menus.
