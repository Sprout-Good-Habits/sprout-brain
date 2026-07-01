# Marketplace Capability

The marketplace is a public catalog of published skills, programs, and
canvas-backed recipes that families can adopt (use as-is) or fork (copy +
customize privately). A family can also submit its own creations for publishing.
Every adopt/fork lands a private copy in the adopting family's library.

Last verified: 2026-07-01

## Tools

- `marketplace_adopt` — copy a published listing into the family library to use
  as-is (not editable). Idempotent per `(family, listing, version)`.
- `marketplace_fork` — copy a published listing into the family library as an
  editable, private remix, carrying lineage back to the parent. Non-idempotent —
  each call makes a fresh copy.
- `marketplace_submit` — prepare a submission draft (`action:'draft'`) or update
  draft metadata (`action:'update'`). Final review/publish happens on the web.
- `marketplace_submit_preview` — dry-run validation of a source package; returns
  content-free node descriptors, a readiness split, and a `previewHash` to echo
  on submit.
- `marketplace_prepare_preview_upload` — mint a short-lived signed PUT URL to
  attach a preview image to a draft (the only path for preview images).
- `marketplace_submission_status` — read the family's drafts + owned listings
  (lifecycle ids, statuses, validation counts, URLs) — never raw content.
- `marketplace_search` / `marketplace_inspect` — discover listings by intent and
  read a listing's detail. **Feature-gated — available only when the marketplace
  search MCP tools are enabled.**

## Current use

- Adopt a published listing for immediate use, or fork one to remix privately.
- Prepare a submission draft, validate it with `submit_preview`, attach a preview
  image, and track status through `submission_status`.
- Where enabled, discover listings by intent (`search`) and inspect before
  adopting/forking.

## Constraints

- Adopt/fork only reach **published** listings. Private drafts, unpublished
  listings, and other families' sources are indistinguishable from not-found — no
  probing.
- **Publishing authority lives on the web.** MCP prepares, previews, validates,
  and tracks; final review/approval/publish is a web-surface action. Do not
  promise an agent can publish end-to-end.
- Adopt is idempotent (use-as-is); fork is intentionally non-idempotent (a new
  remix each time).
- A stale `listingVersionId` is rejected — adopt/fork must target the live
  version.
- Preview images attach only via `prepare_preview_upload`; `submit action:'update'`
  rejects preview-image fields.
- The MCP preview is content-free (hashes + byte sizes, no raw canvas bytes).
