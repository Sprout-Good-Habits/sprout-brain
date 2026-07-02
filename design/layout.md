# Canvas Layout — screens, rhythm, body defaults

## The body you inherit

The injected stylesheet resets margins and gives `<body>`:

- `background: var(--bg-primary)` (white) — **never override** (analyzer error)
- `font-family: var(--font-family-body)` (Inter + system fallbacks) — **never
  override**; TossFace applies to emoji via `.tf` and emoji-bearing kit slots
- `padding: var(--spacing-xl)` (16px) all around, `overflow-y: auto`
- base type: 16px/24 `--text-primary`; `h1` = display-xs bold, `h2` = text-xl
  bold, `h3` = text-lg semibold
- automatic vertical rhythm: block elements (`h1-h3`, `p`, `.card`,
  `.list-item`, `.btn`, `.input-wrapper`, `.progress-bar`, `.toast`,
  `.feedback-banner`, `.info-note`, `.empty-state`, `.badge`) get
  `margin-bottom: var(--spacing-lg)`; `:last-child` resets; children of
  `.stack`/`.row` reset (the gap owns spacing there)

Design phone-first: the canonical kid device frame is ~402×874. Single column.
Touch targets ≥44px.

## Screens

One `.screen` visible at a time; toggle with `.hidden`:

```html
<div class="screen" id="screen-intro">...</div>
<div class="screen hidden" id="screen-game">...</div>
<div class="screen hidden" id="screen-result">...</div>

<script>
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById('screen-' + id).classList.remove('hidden');
  }
</script>
```

`.screen` is an authoring convention (not injected CSS) that the server
analyzer recognizes — it checks that multiple screens come with switching
logic and that no screen is empty. Keep the `showScreen` helper name.

A typical activity is exactly three screens: **intro** (hero emoji + one-line
premise + primary CTA) → **game** (toolbar + prompt + interaction area +
feedback banner) → **result** (celebration + score + visible finish button).
The archetype skeletons in `archetypes/` are complete instances of this.

## Screen anatomy (game screen)

```
top-toolbar          quit/util control · progress-bar · status (⭐ count)
prompt zone          h2 or card — the question; speaker btn-util for tier1
interaction zone     list-items / tile grid / custom x- area (the game)
feedback-banner      hidden; owns Continue; pinned bottom (position:fixed)
```

Keep the interaction zone inside the natural body scroll; pin only the
feedback banner. Don't fight the 16px body padding with negative margins —
full-bleed backgrounds (sky/grass scenes) wrap content in a `x-` container
with its own padding instead.

## Spacing rhythm

Use `.stack`/`.row` with token gaps instead of ad-hoc margins. Section
spacing: `--spacing-3xl` (24) between major zones, `--spacing-lg` (12) between
sibling items, `--spacing-md` (8) inside compact groups. When you need a
custom container, take padding from the spacing scale — never a bare px value
that has a token equivalent.

## Branded scenes (intro / celebration)

Rebuild the kid-app "sky + grass + character" scene with kit classes:
`bg-sky` full-height wrapper → content → `bg-grass` strip at the bottom
(`bg-grass-edge` + `bg-grass-fill`). Ground any character/mascot on the grass
(bottom edge clipping is correct — characters stand IN the scene, not float).
Working screens stay on plain `--bg-primary` for legibility; the scene is for
the emotional bookends (intro, result).

## Emoji sizing (the #1 layout bug)

TossFace glyphs overflow their font-size box. Every hero emoji:

```html
<div class="tf" style="font-size:64px; line-height:1; height:64px;">🏆</div>
```

64px intro hero, 80px celebration hero, 56px empty-state, 24-32px inline
accents. Inline emoji in sentences need no special handling.
