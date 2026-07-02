# Canvas Worked Patterns — distilled from six production canvases

Engine patterns proven by six shipped, QA'd, production canvases (a tier1
Korean-literacy track: trace-letters, write-words, build-syllables,
sound-match, picture-pairs, letter-paint) that run under a live nightly
content-update loop. Read this AFTER picking an archetype skeleton
(`../design/archetypes/`) and BEFORE writing engine code. Every snippet below
is copied from the shipped files — copy the shape, swap the content.

Division of labor with the other docs: `../design/` owns how a canvas LOOKS,
`sdk.md` owns the API contract, this doc owns how a long-lived canvas ENGINE
is structured so that content can be regenerated, state survives resume, and
the server analyzer grades it correctly.

Last verified: 2026-07-02.

## 1. The LESSON data seam

**All regenerable content lives in ONE delimited block near the top of the
script. Engine code never hardcodes content.** This is the single seam a
content-update agent (see §9) is allowed to rewrite via `canvas.update` — it
regenerates the text between the markers and nothing else, so engine bugs
can't be introduced by a content refresh.

```js
/* LESSON-START */
var LESSON = {
  v: 1,                      // lesson version — the coach bumps this
  level: 1,                  // curriculum level
  lang: "ko",                // "ko" | "en" — engine honors both (§6)
  items: [
    { id: "g1", char: "ㄱ", name: "기역", sound: "g" },
    { id: "n1", char: "ㄴ", name: "니은", sound: "n" }
  ]
};
/* LESSON-END */
```

Rules:

- Everything renders from `LESSON`. If a string the kid sees isn't in the T
  table (§6), it belongs in `LESSON.items`.
- Keep the engine robust to `items` arrays of length 1..12; guard empty (§5).
- **Version-mismatch reset**: persisted state can outlive the lesson that
  produced it (the coach updates content between runs). Track the lesson
  version in state and reset board-shaped state when it changes:

```js
S.lv = S.lv || 0;
// Lesson changed under us (coach update) or stale layout → reset the board.
if (S.lv !== LESSON.v || !layoutValid()) {
  S.lv = LESSON.v;
  S.layout = freshLayout();
  S.matched = [];
  S.done = [];
  S.moves = 0;
  S.miss = 0;
}
```

Reset only the state that describes the OLD content (layout, per-item
progress). Never reset `S.t0`-style bookkeeping you still want.

## 2. ASCII-only state keys, canonical schema

**Every key in `sprout.state` — and every `id` in `LESSON.items` — is pure
ASCII. Localized text goes in VALUES only.** A historic iOS bridge bug mangled
non-ASCII dictionary KEYS; it's fixed, but the convention keeps canvases
compatible with older installed builds, and it makes run data trivially
greppable/joinable by the content-update agent.

```js
// ✗ WRONG — Korean key
S.results["ㄱ"] = 0;

// ✓ RIGHT — ASCII id key, Korean in the value
S.done.push({ id: "g1", item: "ㄱ", mistakes: 0, at: Date.now() - S.t0 });
```

Canonical schema every canvas in the family uses (extend it, don't rename it —
the content-update agent reads `data.done` across ALL canvases):

```js
var S = sprout.state;           // ASCII keys only — Korean lives in VALUES
S.v = S.v || 1;                 // state schema version
S.i = S.i || 0;                 // current item index
S.done = S.done || [];          // [{id, item, mistakes, at}] — item may be Korean (VALUE ok)
S.t0 = S.t0 || Date.now();
```

`id` values are stable lesson-item ids (`g1`, `w3`, `b2`, …) that survive
lesson regeneration, so mastery can be scored per item across runs. Also keep
keys ASCII in every object passed to `sprout.*` calls (`signal` props,
`complete` payloads).

## 3. Statically-analyzable completion

**Exactly ONE guarded `sprout.complete({...})` call site, with LITERAL object
keys at the call site.** The server analyzer parses the completion call
statically to learn that the canvas emits a score. If you pass a prebuilt
variable, the canvas registers `emitsScore: false` and every task referencing
it silently downgrades its grading rule to "attempt" — the kid gets
participation credit for a scored activity, and nothing errors.

```js
// ✗ WRONG — analyzer can't see the keys → emitsScore:false → grading
// silently downgrades to "attempt"
var opts = { score: S.done.length, total: IT.length, summary: buildSummary() };
sprout.complete(opts);

// ✓ RIGHT — literal score/total keys at the call site (values may be expressions)
function finish() {
  if (finished) return;
  finished = true;
  sprout.complete({
    score: S.done.length,
    total: Math.max(items().length, 1),
    summary: buildSummary()
  });
}
```

- One call site, one `finished` boolean guard. Helper functions may *build the
  summary string*, but the object literal with `score` / `total` keys sits
  inside `sprout.complete(...)` itself.
- `summary` is for the parent/coach: English framing with localized item
  values inline, e.g.
  `'Hangul tracing L' + LESSON.level + ': ' + S.done.length + '/' + IT.length + ' letters, ' + miss + ' mistakes (' + list.join(' ') + ')'`.

## 4. Signal choreography

**One vocabulary, fired at the same beats in every canvas**, so the host's
buddy reactions and the coach's stuck-detection behave consistently:

| Beat | Signal |
| --- | --- |
| each correct interaction | `sprout.signal('attempt-successful', { id: it.id })` |
| each miss | `sprout.signal('attempt-failed', { id: it.id, misses: n })` |
| 3 consecutive misses on one item | `sprout.signal('user-stuck', { id: it.id, misses: n })` (then help: re-speak the prompt, pulse the correct tile) |
| an item completed | `sprout.signal('milestone-reached', { id: it.id })` |
| ALL items done | `sprout.signal('celebration', { total: IT.length })` — once |

```js
function onItemDone(it, mistakes) {
  if (!isDone(it.id)) S.done.push({ id: it.id, item: it.char, mistakes: mistakes, at: Date.now() - S.t0 });
  if (S.done.length >= IT.length) {
    sprout.signal('celebration', { total: IT.length });
    showFinish(true);
  } else {
    sprout.signal('milestone-reached', { id: it.id });
    setNextEnabled(true);
  }
}
```

The celebration banner always carries a **visible finish button** wired to the
one completion call (§3) — never auto-complete-only; the kid taps out:

```html
<div class="feedback-banner fb-success" id="banner"
  style="display:none; position:fixed; bottom:0; left:0; right:0;" aria-live="polite">
  <div class="fb-header">
    <div class="fb-icon">🎉</div>
    <div class="fb-title" id="fb-title">참 잘했어요!</div>
  </div>
  <div class="fb-content"><div class="fb-desc" id="fb-desc">모든 글자를 다 썼어요!</div></div>
  <button id="finish" class="btn btn-success btn-lg" type="button">⭐ 다 했어요!</button>
</div>
```

## 5. The resume contract

**Boot handles four cases — fresh, mid-run resume, finished resume, empty
LESSON — and never renders a blank page.** The host seeds `sprout.state`
before your first line (see `sdk.md` → Canvas Memory); your init function is a
decision tree over that state:

```js
function init() {
  if (!items().length) { showScreen("empty"); return; } // empty LESSON → empty state + finish button
  if (S.i >= items().length) { showFinish(); return; }  // finished resume → quiet finish screen
  showScreen("game");
  renderItem();                                         // fresh OR mid-run resume
}
```

- **`sprout.resumed` gates the intro TTS** — greet on a fresh run only:
  `if (!sprout.resumed) say(T.intro);`
- **Finished-state resume is QUIET**: render the finish screen with its
  visible complete button, but re-fire no `celebration` signal and no
  celebratory TTS (`finishBoard(true /* quiet */)` in picture-pairs).
- **Skip already-done items on resume** when progress is per-item:
  `while (S.i < IT.length && isDone(IT[S.i].id)) S.i++;`
- **Empty LESSON renders an empty state PLUS a finish button** (the coach may
  legitimately ship an empty lesson between levels; the kid must still be able
  to exit through the one completion call):

```html
<div id="empty" class="empty-state" style="display:none;">
  <div class="empty-state-emoji" style="font-size:64px; line-height:1; height:64px;">🃏</div>
  <div class="empty-state-title" id="empty-title">카드가 없어요</div>
  <div class="empty-state-desc" id="empty-desc">No cards yet</div>
</div>
<button class="btn btn-success btn-lg" id="empty-finish" style="display:none;" onclick="doComplete()">⭐ 다 했어요!</button>
```

## 6. Engine/content multilingual split

**One engine serves every language; the language switch is data.** Chrome
strings (title, buttons, praise, empty-state copy) live in a T table keyed off
`LESSON.lang`; item strings live in `LESSON.items`. A content swap — Korean
track to English track — touches ONLY the LESSON block (§1).

```js
var T = LESSON.lang === "en"
  ? { title: 'Trace Letters', showBtn: '✏️ Show me', nextBtn: 'Next',
      perfect: 'Perfect!', good: 'Great job!',
      emptyTitle: 'No letters yet', emptyDesc: 'Your coach is preparing new letters.' }
  : { title: '한글 따라쓰기', showBtn: '✏️ 보여줘 (Show me)', nextBtn: '다음 (Next)',
      perfect: '완벽해!', good: '잘했어!',
      emptyTitle: '글자가 없어요', emptyDesc: '코치가 새 글자를 준비하고 있어요.' };
```

Where the *mechanic* differs per language, branch on `LESSON.lang` at the
geometry level, not by forking the engine — e.g. build-syllables renders a
Korean syllable-block frame for `"ko"` and a linear left-to-right slot row for
`"en"`, through the same slot/tile code path (§7.3).

## 7. Interaction-engine recipes

Four mechanics beyond the stock archetypes, with the geometry that makes each
work. Custom CSS in these is token-only (`var(--…)`) per the ship gate
(`../design/checklist.md`).

### 7.1 Flip-grid memory (picture-pairs)

Each lesson item becomes two cards — a word card and an emoji card — keyed
`id + "w"` / `id + "e"`. **Shuffle ONCE per fresh run and persist the order in
`S.layout`, so resume restores the exact same board** (a reshuffled board on
reopen destroys the memory the game is exercising). `S.matched` holds matched
pair ids; on resume matched cards render face-up with no animation
(`d.className += ' flipped matched'`). Validate the persisted layout against
the current lesson and reset on mismatch (§1's `layoutValid()` guard).
Geometry: 3/4-aspect cards, 2 columns up to 8 cards, 3 above; the flip is
`transform: rotateY(180deg)` on a `preserve-3d` inner div with two
`backface-visibility: hidden` faces. Mismatches are normal in a memory game —
signal `attempt-failed` gently (no shake), and `user-stuck` only every 6th
consecutive miss.

```js
function freshLayout() {
  var keys = [];
  LESSON.items.forEach(function (it) { keys.push(it.id + "w", it.id + "e"); });
  for (var i = keys.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = keys[i]; keys[i] = keys[j]; keys[j] = tmp;
  }
  return keys;
}
S.layout = S.layout || [];   // persisted → resume restores the exact board
```

### 7.2 Coverage painting (letter-paint)

Free-form painting graded by pixel coverage of a glyph. Build a **mask** from
an offscreen canvas with the letter drawn via `fillText` (alpha > 60 ⇒ glyph
pixel; count those as `maskCount`). The kid paints on a visible 2D canvas
under a pointer-events-none SVG outline of the same glyph. 2D canvas has no
text clip, so after each stroke run `applyMask()` — zero the alpha of every
painted pixel outside the mask — which visually confines paint to the letter.
Coverage check samples every 4th masked pixel; at `COVER_TARGET = 0.6` painted
ratio, the letter "shines" (celebration + enable Next).

```js
function applyMask() {
  var img = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
  var d = img.data;
  for (var i = 0; i < d.length; i += 4) {
    if (maskData[i + 3] <= 60) { d[i + 3] = 0; }
  }
  ctx.putImageData(img, 0, 0);
}
```

Throttle: `applyMask()` + coverage check every ~12 stroke segments and on
pointer-up, not per move event. Respect devicePixelRatio (cap at 2).

### 7.3 Korean syllable-block frame (build-syllables)

A Hangul syllable is a spatial BLOCK whose layout depends on the vowel:
vertical vowels (ㅏㅑㅓㅕㅣㅐㅔ) put the initial LEFT and the vowel RIGHT;
horizontal vowels (ㅗㅜㅡㅛㅠ) stack initial over vowel; a batchim (final
consonant) sits full-width below either arrangement. Render dashed slots in
that geometry, and compose the live preview character with the standard
Unicode formula over the jamo index tables:

```js
var INI = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ".split("");
var VOW = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ".split("");
var BAT = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

function compose(ini, vow, bat) {
  var i = INI.indexOf(ini), v = VOW.indexOf(vow), b = bat ? BAT.indexOf(bat) : 0;
  if (i < 0 || v < 0 || b < 0) return "";
  return String.fromCharCode(0xAC00 + (i * 21 + v) * 28 + b);
}
```

`LESSON.lang === "en"` reuses the same slot/tile engine with a linear row of
letter slots (§6). Tap order is enforced (next slot highlighted); a wrong tile
shakes the frame; three misses pulses the correct tile as a hint.

### 7.4 Stroke tracing via HanziWriter (trace-letters, write-words)

HanziWriter (built for hanzi) traces ANY glyph if you feed `charDataLoader`
your own stroke data. Load it version-pinned through the canvas-CDN proxy —
the only sanctioned external script path:

```html
<script src="/api/canvas-cdn/jsdelivr/npm/hanzi-writer@3.7.3/dist/hanzi-writer.min.js"></script>
```

Generate jamo stroke data inline: author each letter as centerline polylines
in a 1024×1024 **y-UP** grid (big y = top); `outline()` widens each centerline
into a filled ribbon path (a HanziWriter "stroke"), `densify()` resamples it
into the median used for stroke matching. write-words goes further and remaps
each jamo's polylines into syllable-block bounding boxes (per §7.3 geometry)
before ribboning, so whole syllables are traceable.

```js
writer = HanziWriter.create('target', it.char, {
  width: 300, height: 300, padding: 12,
  showCharacter: false, showOutline: true,
  strokeColor: INK, outlineColor: FAINT, drawingColor: DRAWN, drawingWidth: 28,
  charDataLoader: function (c, done) { done(buildCharData(it)); }
});
writer.quiz({
  leniency: 2.5, acceptBackwardsStrokes: true, showHintAfterMisses: 1,
  onCorrectStroke: function () { sprout.signal('attempt-successful', { id: it.id }); },
  onMistake: function (d) { sprout.signal(d.totalMistakes >= 3 ? 'user-stuck' : 'attempt-failed', { id: it.id, misses: d.totalMistakes }); },
  onComplete: function (res) { onItemDone(it, res.totalMistakes); }
});
```

**HanziWriter color options accept hex only** — named CSS colors are rejected.
You still can't hardcode hex (design gate), so resolve kit tokens to their hex
values at runtime:

```js
function tok(name, fb) { try { var v = getComputedStyle(document.documentElement).getPropertyValue(name); if (v && v.trim()) return v.trim(); } catch (e) {} return fb; }
var INK = tok('--brand-500', '#0ba5ec'), FAINT = tok('--gray-300', '#d5d7da'), DRAWN = tok('--gray-700', '#414651');
```

Tuning that worked for age-5 fingers: `leniency: 2.5`,
`acceptBackwardsStrokes: true`, `showHintAfterMisses: 1`, 300×300 stage,
`touch-action: none` on the stage container, and a "Show me" button that
`animateCharacter()`s the stroke order then hands the pen back via
`hideCharacter()` + a fresh `quiz()`.

## 8. Headless QA harness

QA a canvas WITHOUT the app: serve the raw HTML with the kit CSS and a stub
SDK injected exactly where the host would inject them, then drive it with
playwright-core against system Chrome. The whole harness is ~40 lines plus
drive scripts.

**Server** — static files + `<head>` injection + a canvas-CDN proxy shim so
`/api/canvas-cdn/jsdelivr/...` script tags resolve:

```js
// serve.mjs — static server + canvas-CDN proxy shim
http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/canvas-cdn/jsdelivr/')) {
    const target = 'https://cdn.jsdelivr.net/' + req.url.slice('/api/canvas-cdn/jsdelivr/'.length);
    const r = await fetch(target);
    res.writeHead(r.status, { 'content-type': r.headers.get('content-type') || 'application/octet-stream' });
    res.end(Buffer.from(await r.arrayBuffer()));
    return;
  }
  let body = fs.readFileSync(f, 'utf8');
  if (f.endsWith('.html')) body = body.replace(/<head>/i, `<head><style id="sprout-base">${kit}</style><script>${stub}</script>`);
  res.end(body);
}).listen(8931);
```

**Stub SDK** — captures every contract call on `window.__qa`; honors
`window.__seedState` so resume is testable (seed via `addInitScript`, which
runs before ALL page scripts — exactly like the host seeding state):

```js
// stub-sdk.js — injected BEFORE canvas scripts
window.__qa = { signals: [], completions: [], tts: [], stateWrites: 0 };
(function () {
  const state = (window.__seedState) ? JSON.parse(JSON.stringify(window.__seedState)) : {};
  window.sprout = {
    state,
    resumed: !!window.__seedState,
    whoami: async () => ({ childId: 'qa-kid', childName: '재이', ageTier: 'tier1' }),
    complete: (opts) => { window.__qa.completions.push(opts); },
    signal: (name, props) => { window.__qa.signals.push({ name, props }); },
    tts: { speak: (o) => { window.__qa.tts.push(o && o.text); } },
    save: () => {}, restore: () => null,
    rive: { resolveAsset: async () => null },
  };
})();
```

**Driver** — play like a kid, assert the contract:

```js
import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
p.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
// resume test: seed BEFORE any page script runs
await p.addInitScript(() => { window.__seedState = { v: 1, i: 3, done: [/* … */], t0: 1 }; });
await p.goto('http://localhost:8931/trace-letters.html', { waitUntil: 'networkidle' });
```

Useful assertions from the shipped `run-qa.mjs`: capture `pageerror`, console
errors, and `requestfailed`; walk `window.sprout.state` recursively and fail
on any non-ASCII key (`/^[\x00-\x7F]*$/` per key — §2 enforced mechanically);
dump `window.__qa.completions` and the distinct signal names; screenshot the
end state. The TTS capture doubles as an oracle — e.g. the sound-match driver
reads the last spoken word from `__qa.tts` to know which card is correct.

**Minimum drive set per canvas** (all six shipped canvases pass all six):

1. **Fresh run** — play to the end, assert the completion payload
   (`score`/`total`/`summary`) and the signal sequence.
2. **Mistakes path** — answer wrong; assert `attempt-failed` then `user-stuck`
   at 3 misses, and that the engine offers help (hint pulse / re-speak).
3. **Completion payload** — exactly one completion captured, literal
   score/total present, summary string well-formed.
4. **Mid-run resume** — seed `__seedState` at item N; assert the board
   restores exactly (same layout, same progress) and intro TTS is skipped.
5. **Finished resume** — seed a fully-done state; assert the quiet finish
   screen with a visible finish button, no celebration re-fire.
6. **Empty LESSON** — empty items array; assert the empty state + finish
   button render (never a blank page).

## 9. The content-update loop

The nightly "progress coach" that regenerates LESSON blocks is a
**home-agent-side** loop — full doctrine in
`../knowledge/capabilities/home-agent-boundary.md` (the Sprout scheduled
executor has no canvas tools; a maintenance loop scheduled as a heartbeat is
rejected at `heartbeat.create` and impossible at fire time). The contract:

- **Scheduling**: a `category: "home_agent"` skill, re-invoked by the INVOKING
  agent's own cron (e.g. nightly 21:30 local) via `skill.invoke` — never a
  Sprout heartbeat. The skill's first-invocation step is to verify/create that
  schedule in the agent's own scheduler.
- **Evidence**: `canvas.runs.list { childId }` → `canvas.runs.get` per
  completed run. The shared `data.done = [{ id, item, mistakes, at }]` schema
  (§2) is what makes cross-canvas mastery scoring possible — score mastery per
  stable item `id` (e.g. mastered = ≥2 distinct days with ≤1 mistake on the
  latest attempt; stuck = 3+ attempts with ≥3 mistakes).
- **Write path**: `canvas.get` → regenerate ONLY the text between
  `/* LESSON-START */` and `/* LESSON-END */` (bump `LESSON.v`, adjust
  `level`/`items`) → `canvas.update { dryRun: true }` → if the analyzer is
  clean, commit with the returned `specHash`. If dryRun reports issues, do NOT
  commit — post the issue in the skill result instead.
- **Idempotent**: no completed runs since the last check → NO writes, no idle
  version bumps for that canvas.
- **Scope**: content only. Never touch engine code, gems, schedules, tasks, or
  program structure. ASCII-only keys in everything written into LESSON (§2).
- **Progression shape that worked**: ≥80% of items mastered → advance a level,
  KEEP 1-2 mastered items as confidence anchors, cap tier1 sessions at 4-5
  items; stuck items → hold the level, swap decoys/ordering, drop item count
  by 1.

The version-mismatch reset (§1) is the engine-side half of this contract:
when the coach bumps `LESSON.v`, every device picks up a clean board on next
open, even with stale persisted state.
