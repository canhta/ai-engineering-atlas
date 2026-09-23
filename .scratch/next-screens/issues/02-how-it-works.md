# 02: How it works page

Spec: [../spec.md](../spec.md)

**What to build:** `/{lang}/how/`, linked from Home's hero (the secondary action) and the footer: the seven learner states with glyph, label, and meaning; what counts as evidence per capability type; a route's steps in order; why reviews come back. Structure and labels from the content model; explanatory sentences as reviewed-style UI strings from docs/LEARNING_MODEL.md.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Every learner state and every `step` block title from the model appears, in order
- [x] Evidence per capability type follows the assessment rules in AGENTS.md / LEARNING_MODEL.md, without inventing new rules
- [x] Readable at 390 and 1440, en and vi; no marketing language; no generic numbered-step row (the review tells)
- [x] Browser test from the model; DESIGN.md information architecture and a short surface note within budget; site/TODO.md item ticked with the new vi keys listed
- [x] `pnpm run check`, `pnpm run test:e2e`, `make check`, `capture.mjs` pass
