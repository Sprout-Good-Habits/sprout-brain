# Primitive: Home-agent Evidence

Home-agent evidence is an illustrative output shape for external progress or
state. It is not a formal Sprout schema unless explicitly backed by an MCP
tool.

Last verified: 2026-06-02

## Example shape

```json
{
  "source": "khan-academy",
  "childAlias": "sample-child",
  "capturedAt": "2026-06-02T20:00:00Z",
  "recentProgress": [
    {
      "label": "Multiplication practice",
      "status": "completed",
      "score": 86,
      "minutes": 14,
      "observedAt": "2026-06-02T19:45:00Z",
      "evidenceKey": "stable-dedupe-key"
    }
  ]
}
```

## What matters

The exact shape can vary. The planner needs enough information to answer:

- What changed?
- Which child is this for?
- What should the kid see next?
- Is this rewardable?
- Has this evidence already been used?
- Does a parent need to approve?

## Boundary

The home agent is responsible for producing evidence however the parent
chooses. Public Sprout docs should not prescribe scraping, credential
automation, or third-party terms-sensitive extraction methods.
