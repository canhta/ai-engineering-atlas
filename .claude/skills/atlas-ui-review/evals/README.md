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

When a run uses an isolated worktree, check out the commit under test first; new worktrees may start from `origin/main`.

Record for each run: defect found (yes/no), rule cited, false findings. Re-run all three after changing SKILL.md, DESIGN.md, or `site/scripts/capture.mjs`.

## Results

| Date | Patch | Run | Defect found | Notes |
|---|---|---|---|---|
| 2026-09-22 | 01 | automation only | yes | `check:contrast` failed (dark: 3.65:1, 3.40:1); axe `color-contrast` on all pages |
| 2026-09-22 | 02 | automation only | yes | horizontal page scroll on every `/vi/` page at 375px |
| 2026-09-22 | 03 | baseline, no skill | yes | 7 findings; it still read DESIGN.md through `site/AGENTS.md`, so this baseline measures the skill, not the whole harness |
| 2026-09-22 | 03 | with skill | yes | 2 blockers plus 10 findings, each tied to a DESIGN.md rule; automation passed, the visual review caught it |
