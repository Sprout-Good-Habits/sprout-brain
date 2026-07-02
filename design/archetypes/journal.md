# Archetype — Journal / Reflection

The default for any "tell me about it" activity: end-of-day reflection,
gratitude prompts, feelings check-ins, "what did you learn" after a lesson.
The canvas asks a couple of warm questions and hands back a short summary the
parent can actually read.

**How to use this file: copy the skeleton whole, then edit ONLY the slots** —
the `PROMPTS` data block and the copy in the intro/result screens. The
tier-branched input (tap-a-starter for tier1, typed `input` for tier2+),
answer accumulation, state wiring, and completion are already correct and
analyzer-clean; restructuring them is how polish is lost.

Screens: intro (hero prompt + CTA) → write (toolbar/progress → question card
→ tier-branched answer area → one confirm CTA) → result ("All done" +
summary + visible finish button).

Behavior contract: tier1 answers by tapping one of 3 sentence-starter
`list-item`s (tap = select, confirm advances — first prompt, then a "Tell me
more" second prompt); tier2+ types into the kit `input`; empty answers are
gently bounced, never blocking; answers accumulate in `sprout.state`; state
resumes at the current prompt; exactly one `sprout.complete({ summary })`
with the joined answers.

## Skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<style>
  .x-hero { text-align: center; padding-top: var(--spacing-5xl); }
  .x-stepcount { color: var(--text-tertiary); font-size: var(--font-size-text-sm); }
  .x-summary { color: var(--text-secondary); font-size: var(--font-size-text-lg); line-height: 1.6; }
</style>
</head>
<body>

<div class="screen" id="screen-intro">
  <div class="x-hero stack stack-xl">
    <div class="tf" style="font-size:64px; line-height:1; height:64px;">📔</div>
    <!-- SLOT: title + one-line premise -->
    <h1 id="hello">Your Journal</h1>
    <p>Two little questions about your day. Ready?</p>
    <button class="btn btn-primary btn-lg" onclick="startJournal()">Let's chat!</button>
  </div>
</div>

<div class="screen hidden" id="screen-write">
  <div class="top-toolbar">
    <div class="top-toolbar-leading">
      <button class="btn btn-util" onclick="speakPrompt()" aria-label="Hear it" style="width:44px;height:44px;font-size:20px;">🔊</button>
    </div>
    <div style="flex:1">
      <div class="progress-bar"><div class="progress-track"><div class="progress-fill" id="bar" style="width:0%"></div></div></div>
    </div>
    <div class="top-toolbar-trailing"><span class="tf">📔</span></div>
  </div>

  <div class="card">
    <div class="x-stepcount" id="stepcount">Question 1</div>
    <h2 id="prompt-q">…</h2>
  </div>

  <div class="stack stack-lg x-starters" id="starters"></div>

  <div class="input-wrapper hidden" id="typed-wrap">
    <label class="input-label" for="answer-input">Your answer</label>
    <input class="input" type="text" id="answer-input" placeholder="Type your thoughts…">
  </div>

  <button class="btn btn-primary btn-lg" id="btn-confirm" onclick="confirmAnswer()">That's my answer!</button>
</div>

<div class="screen hidden" id="screen-result">
  <div class="x-hero stack stack-xl">
    <div class="tf animate-bounce-in" style="font-size:80px; line-height:1; height:80px;">💛</div>
    <h1>All done!</h1>
    <p class="x-summary" id="summary-line"></p>
    <button class="btn btn-primary btn-lg" onclick="finishTap()">Save my journal!</button>
  </div>
</div>

<script>
// SLOT: the prompts. Keep questions short and speakable. Starters are the
// tier1 tap answers — 3 per prompt, each a complete feeling the kid can own.
// Prompt 2 is the "Tell me more" follow-up; keep that shape.
const PROMPTS = [
  { q: 'How was your day today?', starters: [
    { e: '😄', t: 'My day was awesome!' },
    { e: '🙂', t: 'My day was okay.' },
    { e: '😕', t: 'My day was a bit tough.' },
  ] },
  { q: 'Tell me more! What happened?', starters: [
    { e: '🏆', t: 'The best part was playing.' },
    { e: '😂', t: 'Something really funny happened.' },
    { e: '💡', t: 'I learned something new.' },
  ] },
];

const S = sprout.state;
S.step ??= 0; S.answers ??= []; S.done ??= false;
let tier = 'tier2', selected = -1;

function el(id) { return document.getElementById(id); }
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  el('screen-' + id).classList.remove('hidden');
}
function say(text) { try { sprout.tts.speak({ text }).catch(function(){}); } catch (e) {} }
function sig(name, props) { try { sprout.signal(name, props || {}); } catch (e) {} }

function startJournal() { showScreen('write'); renderPrompt(); }

function renderPrompt() {
  selected = -1;
  const p = PROMPTS[S.step];
  el('stepcount').textContent = 'Question ' + (S.step + 1) + ' of ' + PROMPTS.length;
  el('prompt-q').textContent = p.q;
  el('bar').style.width = Math.round(100 * S.step / PROMPTS.length) + '%';
  el('btn-confirm').textContent = S.step === PROMPTS.length - 1 ? 'All done!' : 'That\'s my answer!';
  const wrap = el('starters'); wrap.innerHTML = '';
  if (tier === 'tier1') {
    el('typed-wrap').classList.add('hidden');
    p.starters.forEach((c, i) => {
      const row = document.createElement('div');
      row.className = 'list-item';
      row.innerHTML = '<div class="list-item-icon">' + c.e + '</div>' +
        '<div class="list-item-content"><div class="list-item-title">' + c.t + '</div></div>';
      row.addEventListener('click', () => pickStarter(i, row));
      wrap.appendChild(row);
    });
    say(p.q);
  } else {
    el('typed-wrap').classList.remove('hidden');
    el('answer-input').value = '';
    el('answer-input').focus();
  }
}

function speakPrompt() { say(PROMPTS[S.step].q); }

function pickStarter(i, row) {
  selected = i;
  document.querySelectorAll('.x-starters .list-item').forEach(r => r.classList.remove('checked'));
  row.classList.add('checked');
  say(PROMPTS[S.step].starters[i].t);
}

function confirmAnswer() {
  const p = PROMPTS[S.step];
  const ans = tier === 'tier1'
    ? (selected >= 0 ? p.starters[selected].t : '')
    : el('answer-input').value.trim();
  if (!ans) {
    say(tier === 'tier1' ? 'Tap the one that feels right first!' : 'Write a little something first!');
    return;
  }
  S.answers[S.step] = ans;
  sig('attempt-successful');
  S.step += 1;
  if (S.step >= PROMPTS.length) return finishJournal();
  renderPrompt();
}

function finishJournal() {
  S.done = true;
  const summary = S.answers.join(' ');
  el('summary-line').textContent = summary;
  showScreen('result');
  sig('celebration');
  say('All done! Thanks for sharing your day with me.');
  try { sprout.complete({ summary: summary }); } catch (e) {}
}

function finishTap() {
  try { sprout.complete({ summary: S.answers.join(' ') }); } catch (e) {}
}

(async function boot() {
  try {
    const me = await sprout.whoami();
    tier = me.ageTier || 'tier2';
    if (me.childName) el('hello').textContent = me.childName + '\'s Journal';
  } catch (e) {}
  if (S.done) { finishJournal(); return; }
  if (sprout.resumed && S.step > 0) { startJournal(); }
})();
</script>
</body>
</html>
```

## Slots (what you edit)

1. **`PROMPTS`** — the questions and the tier1 starters. Keep the two-beat
   shape (open question → "Tell me more"); 3 starters per prompt, each a
   complete sentence a kid could genuinely mean. Add a third prompt at most.
2. **Intro copy + hero emoji** — theme it (gratitude 🙏, feelings 💛,
   learning 💡).
3. **Result copy + finish button label** — "Save my journal!" reads better
   than a generic Done for this archetype.
4. Optional: for tier3 long-form, swap the `input` for a textarea styled
   under an `x-` class with tokens — but prefer the kit `input`; one good
   sentence beats a reluctant paragraph.

## Polish notes

- Tapping a starter speaks it back — that's the tier1 "I said that" moment.
  Keep selection and confirm as two beats; a single-tap auto-advance feels
  like the canvas snatched the answer.
- Empty answers get a gentle voice nudge and nothing else — no error banner,
  no red. A journal must never feel like a test.
- The summary is the deliverable: joined answers go into
  `complete({ summary })` verbatim, so starters must read as standalone
  sentences ("My day was awesome!" not "awesome").
- Answers land at `S.answers[S.step]` (not `push`) so a resumed or re-edited
  step never duplicates entries.
- Never gate tier1 on typing — if `whoami` fails, the skeleton defaults to
  tier2 (typed), which is the safe general case; tier1 kids get starters only
  when the host confirms the tier.
