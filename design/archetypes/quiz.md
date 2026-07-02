# Archetype — Quiz / Question Flow

The default for any "ask N questions, score at the end" activity: multiplication
drills, vocabulary checks, odd-one-out, comprehension questions.

**How to use this file: copy the skeleton whole, then edit ONLY the slots** —
the `QUESTIONS` data block, the copy in the intro/result screens, and (if
needed) the per-question renderer. The chrome, state wiring, feedback flow,
signals, and completion are already correct and analyzer-clean; restructuring
them is how polish is lost.

Screens: intro (hero + premise + CTA) → game (toolbar/progress → question card
→ `list-item` answers → bottom feedback banner) → result (celebration — see
`result-celebration.md` for the richer version).

Behavior contract: single-select answers; correct → `fb-success` banner +
`attempt-successful` signal; wrong → `fb-error` with the right answer named +
`attempt-failed`; banner owns Continue; progress bar tracks position; state
resumes mid-quiz; exactly one `sprout.complete({score, total})`.

## Skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<style>
  .x-hero { text-align: center; padding-top: var(--spacing-5xl); }
  .x-qcount { color: var(--text-tertiary); font-size: var(--font-size-text-sm); }
</style>
</head>
<body>

<div class="screen" id="screen-intro">
  <div class="x-hero stack stack-xl">
    <div class="tf" style="font-size:64px; line-height:1; height:64px;">🦉</div>
    <!-- SLOT: title + one-line premise -->
    <h1 id="hello">Quiz Time!</h1>
    <p>Answer the questions. Ready?</p>
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
    <div class="x-qcount" id="qcount">Question 1</div>
    <h2 id="qtext">…</h2>
  </div>
  <div class="stack stack-lg x-answers" id="answers"></div>
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
  <div class="fb-header"><div class="fb-icon">🎉</div><div class="fb-title">Correct!</div></div>
  <button class="btn btn-success btn-lg" onclick="nextQuestion()">Continue</button>
</div>
<div class="feedback-banner fb-error hidden" id="fb-bad" style="position:fixed; bottom:0; left:0; right:0;" aria-live="polite">
  <div class="fb-header"><div class="fb-icon">🤔</div><div class="fb-title">Not quite</div></div>
  <div class="fb-content"><div class="fb-desc" id="fb-bad-desc"></div></div>
  <button class="btn btn-error btn-lg" onclick="nextQuestion()">Continue</button>
</div>

<script>
// SLOT: the content. prompt (short, speakable), choices (label + optional emoji), answer index.
const QUESTIONS = [
  { prompt: 'Which animal says moo?', choices: [ {e:'🐮', t:'Cow'}, {e:'🐱', t:'Cat'}, {e:'🦆', t:'Duck'} ], answer: 0 },
  { prompt: 'What comes next: 2, 4, 6 …?', choices: [ {e:'7️⃣', t:'Seven'}, {e:'8️⃣', t:'Eight'}, {e:'9️⃣', t:'Nine'} ], answer: 1 },
  { prompt: 'Which one is a fruit?', choices: [ {e:'🥕', t:'Carrot'}, {e:'🍎', t:'Apple'}, {e:'🧀', t:'Cheese'} ], answer: 1 },
];

const S = sprout.state;
S.idx ??= 0; S.score ??= 0; S.done ??= false;
let tier = 'tier2', locked = false;

function el(id) { return document.getElementById(id); }
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  el('screen-' + id).classList.remove('hidden');
}
function say(text) { try { sprout.tts.speak({ text }).catch(function(){}); } catch (e) {} }
function sig(name, props) { try { sprout.signal(name, props || {}); } catch (e) {} }

function startGame() { showScreen('game'); renderQuestion(); }

function renderQuestion() {
  locked = false;
  el('fb-good').classList.add('hidden'); el('fb-bad').classList.add('hidden');
  const q = QUESTIONS[S.idx];
  el('qcount').textContent = 'Question ' + (S.idx + 1) + ' of ' + QUESTIONS.length;
  el('qtext').textContent = q.prompt;
  el('bar').style.width = Math.round(100 * S.idx / QUESTIONS.length) + '%';
  el('score-now').textContent = S.score;
  const wrap = el('answers'); wrap.innerHTML = '';
  const choices = tier === 'tier1' ? q.choices.slice(0, 3) : q.choices;
  choices.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = '<div class="list-item-icon">' + c.e + '</div>' +
      '<div class="list-item-content"><div class="list-item-title">' + c.t + '</div></div>';
    row.addEventListener('click', () => pick(i, row));
    wrap.appendChild(row);
  });
  if (tier === 'tier1') say(q.prompt);
}

function speakPrompt() { say(QUESTIONS[S.idx].prompt); }

function pick(i, row) {
  if (locked) return; locked = true;
  document.querySelectorAll('.x-answers .list-item').forEach(r => r.classList.remove('checked'));
  row.classList.add('checked');
  const q = QUESTIONS[S.idx];
  if (i === q.answer) {
    S.score += 1; sprout.state.score = S.score;
    el('score-now').textContent = S.score;
    sig(S.score > 0 && S.score % 3 === 0 ? 'milestone-reached' : 'attempt-successful');
    el('fb-good').classList.remove('hidden');
    say('You got it!');
  } else {
    sig('attempt-failed');
    el('fb-bad-desc').textContent = 'The answer was ' + q.choices[q.answer].t + '.';
    el('fb-bad').classList.remove('hidden');
    say('Good try! The answer was ' + q.choices[q.answer].t + '.');
  }
}

function nextQuestion() {
  S.idx += 1; sprout.state.idx = S.idx;
  if (S.idx >= QUESTIONS.length) return finishQuiz();
  renderQuestion();
}

function finishQuiz() {
  S.done = true; sprout.state.done = true;
  el('fb-good').classList.add('hidden'); el('fb-bad').classList.add('hidden');
  el('result-line').textContent = 'You got ' + S.score + ' of ' + QUESTIONS.length + '!';
  el('result-emoji').textContent = S.score === QUESTIONS.length ? '🏆' : S.score >= QUESTIONS.length / 2 ? '🌟' : '💪';
  showScreen('result');
  if (S.score >= QUESTIONS.length - 1) sig('celebration', { score: S.score });
  say('All done! You got ' + S.score + ' out of ' + QUESTIONS.length + '!');
  try { sprout.complete({ score: S.score, total: QUESTIONS.length }); } catch (e) {}
}

function finishTap() {
  try { sprout.complete({ score: S.score, total: QUESTIONS.length }); } catch (e) {}
}

(async function boot() {
  try {
    const me = await sprout.whoami();
    tier = me.ageTier || 'tier2';
    if (me.childName) el('hello').textContent = 'Hi ' + me.childName + '!';
  } catch (e) {}
  if (S.done) { finishQuiz(); return; }
  if (sprout.resumed && S.idx > 0) { showScreen('game'); renderQuestion(); }
})();
</script>
</body>
</html>
```

## Slots (what you edit)

1. **`QUESTIONS`** — the whole activity. Keep prompts short and speakable;
   3 choices for tier1, up to 4-6 for tier3 (the renderer already slices).
2. **Intro copy + hero emoji** — theme it to the subject.
3. **Result thresholds** — emoji/copy per score band, gems messaging if the
   task carries a reward.
4. Optional: swap `list-item` answers for a `x-` tile grid (big emoji-only
   choices) on visual questions — see `sorting-matching.md` for the tile
   pattern; everything else stays.

## Polish notes

- Keep the ~900ms rhythm: banner shows, kid taps Continue — don't auto-advance
  faster than a kid can read the feedback.
- The wrong-answer banner always names the right answer (that's the teaching
  moment).
- For dynamically generated questions (seeded randomness instead of a fixed
  array), generate INTO `sprout.state` so resume replays the same round —
  don't regenerate on every load.
