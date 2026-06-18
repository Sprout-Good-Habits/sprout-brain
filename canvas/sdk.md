# Sprout Canvas SDK Reference

The Sprout Canvas SDK is the JavaScript surface every Sprout-served canvas
uses to talk back to the host shell. It's auto-injected — no install, no
script tag, no boilerplate. Canvases run inside a sandboxed iframe (web) or
WKWebView (iOS) with no network access except through this SDK.

> This doc is the **contract** between canvas authors and the Sprout host
> shell. The Sprout design system (CSS classes, components, tokens, layout
> patterns) is documented separately in `artifact-kit.md`. Use both.

---

## Import

The SDK is available two ways. They resolve to the same object at runtime.

```js
// Style A — vanilla global. No import statement needed.
sprout.whoami();
```

```ts
// Style B — ES module import (resolved by an importmap to window.sprout).
import { sprout } from '@sprout/canvas/sdk';
sprout.whoami();
```

**Do not** add `<script src="...">` tags pointing at external scripts — the
SDK is already present, and the canvas's CSP blocks external script loads.
**Do not** use `import` paths other than `@sprout/canvas/sdk` — only that
specifier is registered in the importmap.

---

## Reads — return a `Promise`

### `sprout.whoami(): Promise<Identity>`

Identify the active child. Use on load to personalize the canvas.

```ts
type Identity = {
  childId: string;    // stable id (opaque — for analytics, not display)
  childName: string;  // first name — display this to the kid
  ageTier: 'tier1' | 'tier2' | 'tier3';  // 4-6 / 7-9 / 10+
};
```

Example:

```js
const me = await sprout.whoami();
document.getElementById('title').textContent = `${me.childName}'s Math Game`;
```

Use `ageTier` to gate complexity — e.g., tier1 gets simpler multiplication
tables (×2-5), tier3 gets the full ×2-12.

### `sprout.getAsset(assetId: string): Promise<Asset>`

Fetch a previously-saved asset. Returns metadata plus a Sprout-served URL
that drops straight into `<img src>` / `<audio src>`.

```ts
type Asset = {
  assetId: string;
  url: string;       // pre-signed / inline; usable directly in src=
  kind: 'image' | 'audio' | 'drawing' | 'text';
  sizeBytes: number;
  createdAt: string; // ISO 8601
};
```

Example:

```js
const asset = await sprout.getAsset('fixture-drawing-1');
document.getElementById('preview').src = asset.url;
```

### `sprout.uploadAsset(content: string, kind: Asset['kind']): Promise<Asset>`

Upload a kid-created asset. Returns the same `Asset` shape with the new id
and URL. v1: strings only (SVG markup, data URLs, plain text). 256 KB cap.

```js
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect fill="hsl(${hue},60%,75%)" width="100" height="100"/>
</svg>`;
const asset = await sprout.uploadAsset(svg, 'drawing');
document.getElementById('preview').src = asset.url;
```

Binary upload (`Blob`, `ArrayBuffer`) is reserved for v2 — when it lands,
the same `uploadAsset` accepts those types directly. For now, encode binary
as a data URL string before passing.

### `sprout.history(limit?: number): Promise<{ items: Attempt[] }>` — Roadmap

_Not callable from a canvas yet_ — no host bridges it, so it rejects with
`Error("unsupported in this host yet: history")`. Planned: fetch prior
completion records for this canvas, for "your last score" / "your best time"
callouts. Do not depend on it.

```ts
type Attempt = {
  completedAt: string;       // ISO 8601
  score?: number;            // present for scored canvases
  total?: number;
  durationSec?: number;      // present for timed canvases
};
```

`limit` defaults to 10, max 50.

### `sprout.recall(opts?: RecallOpts): Promise<RecallItem[]>` — Roadmap

_Not callable from a canvas yet — no host bridges it._ The cross-canvas memory
**server** is live (`GET /v1/canvas-runs`), but no host translates
`sprout.recall()` into that call, so invoking it today rejects with
`Error("unsupported in this host yet: recall")` — same as `history()`. Planned:
recall the SAME child's prior **completed** runs (each item is that run's
`sprout.state` snapshot plus when it completed) so a canvas can build on earlier
sessions. Read-only, child-scoped, completed-only.

```ts
type RecallOpts = { canvasId?: string; limit?: number }; // limit default 10, max 50
type RecallItem = { data: unknown; completedAt: string }; // data = your sprout.state shape
```

`recall()` returns the full memory snapshot of completed runs and can span
canvases; `history()` returns lightweight scored/timed summaries of THIS canvas.
Both are Roadmap. For resuming the CURRENT run, use **`sprout.state`** (Released;
see "Canvas Memory") — there is no "no cross-attempt memory" gap for current-run
continuity.

---

## Buddy voice — `sprout.tts` (Released)

The Sprout buddy — the companion in the corner of the kid's screen — can speak
out loud on request: celebrate a correct answer, read a prompt for a pre-reader,
nudge a stuck kid. The host synthesizes and plays the speech through the buddy
overlay; your canvas only asks.

**Released on the kid's device only.** The local web preview has no buddy, so
`tts.speak` / `tts.stop` reject **immediately** there with an `unsupported` /
`not-implemented` `Error` (NOT the 10s timeout) — always handle the rejected
branch.

### `sprout.tts.speak(opts): Promise<{ spoken: true }>`

Ask the buddy to say `opts.text` out loud.

```ts
type SproutTtsSpeakOptions = {
  text: string;   // required, non-empty — the ONLY field with effect in V1
  voice?: string; // reserved; ignored today (host strips it — not rejected)
  rate?: number;  // reserved; ignored today (host strips it)
  lang?: string;  // reserved; ignored today (host strips it)
};
```

- **Send only `text`.** A non-empty string (it is trimmed). `voice` / `rate` /
  `lang` exist for forward-compatibility but V1 ignores them — passing extra keys
  is harmless (stripped on-device, **not** rejected). The buddy always speaks in
  its default Sprout voice for now.
- A resolved `{ spoken: true }` means the request crossed the host's governed
  boundary and was accepted — it is **not** proof the kid heard anything
  (synthesis can fail silently on the host). Keep on-screen content the source of
  truth; let voice be an enhancement.
- `speak` **rejects** (no error shape) on: empty / whitespace `text`
  (`tts.speak: invalid payload`), no host response within 10s, or a host / network
  failure. Always `await` inside `try / catch`.

```js
try {
  // Send ONLY text; `spoken: true` is an ack, not "the kid heard it".
  await sprout.tts.speak({ text: 'Try counting the apples one by one.' });
} catch {
  // Rejects in web preview (immediate 'not implemented'); on-device: empty text
  // or host error. Degrade quietly — the on-screen hint is the source of truth.
}
```

### `sprout.tts.stop(): Promise<void>`

Stop the buddy if it is currently speaking — e.g. when the kid moves to the next
question or your screen unmounts. Resolves with `void`, best-effort: wrap in
`try / catch` and don't block your UI on it.

---

## Signals — fire-and-forget

```ts
sprout.signal(name: SignalName, props?: Record<string, unknown>): void;
```

Signals declare meaningful events. The host shell decides how to react —
some shells animate the Sprout avatar, some show toasts, some log to
telemetry, some do nothing. Your job is to emit signals when something
worth-reacting-to happens; the host's job is to react.

| Signal | When to emit | Default avatar reaction |
| --- | --- | --- |
| `'celebration'` | Big positive moment — perfect streak, big win, milestone | celebration |
| `'milestone-reached'` | Smaller positive checkpoint — finished a section, hit a streak | laugh |
| `'attempt-successful'` | Routine correct answer or successful step | smile |
| `'attempt-failed'` | Routine wrong answer or failed step | doubtful |
| `'user-stuck'` | Kid is idle or repeatedly wrong | thinking |
| `'hint-requested'` | Kid explicitly asked for help | surprise |

Pick the most-specific signal that applies. If the kid hits a 5-streak, fire
`'celebration'` — don't also fire `'attempt-successful'`. If they hit a
3-streak, fire `'milestone-reached'`. Routine correct → `'attempt-successful'`.

```js
function onCorrect() {
  score++;
  streak++;
  if (streak === 5) sprout.signal('celebration', { streak });
  else if (streak === 3) sprout.signal('milestone-reached', { streak });
  else sprout.signal('attempt-successful');
}

function onWrong() {
  streak = 0;
  wrongCount++;
  sprout.signal('attempt-failed');
  if (wrongCount >= 3) sprout.signal('user-stuck');
}
```

`props` is free-form — attach whatever context the host might find useful
(streak length, time remaining, question id). The wire message is JSON, so
keep `props` JSON-serializable.

---

## Completion — call exactly one, exactly once

Every canvas MUST end with a single terminal call. The canonical call is
`sprout.complete(opts)` — it takes any combination of measurements in one call,
so an activity that both scores and times itself reports both:

```js
sprout.complete({ score: 8, total: 10 });            // scored quiz
sprout.complete({ duration: 134 });                  // timed reading (seconds)
sprout.complete({ score: 8, total: 10, duration: 134 }); // scored + timed
sprout.complete({});                                 // open-ended finish
sprout.complete();                                   // same as complete({})
```

`opts` (`CompleteOpts`) — every field optional:

| field      | type                     | meaning                            |
| ---------- | ------------------------ | ---------------------------------- |
| `score`    | `number`                 | correct / points earned            |
| `total`    | `number`                 | max possible / questions attempted |
| `duration` | `number`                 | elapsed time, in **seconds**       |
| `summary`  | `string`                 | free-text summary of the run       |
| `answers`  | `Record<string, string>` | per-question answer map            |

How the host classifies the result: `score` present → scored; else `duration`
present → timed; else open-ended (a `total` without a `score` does not make it
"scored"). Only the fields you pass are forwarded.

The SDK guards double-fire — calling `complete` (or any alias below) twice, or
mixing two completion calls, is a silent no-op after the first. This lets you
wire completion into both an auto-trigger AND a visible submit button without
race conditions:

```js
// Auto-fire when timer ends
const timer = setInterval(() => {
  if (--timeLeft <= 0) {
    clearInterval(timer);
    sprout.complete({ score: correct, total: attempted }); // first call wins
  }
}, 1000);

// Also fire on manual submit
document.getElementById('submit').onclick = () => {
  sprout.complete({ score: correct, total: attempted });   // no-op if timer fired
};
```

### Legacy aliases (still supported)

These three are thin forwarders to `complete()`, kept for canvases already built
on them. New canvases should call `complete(opts)` directly.

```js
sprout.score(correct, total); // → complete({ score: correct, total }) — correct ≤ total, both ≥ 0
sprout.completed();           // → complete({})
sprout.timed(durationSec);    // → complete({ duration: durationSec })
```

### Show a submit button

Even when completion fires automatically, **always** show a visible submit
button the kid can tap. Kids need a sense of agency — the canvas shouldn't
just disappear when a timer ends. The SDK's double-fire guard makes wiring
both paths safe.

---

## Canvas Memory — `sprout.state` (auto-persisted resume)

Write your canvas's durable run state into `sprout.state` and the SDK
**auto-persists it as the child works** — there are NO save points, assignment
IS the save. When the child closes the app mid-activity and reopens the canvas,
the host **seeds `sprout.state` with the saved snapshot before your code runs**,
so it is already correct at your first line — no async wait, no poll.

**Author with merge-defaults: read `sprout.state`, default-fill the fields that
are missing, then mutate.** Never replace the whole object — assigning
`sprout.state = {…}` WIPES a resumed run.

```js
const S = sprout.state; // already the saved snapshot on resume, {} on a fresh start
S.step ??= 0; // default-fill ONLY what's missing — never overwrite
S.answers ??= {};

// …now mutate freely; every change auto-persists.
S.answers.q1 = 'blue';
S.step = 1;
```

Use `sprout.resumed` (a boolean, accurate at your first line) for the genuine
fresh-vs-resume branches:

```js
if (sprout.resumed) {
  goToStep(sprout.state.step); // returning mid-run — rebuild UI from restored state
} else {
  showIntro();                 // brand-new run — intro / tutorial / first-time bonus
}
```

`sprout.restore()` is a **deprecated** back-compat alias (returns the snapshot
when resuming, else `null`); prefer `sprout.resumed`. `sprout.save()` is a
**manual-flush escape hatch** — you rarely need it, assignment already persists.

### Authoring rules (HARD)

- **Merge-defaults, never replace.** Default-fill missing fields
  (`sprout.state.x ??= default`) and mutate. Assigning `sprout.state = {…}`
  wholesale clobbers a resumed run — branch on `sprout.resumed` instead.
- **Durable state only.** Answers, current step, progress, score-so-far. Keep
  volatile / derived / animation state OUT — every write persists, so volatile
  writes cause write-amplification.
- **JSON-serializable values only.** No functions, DOM nodes, `Date`, `Map`,
  `Set` — stripped on save.
- **No PII / identifiers** in `sprout.state`. Activity data only.
- **Always wire `sprout.state` — every canvas.** A canvas that ignores it
  restarts the child from scratch on every reopen, which we never want.

---

## Rules

1. **No `fetch()`.** Network access is blocked by the canvas CSP. Use
   `sprout.getAsset` / `sprout.uploadAsset` for I/O.
2. **No external `<script src>`.** Blocked by CSP. Keep all your JS inline,
   or inside `<script type="module">` blocks.
3. **No `localStorage` / `cookies`.** The canvas runs in an opaque-origin
   sandbox; these are either blocked or empty. For durable state use
   **`sprout.state`** (Canvas Memory) — it auto-persists and resumes the CURRENT
   run across reopens (Released). Reading PRIOR runs (`sprout.history()` /
   `sprout.recall()`) is **Roadmap** — not callable yet.
4. **One completion per canvas.** Call `sprout.complete(opts)` (or a legacy
   alias — `score` / `completed` / `timed`) exactly once.
5. **Visible submit button required.** Even with auto-completion.
6. **Signals are optional.** Emit them for meaningful moments; the host
   dedupes if needed.

---

## Error handling

SDK methods reject with a plain `Error` whose `.message` carries the reason — a
timeout (`sprout.<method> timed out after 10000ms`), or the host's reason string
(e.g. an `unsupported` / `not-implemented` message in the web preview, or
`tts.speak: invalid payload`). There is **no** typed `SproutCanvasError` class
with `code` / `retryable` — every rejection is a base `Error`; branch on
`err.message` only if you must.

Most failures aren't worth retrying mid-canvas (a read timed out, or the host
rejected it). Show a friendly fallback and call `sprout.complete()` to end
gracefully:

```js
try {
  const me = await sprout.whoami();
  document.getElementById('title').textContent = `${me.childName}'s Game`;
} catch (err) {
  document.getElementById('title').textContent = 'Your Game';
  // keep going — a failed whoami shouldn't block the activity
}
```

Timeouts: SDK methods reject after 10 seconds if the host doesn't respond.
This is a defensive timeout — under normal conditions reads return in <500ms.

---

## Legacy bridge (escape hatch — avoid)

The original lower-level contract still works and is what `sprout.*` methods
ultimately call under the hood:

```js
window.SproutBridge.postMessage(JSON.stringify({
  type: 'scored',
  score: 8,
  total: 10
}));
```

You don't need this. The `sprout.*` methods are terser, typed, and the SDK
guards double-fire for you. Use `SproutBridge.postMessage` directly only if
you're authoring against the wire protocol itself — for example, writing a
new host adapter.

---

## Versioning

This is a pre-v1 SDK. No semver promises yet. Sprout-internal canvases are
versioned with the host shell, so the SDK won't change under them. External
canvases consuming a stable version: when the SDK reaches v1, it'll be
published with a stable URL canvases can pin to.

---

## Reference: complete hello-world

```html
<!doctype html>
<html lang="en">
<body>
  <h1>Hello, <span id="who">friend</span>!</h1>

  <button onclick="ask()">Who am I?</button>
  <button onclick="celebrate()">I did it!</button>
  <button onclick="finish()">Done</button>

  <script>
    async function ask() {
      const me = await sprout.whoami();
      document.getElementById('who').textContent = me.childName;
    }

    function celebrate() { sprout.signal('celebration'); }

    function finish() { sprout.complete(); }
  </script>
</body>
</html>
```

That's a complete, working Sprout canvas — three buttons, four SDK calls,
zero imports.
