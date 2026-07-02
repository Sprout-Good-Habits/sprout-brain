# Canvas Components — the injected kit API

Every class documented here is defined by the base stylesheet that
`injectBaseStyles` ships into every canvas (source:
`apps/server/src/services/mastra/tools/artifact-design-system.css` in
sprout-app, `77ada1b8e`). Nothing to import — author against these classes and
they work. The machine-checked class list is
[`generated/inventory.json`](generated/inventory.json); if a class is not
there, it does not exist at runtime.

Rules of engagement (enforced by the server analyzer — see `checklist.md`):
use kit classes before writing any custom markup; never restyle a kit class;
custom additions get your own class names (convention in these docs: `x-`
prefix) built from `tokens.md` tokens.

> Completion is `sprout.complete(opts)` (see `canvas/sdk.md`). Anything you
> read elsewhere about `SproutBridge.postMessage` is the legacy wire protocol —
> do not author against it.

## The signature look

Three things make a screen read as "Sprout kid" instantly:

1. **Tactile 3D buttons** — solid color with a `0 4px 0 0 <darker-600>` bottom
   shadow; pressing translates the button down 4px and swallows the shadow.
   You get this for free from `.btn` variants — never rebuild it.
2. **TossFace emoji everywhere** — the TossFace font is auto-loaded; emoji are
   content, not decoration. Hero emoji get explicit sizing (see Emoji below).
3. **Softly rounded, softly tinted surfaces** — cards and list items on
   `--bg-primary` with `--border-secondary` hairlines; selection states tint
   with `--brand-50`-family backgrounds, never saturated fills.

## Buttons

```html
<button class="btn btn-primary btn-lg" onclick="start()">Let's go!</button>
<button class="btn btn-secondary btn-md" onclick="skip()">Skip</button>
<button class="btn btn-util" onclick="speak()" aria-label="Hear it">🔊</button>
```

- `.btn` — flex-centered, bold, full-width, `radius-2xl` (16px), padding
  `--spacing-lg`. Add a variant AND a size class.
- Sizes: `.btn-lg` **48px** tall / text-lg · `.btn-md` **44px** / text-md.
- Variants: `.btn-primary` (brand-500, shadow brand-600) · `.btn-secondary`
  (white, 2px `--border-secondary`, gray-200 shadow) · `.btn-success`
  (green-500/600) · `.btn-warning` (yellow-500/600) · `.btn-destructive` /
  `.btn-error` (red) · `.btn-disabled` (gray-300, non-interactive).
- `.btn-util` — 56×56 round icon button (`radius-full`), TossFace 24px glyph.
  For speaker buttons, back arrows, small toolbar actions.
- `.btn-social`, `.btn-social-apple` exist for auth flows — rarely used in a
  canvas.
- One primary per screen; inline width via `style="width:auto"` when needed.

## Cards & list items

```html
<div class="card">
  <h2>Which one is different?</h2>
  <p>Tap the odd one out.</p>
</div>

<div class="list-item" onclick="select(this)">
  <div class="list-item-icon">🐟</div>
  <div class="list-item-content">
    <div class="list-item-title">Fish</div>
    <div class="list-item-desc">Lives in water</div>
  </div>
  <div class="list-item-chevron">›</div>
</div>
```

- `.card` — bg-primary, 1px `--border-secondary`, `radius-xl` (12px), padding
  `--spacing-3xl` (24px).
- `.list-item` — the default "pick one of N" answer row. 2px border,
  `radius-xl`, gray-200 shadow. Add `.checked` → brand-tinted selected state.
  `.list-item-icon` is a 44×44 brand-tinted TossFace slot.
- Single-select: onclick clears siblings' `checked`, sets this one.
  Multi-select: `this.classList.toggle('checked')`.

## Selection controls

```html
<div class="checkbox" onclick="this.classList.toggle('checked')"></div>
<div class="radio" onclick="pickRadio(this)"></div>
<div class="switch" onclick="this.classList.toggle('checked')">
  <div class="switch-thumb"></div>
</div>
```

24×24 checkbox (`radius-sm`) and radio (`radius-full`); marks draw via CSS on
`.checked`. Switch is 44×24, thumb slides ~200ms. Prefer `list-item` rows for
tier1 — bigger targets.

## Inputs

```html
<div class="input-wrapper">
  <label class="input-label">Your answer</label>
  <input class="input" type="text" placeholder="Type here...">
  <span class="input-error-text">Try a number</span>
</div>
```

`.input` is 56px, `radius-2xl`, 2px border, brand focus ring. Error state:
add `.input-error` to the input and show `.input-error-text`. `.passcode-group`
+ `.passcode-cell` (48×56, `.filled` / `.focus` states) exist for code entry.

## Progress

```html
<div class="progress-bar">
  <div class="progress-message">3 in a row!</div>
  <div class="progress-track"><div class="progress-fill" style="width:40%"></div></div>
</div>
```

16px track, `radius-full`, brand fill with sheen; width transitions on a
~400ms spring automatically — just set `style.width` in JS. Fill min-width is
32px so 0% still reads. `.progress-message` is the uppercase brand microcopy
slot (streak callouts). Lives inside the `top-toolbar` on multi-step screens.

## Feedback banner (bottom-pinned answer feedback)

```html
<div class="feedback-banner fb-success hidden" id="fb-good"
     style="position:fixed; bottom:0; left:0; right:0;" aria-live="polite">
  <div class="fb-header">
    <div class="fb-icon">🎉</div>
    <div class="fb-title">Correct!</div>
  </div>
  <div class="fb-content"><div class="fb-desc">The pattern was 🐟 🐙 🐟 🐙</div></div>
  <button class="btn btn-success btn-lg" onclick="next()">Continue</button>
</div>
```

Variants `fb-success` / `fb-error` / `fb-warning` / `fb-default`. MUST start
hidden (`hidden` class — analyzer error otherwise); reveal slides up 300ms.
The banner owns its Continue/Retry button — hide it before the next question.

## Toolbar, tab bar, toast, sheet, action prompt

```html
<div class="top-toolbar">
  <div class="top-toolbar-leading"><button class="btn btn-util" onclick="quit()" aria-label="Close">✕</button></div>
  <div style="flex:1">
    <div class="progress-bar"><div class="progress-track"><div class="progress-fill" style="width:25%"></div></div></div>
  </div>
  <div class="top-toolbar-trailing"><span class="tf">⭐</span> <span id="score">0</span></div>
</div>
```

- `.top-toolbar` — 56px min-height chrome row: leading control, flexible
  middle (progress or `.top-toolbar-title`), trailing status.
- `.tab-bar` + `.tab-item` (+`.active`) — bottom nav; rare in single-activity
  canvases.
- `.toast` (+ `.toast-icon/-content/-title/-desc/-countdown`) — transient
  notice, springy enter, `--toast-duration` countdown bar. Show/hide via
  `display`.
- `.sheet-scrim` + `.sheet` (+ `-handle/-header/-body/-footer`) — bottom
  overlay (`radius-4xl` top corners, max-height 90%) for "how to play" help.
  Scrim click dismisses; `event.stopPropagation()` on the sheet body.
- `.action-prompt` (+ `ap-content/ap-leading/ap-leading-emoji/ap-text/ap-label/
  ap-desc/ap-actions`) — small decision dialog ("Start over?").

## Badges, avatar, empty state, spinner, info note

```html
<span class="badge badge-brand">Level 2</span>
<div class="empty-state">
  <div class="empty-state-emoji">🌱</div>
  <div class="empty-state-title">Nothing here yet</div>
  <div class="empty-state-desc">Tap start to grow your first puzzle</div>
</div>
<div class="spinner"></div>
<div class="info-note"><strong>Tip:</strong> listen first, then tap.</div>
```

Badge variants: `badge-brand` / `badge-success` / `badge-error` /
`badge-warning` / `badge-neutral` (tinted 50-bg / 700-text). `.avatar` (36px
round, `.avatar-group` overlaps −8px). `.spinner` 28px / `.spinner-sm` 20px.

## Task cards (gradient hero cards)

```html
<div class="task-card task-card-violet">
  <div class="task-card-badge">Daily</div>
  <div class="task-card-emoji">🧩</div>
  <div class="task-card-title">Puzzle Quest</div>
  <button class="task-card-cta btn btn-secondary btn-md" onclick="start()">Play</button>
</div>
```

278×315 rounded (24px) gradient cards — variants `task-card-brand/-violet/
-green/-pink/-orange/-red/-blue-dark` (`<color>-400 → -600` vertical
gradient), white text, 56px TossFace emoji. Use for activity pickers and
mission lobbies, not for every screen.

## Branded background (sky + grass)

```html
<div class="bg-sky x-scene">
  <div class="bg-grass"><div class="bg-grass-edge"></div><div class="bg-grass-fill"></div></div>
  <!-- content layers above -->
</div>
```

`bg-sky` (flat `--bg-sky` fill — never a gradient) with a `bg-grass` strip is
the kid-app branded scene: sky → content → grass. Use it for intro and
celebration screens to make a canvas feel native; keep working screens on
`--bg-primary` for contrast.

## Emoji (TossFace)

`.tf` forces the TossFace font on any element. Hero emoji ALWAYS get explicit
sizing — TossFace glyphs render larger than their font-size box:

```html
<div class="tf" style="font-size:64px; line-height:1; height:64px;">🧩</div>
```

Inline emoji in text need nothing.

## Layout utilities

- `.stack` (+ `-xs/-sm/-md/-lg/-xl/-2xl/-3xl`) — vertical flex with token gap.
- `.row`, `.row-between` (+ `.gap-xs/-sm/-md/-lg/-xl`) — horizontal flex.
- `.center`, `.w-full`, `.hidden` (`display:none !important`), `.scroll-row`
  (horizontal scroll, hidden scrollbar).
- Body has 16px padding, white background, auto bottom-margins on block
  elements (`--spacing-lg`); `.stack`/`.row` children reset those margins.
  See `layout.md` for the screen skeleton and spacing rhythm.

## What the kit does NOT have (rebuild with tokens)

No gems pill, stat card, tile grid, or celebration-screen class exists in the
runtime CSS (they live only in the kid app). Rebuild them with tokens under an
`x-` class — the archetype skeletons include ready-made rebuilds:

- gems/streak pill → white `radius-full` pill, `--spacing-md --spacing-xl`
  padding, TossFace glyph + bold count (`archetypes/mission-lobby.md`).
- celebration screen → `bg-sky` scene + 80px hero emoji + `spark-overlay`
  sparkles + big score badge (`archetypes/result-celebration.md`).
- answer tile grid → `x-` grid of `.btn`-based tiles
  (`archetypes/sorting-matching.md`).
