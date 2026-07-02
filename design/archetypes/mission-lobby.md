# Archetype — Mission / Goal Lobby

The default for any multi-step goal dashboard: a morning routine, a weekly
mission ("do 5 kind things"), a project checklist. The kid sees the goal, the
steps, and how close they are — and checks steps off as they happen.

**How to use this file: copy the skeleton whole, then edit ONLY the slots** —
the `MISSION` + `STEPS` data blocks and the copy on the two screens. The
step toggling, progress math, gems pill, state wiring, and completion are
already correct and analyzer-clean; restructuring them is how polish is lost.

Screens: lobby (hero + gems pill + progress toward the goal + tappable step
rows + ONE primary CTA) → done (celebration + visible finish button). Two
screens is the whole archetype — a lobby is a place, not a flow.

Behavior contract: each step is a `list-item` that toggles `checked` on tap;
progress bar + "N of M done" message track the count; checked steps persist
in `sprout.state`; when every step is checked the canvas celebrates and fires
`sprout.complete({})` (the CTA is the same path, guarded, so double-wiring is
safe); tapping the CTA early gets a voice nudge, never a block. The kit has
NO gems pill — `x-gems-pill` below is the token rebuild.

## Skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<style>
  .x-hero { text-align: center; padding-top: var(--spacing-3xl); }
  .x-gems-pill { display: inline-flex; align-items: center; gap: var(--spacing-sm);
    background: var(--white); border: 2px solid var(--border-secondary);
    border-radius: var(--radius-full); padding: var(--spacing-md) var(--spacing-xl);
    font-weight: var(--font-weight-bold); box-shadow: 0 2px 0 0 var(--gray-200); }
  .x-goal-line { color: var(--text-secondary); font-size: var(--font-size-text-md); }
</style>
</head>
<body>

<div class="screen" id="screen-lobby">
  <div class="x-hero stack stack-lg">
    <div class="tf" style="font-size:64px; line-height:1; height:64px;" id="mission-hero">🚀</div>
    <!-- SLOT: mission title + goal line -->
    <h1 id="hello">Morning Mission</h1>
    <p class="x-goal-line">Finish every step to launch the rocket!</p>
    <div><span class="x-gems-pill"><span class="tf">💎</span><span id="gems-count">5</span></span></div>
  </div>

  <div class="progress-bar">
    <div class="progress-message" id="progress-count">0 of 5 done</div>
    <div class="progress-track"><div class="progress-fill" id="bar" style="width:0%"></div></div>
  </div>

  <div class="stack stack-lg x-steps" id="steps"></div>

  <button class="btn btn-primary btn-lg" onclick="finishMission()" id="btn-finish">Mission complete!</button>
</div>

<div class="screen hidden" id="screen-done">
  <div class="x-hero stack stack-xl" style="padding-top:var(--spacing-5xl);">
    <div class="tf animate-bounce-in" style="font-size:80px; line-height:1; height:80px;">🎉</div>
    <h1>Mission complete!</h1>
    <p id="done-line">You finished every step. Amazing!</p>
    <button class="btn btn-primary btn-lg" onclick="finishTap()">I'm done!</button>
  </div>
</div>

<script>
// SLOT: the mission. gems = the reward shown in the pill (match the task's
// actual reward). 3-5 steps for tier1; up to 7 for tier3.
const MISSION = { title: 'Morning Mission', hero: '🚀', gems: 5 };
const STEPS = [
  { e: '🦷', t: 'Brush your teeth' },
  { e: '🛏️', t: 'Make your bed' },
  { e: '🥣', t: 'Eat breakfast' },
  { e: '🎒', t: 'Pack your bag' },
  { e: '👟', t: 'Shoes on' },
];

const S = sprout.state;
S.stepsDone ??= [];
while (S.stepsDone.length < STEPS.length) S.stepsDone.push(false);
S.finished ??= false;

function el(id) { return document.getElementById(id); }
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  el('screen-' + id).classList.remove('hidden');
}
function say(text) { try { sprout.tts.speak({ text }).catch(function(){}); } catch (e) {} }
function sig(name, props) { try { sprout.signal(name, props || {}); } catch (e) {} }

function renderSteps() {
  const wrap = el('steps'); wrap.innerHTML = '';
  STEPS.forEach((st, i) => {
    const row = document.createElement('div');
    row.className = 'list-item' + (S.stepsDone[i] ? ' checked' : '');
    row.innerHTML = '<div class="list-item-icon">' + st.e + '</div>' +
      '<div class="list-item-content"><div class="list-item-title">' + st.t + '</div></div>';
    row.addEventListener('click', () => toggleStep(i, row));
    wrap.appendChild(row);
  });
}

function updateProgress() {
  const n = S.stepsDone.filter(Boolean).length;
  el('progress-count').textContent = n + ' of ' + STEPS.length + ' done';
  el('bar').style.width = Math.round(100 * n / STEPS.length) + '%';
}

function toggleStep(i, row) {
  if (S.finished) return;
  S.stepsDone[i] = !S.stepsDone[i];
  row.classList.toggle('checked', S.stepsDone[i]);
  updateProgress();
  if (S.stepsDone[i]) {
    sig('attempt-successful');
    if (S.stepsDone.every(Boolean)) return missionDone();
    say('Nice! ' + STEPS[i].t + ' — done!');
  }
}

function missionDone() {
  if (S.finished) { showScreen('done'); return; }
  S.finished = true;
  showScreen('done');
  sig('celebration');
  say('Mission complete! You did every single step!');
  try { sprout.complete({}); } catch (e) {}
}

function finishMission() {
  if (S.stepsDone.every(Boolean)) return missionDone();
  const left = STEPS.length - S.stepsDone.filter(Boolean).length;
  el('btn-finish').classList.remove('animate-shake');
  void el('btn-finish').offsetWidth;
  el('btn-finish').classList.add('animate-shake');
  say('Not yet! ' + left + ' more step' + (left === 1 ? '' : 's') + ' to go. You can do it!');
}

function finishTap() {
  try { sprout.complete({}); } catch (e) {}
}

(async function boot() {
  try {
    const me = await sprout.whoami();
    if (me.childName) el('hello').textContent = me.childName + '\'s ' + MISSION.title;
  } catch (e) {}
  el('mission-hero').textContent = MISSION.hero;
  el('gems-count').textContent = MISSION.gems;
  renderSteps();
  updateProgress();
  if (S.finished) showScreen('done');
})();
</script>
</body>
</html>
```

## Slots (what you edit)

1. **`MISSION` + `STEPS`** — the whole activity. Steps are physical-world
   actions the kid self-reports; keep titles to 2-4 words with a strong
   emoji each. 3-5 steps for tier1.
2. **Hero emoji + goal line** — the premise in one breath ("Finish every
   step to launch the rocket!"). Theme the done screen to pay it off.
3. **Gems pill count** — mirror the task's real reward; never invent a
   number the app won't grant.

## Polish notes

- Steps toggle BOTH ways — kids mis-tap. Unchecking rolls the progress bar
  back and that's fine; only checking fires a signal.
- The last check IS the finish: celebration + `complete({})` fire the moment
  the final step lands. The lobby CTA and the done-screen button route
  through the same guarded path, so all three wirings coexist safely.
- Tapping the CTA early shakes it and speaks how many steps remain — a nudge
  with a number, never a disabled button or an error state.
- `S.stepsDone` is a plain boolean array padded to `STEPS.length` — that
  merge-default keeps old runs valid when you add a step to the mission.
- This lobby self-reports honesty-system steps. If a step should be
  verified (photo, quiz), make it its own task in the app — don't bolt
  verification onto the lobby.
