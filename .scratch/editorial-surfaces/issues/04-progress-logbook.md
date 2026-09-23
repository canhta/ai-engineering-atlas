# 04: Progress is a field logbook

Spec: [../spec.md](../spec.md)

**What to build:** Progress keeps its summary sentence and region bars at the top; the main column becomes the evidence log (one entry per evidence record, newest first: competency with state glyph, state it supports, kind, review method, date, note excerpt), replacing the per-competency table; the margin column holds next steps, the review queue, and Your data (export/import). Empty state points to a diagnostic.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] With seeded progress, every evidence record appears once, newest first, with dates via `formatDate`
- [x] Export and import work exactly as before (existing tests pass); storage-blocked and import-error states still show
- [x] Next steps and review queue sit in the margin on desktop and after the log on a phone
- [x] Browser tests with a seeded fixture; DESIGN.md's Progress section replaced in place
- [x] `pnpm run check`, `pnpm run test:e2e`, `make check`, `capture.mjs` pass
