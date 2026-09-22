# atlas-ui-review evaluations

Each patch seeds one defect into `site/`. A run passes when the review names the defect, the page and variant where it shows, and the DESIGN.md rule it breaks.

| Patch | Defect | Must be reported |
|---|---|---|
| `01-muted-contrast.patch` | `--text-muted` moved to gray 9 | `check:contrast` failure for `--text-muted`, and axe `color-contrast` on pages with muted text; rule: Accessibility baseline / Colour |
| `02-vi-header-overflow.patch` | long Vietnamese nav label with `white-space: nowrap` | horizontal page scroll on `/vi/` pages at 375px; rule: Bilingual / Layout |
| `03-marketing-hero.patch` | marketing tagline with emoji on the English home page | marketing hero and emoji tells on `/en/` home; rule: Review tells (automation passes, so only the visual review catches it) |

## Running

From the repository root, for each patch:

```bash
git apply .claude/skills/atlas-ui-review/evals/01-muted-contrast.patch
# fresh agent: "Review the site UI." (with the skill) — and once without it as the baseline
git apply -R .claude/skills/atlas-ui-review/evals/01-muted-contrast.patch
```

Record for each run: defect found (yes/no), rule cited, false findings. Re-run all three after changing SKILL.md, DESIGN.md, or `site/scripts/capture.mjs`.
