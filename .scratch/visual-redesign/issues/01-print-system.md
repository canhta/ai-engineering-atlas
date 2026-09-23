# 01: The whole site in the print system

Spec: [../spec.md](../spec.md). Decision: ADR 0001. Primary source: branch `prototype/visual-direction`.

**What to build:** every page of the atlas switches to the editorial print system while keeping today's layouts. A learner sees paper ground and near-black ink, magenta only as the route mark (primary action, selection, prerequisite lines), links as ink with an underline, Newsreader for titles and reading, IBM Plex Sans for UI, a plain full-width top bar with a hairline under it (no floating glass pill), hairline-ruled sections instead of double-bezel trays, rectangular buttons with 2–4 px radii instead of pills with an icon circle, and no plate settle-in animation. Dark mode is a night chart with the same roles. The drawer, sheets, and tooltips keep a shadow because they float; nothing else does.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Tokens are rewritten in place for light and dark: glass, blur, tray/core radii, bezel, pill radius, and the teal link role are gone, with every use removed; learner-state hues are unchanged
- [x] Newsreader and IBM Plex Sans (variable, Vietnamese subset) are the only text faces; JetBrains Mono only for code and IDs; Hubot Sans is removed from dependencies and styles; Vietnamese diacritics render correctly on `/vi/`
- [x] The top bar is plain, full width, hairline-ruled, never blurred, and never covers focused content; the footer keeps its links in the new style
- [x] The field log, drawer, lab bench, and plate lose their bezels; primary actions are one magenta rectangular button without an icon circle
- [x] Home's plate appears at once (no settle-in); remaining motion is control feedback and drawer/sheet slides, instant under reduced motion
- [x] Stylelint enforces the new token set; `check:contrast` covers every new text and meaningful-line pair in both themes
- [x] DESIGN.md's visual system (colour roles, type, shape and depth, motion) and review tells (adding glass, bezels, pill-in-pill buttons, large radii, wide display faces) are rewritten in place
- [x] `pnpm run check`, `pnpm run test:e2e`, and `make check` pass; `capture.mjs` reports no problems; screenshots of Home, Atlas, drawer, Progress, route, lab, Library at 390 and 1440 in light and dark were reviewed
