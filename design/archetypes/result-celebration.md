# Archetype — Result / Celebration Screen

The celebration result screen — the branded "you did it!" moment every
activity ends on. This doc is BOTH a standalone runnable example AND the
drop-in replacement for the plain result screen in any other archetype
(`quiz.md`, `sorting-matching.md`, …): copy the `screen-result` block, the
`<style>` rules, and `showResult()` + `band()` into your canvas, then call
`showResult()` from your finish path.

**How to use this file: copy the skeleton whole, then edit ONLY the slots** —
the score bands (emoji + praise per tier), the finish-button label, and the
demo-game stub you replace with your real activity. The sky/grass scene,
sparkle overlay, score badge, signals, and completion are already correct
and analyzer-clean; restructuring them is how polish is lost.

Screens: game (a stand-in for YOUR activity — it just accumulates
`sprout.state.score`) → result (full-bleed `bg-sky` scene + grass strip +
80px bouncing hero + 8 staggered sparkles + score `badge` + one primary
finish button).

Behavior contract: the game screen owns the score in `sprout.state`;
`showResult()` reads it, picks a 3-tier band (emoji + praise line), fires
`celebration`, speaks the praise, and calls
`sprout.complete({ score, total })`; the visible "I'm done!" button
double-wires the same guarded call; a completed run re-opens straight onto
the celebration.

## Skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<style>
  .x-hero { text-align: center; padding-top: var(--spacing-5xl); }
  .x-scene { position: fixed; inset: 0; overflow: hidden;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: var(--spacing-xl); }
  .x-cheer { position: relative; z-index: 1; text-align: center; align-items: center; }
  .x-grass-slot { position: absolute; left: 0; right: 0; bottom: 0; }
  .x-cheer .x-score { font-size: var(--font-size-text-xl); padding: var(--spacing-md) var(--spacing-2xl); }
</style>
</head>
<body>

<div class="screen" id="screen-game">
  <div class="x-hero stack stack-xl">
    <!-- SLOT: your ENTIRE activity replaces this demo stub. It only has to
         keep sprout.state.score current, then call showResult() to finish. -->
    <div class="tf" style="font-size:64px; line-height:1; height:64px;">⭐</div>
    <h1 id="hello">Demo game</h1>
    <p>Score some points, then finish to see the celebration.</p>
    <p><span class="tf">⭐</span>&nbsp;<span id="demo-score">0 / 5</span></p>
    <button class="btn btn-secondary btn-lg" onclick="scorePoint()">Score a point</button>
    <button class="btn btn-primary btn-lg" onclick="finishGame()">Finish</button>
  </div>
</div>

<div class="screen hidden" id="screen-result">
  <div class="bg-sky x-scene">
    <div class="spark-overlay" style="position:absolute; inset:0; pointer-events:none;">
      <div class="sparkle tf" style="position:absolute; left:12%; top:16%; animation-delay:0s;">✨</div>
      <div class="sparkle tf" style="position:absolute; left:82%; top:12%; animation-delay:.15s;">✨</div>
      <div class="sparkle tf" style="position:absolute; left:24%; top:34%; animation-delay:.3s;">✨</div>
      <div class="sparkle tf" style="position:absolute; left:70%; top:30%; animation-delay:.45s;">✨</div>
      <div class="sparkle tf" style="position:absolute; left:8%; top:56%; animation-delay:.6s;">✨</div>
      <div class="sparkle tf" style="position:absolute; left:88%; top:52%; animation-delay:.75s;">✨</div>
      <div class="sparkle tf" style="position:absolute; left:36%; top:8%; animation-delay:.9s;">✨</div>
      <div class="sparkle tf" style="position:absolute; left:58%; top:64%; animation-delay:1.05s;">✨</div>
    </div>
    <div class="x-cheer stack stack-xl">
      <div class="tf animate-bounce-in" style="font-size:80px; line-height:1; height:80px;" id="result-emoji">🏆</div>
      <h1 id="result-title">Amazing!</h1>
      <p id="result-line">You did it!</p>
      <span class="badge badge-success x-score" id="result-score">0 / 5</span>
      <button class="btn btn-primary btn-lg" onclick="finishTap()" style="width:auto;">I'm done!</button>
    </div>
    <div class="x-grass-slot">
      <div class="bg-grass"><div class="bg-grass-edge"></div><div class="bg-grass-fill"></div></div>
    </div>
  </div>
</div>

<script>
// SLOT: demo stub — DELETE when dropping into a real game. Your game keeps
// sprout.state.score current and calls showResult() when it ends.
const TOTAL = 5;

const S = sprout.state;
S.score ??= 0; S.done ??= false;

function el(id) { return document.getElementById(id); }
function showScreen(id) {
  try { sprout.tts.stop().catch(function(){}); } catch (e) {} // cancel in-flight narration so it does not bleed onto the next screen
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  el('screen-' + id).classList.remove('hidden');
}
function say(text) { try { sprout.tts.stop().catch(function(){}); sprout.tts.speak({ text }).catch(function(){}); } catch (e) {} }
function sig(name, props) { try { sprout.signal(name, props || {}); } catch (e) {} }

function scorePoint() {
  if (S.done) return;
  S.score = Math.min(TOTAL, S.score + 1);
  el('demo-score').textContent = S.score + ' / ' + TOTAL;
  sig('attempt-successful');
}

function finishGame() { showResult(); }

// SLOT: the score bands — emoji + praise per tier. Keep exactly three.
function band(score, total) {
  if (total > 0 && score >= total) return { e: '🏆', title: 'Perfect!', line: 'Every single one — incredible!', speak: 'Perfect score! You are amazing!' };
  if (score >= total / 2) return { e: '🌟', title: 'Great job!', line: 'You got ' + score + ' of ' + total + '!', speak: 'Great job! You got ' + score + ' out of ' + total + '!' };
  return { e: '💪', title: 'Good try!', line: 'You got ' + score + ' of ' + total + '. Next time even more!', speak: 'Good try! Next time you will get even more!' };
}

// The drop-in: reads score from sprout.state, renders the scene, celebrates,
// completes. Call this from YOUR game's finish path instead of a plain
// result screen.
function showResult() {
  S.done = true;
  const b = band(S.score, TOTAL);
  el('result-emoji').textContent = b.e;
  el('result-title').textContent = b.title;
  el('result-line').textContent = b.line;
  el('result-score').textContent = S.score + ' / ' + TOTAL;
  showScreen('result');
  sig('celebration', { score: S.score, total: TOTAL });
  say(b.speak);
  try { sprout.complete({ score: S.score, total: TOTAL }); } catch (e) {}
}

function finishTap() {
  try { sprout.complete({ score: S.score, total: TOTAL }); } catch (e) {}
}

(async function boot() {
  try {
    const me = await sprout.whoami();
    if (me.childName) el('hello').textContent = 'Nice to see you, ' + me.childName + '!';
  } catch (e) {}
  el('demo-score').textContent = S.score + ' / ' + TOTAL;
  if (S.done) { showResult(); return; }
})();
</script>
</body>
</html>
```

## Slots (what you edit)

1. **`band()`** — the three score tiers: emoji, headline, on-screen line,
   spoken praise. Theme them to the activity (🏆/🌟/💪 is the default trio).
   For open-ended activities with no score, collapse to one band and call
   `sprout.complete({})` instead.
2. **The demo-game stub** — replace the whole `screen-game` block and the
   `scorePoint`/`finishGame` stubs with your real activity; keep
   `sprout.state.score` current as it plays and call `showResult()` where
   your old finish logic was.
3. **Finish button label** — "I'm done!" is the default; match the
   activity's voice ("Save my journal!", "Back to base!").

## Polish notes

- Dropping this into another archetype takes four pieces: the `<style>`
  rules, the `screen-result` div, `band()` + `showResult()`, and a call to
  `showResult()` from the old finish function. The score travels through
  `sprout.state`, so there's nothing else to pass.
- The scene is full-bleed via `position: fixed` on `x-scene` — that's how
  you escape the body's 16px padding without negative margins or a body
  background override.
- Keep the sparkles at 8 with ~150ms stagger; more reads as noise, and the
  staggering is what makes it feel alive. `spark-overlay` gets
  `pointer-events:none` so a sparkle never eats the finish tap.
- The hero bounces in (`animate-bounce-in`) while the sparkles pop around it
  — don't add more motion on top; two systems is the ceiling.
- `celebration` fires here even on the low band — finishing IS the win. The
  differentiation lives in the emoji and the praise line, never in
  withholding the party.
