# Moved — see `design/`

This doc has been superseded by the `design/` domain, which is generated from
and linted against the runtime stylesheet (this file had drifted from it:
wrong button heights, legacy `SproutBridge`-first completion, and roughly half
the injected components undocumented).

Go to:

- [`design/components.md`](../design/components.md) — the full injected
  component API (classes, specs, markup)
- [`design/tokens.md`](../design/tokens.md) — GENERATED token reference
- [`design/motion.md`](../design/motion.md) — animations + timing
- [`design/layout.md`](../design/layout.md) — body defaults, screens, rhythm
- [`design/archetypes/`](../design/archetypes/) — copy-paste screen skeletons
- [`design/checklist.md`](../design/checklist.md) — the ship gate

Completion is `sprout.complete(opts)` per [`sdk.md`](sdk.md);
`SproutBridge.postMessage` is the legacy wire protocol — do not author
against it.
