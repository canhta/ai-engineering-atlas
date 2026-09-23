---
status: accepted
---

# The web atlas looks like a printed atlas, not a premium landing page

The first UI (restrained, IBM Plex, 4–6 px radii) was rejected as generic. The survey-plate redesign that followed (glass pill nav, double-bezel trays, 28 px radii, pill buttons with an icon in a circle, a wide display face) was then rejected as AI slop: those are the stock moves of "expensive-looking" generated sites. We chose an editorial print direction with a tool's density: Newsreader for display and reading, IBM Plex Sans for UI, warm paper ground with near-black ink and magenta as the one route accent, hairline rules, 2–4 px radii, no decorative motion, and a plate whose ready routes are large named tiles while mapped competencies stay visible as small marks. Pages size their title to their content, and Home shows a specimen of one real route (a diagnostic task and an exact source locator) because the locator is what the atlas offers that others do not.

## Consequences

- General "high-end visual design" guidance no longer sets the site's look; `site/DESIGN.md` does. Agents should not reintroduce glass, bezels, pill-in-pill buttons, or large radii from such guidance.
- Prototypes on `prototype/visual-direction` settled the variant: the plate leads Home and a real-route specimen sits directly under it; the route page reads like a book with a locator plate of its region in the margin. Prerequisite lines show on hover and focus only, because always-drawn lines tangled into noise. `site/DESIGN.md` is replaced in place to match.
