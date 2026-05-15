# Sprout Artifact Kit — API Reference

Use this reference when building interactive HTML artifacts for the Sprout app.
Artifacts render in a mobile WebView (iOS/Android). All styling is applied automatically after generation — focus on structure, interactivity, and content.

---

## Bridge API

Every artifact MUST call `SproutBridge.postMessage()` to report completion. The bridge is auto-injected.

### Completion Types

```js
// Scored — quiz, game, worksheet
window.SproutBridge.postMessage(JSON.stringify({
  type: "scored",
  score: 8,
  total: 10
}));

// Completed — checklist, journal, open-ended activity
window.SproutBridge.postMessage(JSON.stringify({
  type: "completed"
}));

// Timed — timed challenge, reading session
window.SproutBridge.postMessage(JSON.stringify({
  type: "timed",
  duration: 300 // seconds
}));
```

### Rules
- Fire automatically when the activity completes (don't wait for button press)
- ALSO show a visible submit button the child can tap
- Guard against double-fire:
```js
let submitted = false;
function submitScore(score, total) {
  if (submitted) return;
  submitted = true;
  window.SproutBridge.postMessage(JSON.stringify({ type: "scored", score, total }));
}
```

---

## Component Reference

These CSS classes are available in every artifact. Use them instead of writing custom styles.

### Buttons

| Class | Look | Use for |
|-------|------|---------|
| `btn btn-primary btn-lg` | Blue, raised | Main CTA (one per screen) |
| `btn btn-secondary btn-lg` | White outline | Cancel, dismiss, alternative |
| `btn btn-success btn-lg` | Green, raised | Correct answer, positive action |
| `btn btn-error btn-lg` | Red, raised | Wrong answer feedback |
| `btn btn-warning btn-md` | Yellow, raised | Cautionary action |
| `btn btn-disabled btn-lg` | Gray | Non-interactive |

```html
<button class="btn btn-primary btn-lg" onclick="start()">Let's Go!</button>
<button class="btn btn-secondary btn-md" onclick="skip()">Skip</button>
```

Buttons are full-width by default. Add `style="width:auto"` for inline buttons.
Sizes: `btn-lg` (50px height), `btn-md` (46px height).

### Inputs

```html
<!-- Basic -->
<input class="input" type="text" placeholder="Type here...">

<!-- With label and error -->
<div class="input-wrapper">
  <label class="input-label">Your Name</label>
  <input class="input" type="text">
  <span class="input-error-text">This field is required</span>
</div>
```

Inputs are 56px height, rounded, blue border on focus. Add `input-error` class for red border.

### Cards

```html
<div class="card">
  <h2>Card Title</h2>
  <p>Card content goes here.</p>
</div>
```

White background, light border, rounded corners, padded.

### List Items

```html
<div class="list-item" onclick="select(this)">
  <div class="list-item-icon">📚</div>
  <div class="list-item-content">
    <div class="list-item-title">Read for 20 minutes</div>
    <div class="list-item-desc">Daily reading habit</div>
  </div>
  <div class="list-item-chevron">›</div>
</div>
```

Add class `checked` for selected state (blue background). Works great for answer options, settings, selection lists.

### Progress Bar

```html
<div class="progress-bar">
  <div class="progress-track">
    <div class="progress-fill" style="width: 40%"></div>
  </div>
</div>
```

16px track, blue fill with glossy highlight. Update width via JS for animation.

### Feedback Banners

Pin to bottom of screen. Show after correct/wrong answers.

```html
<!-- Success -->
<div class="feedback-banner fb-success" id="feedback" style="display:none; position:absolute; bottom:0; left:0; right:0;">
  <div class="fb-header">
    <div class="fb-icon">🎉</div>
    <div class="fb-title">Correct!</div>
  </div>
  <div class="fb-content">
    <div class="fb-desc">The answer is "moon"</div>
  </div>
  <button class="btn btn-success btn-lg" onclick="next()">Continue</button>
</div>

<!-- Error -->
<div class="feedback-banner fb-error" id="feedback-wrong" style="display:none; position:absolute; bottom:0; left:0; right:0;">
  <div class="fb-header">
    <div class="fb-icon">🤔</div>
    <div class="fb-title">Not quite</div>
  </div>
  <div class="fb-content">
    <div class="fb-desc">The correct answer was "rain"</div>
  </div>
  <button class="btn btn-error btn-lg" onclick="next()">Continue</button>
</div>
```

**IMPORTANT:** Always start with `display:none` and show/hide via JS. Always hide the banner before showing the next question.

Variants: `fb-success` (green), `fb-error` (red), `fb-warning` (yellow), `fb-default` (white).

### Selection Controls

```html
<!-- Checkbox -->
<div class="checkbox" onclick="this.classList.toggle('checked')"></div>

<!-- Radio -->
<div class="radio" onclick="selectRadio(this)"></div>

<!-- Switch -->
<div class="switch" onclick="this.classList.toggle('checked')">
  <div class="switch-thumb"></div>
</div>
```

### Badges

```html
<span class="badge badge-brand">Level 1</span>
<span class="badge badge-success">Complete</span>
<span class="badge badge-error">3 wrong</span>
<span class="badge badge-warning">Time low</span>
```

### Empty State

```html
<div class="empty-state">
  <div class="empty-state-emoji">🌱</div>
  <div class="empty-state-title">No tasks yet</div>
  <div class="empty-state-desc">Add your first task to get started</div>
</div>
```

### Top Toolbar

```html
<div class="top-toolbar">
  <div class="top-toolbar-leading">
    <!-- Close/back button -->
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke="#717680" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  </div>
  <div style="flex:1;">
    <!-- Progress bar or title goes here -->
    <div class="progress-bar"><div class="progress-track"><div class="progress-fill" style="width:30%"></div></div></div>
  </div>
  <div class="top-toolbar-trailing">
    <span>⭐</span> <span>5</span>
  </div>
</div>
```

### Spinner

```html
<div class="spinner"></div>      <!-- 28px -->
<div class="spinner spinner-sm"></div>  <!-- 20px -->
```

---

## Layout

### Stacks (vertical)

```html
<div class="stack stack-lg">   <!-- 12px gap -->
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

Sizes: `stack-xs` (4px), `stack-sm` (6px), `stack-md` (8px), `stack-lg` (12px), `stack-xl` (16px), `stack-2xl` (20px), `stack-3xl` (24px).

### Rows (horizontal)

```html
<div class="row gap-lg">Item 1 Item 2</div>           <!-- centered -->
<div class="row-between">Left <span>Right</span></div> <!-- space-between -->
```

### Other

```html
<div class="center">Centered text</div>
<div class="scroll-row"><!-- horizontal scroll --></div>
```

---

## Typography

Headings are pre-styled — just use HTML tags:

| Tag | Size | Weight |
|-----|------|--------|
| `h1` | 24px | Bold |
| `h2` | 20px | Bold |
| `h3` | 18px | Semibold |
| `p` | 16px | Regular |

---

## Design Tokens

Use `var(--token)` for any inline styles. Never hardcode hex colors.

### Spacing
`--spacing-xs` (4px), `--spacing-sm` (6px), `--spacing-md` (8px), `--spacing-lg` (12px), `--spacing-xl` (16px), `--spacing-2xl` (20px), `--spacing-3xl` (24px), `--spacing-4xl` (32px), `--spacing-5xl` (40px)

### Colors
- **Brand blue:** `--brand-500` (primary), `--brand-400` (hover), `--brand-600` (dark)
- **Sprout green:** `--sprout-400` (accent), `--sprout-500` (dark)
- **Gray:** `--gray-100` through `--gray-900`
- **Status:** `--red-500`, `--green-500`, `--yellow-500`

### Semantic
- **Backgrounds:** `--bg-primary` (white), `--bg-sky` (sky blue), `--bg-secondary` (light gray)
- **Text:** `--text-primary` (dark), `--text-secondary` (gray), `--text-tertiary` (light gray)
- **Borders:** `--border-primary`, `--border-secondary`, `--border-brand` (blue), `--border-error` (red)

### Radius
`--radius-xs` (4px), `--radius-sm` (6px), `--radius-md` (8px), `--radius-xl` (12px), `--radius-2xl` (16px), `--radius-full` (pill)

### Font
`--font-size-text-xs` (12px), `--font-size-text-sm` (14px), `--font-size-text-md` (16px), `--font-size-text-lg` (18px), `--font-size-text-xl` (20px), `--font-size-display-xs` (24px)

---

## Emoji

TossFace emoji font is auto-loaded. Use emoji liberally — they're a core part of the Sprout look.

When displaying large emoji (hero emoji, section headers), ALWAYS set explicit sizing to prevent layout overflow:

```html
<!-- Large hero emoji — always set font-size, line-height:1, and explicit height -->
<div style="font-size: 64px; line-height: 1; height: 64px; text-align: center;">🌙</div>

<!-- Medium emoji -->
<div style="font-size: 48px; line-height: 1; height: 48px;">📚</div>

<!-- Inline emoji (body text size) — no special sizing needed -->
<span>Great job! 🎉</span>
```

IMPORTANT: TossFace glyphs are larger than their font-size. Always pair large emoji with `line-height: 1` and an explicit `height` matching the font-size to prevent container overflow.

---

## App Structure Pattern

```html
<div class="app">
  <!-- Screen 1: Game -->
  <div class="screen" id="screen-game">
    <!-- toolbar, content, feedback -->
  </div>

  <!-- Screen 2: Results -->
  <div class="screen hidden" id="screen-results">
    <!-- score, submit button -->
  </div>
</div>

<script>
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  document.getElementById('screen-' + id).classList.remove('hidden');
}
</script>
```

Use `.screen` for each view. Toggle with `.hidden` class. The body scrolls automatically.

---

## Animations

Built-in animations that work automatically:
- **Buttons**: 0.15s background/shadow transition, 0.1s transform on press
- **Toast**: springy enter (350ms), auto-dismiss countdown bar. Add `<div class="toast-countdown"></div>` inside toast for visual timer.
- **Sheet**: slide-up enter (300ms ease-out)
- **Feedback banner**: slide-up (300ms ease-out)
- **Progress bar**: smooth fill (400ms spring easing)
- **Switch**: 0.2s toggle transition
- **Inputs/checkboxes/radios**: 0.15s border/background transitions

Opt-in animation utility classes (add to any element):
```html
<div class="animate-in">Fades in</div>
<div class="animate-bounce-in">Bouncy scale entrance</div>
<div class="animate-pop">Quick pop-in</div>
<div class="animate-slide-up">Slides up from below</div>
<div class="animate-shake">Shake (wrong answer)</div>
<div class="animate-pulse">Gentle pulse</div>
```

Use `.animate-shake` on wrong answers, `.animate-bounce-in` for score reveals, `.animate-pop` for emoji entrances.

Timing reference:
- Fast feedback (hover, border): 0.15s
- Toggle (switch): 0.2s
- Enter animations: 300–350ms
- Dynamic fills: 400ms cubic-bezier(0.22, 1, 0.36, 1)
- Spinner: 0.8s linear infinite

`prefers-reduced-motion` is respected — all animations are disabled for users who prefer reduced motion.

---

## Defaults

- Body background: white (`--bg-primary`)
- Font: Inter + TossFace (auto-loaded)
- Elements have automatic 12px bottom margin
- Body has 16px padding and scrolls
- Touch targets should be at least 44px
- Single column layout, mobile-first
