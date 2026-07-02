# design/ — the Sprout kid design language for canvases

How to make an authored canvas look and behave like a native Sprout child
screen. Modeled on the kid design system in `sprout-design`
(`public/kid-design-system/` — tokens.css, component-specs.json,
sprout-ui-skill.md); constrained to what the canvas runtime actually injects.

## The freshness contract

`tokens.md` and `generated/inventory.json` are **generated** from the runtime
stylesheet (`artifact-design-system.css` in sprout-app — the CSS
`injectBaseStyles` ships into every canvas), stamped with the source commit.
The prose docs are linted against that inventory: no doc here may reference a
class or token the runtime doesn't define.

```bash
# regenerate after sprout-app changes the stylesheet
git -C <sprout-app> show origin/main:apps/server/src/services/mastra/tools/artifact-design-system.css > /tmp/ads.css
node scripts/sync-design-inventory.mjs --css /tmp/ads.css --commit $(git -C <sprout-app> rev-parse --short origin/main)

# lint the docs (CI-able)
node scripts/sync-design-inventory.mjs --lint
```

## Reading order

| Doc | What it is |
| --- | --- |
| `checklist.md` | The ship gate — mirrors the server analyzer rule-for-rule, plus the golden rules. Read ALWAYS. |
| `archetypes/*.md` | Copy-paste, analyzer-clean HTML skeletons per page archetype. **Start every canvas here** — fill slots, don't compose from scratch. |
| `age-tiers.md` | tier1/2/3 adaptation table. |
| `components.md` | The full injected component API (classes, specs, markup) + what does NOT exist and how to rebuild it. |
| `layout.md` | Body defaults, screen anatomy, spacing rhythm, branded scenes, emoji sizing. |
| `motion.md` | Built-in motion, animate-* utilities, sparkles, timing, signals-as-motion. |
| `tokens.md` | GENERATED token reference. |
| `generated/inventory.json` | GENERATED machine-checked class/token/keyframe inventory. |

Behavior (SDK) lives in `../canvas/sdk.md` — identity, state/resume,
completion, tts, Rive, sandbox rules. The `/canvas-planner` skill
(`../skills/canvas-planner/SKILL.md`) stages these docs so a planning session
loads only what it needs.
