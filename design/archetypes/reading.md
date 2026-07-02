# Archetype — Reading / Read-Along

The default for any passage activity: a short story split across pages, a
poem, instructions to read before a task, or a parent-written note. The kid
pages through, can hear any page read aloud, and the canvas quietly tracks
how long they spent.

**How to use this file: copy the skeleton whole, then edit ONLY the slots** —
the `PAGES` data block and the copy in the intro/result screens. The paging,
per-page read-aloud, elapsed-time tracking, state wiring, and completion are
already correct and analyzer-clean; restructuring them is how polish is lost.

Screens: intro (hero + premise + CTA) → read (toolbar/progress → passage
`card` → prev/next row) → result (celebration — see `result-celebration.md`
for the richer version).

Behavior contract: one page visible at a time; speaker `btn-util` reads the
current page via `sprout.tts`; Next is the primary flow and becomes Finish on
the last page; elapsed seconds tick into `sprout.state` while reading; state
resumes at the current page; exactly one `sprout.complete({ duration })` plus
a visible finish button.

## Skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<style>
  .x-hero { text-align: center; padding-top: var(--spacing-5xl); }
  .x-passage { font-size: var(--font-size-text-xl); line-height: 1.8; color: var(--text-primary); }
  .x-pagecount { color: var(--text-tertiary); font-size: var(--font-size-text-sm); font-weight: var(--font-weight-semibold); }
</style>
</head>
<body>

<div class="screen" id="screen-intro">
  <div class="x-hero stack stack-xl">
    <div class="tf" style="font-size:64px; line-height:1; height:64px;">📖</div>
    <!-- SLOT: title + one-line premise -->
    <h1 id="hello">Story Time!</h1>
    <p>A little story, just for you. Ready to read?</p>
    <button class="btn btn-primary btn-lg" onclick="startReading()">Start reading!</button>
  </div>
</div>

<div class="screen hidden" id="screen-read">
  <div class="top-toolbar">
    <div class="top-toolbar-leading">
      <button class="btn btn-util" onclick="readPage()" aria-label="Read it to me" style="width:44px;height:44px;font-size:20px;">🔊</button>
    </div>
    <div style="flex:1">
      <div class="progress-bar"><div class="progress-track"><div class="progress-fill" id="bar" style="width:0%"></div></div></div>
    </div>
    <div class="top-toolbar-trailing"><span class="x-pagecount" id="pagenum">1 / 1</span></div>
  </div>

  <div class="card">
    <p class="x-passage" id="passage">…</p>
  </div>

  <div class="row gap-lg">
    <button class="btn btn-secondary btn-lg" id="btn-prev" onclick="prevPage()">Back</button>
    <button class="btn btn-primary btn-lg" id="btn-next" onclick="nextPage()">Next</button>
  </div>
</div>

<div class="screen hidden" id="screen-result">
  <div class="x-hero stack stack-xl">
    <div class="tf animate-bounce-in" style="font-size:80px; line-height:1; height:80px;">🌟</div>
    <h1>The end!</h1>
    <p id="result-line"></p>
    <button class="btn btn-primary btn-lg" onclick="finishTap()">I'm done!</button>
  </div>
</div>

<script>
// SLOT: the passage, split into pages. Tier1: 1-2 short sentences per page.
// Tier2: 2-3 sentences. Tier3: a short paragraph per page is fine.
const PAGES = [
  { text: 'Milo the fox found a red kite in the tall grass. He wished it could fly.' },
  { text: 'The wind came whooshing down the hill. The kite jumped up into the sky!' },
  { text: 'Milo held on tight and laughed. Best day ever.' },
];

const S = sprout.state;
S.page ??= 0; S.elapsed ??= 0; S.done ??= false;
let tier = 'tier2', timer = null;

function el(id) { return document.getElementById(id); }
function showScreen(id) {
  try { sprout.tts.stop().catch(function(){}); } catch (e) {} // cancel in-flight narration so it does not bleed onto the next screen
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  el('screen-' + id).classList.remove('hidden');
}
function say(text) { try { sprout.tts.stop().catch(function(){}); sprout.tts.speak({ text }).catch(function(){}); } catch (e) {} }
function sig(name, props) { try { sprout.signal(name, props || {}); } catch (e) {} }

function startTimer() {
  if (timer) return;
  timer = setInterval(() => { if (!S.done) S.elapsed += 1; }, 1000);
}

function startReading() { showScreen('read'); startTimer(); renderPage(); }

function renderPage() {
  const p = PAGES[S.page];
  el('passage').textContent = p.text;
  el('pagenum').textContent = (S.page + 1) + ' / ' + PAGES.length;
  el('bar').style.width = Math.round(100 * (S.page + 1) / PAGES.length) + '%';
  el('btn-prev').classList.toggle('hidden', S.page === 0);
  el('btn-next').textContent = S.page === PAGES.length - 1 ? 'Finish!' : 'Next';
  if (tier === 'tier1') say(p.text);
}

function readPage() { say(PAGES[S.page].text); }

function prevPage() {
  if (S.page === 0) return;
  S.page -= 1;
  renderPage();
}

function nextPage() {
  if (S.page >= PAGES.length - 1) return finishReading();
  S.page += 1;
  sig('attempt-successful');
  renderPage();
}

function finishReading() {
  S.done = true;
  if (timer) { clearInterval(timer); timer = null; }
  const m = Math.floor(S.elapsed / 60), s = S.elapsed % 60;
  el('result-line').textContent = 'You read ' + PAGES.length + ' pages in ' + m + 'm ' + s + 's!';
  showScreen('result');
  sig('celebration', { pages: PAGES.length });
  say('The end! You read the whole thing. Great job!');
  try { sprout.complete({ duration: S.elapsed }); } catch (e) {}
}

function finishTap() {
  try { sprout.complete({ duration: S.elapsed }); } catch (e) {}
}

(async function boot() {
  try {
    const me = await sprout.whoami();
    tier = me.ageTier || 'tier2';
    if (me.childName) el('hello').textContent = 'Story time, ' + me.childName + '!';
  } catch (e) {}
  if (S.done) { finishReading(); return; }
  if (sprout.resumed && (S.page > 0 || S.elapsed > 0)) { startReading(); }
})();
</script>
</body>
</html>
```

## Slots (what you edit)

1. **`PAGES`** — the whole activity. Tier1: 1-2 short sentences per page and
   3-5 pages total; tier3 handles a short paragraph per page and more pages.
   Every page must read well aloud — the speaker button sends it verbatim.
2. **Intro copy + hero emoji** — theme it to the story (📖 🦊 🚀 …).
3. **Result copy** — the finish line already reports pages + time; add a
   story-specific payoff ("Milo says thanks for reading!").

## Polish notes

- The elapsed timer only runs while the reading screen is up and stops for
  good at finish — don't count intro dawdling as reading time.
- `S.elapsed` ticks once per second into `sprout.state`; that's durable
  progress (resume keeps the clock honest), not volatile state — keep it.
- Tier1 auto-reads each page on arrival AND keeps the speaker button for
  replays; tier2+ only speaks on request. On-screen text is always the
  source of truth — `tts` can fail silently.
- Back never changes the score of anything — re-reading is a feature. Never
  hide it behind a penalty.
- For chaptered content, keep one canvas per chapter rather than 20 pages in
  one — session length beats density, and completion should land while the
  kid still feels the win.
