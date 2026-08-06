# Sprout Canvas SDK Reference

The Sprout Canvas SDK is the JavaScript surface every Sprout-served canvas
uses to talk back to the host shell. It's auto-injected — no install, no
script tag, no boilerplate. Canvases run inside a sandboxed iframe (web) or
WKWebView (iOS) with no network access except through this SDK.

> This doc is the **contract** between canvas authors and the Sprout host
> shell. The Sprout design system (CSS classes, components, tokens, layout
> patterns) is documented separately in `artifact-kit.md`. Use both.

---

## SDK status legend

Every method below is tagged **Released**, **Feature-gated**, or **Roadmap**.

- **Released** — wired on the kid's device (iOS). A few Released methods are
  intentionally inert in the local **web preview** (it has no buddy overlay and
  no server allowlist) and reject there — each method's section flags this. Safe
  to build on, but always handle the documented preview-degraded branch.
- **Feature-gated** — implemented on the supported host, but unavailable by
  default. Runtime photo capture/upload requires the server-controlled
  `canvas_uploads` launch decision: either `FEATURE_CANVAS_UPLOADS` is enabled
  for the environment or the family has an active approved pilot grant. When
  access is ineffective, the host blocks before camera presentation and before
  creating, transferring, finalizing, or reading runtime media. The SDK methods
  remain typed and discoverable so authors can implement a safe fallback.
  Task-driven `sprout.activity` video verification is separately gated by
  `activity_video_verification_v1` plus the assignment, Canvas declaration,
  cohort, iOS host-version, device, and permission checks described below.
- **Roadmap** — present in the SDK type surface so you can see its shape, but
  **not implemented on any host**. Calling one today rejects immediately with
  `Error("unsupported in this host yet: <method>")`. **Do not build a canvas
  that depends on a Roadmap method** — its shape may still change before it
  ships.

Released today: `whoami`, `sprout.participants` / `sprout.onParticipantsChanged`,
`openExternalUrl`, `sprout.tts.speak` /
`sprout.tts.stop`, `sprout.rive.resolveAsset`, `signal`, `sprout.progress`
(`setup` / `show` / `hide` / `set` / `clear`), `sprout.journey` (`get` / `save`),
`sprout.values`, `sprout.log`, `score` / `complete` / `timed`, and the legacy
`SproutBridge`. The Health Canvas proof methods (`sprout.health`,
`sprout.camera`, and `sprout.ai`) are also released, but only in the
flag-enabled parent board host described below. Everything in the **Roadmap**
section below is not callable yet.

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

**Do not** add `<script src="...">` tags pointing at arbitrary external
scripts — the SDK is already present, and the canvas's CSP blocks loads from
any origin other than the canvas itself. The one supported way to bring in
an external library is the **canvas-CDN proxy** (see [Rules](#rules) §2),
which routes you to a pinned jsdelivr release through a Sprout-controlled
allowlist.

**Do not** use `import` paths other than `@sprout/canvas/sdk` (for the SDK
itself), the canvas-CDN proxy URL shape
(`/api/canvas-cdn/jsdelivr/npm/<pkg>@<version>/<file>`) for external
libraries, or a bare specifier that your canvas maps with a static import map
to that exact canvas-CDN URL shape.

---

## Runtime model — browser sandbox, not Node

Canvas code runs as plain browser JavaScript inside a sandboxed iframe (web)
or WKWebView (iOS). It is **not** Node.js, Vite, Webpack, React, Expo, or any
other framework/runtime. There is no package install step, no bundler, no
server-side module resolution, and no Node standard library.

Do not use Node-only APIs or globals such as `require`, `fs`, `path`,
`process`, `Buffer`, `module.exports`, or package-name imports that depend on
Node/npm resolution. Browser ESM accepts explicit URLs and static import-map
specifier mappings only. If a library's README assumes a bundler, translate
the example into plain browser ESM with pinned `/api/canvas-cdn/...` URLs
before authoring the canvas.

---

## Reads (Released)

### `sprout.whoami(): Promise<Identity>` — Released

Identify the active child. Use on load to personalize the canvas.

```ts
type Identity = {
  childId: string; // driving principal's id (opaque — for analytics, not display)
  childName: string; // first name — display this to the kid
  ageTier: 'tier1' | 'tier2' | 'tier3'; // 4-6 / 7-9 / 10+
  principalType?: 'child' | 'parent'; // who is driving — see note below
  sample?: true; // present only for synthetic preview identities (see below)
  avatar?: ParticipantAvatar | null; // the viewer's OWN Village avatar, or null
};
```

`principalType` and `avatar` are **additive** — canvases reading only `childId`
/ `childName` / `ageTier` are unaffected.

`childId` is the **driving principal's** id, and on the parent board host that
is the **parent's** id, not a child row — it is `'child'` on the kid hosts and
the web preview, `'parent'` on the parent board host. Do NOT assume a child row
keyed only by `childId`; branch on `principalType` when the distinction matters
(e.g. a canvas that keys per-child state must not mint a row for a parent).

`avatar` is the viewer's own cosmetic Village character (same shape as a
`participants()` entry, see below), or `null` when the viewer hasn't customized.
Pair it with `sprout.rive.resolveAsset` to render the viewer as their own
character.

In the web preview, an anonymous or kid-less viewer resolves to a synthetic
sample child marked `sample: true` (a signed-in parent still gets their real
kid, unmarked). Render it exactly like a real identity — the marker only lets
chrome flag it as a preview stand-in; it is never set on the kid's device.

Example:

```js
const me = await sprout.whoami();
document.getElementById('title').textContent = `${me.childName}'s Math Game`;
```

Use `ageTier` to gate complexity — e.g., tier1 gets simpler multiplication
tables (×2-5), tier3 gets the full ×2-12.

Runtime-media requests (`camera.capture`, `asset.upload`, `asset.resolve`) are
**Feature-gated** on the iOS kid host under `canvas_uploads`. The
`FEATURE_CANVAS_UPLOADS` env lever defaults OFF (unset and every non-truthy
value are OFF); effective per-family access is that lever OR an active family
pilot grant, so a pilot grant can make access effectively ON even when the
lever is off. See "Release-gated and roadmap methods" below for how the
decision is composed. The parent-board-only Health proof
reads are documented below. Cross-run reads
(`history` / `recall`) are Roadmap and reject as unsupported. Durable run state is a
separate, Released surface — see "Canvas Memory — `sprout.state`".

---

## Participants — the canvas roster (Released)

### `sprout.participants(): Promise<Participant[]>` — Released

Read the canvas's roster so a multiplayer / board canvas renders the family's
**real** Village characters live — instead of hardcoding Rive inputs into HTML
that rot the moment a kid recustomizes.

```ts
type ParticipantAvatar = {
  kind: 'village-character';
  // Exactly the 14 Village axes, clamped. Keyed by CONFIG key
  // (skin, eyeShade, hair, hairShade, beard, beardShade, clothing,
  // clothingColour, glasses, glassesShade, earring, faceDetail, headwear,
  // headwearShade). The UI-only `background` axis is NEVER included.
  inputs: Record<string, number>;
};

type Participant = {
  id: string; // principal id (opaque, stable per roster)
  principalType: 'child' | 'parent';
  name: string; // display first name (never empty)
  isSelf: boolean; // true for exactly the viewer
  avatar: ParticipantAvatar | null; // null ⇒ uncustomized (fall back to your own chip)
};
```

**Scope equals visibility** — each host answers exactly the roster its user
already sees, and nothing more:

| Host                            | `participants()` answers                                        |
| ------------------------------- | --------------------------------------------------------------- |
| Board-play host (kid or parent) | the board's **active members**                                  |
| Solo skill run                  | `[self]`                                                        |
| Web preview                     | a synthetic **sample cast** (never real names, even logged out) |
| Parent chat modal / old builds  | rejects `unsupported in this host yet`                          |

Ages, birthdays, emails, and the `background` axis **never** cross the bridge —
`participants()` is presentation data only.

**Rendering a character.** The `inputs` are keyed by config key; the Rive state
machine expects its own input **names**. Map them when you drive Rive — and mind
the one gotcha: **`beardShade` maps to the Rive input `'beardshadeID '` with a
TRAILING SPACE.** Set it verbatim or the input silently no-ops.

```js
// axis config key → Rive state-machine input name
const RIVE_INPUT = {
  skin: 'skinID',
  eyeShade: 'eyeshadeID',
  hair: 'hairID',
  hairShade: 'hairshadeID',
  beard: 'beardID',
  beardShade: 'beardshadeID ' /* ← trailing space is REAL */,
  clothing: 'clothingID',
  clothingColour: 'clothingcolourID',
  glasses: 'glassID',
  glassesShade: 'glassshadeID',
  earring: 'earringID',
  faceDetail: 'facedetailID',
  headwear: 'headwearID',
  headwearShade: 'headwearshadeID',
};

const [me, ...others] = await sprout.participants();
const roster = await sprout.participants();
const asset = await sprout.rive.resolveAsset('village-character');
// new rive.Rive({ src: asset.url, ... }) → then, per member:
for (const p of roster) {
  if (!p.avatar) continue; // uncustomized — render your own fallback chip
  for (const [key, value] of Object.entries(p.avatar.inputs)) {
    stateMachineInput(RIVE_INPUT[key]).value = value; // note the beardShade space
  }
}
```

### `sprout.onParticipantsChanged(cb: () => void): () => void` — Released

Subscribe to roster changes. When a member joins/leaves or recustomizes their
avatar mid-run, the host fires a **bare** signal (no data rides it). It means
**"identity presentation data changed"** — re-call **both** `participants()`
**and** `whoami()`: the change may be to another member OR to the viewer's own
avatar (`whoami().avatar`), and the signal does not say which. Re-pulling both
heals every case, no remount. Returns an unsubscribe function. Solo + preview
hosts never fire it (static scope).

Because the signal is bare and coalesced, also re-pull once when you first
subscribe — a change can land in the gap before your subscription attaches.

```js
async function refreshIdentity() {
  const [me, roster] = await Promise.all([sprout.whoami(), sprout.participants()]);
  rerenderSelf(me.avatar); // the viewer's own avatar may have changed
  rerenderCharacters(roster); // …or another member's
}
const stop = sprout.onParticipantsChanged(refreshIdentity);
refreshIdentity(); // re-pull once on subscribe (covers a pre-subscribe change)
// later: stop();
```

---

## External learning links (Released)

### `sprout.openExternalUrl(input: { url: string; label?: string }): Promise<OpenExternalUrlResult>` — Released

Request a server-authorized launch of an external learning URL. Use this when
a canvas needs to send the kid to a parent- or tutor-assigned learning service,
such as a Khan Academy math path. The host shell checks the URL against
Sprout's server-side allowlist, opens the authorized HTTPS URL externally when
allowed, and returns a structured decision to the canvas.

**Today the allowlist covers Khan Academy math paths
(`https://www.khanacademy.org/math/...`) and Duolingo ABC's next-lesson
universal link (`https://abc.duolingo.com/next_lesson`), with no query string
or hash.** Any other URL — a different service, a different Khan section, a
different Duolingo ABC path, or an otherwise allowed path carrying a tracking
query — returns `decision: 'blocked'`. Do not author `openExternalUrl` buttons
against other services or sections; they will render a button that does nothing
when tapped.

This is a launch request, not a network or browser embed API:

- Only HTTPS URLs on Sprout-authorized learning services can be allowed.
- Query strings and hash fragments are rejected by policy today; pass the
  canonical public path you want to launch.
- In the local **web preview** the host is not wired to the server allowlist,
  so `openExternalUrl` always resolves to
  `{ decision: 'blocked', reason: 'feature_disabled' }` (the real authorize +
  launch runs only on the device hosts). Build for the blocked branch and it
  degrades cleanly in preview.
- Raw `<a href>`, `window.location`, custom schemes, `fetch`, and embedded
  webviews are still blocked by the canvas sandbox. Put a normal button in
  your UI and call `sprout.openExternalUrl(...)` from its click handler.
- The host may block a URL even if it looks valid. Always handle the blocked
  result and keep the canvas usable.

```ts
type OpenExternalUrlResult =
  | { decision: 'allowed' }
  | {
      decision: 'blocked';
      reason:
        | 'invalid_payload'
        | 'invalid_url'
        | 'unsupported_scheme'
        | 'feature_disabled'
        | 'url_not_allowed'
        | 'auth_required'
        | 'launch_failed'
        | 'service_unavailable';
      message?: string;
      serviceDisplayName?: string;
    };
```

Example:

```html
<button id="khan-math" type="button">Open Khan Academy math</button>
<button id="duo-abc" type="button">Open Duo ABC</button>
<p id="link-status" aria-live="polite"></p>

<script>
  const status = document.getElementById('link-status');

  document.getElementById('khan-math').onclick = async () => {
    const result = await sprout.openExternalUrl({
      url: 'https://www.khanacademy.org/math/cc-seventh-grade-math',
      label: 'Khan Academy math',
    });

    if (result.decision === 'blocked') {
      status.textContent = 'This link is not available from Sprout right now.';
    }
  };

  document.getElementById('duo-abc').onclick = async () => {
    const result = await sprout.openExternalUrl({
      url: 'https://abc.duolingo.com/next_lesson',
      label: 'Duo ABC next lesson',
    });

    if (result.decision === 'blocked') {
      status.textContent = 'Duo ABC is not available from Sprout right now.';
    }
  };
</script>
```

---

## Buddy voice (Released)

The Sprout buddy — the friendly companion in the corner of the kid's screen —
can speak out loud on request. Use this to react in the buddy's own voice:
celebrate a correct answer, read a prompt aloud for a pre-reader, or nudge a
stuck kid. The host synthesizes the speech and plays it through the buddy
overlay with lip-sync; your canvas only asks.

**Released on the kid's device.** The local web preview has no buddy and rejects
these calls (see below) — always handle the rejected branch.

### `sprout.tts.speak(opts: SproutTtsSpeakOptions): Promise<{ spoken: true }>` — Released

Ask the buddy to say `opts.text` out loud.

**The buddy lives in the host shell, not in your canvas. Your canvas never
receives, plays, or controls any audio — it sends text and gets back a single
acknowledgement bit.** A resolved `{ spoken: true }` means the request crossed
the host's governed boundary and was accepted; it does **not** guarantee the kid
actually heard anything (synthesis can fail silently on the host). Never treat
`speak` resolving as "the audio played" — keep your on-screen content the source
of truth and let the voice be an enhancement on top.

This is a request to the host buddy, not a Web Speech / `<audio>` API:

- **Send only `text`.** The wire contract is `{ text }` — a non-empty string (it
  is trimmed). The type also lists `voice?`, `rate?`, and `lang?` for
  forward-compatibility, but V1 ignores them: on the kid's device the host
  forwards only `text`, so passing extra keys is harmless but has **no effect**
  (it does **not** reject). Send `{ text }` and don't rely on the others.
- The buddy always speaks in its default Sprout voice for now.
- `speak` **rejects** (it does not resolve to an error shape) on: empty or
  whitespace-only `text` (rejected before the host governs the call — on-device
  message `tts.speak: invalid payload`); no host response within 10s (a timeout
  `Error`); or a host / network failure (an `Error`). Always `await` it inside
  `try / catch`.
- In the local **web preview** there is no buddy overlay, so `tts.speak` /
  `tts.stop` are not implemented — the call rejects **immediately** with an
  `unsupported` / `not-implemented` `Error` (not the 10s timeout). The real voice
  runs only on the kid's device; build for the rejected branch so the canvas
  degrades cleanly in preview.
- There is nothing to declare — just call `sprout.tts.speak({ text })`. Canvas
  authors do not declare capabilities; the host governs the call for you.

### `sprout.tts.stop(): Promise<void>` — Released

Stop the buddy if it is currently speaking — e.g. when the kid moves to the next
question or your screen unmounts. Resolves with `void` and is best-effort: wrap
it in `try / catch` and don't block your UI on it. A failed or late `stop` just
means the current utterance may finish playing on its own.

```ts
type SproutTtsSpeakOptions = {
  text: string; // required, non-empty — the ONLY field that has effect in V1
  voice?: string; // reserved for a future release; ignored today (host strips it)
  rate?: number; //  reserved for a future release; ignored today (host strips it)
  lang?: string; //  reserved for a future release; ignored today (host strips it)
};

type SproutTtsSpeakResult = { spoken: true }; // acknowledgement only — never audio
```

Example:

```html
<button id="hint" type="button">Hear a hint</button>
<p id="hint-text">Try counting the apples one by one.</p>

<script>
  document.getElementById('hint').onclick = async () => {
    try {
      // Send ONLY text. `spoken: true` means the buddy got the request — not a
      // guarantee the kid heard it — so keep the hint visible on screen too.
      await sprout.tts.speak({ text: 'Try counting the apples one by one.' });
    } catch {
      // Rejects in the web preview (immediate 'not implemented'); on-device:
      // empty text or a host error. Degrade quietly — the on-screen hint is
      // the source of truth.
    }
  };

  // Quiet the buddy before moving on:
  async function nextQuestion() {
    try {
      await sprout.tts.stop();
    } catch {
      /* best-effort */
    }
    // ...render the next question...
  }
</script>
```

---

## Rive animations — `sprout.rive` — Released

Rive is the one sanctioned WASM runtime inside a canvas. Use it for rich
vector animation, interactive characters, and state-machine-driven motion (a
mascot that reacts, a scene that responds to a kid's progress). The runtime
itself is `@rive-app/canvas` — an ordinary browser JS library you load through
the canvas-CDN proxy and drive with its own public API. `sprout.rive` is the
thin Sprout seam around it: it **resolves an asset** to a same-origin URL and
**pre-pins the Rive wasm loader** so you never touch wasm plumbing.

**Released on the kid's device (iOS).** Web-preview render fidelity tracks
stories `-b`/`-c`; build for the device and let the preview degrade — wrap the
load in `try / catch` and show a static poster as the fallback (below).

### `sprout.rive.resolveAsset(idOrBundlePath): Promise<RiveAsset>` — Released

Resolve a Rive asset to a same-origin URL you pass straight to the Rive
runtime's `src`. Pass a plain `string` to resolve a first-party **curated**
asset by id, or `{ bundlePath }` to resolve **your own** `.riv` carried as a
canvas bundle asset.

```ts
type RiveResolveByBundle = {
  bundlePath: string; // manifest path of your own bundled .riv, e.g. 'anim/hero.riv'
};

type RiveAsset = {
  url: string; // same-origin URL — pass DIRECTLY as the Rive runtime's `src`
  source: 'curated' | 'bundle'; // which mode resolved it
};

sprout.rive.resolveAsset(id: string | RiveResolveByBundle): Promise<RiveAsset>;
```

It is **resolve + pin, and nothing else.** `sprout.rive` deliberately does NOT
wrap, version, or re-export the Rive runtime API — there is no
`sprout.rive.Rive`, no `play`, no `stateMachineInputs`. After you resolve the
URL, you construct `new rive.Rive({...})` and drive the ordinary
`@rive-app/canvas` JS API yourself. Two facts make that safe:

- **The blessed loader pins the wasm for you.** At runtime init — before your
  first line — Sprout pins Rive's `RuntimeLoader` wasm URL to a same-origin
  canvas-CDN path. You never call `RuntimeLoader.setWasmUrl`, never reference a
  `.wasm` URL, never call `WebAssembly.*`. This pinned shape is the contract
  the create-time analyzer recognizes as the blessed path (see below).
- **`resolveAsset` is the only member**, and it inherits the SDK's 10s timeout.
  On an unknown curated id or an invalid bundle path it **rejects** with a plain
  `Error` — `try / catch` it and fall back to a static poster.

`@rive-app/canvas` v2.37.8 is UMD-only: loaded via the canvas-CDN proxy it
registers a `window.rive` global (there is no ESM build to import as a module).
Load it with a classic `<script src>` against the proxy, then read `window.rive`.

### The three asset modes (no creative ceiling — the safety envelope is the only one)

There is no fixed menu of "allowed" Rive shapes. Inside the safety envelope
(no external network, no storage, no workers, no iframe escape) you compose
freely. These three modes are how you get an asset to animate — pick whichever
fits, mix them:

- **Mode A — curated-by-reference.** Load a first-party Sprout `.riv` by its
  catalog id (e.g. `'sprout-mascot'`, `'village-scene'`). Served same-origin by
  story `-b`; no upload, no bytes in your tool call. The fastest path and the
  one the pilot uses.
- **Mode B — bring-your-own `.riv`.** Carry your own `.riv` as a canvas bundle
  asset (declared via the bundle pipeline — `canvas.prepare_upload`, magic-byte
  - extension allowlisted by story `-a`), then resolve it with
    `{ bundlePath: 'anim/hero.riv' }`. Use when you have an existing `.riv` file
    (e.g. exported from the Rive editor) that isn't in the curated catalog.
- **Mode C — generate-from-scratch.** Customize a curated/bundled Rive (drive
  its state-machine inputs, swap artboards, recolor at runtime), OR author the
  motion procedurally with the **existing non-Rive primitives** — SVG, CSS
  animation, `<canvas>` 2D, or three.js via the canvas-CDN proxy. "From scratch"
  is about the _motion you design_, not about emitting a new `.riv`.

> **Honest caveat — you cannot text-generate a `.riv`.** A `.riv` is a **binary
> editor format** (authored in the Rive editor); an agent cannot reliably emit
> its bytes as text. "From-scratch Rive" therefore means **Mode A customization**
> (take a curated/bundled `.riv` and reshape its behavior at runtime through the
> state-machine API) or **Mode C procedural authoring** with non-Rive primitives
> — NEVER hand-writing `.riv` bytes. If you try, you produce a corrupt binary
> the runtime rejects; fall back to Mode A or Mode C instead.

### Customizing motion — drive the state machine through the ordinary Rive API

A Rive asset's interactivity lives in its **state machine** — named inputs
(booleans, numbers, triggers) the runtime exposes. You read them with the
ordinary `@rive-app/canvas` API after the file loads and set them to change
behavior. `sprout.rive` plays no part here — this is plain Rive:

```html
<canvas id="stage" width="400" height="400"></canvas>
<img id="poster" src="/api/canvas-cdn/..." alt="" /><!-- optional static fallback -->
<script src="/api/canvas-cdn/jsdelivr/npm/@rive-app/canvas@2.37.8/rive.js"></script>
<script>
  async function startRive() {
    try {
      // Mode A — resolve a curated asset to its same-origin URL.
      const asset = await sprout.rive.resolveAsset('sprout-mascot');
      const r = new window.rive.Rive({
        src: asset.url, // the resolved same-origin URL — never a .wasm URL
        canvas: document.getElementById('stage'),
        autoplay: true,
        stateMachines: 'State Machine 1',
        onLoad() {
          // Poster-first → swap to the live animation once Rive is ready.
          document.getElementById('poster').style.display = 'none';
          // Customize ≥1 state-machine input through the ordinary Rive API.
          const inputs = r.stateMachineInputs('State Machine 1');
          const happy = inputs.find((i) => i.name === 'happy');
          if (happy) happy.value = true;
        },
      });
    } catch (err) {
      // Curated id unknown, invalid bundle path, or no Rive host (web preview):
      // keep the static poster on screen and continue the activity.
    }
  }
  startRive();
</script>
```

The author owns the Rive instance, so the author owns its teardown — see the
lifecycle contract next.

### Lifecycle teardown — stop the render loop on `host-lifecycle`

A Rive instance runs its own `requestAnimationFrame` loop and holds WASM linear
memory. DOM teardown alone does **not** guarantee that loop is cancelled or the
memory reclaimed, and app-background does not detach the WebView at all. So the
host emits an explicit **`host-lifecycle`** message on two transitions:

- `phase: 'close'` — the canvas surface is detaching (navigation away /
  unmount); delivered just before the DOM is cleared, while your code is still
  alive.
- `phase: 'background'` — the app left the foreground; the WebView stays
  attached, so an off-screen loop must be stopped explicitly.

`sprout.rive` does not wrap the Rive lifecycle, so the **author** owns the
receiver: register a handler and call your Rive instance's `cleanup()` (or
`stop()`). A canvas that uses no Rive simply ignores the envelope — it is a safe
no-op.

```js
function handleHostLifecycle(msg) {
  if (msg && msg.type === 'host-lifecycle') {
    try {
      riveInstance && riveInstance.cleanup(); // stop rAF + release WASM memory
    } catch {
      /* best-effort teardown */
    }
  }
}
// web: the host posts the envelope to the canvas window.
window.addEventListener('message', (e) => handleHostLifecycle(e.data));
// iOS: the host delivers inbound through window.__sproutDeliver — wrap it so
// your Rive teardown runs without disturbing the SDK's own dispatch.
const priorDeliver = window.__sproutDeliver;
window.__sproutDeliver = function (msg) {
  handleHostLifecycle(msg);
  if (typeof priorDeliver === 'function') priorDeliver(msg);
};
```

---

## Health canvas proof capabilities — Released, parent-board host gated

These methods are part of the released SDK contract, but they are available
only inside a **flag-enabled parent board host**. They are intentionally
unsupported in the child app, the web preview, older app builds, and any host
without the Health Canvas feature enabled. Always wrap them in `try/catch` and
keep a visible non-proof fallback. Do not use host availability as evidence
that Health permission was granted.

The proof boundary is deliberately narrow:

- Health uses one fixed host-owned read set: active energy, steps, and workouts
  from the start of the local day. Canvas code cannot select metrics, request
  heart rate, or probe arbitrary date windows. It receives the host-derived
  categorical result AND, on a `met` / `not_met` reading, the two aggregate
  totals behind it — today's step count and active-energy `metrics` for the
  authorizing parent (SPR-3082). These are the parent's OWN consented activity
  numbers, shown on their proof card. Heart rate, individual workout rows, other
  units, and timestamps still never cross.
- Camera capture is foreground-only and camera-only. The canvas receives an
  opaque, mount-scoped `captureToken` plus safe dimensions and MIME type—never
  bytes, base64, a URL/URI, EXIF, an asset id, or photo-library access.
- AI accepts only the activity-proof operation. The trusted parent host binds
  the confirmed subject to the token; canvas code cannot supply attestation,
  a model, schema, system prompt, arbitrary prompt, or image content.
- Health proof results never belong in `sprout.complete(...)`. The separate
  runtime-media completion proof accepts one durable uploaded asset id; Health
  capture tokens are transient and must never enter that field. Save only the
  board-safe categorical state defined by the Health activity.

```ts
type CanvasRequestOptions = { signal?: AbortSignal };

sprout.health.requestAuthorization(
  options?: CanvasRequestOptions
): Promise<{
  status: 'available' | 'incomplete' | 'unavailable';
  presented: boolean;
  reason?: 'unsupported' | 'cancelled' | 'native_failure';
}>;

sprout.health.query(
  input: { since: 'startOfToday' },
  options?: CanvasRequestOptions
): Promise<{
  status: 'met' | 'not_met' | 'empty' | 'unavailable' | 'error';
  basis?: 'active_energy' | 'steps' | 'workout';
  headline?: string;
  // The parent's own consented totals, present only on a met / not_met reading.
  metrics?: { steps?: number; activeEnergy?: number };
}>;

sprout.camera.capture(
  input: { direction?: 'front' | 'back'; quality?: number },
  options?: CanvasRequestOptions
): Promise<{
  captureToken: string;
  width: number;
  height: number;
  mimeType: 'image/jpeg' | 'image/png';
}>;

sprout.ai.ask(
  input: {
    kind: 'activity-proof';
    captureToken: string;
    activityLabel: string;
  },
  options?: CanvasRequestOptions
): Promise<{
  verified: boolean;
  confidence: number;
  label: string;
  unavailable?: 'cancelled' | 'provider' | 'invalid_capture' | 'rate_limited';
}>;
```

`quality`, when present, must be from `0.1` through `1`. `activityLabel` is
visible wording and is limited to 120 characters. A camera token is transient,
consume-once, and valid only for the current mounted host; never put it in
`sprout.state`, journey data, logs, or completion.

The required `input` object distinguishes this parent-board proof call from the
feature-gated, zero-argument runtime-media capture documented below. Pass `{}`
when accepting the default camera direction and quality.

Authorization and camera sheets have 120-second deadlines, a Health query has
15 seconds, and an AI verdict has 30 seconds. Passing an `AbortSignal`, a
timeout, or leaving the canvas cancels the host operation and ignores a late
reply. An already-aborted signal rejects locally. Cancellation is terminal;
start a new request rather than reusing a token.

```js
async function collectActivityProof() {
  const controller = new AbortController();
  try {
    const authorization = await sprout.health.requestAuthorization({
      signal: controller.signal,
    });
    if (authorization.status !== 'available') return showManualFallback();

    const health = await sprout.health.query(
      { since: 'startOfToday' },
      { signal: controller.signal }
    );
    if (health.status === 'met') return showHealthSuccess(health.headline);

    const capture = await sprout.camera.capture(
      { direction: 'back', quality: 0.8 },
      { signal: controller.signal }
    );
    const verdict = await sprout.ai.ask(
      {
        kind: 'activity-proof',
        captureToken: capture.captureToken,
        activityLabel: "Today's movement",
      },
      { signal: controller.signal }
    );
    return verdict.verified ? showCameraSuccess(verdict.label) : showManualFallback();
  } catch {
    // Expected in child/web/old/flag-off hosts and on permission/provider failure.
    return showManualFallback();
  }
}
```

---

## Activity verification — task-driven native proof (Feature-gated)

`activity_verification_plan_v1` is the trusted, task-owned description of a
bounded activity check. The task author supplies the kid-facing instruction and
one closed activity intent; the server maps that intent to the profile, Count
Me meaning, audio rule, and capture limits, then freezes the complete plan for
the attempt. A Canvas may render the trusted instruction, but it cannot replace
the plan, choose a model/profile, loosen capture limits, or derive progress
from camera frames.

The V1 compatibility types are exported from every supported package surface.
Runtime constants and validators are host-tooling exports from `@sprout/canvas`,
`@sprout/canvas/ios`, `@sprout/canvas/web`, and
`@sprout/canvas/activity-verification`. The Canvas-author
`@sprout/canvas/sdk` entry exposes these as **types only** because its injected
runtime module exports only `sprout`; author code must not make named runtime
imports that old iframe/WKWebView hosts cannot provide.

- `activity_verification_v1` — the Canvas can orchestrate the generic
  activity-verification journey.
- `camera_video_v1` — the Canvas journey requires bounded foreground camera
  video.
- `microphone_v1` — the plan may require microphone audio.

These are declaration and preflight IDs, not caller-selectable policy. The
authoring analyzer derives them from executable `sprout.activity.*` calls, and
the host validates the frozen task plan, declarations, rollout gate, device
support, and permission state before presenting capture UI.

`sprout.activity.status()` reads the safe state for the current authenticated
Canvas run. `sprout.activity.verify()` presents or rejoins the native proof
journey and resolves at a terminal or unavailable state.
`sprout.activity.references()` reads the frozen plan's ordered `golden` example
images (documented below). All three accept only the standard optional request
controls (`signal` and `timeoutMs`); none of them accepts an app name,
instruction, target, profile, provider, asset id, or media input.

```js
const current = await sprout.activity.status();
renderTrustedPlan(current.plan);

startButton.addEventListener('click', async () => {
  const finished = await sprout.activity.verify();
  if (finished.state === 'terminal') renderSafeResult(finished.result);
});
```

The verify deadline is 30 minutes so recording, local safety checks, upload,
and assessment can finish without a bridge timeout. Status reads use a
15-second deadline. A Canvas reload may call `status()` to recover by run;
attempt IDs, task/child identity, evidence, provider details, and confidence
never cross the bridge. See
[`docs/examples/activity-verification.html`](./examples/activity-verification.html)
for an activity-neutral Canvas.

Example server-compiled plan:

```ts
const plan: ActivityVerificationPlanV1 = {
  version: 'activity_verification_plan_v1',
  instruction: 'Play a piano passage 3 times',
  captureMode: 'camera',
  profile: 'piano_passage_repetition_v1',
  checks: [
    {
      mode: 'count_me',
      criteria: 'one complete start-to-finish piano performance',
      target: 3,
      unit: 'repetitions',
    },
  ],
  audio: 'required',
  capturePolicy: {
    maxDurationSeconds: 90,
    maxSizeBytes: 10 * 1024 * 1024,
  },
};
```

The server compiles and freezes the closed verification profile. V1 supports
`piano_passage_repetition_v1` (audio required) and
`hand_clap_repetition_v1` (audio prohibited), with targets through 10 and a
10 MiB capture cap. Instruction, criteria, and unit are display context; they
do not define model policy or leave Sprout for verification.

Task authoring stores a closed `activity_verification_intent_v1` with
`activity`, `instruction`, and `target`; directly supplied plan/profile/audio
fields are rejected at the execution boundary.

V1 accepts exactly one Count Me check because its result has one
`observed`/`target`/`unit` projection. Multi-check plans require a future
per-check result version.

The Canvas-facing `activity_verification_result_v1` is metadata only:
`status`, `outcome`, `observed`, `target`, `unit`, a closed `message` code, and
optional coarse retry metadata. The trusted host localizes that code using the
numeric fields; arbitrary display copy never crosses into generic Canvas code.
Retry guidance is outcome-bound: verified results cannot request a retry;
insufficient evidence uses `evidence_insufficient`; ambiguous completed
assessments use `try_again`; blocked capture may use `permission_denied` or
`try_again`; and unavailable verification uses `verification_unavailable`.
Strict validation rejects contradictory retry guidance and extra fields,
including media paths/URLs, bytes, provider payloads, transcripts, model
confidence, child identity, and moderation details. Exported limits and
capability lists are frozen, and validators enforce private immutable limits
so consumer mutation cannot widen policy.

Result validation requires the trusted frozen plan. It rejects target or unit
values that differ from that plan, then reconstructs both fields from the
validated plan rather than passing result-producer strings through to Canvas.

V1 also bounds persisted metadata: instruction and criteria are each at most
1,000 JavaScript string characters, unit is at most 64, and Count Me target is
from 1 through 100. Plan and result validators enforce the same target/unit
limits so later attempt snapshots do not freeze unbounded JSON or incompatible
numeric values.

| Frozen task plan                                       | Required Canvas declarations                                          | Minimum host support                |
| ------------------------------------------------------ | --------------------------------------------------------------------- | ----------------------------------- |
| Camera Count Me, `audio: 'prohibited'`                 | `activity_verification_v1`, `camera_video_v1`                         | activity verification V1 + camera   |
| Camera Count Me, `audio: 'required'`                   | `activity_verification_v1`, `camera_video_v1`, `microphone_v1`        | activity verification V1 + mic      |
| Photo `golden_compare`, `audio: 'prohibited'` (always) | `activity_verification_v1`, `camera_video_v1`                         | activity verification V1 + camera   |
| Unknown plan/check/capture/audio contract version      | Unsupported; do not infer support from prose or another capability ID | matching future version is required |

Existing Canvases declare none of these IDs and remain unchanged. Declaration
alone never enables recording; unsupported combinations must fail preflight
without entering capture.

### `golden_compare` — photo proof profile

`golden_compare_v1` is the photo-proof sibling of Count Me above. It rides the
SAME two SDK methods — `sprout.activity.status()` / `sprout.activity.verify()`
— with plan-driven dispatch: the host branches on the frozen `plan.profile` /
`plan.captureMode`, never on a separate verb. A Canvas author never picks a
model, a comparison threshold, or an image; the TASK author supplies an
`instruction`, a model-facing `criteria` string, and 1–6 role-tagged reference
`assetId`s (at least one `golden`), and the server compiles and freezes those
into the same `ActivityVerificationPlanV1` shape, with `captureMode: 'photo'`,
`audio: 'prohibited'`, and a zero-duration capture policy (a still, not a
clip).

Required Canvas declarations: `activity_verification_v1`, `camera_video_v1` —
the same two IDs a Count Me Canvas declares, minus `microphone_v1` (a photo
proof records no audio). The authoring analyzer derives them from the exact
same executable `sprout.activity.verify()` / `sprout.activity.status()` calls
described above — there is no separate photo-specific SDK call to author
against. The analyzer is call-name-only and cannot see `check.mode`, so a real
golden_compare Canvas's actual declared set still includes `microphone_v1`
alongside these two in practice — this row states the required minimum, not
what a golden_compare Canvas ends up declaring today.

The terminal result carries a `golden_compare` check outcome instead of a
Count Me `observed`/`target` count. `finished.result.outcome` is one of
`verified` (photo matched the frozen golden reference(s)), `insufficient`
(a photo was judged but did not match — `retry?.allowed` gates a retake),
`not_sent` (`status: 'blocked'` — permission denied, or capture never
completed), or `unavailable` (verification could not run at all):

```js
const status = await sprout.activity.status();
renderTrustedPlan(status.plan); // status.plan.instruction — same trusted plan shape as Count Me

verifyButton.addEventListener('click', async () => {
  const finished = await sprout.activity.verify();
  if (finished.state !== 'terminal') return; // e.g. 'unavailable' — no plan, no journey
  const proof = finished.result;
  switch (proof.outcome) {
    case 'verified':
      celebrate();
      break;
    case 'insufficient':
      offerRetake(proof.retry); // proof.retry?.allowed gates a retake button
      break;
    case 'not_sent':
      showBlocked(proof.retry);
      break;
    case 'unavailable':
      showUnavailable();
      break;
    default:
      // needs_review is reserved for Count Me in V1 and never emitted by
      // golden_compare today, but the shared outcome type isn't narrowed
      // per check mode — fail visibly instead of silently no-op-ing.
      showUnavailable();
      break;
  }
});
```

See
[`docs/examples/tidy-room-photo-proof.html`](./examples/tidy-room-photo-proof.html)
for the real, Stage-uploadable worked example this snippet is drawn from — a
tidy-room activity authored as ordinary Canvas content that calls the one
shipped verb and branches on the structured terminal result only, with no
`task-proof` or capability plumbing anywhere in Canvas code.

### `sprout.activity.references(): Promise<ActivityReferencesResult>` — Feature-gated

Reads the active `golden_compare` task's frozen plan's ordered `golden`
reference images — the parent-authored "here's what done looks like" photos —
so a Canvas can show the kid an example BEFORE asking them to capture proof.
Takes no arguments: the Canvas never supplies a task, run, or asset id, and
never sees a storage path, signing credential, raw asset id, or the
verifier-only `criteria` string. `negative` references are never returned in
v1. Requires the same `activity_verification_v1` declaration as
`sprout.activity.status()` / `sprout.activity.verify()` — there is no separate
declaration for this read.

```ts
type ActivityReferencesResult =
  | { status: 'ready'; references: readonly ActivityReference[] }
  | {
      status: 'unavailable';
      reason: 'not_available' | 'capability_not_declared' | 'host_unsupported';
    };

interface ActivityReference {
  checkIndex: number; // position in the plan's `checks` array — preserve this order
  role: 'golden';
  src: string; // a render-safe source for a plain <img src> — do not persist
  mimeType: 'image/jpeg' | 'image/png';
}
```

The call resolves within 120 seconds (it carries the image bytes inline, so it
sits with `asset.upload` rather than with `sprout.activity.status()`'s 15s), and
accepts the same `signal` / `timeoutMs` request controls as the other two
`sprout.activity` verbs if you want a tighter budget.

Wrap the call in `try`/`catch`. `ActivityReferencesResult` has no error arm, but
the promise can still _reject_ — on the bridge deadline, or if the host returns
a response whose shape doesn't validate. Treat a rejection exactly like an
`unavailable` status: hide the gallery and carry on.

Minimal "show the example, then verify" sample:

```js
try {
  const refs = await sprout.activity.references();
  if (refs.status === 'ready') {
    for (const ref of refs.references) {
      const image = document.createElement('img');
      image.src = ref.src; // render only — never write this value to sprout.state or any storage
      image.alt = 'Example of the completed task';
      examples.appendChild(image);
    }
  } else {
    // 'not_available' | 'capability_not_declared' | 'host_unsupported' — all the
    // same safe degradation: skip the example gallery, the task instruction
    // alone still carries the kid through to verify.
    examples.hidden = true;
  }
} catch {
  // Deadline or invalid response shape — same degradation as 'unavailable'.
  examples.hidden = true;
}

verifyButton.addEventListener('click', async () => {
  const verdict = await sprout.activity.verify();
  // ...branch on verdict.state exactly as the golden_compare example above.
});
```

Multi-check plans (a `golden_compare` task with more than one check — e.g. "Shelf 1"
and "Shelf 2") carry references for every check in one flat array. Group by
`checkIndex` to route each example to the right task zone instead of dumping every
reference into one gallery:

```js
try {
  const refs = await sprout.activity.references();
  if (refs.status === 'ready') {
    const byCheck = new Map();
    for (const ref of refs.references) {
      if (!byCheck.has(ref.checkIndex)) byCheck.set(ref.checkIndex, []);
      byCheck.get(ref.checkIndex).push(ref);
    }
    for (const [checkIndex, checkRefs] of byCheck) {
      const zone = document.querySelector(`[data-check-zone="${checkIndex}"]`);
      for (const ref of checkRefs) {
        const image = document.createElement('img');
        image.src = ref.src; // render only — never write this value to sprout.state or any storage
        image.alt = 'Example of the completed task';
        zone.appendChild(image);
      }
    }
  }
} catch {
  // Deadline or invalid response shape — leave the zones without examples.
}
```

Never persist a resolved `src` — it is not a stable identifier and reading it
again next session is what `sprout.activity.references()` itself is for. The
bundled **Photo Proof** demo (`?demo=photo-proof`) and MCP preview tokens carrying
the trusted server-derived photo-proof marker return two frozen `golden` entries
backed by checked-in fake room photos. The server derives that marker from an
executable `sprout.activity.references()` call before minting the token; the web
host never classifies Canvas HTML text. No environment setup is required, and
Canvas code cannot select a different fixture or provide bytes. Paste sources
and tokens without that explicit metadata receive `{ status: 'unavailable',
reason: 'capability_not_declared' }`.

### Previewing the photo-proof journey

The bundled Photo Proof demo and trusted MCP photo-proof previews provide a
deterministic fake camera journey.
`sprout.activity.status()` starts at a real validator-backed `available` status.
`sprout.activity.verify()` opens the inline camera over the Canvas, lets the
author capture/review a checked-in fake room photo, and keeps the child capture
visible beside both golden references while it explains the result. The tidy path
returns a validator-backed two-check `verified` result only after **Finish photo
proof**. The dirty path shows the same child-versus-golden comparison and offers
**Take another photo** or **Send to parent**. Because the preview is anonymous,
the latter opens a clearly labeled preview-only explanation instead of claiming
that it contacted a real parent.
Closing the camera returns the same `unavailable` shape a production host
returns for a cancelled capture.

The preview also resolves `camera.capture`, `asset.upload`, and `asset.resolve`
against the same checked-in fake capture. These paths never open a device
camera, upload bytes, reach production storage, or read fixture identifiers
from a Canvas payload. The parent-review preview does not contact a real family,
upload the capture, or create a production submission.

---

## Release-gated and roadmap methods

The runtime-media methods below have a pinned byte-free contract and an iOS kid
host implementation, but they are **default-off feature-gated capabilities**.
They work only when the server derives effective `canvas_uploads` access from
the trusted `FEATURE_CANVAS_UPLOADS` environment lever or an active approved
family pilot grant. Canvas input cannot enable or select that decision.

When access is ineffective, `camera.capture` is denied before native camera UI
appears, and `asset.upload` / `asset.resolve` are denied before any new runtime
asset state, object transfer, finalize, or byte read. Authors may prepare
against these signatures only when they also provide a non-camera fallback.
`history` and `recall` remain ordinary roadmap shapes and may still change.

**Server boundary:** the host-only capability broker
(`/v1/canvas/capabilities/:capabilityKey`), authenticated asset content/finalize
routes (`/v1/canvas/assets/:assetId/*`), and proof-bearing Canvas completion
(`/v1/canvas-runs/:runId/complete`) all recheck effective `canvas_uploads`
authority. They are not public Canvas fetch targets, and proof completion cannot
be used to bypass a disabled capture/upload rollout. There is no MCP surface
that reports this effective authority today (`mcp_health` returns protocol info
only). The `FEATURE_CANVAS_UPLOADS` env lever defaults OFF, but an active
family pilot grant can make effective access ON even when the lever is off —
treat the composed decision (lever OR grant), not the lever alone, as the
source of truth for any given family.

**Availability:** raw runtime-media calls in the web preview use a checked-in
fake capture only for a canvas the host has fingerprinted as the bundled Photo
Proof demo (an executable `sprout.activity.references()` call resolves that
fixture); every other canvas gets the honest unsupported-host refusal
(`{status:'blocked'/'unavailable', reason:'host_unsupported'}` or
`'feature_disabled'`) instead. That fingerprinted demo also receives the fake
golden references and inline verification journey described above. The
preview never opens a camera, uploads bytes, or calls an asset route. This
preview behavior does not change device authority. iOS stays release-gated until
`canvas-runtime-media-i-proof-host` passes its on-device verification; the
presence of these SDK members alone does not mean device availability.

### `sprout.camera.capture(): Promise<CameraCaptureResult>` — Feature-gated

Requests one host-native photo. A successful capture returns an expiring,
host-local `captureId` plus preview metadata. **Capture does not upload and does
not return an `assetId`.** Cancel and expected policy/permission denials resolve
as result-union branches; infrastructure failures reject with the SDK's normal
base `Error`. The camera interaction may take up to five minutes.

### `sprout.asset.upload({source:{type:'capture',captureId}}): Promise<AssetUploadResult>` — Feature-gated

Explicitly uploads one accepted host-local capture. The native host owns the
file URI and transfer credentials; Canvas JS sends only the opaque `captureId`.
Only `{status:'ready'}` returns a durable `assetId` and host-safe `src`. Upload
may take up to two minutes. There is no string/base64/file-URI upload API.

### `sprout.asset.resolve(assetId: string): Promise<AssetResolveResult>` — Feature-gated

Re-authorizes a durable asset for rendering and returns either a ready
host-safe source or a coarse unavailable result. The result never includes a
storage provider, bucket/path, signed upload URL, digest, scan details, or
bytes. Resolve retains the normal ten-second request timeout.

These namespaced methods exist so Canvas code can be authored against the final
byte-free contract. Authors must handle `host_unsupported` /
`feature_disabled` and provide a non-camera fallback. SDK presence alone does
not mean the family or environment has enabled runtime media.

### `sprout.history(limit?: number): Promise<{ items: Attempt[] }>` — Roadmap

_Not implemented._ Planned: fetch prior completion records for this canvas,
for "your last score" / "your best time" callouts.

```ts
type Attempt = {
  completedAt: string; // ISO 8601
  score?: number; // present for scored canvases
  total?: number;
  durationSec?: number; // present for timed canvases
};
```

Planned: `limit` defaults to 10, max 50. Until the SDK bridge ships there is no
cross-run read from inside a canvas — but use **`sprout.state`** to resume the
CURRENT run (Released; see "Canvas Memory"). For cross-canvas reads see
`sprout.recall()` below.

### `sprout.recall(opts?: RecallOpts): Promise<RecallItem[]>` — Roadmap

_Not callable from a canvas yet — no host bridges it._ The cross-canvas memory
**server** is live (`GET /v1/canvas-runs` → completed-run recall), but no host
yet translates a canvas's `sprout.recall()` into that call, so invoking it today
rejects with `Error("unsupported in this host yet: recall")` — same as
`history()`.

Planned: recall the SAME child's prior **completed** runs so a canvas can build
on earlier sessions (e.g. a reading canvas that remembers last session's words).
Each item is that run's memory `data` (the snapshot shape your canvas writes into
`sprout.state` — see Canvas Memory) plus when it completed. Read-only and
**child-scoped** — a canvas can never recall another child's data — and
**completed-only** (the in-progress run is your own `sprout.state` resume, not
recall).

```ts
interface RecallOpts {
  canvasId?: string; // absent ⇒ ALL the child's completed runs in the family;
  // present ⇒ only that canvas's runs. The host MAY inject
  // the current canvas id to scope recall to same-canvas memory.
  limit?: number; // defaults to 10, max 50
}

interface RecallItem {
  data: unknown; // the run's memory snapshot (your sprout.state shape)
  completedAt: string; // ISO 8601
}
```

Returns `[]` when there are no prior completed runs.

**`recall()` vs `history()`** — `history()` returns lightweight scored/timed
**summaries** of THIS canvas's attempts (for "your best time" callouts);
`recall()` returns the full memory **`data` snapshot** of completed runs and can
span canvases. Both are Roadmap at the SDK bridge; neither replaces the other.

---

## Multiplayer sessions — host-gated

The multiplayer session namespace is the SDK primitive for future shared
canvases, such as two siblings playing the same board game. The canvas reads
the latest host-authoritative shared projection and emits intents; it does not
write shared state directly.

This is **not** a request/response Roadmap method. `sprout.session.act()`
always posts a fire-and-forget `session.act` envelope, but it is only useful on
hosts that wire the optional session seam and deliver `session.update` snapshots.

Ordinary solo canvas hosts can safely ignore the envelope.

**Board-play contract (family boards):** a finished play must cross the SDK
boundary — `sprout.session.act(verb, payload)` on session-wired hosts, or the
`sprout.complete(...)` crossing (settlement writes the round-stamped wall
contribution). Renders must come from `session.update` snapshots or history
re-reads, never from canvas-local memory alone: local-only state is invisible
to the other kid's device. Conformance tooling asserts these crossings at the
SDK boundary (see the boards guide's multiplayer contract).

### `sprout.session`

```ts
type SessionParticipant = {
  childId: string;
  role: string;
};

type SessionUpdate = {
  shared: Record<string, unknown>;
  participants: readonly SessionParticipant[];
  turn: string | null;
  me: string;
  version: number;
  by: string;
};

type SproutSession = {
  readonly shared: Record<string, unknown>;
  readonly participants: SessionParticipant[];
  readonly turn: string | null;
  readonly me: string;
  act(verb: string, payload?: unknown): void;
  onUpdate(cb: (u: SessionUpdate) => void): () => void;
};
```

Authoring rules:

- Treat `sprout.session.shared` as **read-only**. The SDK rejects direct writes;
  use `sprout.session.act(verb, payload)` to emit an intent.
- `act()` is fire-and-forget. It posts one `session.act` envelope and does not
  optimistically mutate `shared`; the server/host reflects accepted changes
  later through `session.update`.
- Register `sprout.session.onUpdate(cb)` to re-render when the host applies a
  new projection. The callback receives the full session view:
  `{ shared, participants, turn, me, version, by }` and returns an unsubscribe
  function.
- Do not build ordinary solo canvases on this surface yet. It is inert unless a
  multiplayer host bridge has joined a session and is delivering
  `session.update` messages.

Example:

```js
const unsubscribe = sprout.session.onUpdate(() => {
  renderBoard(sprout.session.shared.board);
});

function move(from, to) {
  sprout.session.act('move', { from, to });
}
```

---

## Signals — fire-and-forget

```ts
sprout.signal(name: SignalName, props?: Record<string, unknown>): void;
```

Signals declare meaningful events. The host shell decides how to react —
some shells animate the Sprout avatar, some show toasts, some log to
telemetry, some do nothing. Your job is to emit signals when something
worth-reacting-to happens; the host's job is to react.

| Signal                 | When to emit                                                   | Default avatar reaction |
| ---------------------- | -------------------------------------------------------------- | ----------------------- |
| `'celebration'`        | Big positive moment — perfect streak, big win, milestone       | celebration             |
| `'milestone-reached'`  | Smaller positive checkpoint — finished a section, hit a streak | laugh                   |
| `'attempt-successful'` | Routine correct answer or successful step                      | smile                   |
| `'attempt-failed'`     | Routine wrong answer or failed step                            | doubtful                |
| `'user-stuck'`         | Kid is idle or repeatedly wrong                                | thinking                |
| `'hint-requested'`     | Kid explicitly asked for help                                  | surprise                |

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

## Back press — consume or bubble (Released)

```ts
sprout.onBackPress(handler: () => boolean | void): void;
```

The kid's device Back affordance always used to exit the whole activity — a
canvas had no way to participate. `onBackPress` lets your canvas move its
**own internal state** backward instead: quiz question N → N-1, a result
screen → retake, a confirmation → the thing being confirmed. It is **not**
multi-page canvas navigation (`navigable_multi_page` stays blocked) — it's
one canvas handling its own Back gesture.

Register ONE handler. When the kid taps Back, the host calls it
**synchronously** and reads the return value:

- Return `true` → **consume** the press. The host does nothing further; your
  canvas stays mounted and moves its own state backward.
- Return anything else (including nothing, or throw) → **bubble** the press.
  Today's behavior: the host exits the activity.

```js
let question = 0;
sprout.onBackPress(() => {
  if (question === 0) return false; // nothing to go back to — bubble, exit
  question -= 1;
  render(question);
  sprout.progress.set({ current: question, total: TOTAL }); // bar animates BACKWARD
  return true; // consumed — stay in the canvas
});
```

**Purely additive.** A canvas that never calls `onBackPress` is
byte-identical to pre-consume-or-bubble behavior — every Back press exits.
Calling it again REPLACES the previous handler (one slot, one owner of "what
does Back mean right now" — not a subscriber list).

**Bounded and safe by construction:**

- **Short deadline.** The host applies its own bounded wait on your answer
  (currently 300ms — `BACK_REQUEST_TIMEOUT_MS` in `canvas-shell.ts`). A slow,
  async-looking, or throwing handler is treated as "did not consume" and the
  host exits — a canvas bug can never freeze the Back button.
- **Escape hatch — the kid can always leave.** The host will not honor more
  than 2 CONSECUTIVE consumed presses; the 3rd in a row always exits
  regardless of what your handler returns. This is a hard safety floor, not
  configurable, and NOT reset by other canvas activity between presses (a
  canvas can't game it by interleaving a `signal` or `progress.set` call) —
  it resets only when a press genuinely bubbles. A well-behaved canvas that
  legitimately needs to consume 3+ backward presses in a row without any
  other activity between them will hit this floor; that tradeoff is
  deliberate (see `MAX_CONSECUTIVE_CONSUMED_BACK` in `canvas-shell.ts`).
- **The exit path is unchanged.** Whatever the host does when a press
  bubbles (timer-gate checks, held-completion flushes, navigation) runs
  exactly as before SPR-4055 — a consumed press simply never reaches it.

**Pairs with the progress bar's documented backward contract:** the bar
already animates both ways and only celebrates forward moves (see below) —
so reporting a smaller `current` from your `onBackPress` handler is the
correct, complete way to reflect the backward move to the kid.

---

## Progress — host-rendered bar (Released)

```ts
sprout.progress.setup(spec: {
  total?: number;                       // step count → counter / milestone circles
  milestones?: 'auto' | 'none';         // checkpoint circles (default 'auto'; 'none' with emoji)
  emoji?: string;                       // ONE emoji riding the fill head
  timer?: { targetSeconds: number };    // right-side m:ss countdown (host clock)
}): void;
sprout.progress.show(): void;
sprout.progress.hide(): void;
sprout.progress.set(progress: { current: number; total: number }): void;
sprout.progress.clear(): void;
```

The Sprout app draws **one branded progress bar above the canvas**. The bar
is part of YOUR canvas's design — you declare it, dress it, and move it; the
host owns the visuals (Sprout track, fill, milestone circles, countdown).
**Do NOT draw your own progress bar** — no `.progress-bar` markup, no custom
track/fill, no countdown headers. An in-canvas bar costs kid screen space,
duplicates chrome, and can't get the Sprout-branded treatments.

**The bar exists only after `setup()`.** Calling `set()` without a prior
`setup()` renders nothing — declaring the bar is the explicit opt-in. Call
`setup()` early (top of your script), then report position as the kid moves.

All five calls are **fire-and-forget**, exactly like `signal`: no return
value, nothing to `await`, and they never throw — no `try / catch` needed.

Semantics:

- **`setup()` is re-callable.** A multi-page canvas re-declares the bar per
  phase — new `total`, timer on/off, emoji — and the host re-dresses the
  same bar in place. Each timer-carrying setup restarts the countdown.
- **Steps, not fractions.** Report `{ current: 2, total: 5 }` for "question
  2 of 5" — never a 0-1 fraction. `current` ≥ 0, `total` ≥ 1.
- **Milestone circles are automatic.** With `milestones: 'auto'` (the
  default) the host places numbered Kid-DS checkpoint circles on a 1-2-5
  ladder — every step for ≤ 6 steps, every 5th for 15, every 10th for 40 —
  capped at 6 circles at any total; 3-digit totals switch to label-less
  circles that tick a ✓ as the fill passes. Pass `'none'` for a clean track
  (an `emoji` rider defaults milestones off — the rider owns the track).
- **The host clamps.** Out-of-range `current` is clamped to `[0, total]` —
  report honest values; clamping is a safety net, not an API.
- **Backward moves are allowed.** If your canvas consumes the kid's Back
  press via `sprout.onBackPress` (see above) and moves its own state
  backward, report the smaller `current` — the bar animates both ways.
  Celebrations fire only on forward moves, so an honest backward report
  never triggers a false celebration.
- **Timers encourage, never punish.** The countdown renders to the RIGHT of
  the bar and flips to a gentle "Finish up!" at 0:00 — it never blocks,
  ends, or fails the activity. Time-based game logic is yours to run inside
  the canvas; the host countdown is presentation.
- **`hide()` / `show()`** — hide the bar on cutscenes, free-play sections,
  or results pages; the declared spec survives and `show()` restores it.
- **Completion fills the bar.** On `sprout.complete(...)` the host animates
  the bar to full and celebrates, regardless of the last reported value.
- **`clear()`** drops the position report (bar returns to at-rest); it does
  NOT hide the bar — use `hide()` for that.
- Rapid repeated calls are safe: the host coalesces them (latest value wins).

```js
const TOTAL = questions.length;
sprout.progress.setup({ total: TOTAL }); // declare the bar up front

function showQuestion(index) {
  sprout.progress.set({ current: index, total: TOTAL }); // works going back too
  render(questions[index]);
}

function showResults() {
  sprout.progress.hide(); // results page owns the screen
}

function finish() {
  sprout.complete({ score: correct, total: TOTAL }); // host animates the bar to full
}
```

Multi-page example — a warm-up phase, then a timed round:

```js
sprout.progress.setup({ total: warmup.length }); // phase 1: steps
// … warm-up questions, sprout.progress.set(...) per question …

sprout.progress.setup({
  // phase 2: re-declare
  total: round.length,
  timer: { targetSeconds: 120 }, // fresh countdown
});
```

## Task setup — `sprout.values` (Released)

`sprout.values` is the setup document supplied when this task was created. Its
fields come from the Canvas's own values contract, and Sprout validates the
document before the task exists. The host freezes the validated document into
the run and makes it available before your first line executes.

```js
const pages = sprout.values.pages;
const instruction = sprout.values.instruction;
renderReadingActivity({ pages, instruction });
```

The object is read-only, including nested objects and arrays. A direct or
nested write throws `TypeError("sprout.values is read-only")`. A Canvas opened
without setup receives an empty object.

Keep these three surfaces separate:

- **`sprout.values`** is the task author's frozen setup for this run. Read it;
  do not save progress into it.
- **`sprout.state`** is the child's resumable state for the current run.
- **`sprout.journey`** is the child's small checkpoint that carries across
  runs and days.

The Canvas owns the allowed fields, required fields, types, constraints, and
field explanations. A task author supplies values only. Task setup must never
contain a schema, prompt, profile, instruction id, Canvas-data hash, or another
attempt to redefine the Canvas contract.

## Durable journey — `sprout.journey.get` / `.save` (Released)

`sprout.journey` is the kid's **durable journey** for this task — memory that
survives across sittings and across DAYS (distinct from the ephemeral
`sprout.progress` bar above). The three-line model, memorize it:

- **`sprout.state`** = THIS SITTING (scratch for the current run; auto-persisted, resumes the same run).
- **`sprout.journey`** = THIS KID'S JOURNEY (a small, current checkpoint that carries across days).
- **`sprout.log`** = WHAT HAPPENED, FOR THE RECORD (an append-only trail).

```js
// Read where this kid is (host-seeded at start). ALWAYS default-fill — get()
// resolves {} on a first-run AND when the family hasn't enabled durable state;
// the two are indistinguishable by design.
const journey = await sprout.journey.get(); // unknown — never assume shape
const level = journey.level ?? 1; // default-fill every field
const stars = journey.stars ?? 0;

// … the kid plays, clears level 3 …

// Save the WHOLE checkpoint (replace-only, last-write-wins). Keep it SMALL and
// CURRENT — where they are, not where they've been. save() ALWAYS resolves,
// never rejects: branch on the result instead of catching.
const res = await sprout.journey.save({ level: 4, stars: 12 });
if (!res.ok) {
  // res.error is 'too-large' | 'disabled' | 'not-task-linked'. On 'too-large'
  // the previously-saved journey is untouched. Degrade gracefully — the canvas
  // still works, just without cross-day memory.
}
```

Rules:

- **Replace-only, ≤ 64 KB.** `save(next)` overwrites the whole blob — there is
  no partial merge. Keep it a small "where are they" object.
- **History does NOT go here.** A growing list of past attempts belongs in
  `sprout.log`, not `journey`. `journey` is the current checkpoint only.
- **Save BEFORE you complete.** `await sprout.journey.save(next)` and let it
  resolve, THEN call `sprout.complete(...)`, so the journey is durable before the
  run freezes.
- **Default-fill on read.** `get()` is `{}` on first-run/flag-off/free-play —
  never assume a field exists.

## Journey log — `sprout.log` (Released)

`sprout.log(entry)` appends one entry to this run's record — "what happened, for
the record". Fire-and-forget like `signal`: no return value, never throws. The
host BATCHES entries (~1 flush/second) and caps size/count, so a chatty canvas
is bounded automatically.

```js
sprout.log('level 3 cleared');
sprout.log({ event: 'hint_used', card: 7, msLeft: 4200 });
```

Use `log` for the trajectory (events, attempts, choices) that a parent or the
system might review later. Use `journey` for the current checkpoint the canvas
resumes from. Do not put the running history into `journey`.

## Completion — call exactly one, exactly once

Every canvas MUST end with a single terminal call. The canonical call is
`sprout.complete(opts)` — it takes any combination of measurements in one call,
so an activity that both scores and times itself reports both:

```js
sprout.complete({ score: 8, total: 10 }); // scored quiz
sprout.complete({ duration: 134 }); // timed reading (seconds)
sprout.complete({ score: 8, total: 10, duration: 134 }); // scored + timed
sprout.complete({}); // open-ended finish (no measurement)
sprout.complete(); // same as complete({})
```

`opts` (`CompleteOpts`) — every field optional:

| field      | type                     | meaning                            |
| ---------- | ------------------------ | ---------------------------------- |
| `score`    | `number`                 | correct / points earned            |
| `total`    | `number`                 | max possible / questions attempted |
| `duration` | `number`                 | elapsed time, in **seconds**       |
| `summary`  | `string`                 | free-text summary of the run       |
| `answers`  | `Record<string, string>` | per-question answer map            |

Only fields you pass are forwarded; the host strips everything else. How the
host classifies the result: `score` present → scored; else `duration` present →
timed; else open-ended (a `total` without a `score` is forwarded but does not
make the result "scored").

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
  sprout.complete({ score: correct, total: attempted }); // no-op if timer already fired
};
```

### Legacy aliases (still supported)

These three are thin forwarders to `complete()`, kept for canvases already built
on them. New canvases should call `complete(opts)` directly.

```js
sprout.score(correct, total); // → complete({ score: correct, total }) — correct ≤ total, both ≥ 0
sprout.completed(); // → complete({})
sprout.timed(durationSeconds); // → complete({ duration: durationSeconds })
```

### Show a submit button

Even when completion fires automatically, **always** show a visible submit
button the kid can tap. Kids need a sense of agency — the canvas shouldn't
just disappear when a timer ends. The SDK's double-fire guard makes wiring
both paths safe.

---

## Canvas Memory — `sprout.state` (auto-persisted resume)

Write your canvas's durable run state into `sprout.state` and the SDK
**auto-persists it as the child works** — there are NO save points,
assignment IS the save. When the child closes the app mid-activity and
reopens the canvas, the host **seeds `sprout.state` with the saved snapshot
before your code runs**, so it is already correct at your first line — no
async wait, no poll.

**Author with merge-defaults: read `sprout.state`, default-fill the fields
that are missing, then mutate.** Never replace the whole object — assigning
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
  // Returning mid-run — rebuild the UI from the restored sprout.state.
  goToStep(sprout.state.step);
} else {
  // Brand-new run — intro / tutorial / first-time bonus.
  showIntro();
}
```

Other `sprout.resumed` uses: first-time bonus, schema migration (key a `_v`
version field and migrate from the resumed snapshot), opening animation,
analytics.

`sprout.restore()` is a **deprecated** back-compat alias — it returns the
snapshot when resuming (else `null`); prefer `sprout.resumed`. `sprout.save()`
is a **manual-flush escape hatch** (re-emits the current snapshot) but you
rarely need it — assignment already persists.

### Authoring rules (HARD)

- **Merge-defaults, never replace.** Default-fill missing fields
  (`sprout.state.x ??= default`) and mutate. Assigning `sprout.state = {…}`
  wholesale clobbers a resumed run — use `sprout.resumed` to branch instead.
- **Durable state only.** Put answers, current step, progress, score-so-far
  here. Keep **volatile / derived / animation** state OUT (cursor position,
  tween frames, hover) — every write is persisted, so volatile writes cause
  write-amplification and bloat the run.
- **JSON-serializable values only.** No functions, DOM nodes, `Date`, `Map`,
  `Set` — they're stripped on save.
- **No PII or user/family identifiers** in `sprout.state`: never persist names,
  account IDs, family IDs, auth tokens, or other identity data. An opaque runtime
  `assetId` is allowed as a durable activity reference. Persist only that ID —
  never an asset `src`, camera `captureId`, local preview, or upload credential.
- **Always wire `sprout.state` — every canvas.** Persist the child's progress
  (current step, answers, score-so-far) so they resume where they left off. A
  canvas that ignores it restarts the child from scratch on every reopen, which
  we never want. It's one object, no per-step wiring — there is no reason to
  skip it.

---

## Choosing an upload flow

You have two ways to give a canvas its HTML bytes:

- **Inline `html` (or REST `content`)** — Pass the HTML string directly in
  `canvas.create` / `canvas.update`. Simplest path. Best for small canvases
  (under ~50 KB) when you're authoring one or two per session.

- **Out-of-band upload via `blobRef`** — Use `canvas.prepare_upload` to get a
  signed PUT URL, upload the bytes directly to storage, then pass
  `blobRef: { uploadId }` to `canvas.create` / `canvas.update` instead of
  `html`. Best for large canvases (over ~50 KB) or when you're authoring
  multiple canvases — the bytes never travel through this tool-call channel,
  so your token cost stays flat regardless of canvas size.

A 100 KB canvas costs roughly 25,000 tokens on the inline path. The same
canvas on the upload path costs about 50 tokens for the tool-call envelope —
the bytes go directly to storage via the signed URL, which doesn't count
against your model context.

The 50 KB figure is a hard contract, not a guideline. The server rejects
inline payloads at or above the floor with a typed `inline-too-large`
envelope whose `recovery.nextAction` is `'refresh-upload'` — the rest of the
flow is documented below.

## Out-of-band upload via canvas.prepare_upload

### The flow

1. Call `canvas.prepare_upload` with the content-type and byte size you
   expect to upload.
2. The response gives you an `uploadId` and a one-element `uploads` array.
   The single entry contains a `signedUrl` (valid for 5 minutes) and a
   `path` (`"index.html"` in v1).
3. PUT your HTML bytes to `signedUrl` using your runtime's HTTP client.
   Set `Content-Type: text/html`. The signed URL enforces both the
   content-type and the byte-size limit you declared.
4. Call `canvas.create` (or `canvas.update`) with
   `blobRef: { uploadId: <uploadId> }` instead of `html`. The server reads
   the bytes you uploaded, runs the canvas pipeline, and persists the
   canonical version.

### Worked example

```text
> canvas.prepare_upload({ contentType: "text/html", byteSize: 102400 })
< {
>   uploadId: "8c3f1d2e-...",
>   uploads: [{
>     path: "index.html",
>     signedUrl: "https://...supabase.co/object/upload/sign/...",
>     expiresAt: "2026-05-26T19:05:00Z"
>   }]
> }

(your runtime PUTs the 100 KB HTML to signedUrl)

> canvas.create({
>   blobRef: { uploadId: "8c3f1d2e-..." },
>   name: "fractions-game",
>   dimensions: { ... }
> })
< {
>   canvasId: "a7e9b3...",
>   version: 1,
>   previewUrl: "https://app.sprout.dev/preview/a7e9b3...?v=1"
> }
```

### Constraints

- Content-type is `text/html` in v1; other types are rejected at the
  prepare-upload step.
- Maximum byte size is 5 MB (the same cap as inline `html`).
- The `uploadId` is consumed exactly once. After `canvas.create` or
  `canvas.update` succeeds, the pending object is deleted; retrying with
  the same `uploadId` returns `pending-not-found`.
- Pending objects expire after 1 hour if not consumed.

### Typed error envelopes

Every canvas write surfaces failures through a structured envelope so the
agent can dispatch on `code` and follow the `recovery.nextAction` without
re-parsing free text:

```ts
{
  ok: false,
  code: 'inline-too-large' | 'pending-not-found' | 'version-mismatch'
      | 'invalid-content-type' | 'size-too-large',
  // ...code-specific payload fields...
  recovery: {
    retriable: boolean,
    nextAction: 'retry' | 'refresh-upload' | 'reduce-size' | 'abort',
    hint: string,
  },
}
```

- **`inline-too-large`** — Inline `html` exceeded the 50 KB floor.
  `recovery.nextAction: 'refresh-upload'`; the `hint` names
  `canvas.prepare_upload` as the next call.
- **`pending-not-found`** — The `uploadId` you passed is unknown or already
  consumed. `recovery.nextAction: 'refresh-upload'`; re-run
  `canvas.prepare_upload` and retry the create/update with the new id.
- **`version-mismatch`** — `expectedVersion` did not match the canvas's
  current version. `recovery.nextAction: 'retry'`; the `hint` includes the
  `actualVersion` so the agent can re-fetch and reapply (see next section).
- **`invalid-content-type`** — `prepare_upload` was called with a
  `contentType` outside the v1 whitelist (`text/html`).
  `recovery.nextAction: 'abort'`; the contract is the violation — adjust
  and re-prepare.
- **`size-too-large`** — Declared `byteSize` exceeds the 5 MB cap, or the
  bytes you PUT exceeded the declared `byteSize`.
  `recovery.nextAction: 'reduce-size'`; shrink the canvas (split into
  multiple, drop assets) and re-prepare.

A second error family comes from the **create-time authoring guard**, which runs
BEFORE persistence and uses a different envelope — `{ code, message, details: { findings, hints } }`
with **no `recovery` block**. The `details.findings` shape depends on `code`: for
`CANVAS_STRUCTURALLY_INVALID` each finding is `{ code, severity, message, hint }`;
for `CANVAS_MALFORMED_SCORE_CALLS` each is the legacy `{ kind, line, sample }`
(no `code` / `hint`). For a uniform partner-facing message across both, read
`details.hints[]`. A single write can fail several checks at once, so the array
lists every problem to fix in one pass.

- **`CANVAS_STRUCTURALLY_INVALID`** — The HTML cannot render as a canvas: it is
  empty / whitespace-only (`canvas-empty`), or contains no element markup —
  plain text, not HTML (`canvas-no-markup`). Read each finding's `hint`, fix all
  of them, and re-submit.
- **`CANVAS_MALFORMED_SCORE_CALLS`** — Your canvas JS calls `sprout.score` /
  `sprout.complete` with a `(score, total)` pair that can never grade (missing
  total, or score > total). Each finding carries the offending `line` / sample;
  pass a score and a matching total where `total ≥ score` (e.g.
  `sprout.score(8, 10)`) and re-submit.

### Authoring hints on a successful write

`canvas.create` and `canvas.update` may attach an optional `hints[]` array to a
**successful** response — non-fatal advisories the server derived while
validating your canvas. The canvas still persisted; a hint is something to fix on
the next edit or mention to the parent.

```ts
{
  // ...canvasId, version, previewUrl, completionCapability...
  hints?: Array<{
    kind:
      | 'canvas-structural-issue'
      | 'canvas-capability-shrunk'
      | 'canvas-capability-grew',
    severity: 'info' | 'warn',
    message: string, // partner-facing English — often shown verbatim
    details?: Record<string, unknown>, // e.g. { code: 'canvas-no-content', hint }
  }>;
}
```

- **`canvas-structural-issue`** (`warn`) — A borderline structural finding that
  is not fatal. Today that is `canvas-no-content`: the HTML has markup but no
  visible text and no interactive / media / script content, so it may render
  blank. The canvas was saved anyway (a false reject would block a valid canvas).
  Surface the `message`; add visible text, an image, a `<canvas>`, or a
  `<script>` that draws / responds, then re-publish if it really was blank.
- **`canvas-capability-shrunk` / `canvas-capability-grew`** come from the
  capability-drift check and are documented with the scoring / capability tools.

Malformed-score findings are **error**-severity — they reject the write (above)
and never ride a success hint. The field is OMITTED when there is nothing to say
(treat omitted ≡ empty array).

## Reading canvases — response shapes

`canvas.get` returns one of two response shapes depending on whether the
canvas was authored via the legacy inline flow or the new upload flow:

- **Legacy canvas:** `{ id, version, previewUrl, html, dimensions, ... }`.
  The `html` field carries the canvas's HTML string inline.
- **New canvas (uploaded via `blobRef`):** `{ id, version, previewUrl,
dimensions, ... }` — the `html` field is absent.

This is intentional. MCP is your authoring channel; it doesn't return raw
bytes for canvases that live in storage, because doing so would defeat the
token-cost benefit of the upload flow. If you need to inspect a canvas's
rendered output, open `previewUrl` in a browser — it shows the canvas
wrapped in the Sprout preview shell.

If you need the raw bytes programmatically (rare for authoring), use the
REST API path `GET /v1/artifacts/:id`, which returns a signed storage URL
field for new canvases and an inline body for legacy ones.

## Concurrent updates and expectedVersion

`canvas.update` accepts an optional `expectedVersion` field. When set, the
server checks that the canvas's current version matches `expectedVersion`
before applying the update; if it doesn't (because another caller already
updated the canvas), the call returns a `version-mismatch` error with the
actual current version.

Recommended pattern: read the canvas (or remember its version from your
last write), then pass that version back on the update. This guards
against silent overwrites if two callers are editing the same canvas.

```text
> canvas.get({ canvasId: "a7e9b3..." })
< { id: "a7e9b3...", version: 3, previewUrl, ... }

> canvas.update({
>   canvasId: "a7e9b3...",
>   expectedVersion: 3,
>   blobRef: { uploadId: "..." }
> })
< { canvasId: "a7e9b3...", version: 4, previewUrl }

# If someone else updated between your get and update:
< { code: "version-mismatch", expectedVersion: 3, actualVersion: 5,
#   recovery: { retriable: true, nextAction: "retry",
#               hint: "re-fetch the canvas and reapply your edit" } }
```

Omitting `expectedVersion` is allowed — calls without it are last-write-
wins. Recommended for one-shot agent flows; recommended-against for any
flow where the agent is reading-then-modifying.

---

## Rules

1. **No external network calls from canvas JS.** `fetch` and
   `XMLHttpRequest` are allowed only for same-origin canvas URLs
   (`connect-src 'self'`), which lets browser-native loaders such as Three.js
   read manifest-declared bundle assets like `./models/example.glb`.
   External `http(s)` origins, `WebSocket`, `EventSource`, and
   `navigator.sendBeacon` remain blocked. The only ways code or assets reach
   the canvas are (a) the auto-injected SDK, (b) inline `<script>` / `<style>`
   blocks, (c) same-origin manifest assets, and (d) external subresources
   loaded via the canvas-CDN proxy in rule 2 (`<script src>`, `<link href>`,
   `<img src>`, `<audio src>`, etc.). Runtime media uses only the namespaced,
   host-mediated `sprout.camera` / `sprout.asset` contract described above.

2. **External `<script src>` / `<link href>` / `<img src>` ONLY via the
   canvas-CDN proxy. Use RELATIVE URLs.**

   The canvas runtime allows subresources whose URL matches the proxy shape:

   ```
   /api/canvas-cdn/jsdelivr/npm/<pkg>@<version>/<file>
   ```

   Examples:

   ```html
   <script
     type="module"
     src="/api/canvas-cdn/jsdelivr/npm/three@0.160.0/build/three.module.js"
   ></script>
   <link rel="stylesheet" href="/api/canvas-cdn/jsdelivr/npm/normalize.css@8.0.1/normalize.css" />
   ```

   **Always relative, never absolute.** The relative path works on both web
   (resolves to `https://<sprout-origin>/api/canvas-cdn/...`) and iOS (the
   canvas WKWebView's `CanvasSchemeHandler` intercepts the same relative
   path under `sprout-tool://worksheet` and proxies to Sprout's CDN route).
   An absolute `https://sproutgoodhabits.com/api/canvas-cdn/...` URL works
   only on web — on iOS it leaves the scheme handler and 404s. Authors
   must write relative URLs so canvases stay portable across platforms.

   **Always pin a specific version.** No `latest`, no version ranges
   (`^1.2.0`, `~1.2.0`, `1.2.x`). Pin to a literal semver (`1.2.3` or
   `1.2.3-beta.1`) so what runs in dev matches what runs in production.
   Query strings on proxy URLs are rejected by the proxy with HTTP 400.
   Any URL outside this exact shape fails canvas validation with
   `EXTERNAL_URL_NOT_ALLOWLISTED`.

   **Module imports must be string literals.** Computed `import(varName)`
   is rejected at canvas write time — the canvas-side scanner only validates
   static URLs against the allowlist, and a runtime-computed specifier
   would route through the same CSP / scheme-handler path with a target
   the scanner can't see.

   ```js
   // OK — static string literal, validated at write time.
   import * as THREE from '/api/canvas-cdn/jsdelivr/npm/three@0.160.0/build/three.module.js';

   // REJECTED — computed specifier, scanner can't audit the URL.
   const lib = '/api/canvas-cdn/jsdelivr/npm/three@0.160.0/build/three.module.js';
   const m = await import(lib);
   ```

   **Use a static import map for CDN modules with bare transitive imports.**
   Sprout does not inject import maps for arbitrary author libraries and does
   not rewrite CDN module source. If an approved CDN module imports a bare
   package name internally, map that bare specifier yourself before the module
   script runs. The import-map URL must be a pinned relative canvas-CDN URL.

   ```html
   <script type="importmap">
     {
       "imports": {
         "three": "/api/canvas-cdn/jsdelivr/npm/three@0.160.0/build/three.module.js"
       }
     }
   </script>

   <script type="module">
     import * as THREE from 'three';
     import { GLTFLoader } from '/api/canvas-cdn/jsdelivr/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

     const scene = new THREE.Scene();
     const loader = new GLTFLoader();
     loader.load('models/example.glb', (gltf) => {
       scene.add(gltf.scene);
     });
   </script>
   ```

   Put the import map before any module script that imports the mapped
   specifier. Keep entries exact and pinned; `latest`, version ranges, absolute
   URLs, and attacker origins fail canvas validation.

3. **No Node, bundler, framework, or package-manager behavior.** Canvas code
   is browser JavaScript, not Node.js. There is no `require`, `fs`, `path`,
   `process`, `Buffer`, npm package resolution, JSX/TS compilation, CSS
   injection, asset URL rewriting, or `?worker` / `?url` / `?raw` loader
   syntax. Import full relative canvas-CDN URLs, or use a static import map
   that maps a bare specifier to a full pinned canvas-CDN URL.

4. **No workers. WASM only through the blessed `sprout.rive` loader.**
   The runtime sets `worker-src 'none'`, so `new Worker(...)` and
   `new SharedWorker(...)` are outside the supported canvas scope and remain
   blocked. WASM is **scoped, not absolute**: the one sanctioned WASM runtime
   is Rive, instantiated through the blessed `sprout.rive` loader (see
   [Rive animations](#rive-animations--sproutrive--released)), which pins the
   Rive wasm to a same-origin canvas-CDN path for you — you never reference a
   `.wasm` URL or call `WebAssembly.*` yourself. Both of those raw paths stay
   rejected: the create-time analyzer fails any author HTML that calls
   `WebAssembly.*` directly or fetches a foreign `.wasm` URL (one outside the
   `/api/canvas-cdn/...` proxy). So: drive Rive via `sprout.rive`, and treat
   any other WASM runtime — and all `new Worker(...)` — as outside the
   contract. If Sprout adds workers later, each worker script will be declared
   as a bundle asset and scanned as its own executable module graph before the
   canvas can run.

5. **No `localStorage` / `cookies`.** The canvas runs in an opaque-origin
   sandbox; browser storage is blocked or empty. For durable state use
   **`sprout.state`** (Canvas Memory) — it auto-persists and resumes the CURRENT
   run across reopens (Released; see "Canvas Memory"). Reading PRIOR runs from
   inside a canvas (`sprout.history()` / `sprout.recall()`) is **Roadmap** — not
   callable yet — so don't depend on cross-run reads.
6. **One completion per canvas.** Call `sprout.complete(opts)` (or a legacy
   alias — `score` / `completed` / `timed`) exactly once.
7. **Visible submit button required.** Even with auto-completion.
8. **Signals are optional.** Emit them for meaningful moments; the host
   dedupes if needed.

---

## Error handling

SDK methods reject with a plain `Error` whose `.message` carries the reason — a
timeout (`sprout.<method> timed out after 10000ms`), or the host's reason string
(e.g. an `unsupported` / `not-implemented` message in the web preview, or
`tts.speak: invalid payload`). There is **no** typed error class with
`code` / `retryable` — every rejection is a base `Error`; branch on
`err.message` only if you must.

Expected runtime-media outcomes are different: cancellation, policy blocks,
and unavailable assets resolve through the documented discriminated unions.
Only malformed requests, infrastructure failures, and timeouts reject.

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

(For feature-gated runtime media, the same try/fallback pattern applies around
`sprout.camera.capture()` / `sprout.asset.upload()`.)

Timeouts: ordinary SDK requests reject after 10 seconds, explicit asset upload
after 2 minutes, and feature-gated native camera capture after 5 minutes.
Health Canvas proof methods use their documented 120s/120s/15s/30s deadlines
so a human permission or camera sheet is not mistaken for a hung read. These
are defensive limits; expected runtime-media cancel/permission/policy outcomes
resolve as typed results, while Health proof failures should use the same safe
fallback as unsupported hosts.

---

## Legacy bridge (escape hatch — avoid)

The original lower-level contract still works and is what `sprout.*` methods
ultimately call under the hood:

```js
window.SproutBridge.postMessage(
  JSON.stringify({
    type: 'scored',
    score: 8,
    total: 10,
  })
);
```

You don't need this. The `sprout.*` methods are terser, typed, and the SDK
guards double-fire for you. Use `SproutBridge.postMessage` directly only if
you're authoring against the wire protocol — for example, writing a new host
adapter (see `host.ts` in `@sprout/canvas/web`).

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

      function celebrate() {
        sprout.signal('celebration');
      }

      function finish() {
        sprout.complete();
      }
    </script>
  </body>
</html>
```

That's a complete, working Sprout canvas — three buttons, four SDK calls,
zero imports.
