# Design Tokens — Canvas Runtime (GENERATED)

> **GENERATED FILE — do not edit by hand.** Regenerate with
> `node scripts/sync-design-inventory.mjs --css <artifact-design-system.css> --commit <sha>`.
> Source: `apps/server/src/services/mastra/tools/artifact-design-system.css` @ sprout-app `6daf8825e`.

Every token below is a CSS custom property available inside EVERY canvas via the
injected base stylesheet. Use `var(--token)` — never hardcode hex, px sizes, or
font stacks where a token exists (the server analyzer flags hex as a design error).

## Font weights

| Token | Value |
| --- | --- |
| `--font-weight-regular` | `400` |
| `--font-weight-medium` | `500` |
| `--font-weight-semibold` | `600` |
| `--font-weight-bold` | `700` |

## Font sizes

| Token | Value |
| --- | --- |
| `--font-size-display-2xl` | `72px` |
| `--font-size-display-xl` | `60px` |
| `--font-size-display-lg` | `48px` |
| `--font-size-display-md` | `36px` |
| `--font-size-display-sm` | `30px` |
| `--font-size-display-xs` | `24px` |
| `--font-size-text-xl` | `20px` |
| `--font-size-text-lg` | `18px` |
| `--font-size-text-md` | `16px` |
| `--font-size-text-sm` | `14px` |
| `--font-size-text-xs` | `12px` |

## Line heights

| Token | Value |
| --- | --- |
| `--line-height-display-2xl` | `90px` |
| `--line-height-display-xl` | `72px` |
| `--line-height-display-lg` | `60px` |
| `--line-height-display-md` | `44px` |
| `--line-height-display-sm` | `38px` |
| `--line-height-display-xs` | `32px` |
| `--line-height-text-xl` | `30px` |
| `--line-height-text-lg` | `28px` |
| `--line-height-text-md` | `24px` |
| `--line-height-text-sm` | `20px` |
| `--line-height-text-xs` | `16px` |

## Letter spacing

| Token | Value |
| --- | --- |
| `--letter-spacing-display` | `-0.02em` |

## Spacing scale

| Token | Value |
| --- | --- |
| `--spacing-none` | `0` |
| `--spacing-xxs` | `2px` |
| `--spacing-xs` | `4px` |
| `--spacing-sm` | `6px` |
| `--spacing-md` | `8px` |
| `--spacing-lg` | `12px` |
| `--spacing-xl` | `16px` |
| `--spacing-2xl` | `20px` |
| `--spacing-3xl` | `24px` |
| `--spacing-4xl` | `32px` |
| `--spacing-5xl` | `40px` |
| `--spacing-6xl` | `48px` |
| `--spacing-7xl` | `64px` |
| `--spacing-8xl` | `80px` |

## Radius scale

| Token | Value |
| --- | --- |
| `--radius-none` | `0` |
| `--radius-xs` | `4px` |
| `--radius-sm` | `6px` |
| `--radius-md` | `8px` |
| `--radius-xl` | `12px` |
| `--radius-2xl` | `16px` |
| `--radius-4xl` | `24px` |
| `--radius-full` | `9999px` |

## Color ramp — sprout

| Token | Value |
| --- | --- |
| `--sprout-25` | `#fafdf7` |
| `--sprout-50` | `#f5fbee` |
| `--sprout-100` | `#e6f4d7` |
| `--sprout-200` | `#ceeab0` |
| `--sprout-300` | `#acdc79` |
| `--sprout-400` | `#86cb3c` |
| `--sprout-500` | `#669f2a` |
| `--sprout-600` | `#4f7a21` |
| `--sprout-700` | `#3f621a` |
| `--sprout-800` | `#335015` |
| `--sprout-900` | `#2b4212` |
| `--sprout-950` | `#1a280b` |

## Color ramp — brand

| Token | Value |
| --- | --- |
| `--brand-25` | `#f5fbff` |
| `--brand-50` | `#f0f9ff` |
| `--brand-100` | `#e0f2fe` |
| `--brand-200` | `#b9e6fe` |
| `--brand-300` | `#7cd4fd` |
| `--brand-400` | `#36bffa` |
| `--brand-500` | `#0ba5ec` |
| `--brand-600` | `#0086c9` |
| `--brand-700` | `#026aa2` |
| `--brand-800` | `#065986` |
| `--brand-900` | `#0b4a6f` |
| `--brand-950` | `#062c41` |

## Color ramp — gray

| Token | Value |
| --- | --- |
| `--gray-25` | `#fdfdfd` |
| `--gray-50` | `#fafafa` |
| `--gray-100` | `#f5f5f5` |
| `--gray-200` | `#e9eaeb` |
| `--gray-300` | `#d5d7da` |
| `--gray-400` | `#a4a7ae` |
| `--gray-500` | `#717680` |
| `--gray-600` | `#535862` |
| `--gray-700` | `#414651` |
| `--gray-800` | `#252b37` |
| `--gray-900` | `#181d27` |
| `--gray-950` | `#0a0d12` |

## Color ramp — red

| Token | Value |
| --- | --- |
| `--red-25` | `#fffbfa` |
| `--red-50` | `#fef3f2` |
| `--red-100` | `#fee4e2` |
| `--red-200` | `#fecdca` |
| `--red-300` | `#fda29b` |
| `--red-400` | `#f97066` |
| `--red-500` | `#f04438` |
| `--red-600` | `#d92d20` |
| `--red-700` | `#b42318` |
| `--red-800` | `#912018` |
| `--red-900` | `#7a271a` |
| `--red-950` | `#55160c` |

## Color ramp — green

| Token | Value |
| --- | --- |
| `--green-25` | `#f6fef9` |
| `--green-50` | `#ecfdf3` |
| `--green-100` | `#dcfae6` |
| `--green-200` | `#abefc6` |
| `--green-300` | `#75e0a7` |
| `--green-400` | `#47cd89` |
| `--green-500` | `#17b26a` |
| `--green-600` | `#079455` |
| `--green-700` | `#067647` |
| `--green-800` | `#085d3a` |
| `--green-900` | `#074d31` |
| `--green-950` | `#053321` |

## Color ramp — yellow

| Token | Value |
| --- | --- |
| `--yellow-25` | `#fefdf0` |
| `--yellow-50` | `#fefbe8` |
| `--yellow-100` | `#fef7c3` |
| `--yellow-200` | `#feee95` |
| `--yellow-300` | `#fde272` |
| `--yellow-400` | `#fac515` |
| `--yellow-500` | `#eaaa08` |
| `--yellow-600` | `#ca8504` |
| `--yellow-700` | `#a15c07` |
| `--yellow-800` | `#854a0e` |
| `--yellow-900` | `#713b12` |
| `--yellow-950` | `#542c0d` |

## Color ramp — orange

| Token | Value |
| --- | --- |
| `--orange-25` | `#fefaf5` |
| `--orange-50` | `#fef6ee` |
| `--orange-100` | `#fdead7` |
| `--orange-200` | `#f9dbaf` |
| `--orange-300` | `#f7b27a` |
| `--orange-400` | `#f38744` |
| `--orange-500` | `#ef6820` |
| `--orange-600` | `#e04f16` |
| `--orange-700` | `#b93815` |
| `--orange-800` | `#932f19` |
| `--orange-900` | `#772917` |
| `--orange-950` | `#511c10` |

## Color ramp — violet

| Token | Value |
| --- | --- |
| `--violet-25` | `#fbfaff` |
| `--violet-50` | `#f5f3ff` |
| `--violet-100` | `#ece9fe` |
| `--violet-200` | `#ddd6fe` |
| `--violet-300` | `#c3b5fd` |
| `--violet-400` | `#a48afb` |
| `--violet-500` | `#875bf7` |
| `--violet-600` | `#7839ee` |
| `--violet-700` | `#6927da` |
| `--violet-800` | `#5720b7` |
| `--violet-900` | `#491c96` |
| `--violet-950` | `#2e125e` |

## Color ramp — pink

| Token | Value |
| --- | --- |
| `--pink-25` | `#fef6fb` |
| `--pink-50` | `#fdf2fa` |
| `--pink-100` | `#fce7f6` |
| `--pink-200` | `#fcceee` |
| `--pink-300` | `#faa7e0` |
| `--pink-400` | `#f670c7` |
| `--pink-500` | `#ee46bc` |
| `--pink-600` | `#dd2590` |
| `--pink-700` | `#c11574` |
| `--pink-800` | `#9e165f` |
| `--pink-900` | `#851651` |
| `--pink-950` | `#4e0d30` |

## Color ramp — blue-dark

| Token | Value |
| --- | --- |
| `--blue-dark-25` | `#f5f8ff` |
| `--blue-dark-50` | `#eff4ff` |
| `--blue-dark-100` | `#d1e0ff` |
| `--blue-dark-200` | `#b2ccff` |
| `--blue-dark-300` | `#84adff` |
| `--blue-dark-400` | `#528bff` |
| `--blue-dark-500` | `#2970ff` |
| `--blue-dark-600` | `#155eef` |
| `--blue-dark-700` | `#004eeb` |
| `--blue-dark-800` | `#0040c1` |
| `--blue-dark-900` | `#00359e` |
| `--blue-dark-950` | `#002266` |

## Semantic — backgrounds

| Token | Value |
| --- | --- |
| `--bg-primary` | `#ffffff` |
| `--bg-secondary` | `#fafafa` |
| `--bg-tertiary` | `#f5f5f5` |
| `--bg-sky` | `#e0f2fe` |
| `--bg-grass` | `#86cb3c` |
| `--bg-brand-primary` | `#f0f9ff` |
| `--bg-brand-solid` | `#0086c9` |
| `--bg-brand-secondary` | `#e0f2fe` |
| `--bg-error-primary` | `#fef3f2` |
| `--bg-error-secondary` | `#fee4e2` |
| `--bg-error-solid` | `#d92d20` |
| `--bg-success-primary` | `#ecfdf3` |
| `--bg-success-secondary` | `#dcfae6` |
| `--bg-success-solid` | `#079455` |
| `--bg-warning-primary` | `#fefbe8` |
| `--bg-warning-secondary` | `#fef7c3` |
| `--bg-warning-solid` | `#ca8504` |
| `--bg-overlay` | `rgba(10,13,18,0.2)` |
| `--bg-disabled` | `#f5f5f5` |
| `--bg-quaternary` | `var(--gray-200, #e9eaeb)` |

## Semantic — text

| Token | Value |
| --- | --- |
| `--text-primary` | `#181d27` |
| `--text-secondary` | `#414651` |
| `--text-tertiary` | `#535862` |
| `--text-quaternary` | `#717680` |
| `--text-white` | `#ffffff` |
| `--text-disabled` | `var(--gray-400)` |
| `--text-placeholder` | `#717680` |
| `--text-brand-primary` | `#0b4a6f` |
| `--text-brand-secondary` | `#026aa2` |
| `--text-error` | `#d92d20` |
| `--text-error-primary` | `#d92d20` |
| `--text-success` | `#079455` |
| `--text-success-primary` | `#079455` |
| `--text-warning` | `#ca8504` |
| `--text-warning-primary` | `#ca8504` |

## Semantic — borders

| Token | Value |
| --- | --- |
| `--border-primary` | `#d5d7da` |
| `--border-secondary` | `#e9eaeb` |
| `--border-brand` | `#0ba5ec` |
| `--border-error` | `#f04438` |

## Semantic — foreground/icons

| Token | Value |
| --- | --- |
| `--fg-primary` | `#181d27` |
| `--fg-secondary` | `#414651` |
| `--fg-tertiary` | `#535862` |
| `--fg-quaternary` | `#a4a7ae` |
| `--fg-white` | `#ffffff` |
| `--fg-brand-primary` | `#0ba5ec` |
| `--fg-brand-primary-hover` | `#36bffa` |
| `--fg-brand-secondary` | `#0086c9` |
| `--fg-error` | `#d92d20` |
| `--fg-error-primary` | `#f04438` |
| `--fg-destructive-primary` | `#f04438` |
| `--fg-success` | `#079455` |
| `--fg-success-primary` | `#17b26a` |
| `--fg-success-secondary` | `#079455` |
| `--fg-warning` | `#ca8504` |
| `--fg-warning-primary` | `#eaaa08` |
| `--fg-warning-secondary` | `#ca8504` |

## Base

| Token | Value |
| --- | --- |
| `--font-display` | `'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif` |
| `--font-body` | `'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif` |
| `--shadow-soft` | `rgba(28,46,64,0.16)` |
| `--shadow-elevated` | `0 12px 16px -4px rgba(10,13,18,0.08), 0 4px 6px -2px rgba(10,13,18,0.03)` |
| `--shadow-dialog` | `0 2px 2px -1px rgba(10,13,18,0.04), 0 4px 6px -2px rgba(10,13,18,0.03), 0 12px 16px -4px rgba(10,13,18,0.08)` |
| `--overlay-white-20` | `rgba(255,255,255,0.2)` |
| `--overlay-white-50` | `rgba(255,255,255,0.5)` |
| `--overlay-white-60` | `rgba(255,255,255,0.6)` |
| `--black` | `#000000` |
| `--white` | `#ffffff` |
| `--canvas-safe-top` | `104px` |
| `--sprout-buddy-clearance` | `150px` |
| `--focus-ring-color` | `var(--brand-700, #026aa2)` |
| `--focus-ring-width` | `3px` |
| `--focus-ring-offset` | `2px` |
| `--response-stroke-subtle` | `1px` |
| `--response-stroke-default` | `2px` |
| `--response-stroke-focus` | `3px` |
| `--drop-3` | `0 3px 0 0 var(--gray-200, #e9eaeb)` |
| `--drop-4` | `0 4px 0 0 var(--gray-200, #e9eaeb)` |
| `--drop-brand` | `0 4px 0 0 var(--brand-600, #0086c9)` |
| `--drop-correct` | `0 4px 0 0 var(--green-200, #abefc6)` |
| `--drop-incorrect` | `0 4px 0 0 var(--red-200, #fecdca)` |
| `--oral-accent-complete` | `var(--word-accent-complete)` |
| `--oral-accent-primary` | `var(--word-accent-primary)` |
| `--oral-border-bead` | `var(--word-border-frame)` |
| `--oral-guide-ring` | `rgb(196,232,252)` |
| `--oral-surface-bead` | `var(--word-surface-tile)` |
| `--oral-surface-bead-held` | `var(--word-surface-tile-active)` |
| `--oral-surface-control` | `var(--word-accent-primary)` |
| `--oral-surface-control-held` | `rgb(19,125,181)` |
| `--oral-text-on-accent` | `var(--text-white, #ffffff)` |
| `--oral-text-primary` | `var(--word-text-primary)` |
| `--response-border-correct` | `var(--green-200, #abefc6)` |
| `--response-border-default` | `var(--border-secondary, #e9eaeb)` |
| `--response-border-disabled` | `var(--gray-300, #d5d7da)` |
| `--response-border-incorrect` | `var(--red-200, #fecdca)` |
| `--response-border-selected` | `var(--brand-200, #b9e6fe)` |
| `--response-icon-on-accent` | `var(--fg-white, #ffffff)` |
| `--response-icon-selected` | `var(--fg-brand-primary, #0ba5ec)` |
| `--response-size-control` | `24` |
| `--response-spacing-component-group` | `20` |
| `--response-surface-correct` | `var(--bg-success-secondary, #dcfae6)` |
| `--response-surface-default` | `var(--bg-primary, #ffffff)` |
| `--response-surface-disabled` | `var(--gray-50, #fafafa)` |
| `--response-surface-incorrect` | `var(--bg-error-secondary, #fee4e2)` |
| `--response-surface-selected` | `var(--bg-brand-secondary, #e0f2fe)` |
| `--response-surface-subtle` | `var(--bg-secondary, #fafafa)` |
| `--response-text-default` | `var(--text-primary, #181d27)` |
| `--response-text-disabled` | `var(--gray-500, #717680)` |
| `--response-text-secondary` | `var(--text-secondary, #414651)` |
| `--swap-border-bead` | `var(--word-border-frame)` |
| `--swap-border-entering` | `var(--word-accent-complete)` |
| `--swap-border-target` | `rgb(240,82,87)` |
| `--swap-surface-bead` | `var(--word-surface-tile)` |
| `--swap-surface-entering` | `rgb(229,250,229)` |
| `--swap-surface-target` | `rgb(255,232,232)` |
| `--swap-text-primary` | `var(--word-text-primary)` |
| `--taffy-border-word` | `rgb(227,94,156)` |
| `--taffy-guide-stretch` | `rgb(245,186,214)` |
| `--taffy-surface-word` | `rgb(255,199,224)` |
| `--taffy-surface-word-held` | `rgb(255,161,199)` |
| `--taffy-text-word` | `rgb(150,33,84)` |
| `--trace-guide-rule` | `rgb(221,226,229)` |
| `--trace-letter-guide` | `rgb(229,231,233)` |
| `--trace-letter-ink` | `rgb(66,67,72)` |
| `--trace-letter-path` | `var(--brand-500, #0ba5ec)` |
| `--trace-surface-active-letter` | `var(--brand-500, #0ba5ec)` |
| `--trace-surface-page` | `rgb(255,255,255)` |
| `--trace-surface-response` | `rgb(255,254,252)` |
| `--trace-text-active` | `rgb(52,56,62)` |
| `--trace-text-inactive` | `rgb(208,213,218)` |
| `--word-accent-complete` | `var(--gray-900, #181d27)` |
| `--word-accent-primary` | `var(--brand-500, #0ba5ec)` |
| `--word-border-frame` | `rgb(215,223,232)` |
| `--word-letter-green` | `var(--green-500, #17b26a)` |
| `--word-surface-tile` | `rgb(255,255,255)` |
| `--word-surface-tile-active` | `rgb(234,248,255)` |
| `--word-target-active` | `var(--gray-900, #181d27)` |
| `--word-target-ghost` | `var(--gray-200, #e9eaeb)` |
| `--word-text-primary` | `rgb(52,56,62)` |
| `--word-letter-purple` | `var(--violet-500, #875bf7)` |
| `--word-letter-yellow` | `var(--yellow-500, #eaaa08)` |
| `--word-surface-page` | `#ffffff` |
| `--word-text-secondary` | `rgb(121,130,140)` |
| `--oral-surface-page` | `var(--word-surface-page)` |
| `--swap-surface-page` | `var(--word-surface-page)` |
| `--swap-text-secondary` | `var(--word-text-secondary)` |
| `--taffy-surface-page` | `var(--word-surface-page)` |
| `--taffy-text-secondary` | `var(--word-text-secondary)` |
| `--ot` | `var(--gray-200)` |
| `--wc` | `var(--gray-200)` |
| `--wc-drop` | `4px` |
| `--as` | `var(--gray-200)` |
| `--slot-ghost-font` | `800 16px/0 var(--font-display)` |
| `--slot-ghost-pad` | `0 18px` |
| `--slot-ghost-min` | `36px` |
| `--di` | `var(--gray-200)` |
| `--mt` | `var(--gray-200)` |
| `--mc` | `var(--gray-200)` |
| `--sc` | `var(--gray-200)` |
| `--progress-accent` | `Sprout host = sprout-400,
   Village host = brand-500. The session bar defaults to the Sprout host color. */
.session-bar{--progress-accent:var(--sprout-400)}
.progress-checkpoints{position:absolute` |
| `--sb-fill` | `var(--bg-primary)` |
| `--cb` | `var(--brand-600)` |
| `--pab` | `var(--brand-600)` |
| `--ls-pct` | `50` |
| `--lt` | `var(--response-border-default)` |
| `--lt-bg` | `var(--response-surface-default)` |
| `--overlay-gray-60` | `rgba(10,13,18,0.6)` |
| `--sprout-dock-reserve` | `272px}
html:has(.sprout-dock .action-bar.two-up){--sprout-dock-reserve:320px}
.sprout-dock{position:absolute` |
| `--bub-surface-page` | `var(--bg-primary)` |
| `--bub-film` | `var(--brand-50)` |
| `--bub-film-swoosh` | `var(--bg-sky)` |
| `--bub-burst` | `var(--brand-500)` |
| `--bub-text` | `var(--gray-900)` |
| `--bub-text-reveal-from` | `var(--trace-text-inactive)` |
| `--bub-text-reveal-to` | `var(--trace-text-active)` |
| `--bub-error` | `var(--red-100)` |
| `--bub-error-text` | `var(--red-600)` |
| `--bub-error-swoosh` | `var(--red-200)` |

## Class + keyframe inventory

The complete list of classes and keyframes the runtime injects lives in
[`generated/inventory.json`](generated/inventory.json). `components.md`,
`motion.md`, and `layout.md` document how to use them; the lint mode of the
sync script verifies those docs never reference a class or token that does not
exist at runtime.
