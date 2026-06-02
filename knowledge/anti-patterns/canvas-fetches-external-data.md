# Anti-pattern: Canvas Fetches External Data

Bad recommendation:

"The canvas fetches Khan progress."

Last verified: 2026-06-02

## Why bad

- Sprout canvases cannot fetch external network data.
- Credentials and external state do not belong inside the kid canvas.

## Use instead

- Home agent produces progress evidence.
- Canvas renders the current mission and progress passed through Sprout-side
  setup or updates.
