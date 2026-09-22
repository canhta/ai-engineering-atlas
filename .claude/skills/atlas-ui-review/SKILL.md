---
name: atlas-ui-review
description: Reviews rendered pages of the web atlas (site/) against site/DESIGN.md using screenshots, axe, overflow, and header checks. Use after changing components, styles, layout, copy, or i18n strings under site/, or when asked to review the site's UI.
---

# Atlas UI review

The design source of truth is [site/DESIGN.md](../../../site/DESIGN.md). This skill renders the site and compares what it shows against that file; it restates none of its rules.

## Steps

1. **Build and serve.** From `site/`: `pnpm run build`, then start `pnpm run preview` in the background and wait until `http://127.0.0.1:8787/en/` returns 200. Preview goes through Wrangler, so `_headers` apply.
2. **Capture.** Run `node scripts/capture.mjs http://127.0.0.1:8787 <scratch-dir>/ui-review [paths]`. Add the paths you changed (use `{lang}` in place of the locale, e.g. `/{lang}/routes/ai.evaluation/`); with no paths it covers home, map, and one route page. It writes one screenshot per page × `en`/`vi` × light/dark × 375/1280 and prints automated problems.
3. **Automated findings.** Every line under "Problems" is a blocker finding. Also run `pnpm run check`; each failure is a blocker.
4. **Visual review.** Open every screenshot. For each, check the DESIGN.md section for the surface shown (Layout by surface), then Typography, Colour, Shape, Motion-free rendering, Bilingual, and every row of the Review tells table. Compare `vi` against `en` at 375px for wrapping, clipped diacritics, and labels that push layout.
5. **Report.** One table:

   | Severity | Page · variant | DESIGN.md rule | Evidence | Fix (file) |
   |---|---|---|---|---|

   Severity: `blocker` (automated failure, broken rule), `should` (weakens a rule), `nit`.
6. **Fix and re-capture.** Fix what the task allows, then repeat steps 2–4 for the affected pages.
7. **Stop the preview server.**

## Done when

Every screenshot has been opened, every automated problem and visual finding is fixed or listed in the report, and the report cites a DESIGN.md section for each finding.

## Maintaining this skill

Seeded-defect evaluations live in [evals/](evals/README.md). Re-run them after changing this file, DESIGN.md, or `site/scripts/capture.mjs`.
