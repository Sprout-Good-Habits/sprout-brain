# Anti-pattern: Public Scraping Instructions

Bad recommendation:

"Install Playwright and scrape this service."

Last verified: 2026-06-02

## Why bad

Public Sprout docs should not distribute third-party extraction recipes or
terms-sensitive automation instructions.

## Use instead

- "The home agent is responsible for producing evidence in the parent's
  environment."
- Give a suggested evidence shape.
- Suggest official APIs, exports, manual entry, partner integrations, or
  user-owned local tooling without implementation details.
