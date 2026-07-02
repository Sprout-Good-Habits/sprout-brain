# Golden Examples — Early-Reader Canvases

Complete, analyzer-clean canvases demonstrating the Speak-Then-Act pattern
from `../../../design/early-readers.md`: voice + several actions on one
screen without clutter, for kids who can't read yet.

Each file is authored-canvas HTML (injected kit classes + tokens only, SDK
per `canvas/sdk.md`) and passed the server analyzer plus a scripted
interaction drive with screenshots before landing. Use them the way you use
archetype skeletons: copy whole, edit the content slots, keep the interaction
layer intact.

| File | Shows |
| --- | --- |
| `quiz-tier1.html` | The canonical Speak-Then-Act screen: auto-spoken prompt card (whole card = replay), frozen-then-cued choices, select-then-confirm, speaking feedback banner, idle re-prompt. |
| `reading-tier1.html` | Read-to-me passage: per-page auto-speak + block highlight, tap-the-card replay, paged navigation, duration completion. |
| `lobby-multiaction.html` | The hard case — a lobby whose action inventory would naively be 6+ buttons, decluttered via a state-morphing primary CTA, contextual reveal, and spoken nudges. |

How these differ from `design/archetypes/`: archetypes are the neutral
skeletons per page type; these examples layer the tier1 voice-first
interaction contract on top. For a tier1 canvas, start from the archetype,
then apply `design/early-readers.md` → Drop-in implementation (or copy the
matching example here).

QA rig (stub SDK + runtime CSS injection + Playwright drives) lives in the
workspace project `canvas-early-reader-ui/test/`.
