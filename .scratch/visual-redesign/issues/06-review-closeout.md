# 06: Redesign review and close-out

Spec: [../spec.md](../spec.md).

**What to build:** the redesigned atlas is judged as a whole on the rendered site and left coherent. Screenshots of every surface in en and vi, light and dark, at 390 and 1440 are reviewed against the rewritten DESIGN.md with the `atlas-ui-review` skill, and every defect found is fixed. DESIGN.md reads end to end as one design (no leftover survey-plate or bezel language), and TODO.md records what landed and the follow-up specs for restructuring Atlas, Progress, Labs, and Library.

**Blocked by:** 01, 02, 03, 04, 05.

**Status:** ready-for-agent

- [ ] `capture.mjs` over Home, Atlas, drawer, Progress, route, lab, Labs index, and Library reports no HTTP, header, overflow, or axe problems in both languages, both themes, both widths
- [ ] `atlas-ui-review` findings are fixed or recorded as follow-ups with a reason
- [ ] DESIGN.md has no references to glass, bezels, trays, pill buttons, Hubot Sans, or the settle-in animation, except in the review tells
- [ ] TODO.md marks the redesign items done and lists the follow-up restructure specs; the owner review of the redesign and its Vietnamese strings is listed as open
- [ ] `make check` and `make site-check` pass
