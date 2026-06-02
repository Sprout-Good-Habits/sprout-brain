# Anti-pattern: Created Before Writes

Bad recommendation:

"I created this" before MCP writes complete.

Last verified: 2026-06-02

## Why bad

It confuses a plan with delivered state.

## Use instead

- "The setup plan is ready."
- "I am about to create..."
- "Created" only after write tools return success.
