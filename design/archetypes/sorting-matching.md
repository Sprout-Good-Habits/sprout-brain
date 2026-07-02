# Archetype — Sorting / Matching

The default for any "tap the right tiles" activity: order things by size,
number, or time; match animals to foods, words to pictures, uppercase to
lowercase. A grid of big emoji tiles is the whole interface — no reading
required, so it works from tier1 up.

**How to use this file: copy the skeleton whole, then edit ONLY the slots** —
the `ROUNDS` data block, the copy in the intro/result screens, and the tile
size if your content needs it. The tile grid, tap logic for both round modes,
shake-on-wrong, state wiring, signals, and completion are already correct and
analyzer-clean; restructuring them is how polish is lost.

Screens: intro (hero + premise + CTA) → game (toolbar/progress → prompt card
→ `x-tile` grid → round-complete banner) → result (celebration — see
`result-celebration.md` for the richer version).

Behavior contract: two round modes — `order` (tap tiles in the right
sequence; each correct tap dims the tile) and `pairs` (tap two tiles that
belong together; matched tiles dim). Wrong tap → tile shakes +
`attempt-failed` and the round's tap progress resets; a round finished with
zero mistakes scores a point; banner owns Continue between rounds; state
resumes at the current round; exactly one `sprout.complete({score, total})`.

## Skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<style>
  .x-hero { text-align: center; padding-top: var(--spacing-5xl); }
  .x-roundcount { color: var(--text-tertiary); font-size: var(--font-size-text-sm); }
  .x-grid { display: flex; flex-wrap: wrap; gap: var(--spacing-lg); justify-content: center; padding: var(--spacing-xl) 0; }
  .x-grid .x-tile { width: 96px; height: 96px; flex: 0 0 auto; padding: 0; font-size: 44px; line-height: 1; }
  .x-grid .x-tile.x-sel { border-color: var(--brand-500); background: var(--brand-50); }
  .x-grid .x-tile.x-done { opacity: 0.35; }
</style>
</head>
<body>

<div class="screen" id="screen-intro">
  <div class="x-hero stack stack-xl">
    <div class="tf" style="font-size:64px; line-height:1; height:64px;">🧩</div>
    <!-- SLOT: title + one-line premise -->
    <h1 id="hello">Sort &amp; Match!</h1>
    <p>Tap the tiles in the right way. Ready?</p>
    <button class="btn btn-primary btn-lg" onclick="startGame()">Let's go!</button>
  </div>
</div>

<div class="screen hidden" id="screen-game">
  <div class="top-toolbar">
    <div class="top-toolbar-leading">
      <button class="btn btn-util" onclick="speakPrompt()" aria-label="Hear it" style="width:44px;height:44px;font-size:20px;">🔊</button>
    </div>
    <div style="flex:1">
      <div class="progress-bar"><div class="progress-track"><div class="progress-fill" id="bar" style="width:0%"></div></div></div>
    </div>
    <div class="top-toolbar-trailing"><span class="tf">⭐</span>&nbsp;<span id="score-now">0</span></div>
  </div>

  <div class="card">
    <div class="x-roundcount" id="roundcount">Round 1</div>
    <h2 id="prompt-text">…</h2>
  </div>
  <div class="x-grid" id="tiles"></div>
</div>

<div class="screen hidden" id="screen-result">
  <div class="x-hero stack stack-xl">
    <div class="tf animate-bounce-in" style="font-size:80px; line-height:1; height:80px;" id="result-emoji">🏆</div>
    <h1>All done!</h1>
    <p id="result-line"></p>
    <button class="btn btn-primary btn-lg" onclick="finishTap()">I'm done!</button>
  </div>
</div>

<div class="feedback-banner fb-success hidden" id="fb-good" style="position:fixed; bottom:0; left:0; right:0;" aria-live="polite">
  <div class="fb-header"><div class="fb-icon">🎉</div><div class="fb-title">Round done!</div></div>
  <button class="btn btn-success btn-lg" onclick="nextRound()">Continue</button>
</div>

<script>
// SLOT: the content. Two modes:
//  - order: tap tiles in `order` (indexes into tiles, first→last)
//  - pairs: tap two tiles that belong together; `pairs` lists index pairs
// Keep prompts short and speakable. ~3-4 tiles for tier1, up to 6 for tier3.
const ROUNDS = [
  { mode: 'order', prompt: 'Tap them smallest to biggest!',
    tiles: [ {e:'🐘', t:'Elephant'}, {e:'🐭', t:'Mouse'}, {e:'🐶', t:'Dog'} ], order: [1, 2, 0] },
  { mode: 'pairs', prompt: 'Match each animal to its snack!',
    tiles: [ {e:'🐰', t:'Bunny'}, {e:'🍌', t:'Banana'}, {e:'🐵', t:'Monkey'}, {e:'🥕', t:'Carrot'} ], pairs: [[0, 3], [2, 1]] },
  { mode: 'order', prompt: 'Tap the numbers from 1 to 4!',
    tiles: [ {e:'3️⃣', t:'Three'}, {e:'1️⃣', t:'One'}, {e:'4️⃣', t:'Four'}, {e:'2️⃣', t:'Two'} ], order: [1, 3, 0, 2] },
];

const S = sprout.state;
S.round ??= 0; S.score ??= 0; S.done ??= false;
let tier = 'tier2', locked = false, seq = [], sel = -1, matchedCount = 0, mistakes = 0;

function el(id) { return document.getElementById(id); }
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  el('screen-' + id).classList.remove('hidden');
}
function say(text) { try { sprout.tts.speak({ text }).catch(function(){}); } catch (e) {} }
function sig(name, props) { try { sprout.signal(name, props || {}); } catch (e) {} }
function shake(node) {
  node.classList.remove('animate-shake');
  void node.offsetWidth;
  node.classList.add('animate-shake');
  setTimeout(() => node.classList.remove('animate-shake'), 400);
}

function startGame() { showScreen('game'); renderRound(); }

function tileBtn(i) { return el('tiles').children[i]; }

function renderRound() {
  locked = false; seq = []; sel = -1; matchedCount = 0; mistakes = 0;
  el('fb-good').classList.add('hidden');
  const r = ROUNDS[S.round];
  el('roundcount').textContent = 'Round ' + (S.round + 1) + ' of ' + ROUNDS.length;
  el('prompt-text').textContent = r.prompt;
  el('bar').style.width = Math.round(100 * S.round / ROUNDS.length) + '%';
  el('score-now').textContent = S.score;
  const wrap = el('tiles'); wrap.innerHTML = '';
  r.tiles.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'btn btn-secondary x-tile tf';
    b.textContent = t.e;
    b.setAttribute('aria-label', t.t);
    b.addEventListener('click', () => tap(i, b));
    wrap.appendChild(b);
  });
  if (tier === 'tier1') say(r.prompt);
}

function speakPrompt() { say(ROUNDS[S.round].prompt); }

function tap(i, b) {
  if (locked || b.classList.contains('x-done')) return;
  const r = ROUNDS[S.round];
  if (r.mode === 'order') tapOrder(i, b, r); else tapPairs(i, b, r);
}

function tapOrder(i, b, r) {
  if (i === r.order[seq.length]) {
    seq.push(i); b.classList.add('x-done');
    if (seq.length === r.order.length) return roundComplete();
    sig('attempt-successful');
  } else {
    mistakes += 1; seq = [];
    sig('attempt-failed'); shake(b);
    document.querySelectorAll('.x-grid .x-tile').forEach(t => t.classList.remove('x-done'));
    say('Oops! Start the round again.');
  }
}

function tapPairs(i, b, r) {
  if (sel === -1) { sel = i; b.classList.add('x-sel'); return; }
  if (sel === i) { sel = -1; b.classList.remove('x-sel'); return; }
  const first = tileBtn(sel);
  const isPair = r.pairs.some(p => (p[0] === sel && p[1] === i) || (p[1] === sel && p[0] === i));
  if (isPair) {
    first.classList.remove('x-sel');
    first.classList.add('x-done'); b.classList.add('x-done');
    matchedCount += 2; sel = -1;
    if (matchedCount === r.tiles.length) return roundComplete();
    sig('attempt-successful');
  } else {
    mistakes += 1; locked = true;
    sig('attempt-failed'); shake(b); shake(first);
    say('Good try! Those two don\'t go together.');
    setTimeout(() => { first.classList.remove('x-sel'); sel = -1; locked = false; }, 450);
  }
}

function roundComplete() {
  locked = true;
  if (mistakes === 0) { S.score += 1; el('score-now').textContent = S.score; }
  sig(mistakes === 0 ? 'milestone-reached' : 'attempt-successful');
  el('fb-good').classList.remove('hidden');
  say(mistakes === 0 ? 'Perfect round!' : 'Round done! Nice work.');
}

function nextRound() {
  S.round += 1;
  if (S.round >= ROUNDS.length) return finishGame();
  renderRound();
}

function finishGame() {
  S.done = true;
  el('fb-good').classList.add('hidden');
  el('result-line').textContent = 'You got ' + S.score + ' of ' + ROUNDS.length + ' rounds perfect!';
  el('result-emoji').textContent = S.score === ROUNDS.length ? '🏆' : S.score >= ROUNDS.length / 2 ? '🌟' : '💪';
  showScreen('result');
  if (S.score >= ROUNDS.length - 1) sig('celebration', { score: S.score });
  say('All done! You got ' + S.score + ' out of ' + ROUNDS.length + ' perfect rounds!');
  try { sprout.complete({ score: S.score, total: ROUNDS.length }); } catch (e) {}
}

function finishTap() {
  try { sprout.complete({ score: S.score, total: ROUNDS.length }); } catch (e) {}
}

(async function boot() {
  try {
    const me = await sprout.whoami();
    tier = me.ageTier || 'tier2';
    if (me.childName) el('hello').textContent = 'Sort & Match, ' + me.childName + '!';
  } catch (e) {}
  if (S.done) { finishGame(); return; }
  if (sprout.resumed && S.round > 0) { showScreen('game'); renderRound(); }
})();
</script>
</body>
</html>
```

## Slots (what you edit)

1. **`ROUNDS`** — the whole activity. Mix `order` and `pairs` rounds freely;
   keep prompts short and speakable. Tier1: 3-4 tiles and 5-8 rounds; tier3
   can take 6 tiles and trickier orderings (biggest→smallest, alphabetical).
2. **Intro copy + hero emoji** — theme it to the subject.
3. **Tile size** — 96px is the tier1-safe default; drop to 80px only if a
   tier3 round genuinely needs more tiles on screen at once.
4. **Result thresholds** — emoji/copy per score band, gems messaging if the
   task carries a reward.

## Polish notes

- The tiles are real `btn btn-secondary` buttons, so the tactile press +
  44px-plus target come free — never rebuild tiles as bare divs.
- Wrong tap in an `order` round resets that round's taps (the dimmed tiles
  light back up) — that's the point of the mode: the kid re-thinks the whole
  sequence, and only a zero-mistake round scores.
- In `pairs` rounds a wrong pair only clears the current selection; already
  matched pairs stay dimmed. Resetting those too just punishes memory.
- Score counts perfect rounds, not taps — say so in the result line so the
  number makes sense to the kid.
- For dynamically generated rounds (seeded randomness instead of a fixed
  array), generate INTO `sprout.state` so resume replays the same round —
  don't regenerate on every load.
