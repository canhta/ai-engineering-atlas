# Source Review Policy

A ready learning route is only as reliable as the source location it points to.

The resource registry records when a source was last checked and, where appropriate, a review interval.

## What "checked" means

For a source used by a ready route, verify:

- the canonical URL still resolves;
- the named chapter/section/lecture still exists;
- the locator still teaches the intended outcome;
- the material has not changed enough to invalidate the practice or assessment;
- access requirements have not materially changed.

This is stronger than checking that the homepage exists.

## Review intervals

Use shorter intervals for sources that change frequently.

Typical defaults:

| Source type                                 | Suggested interval |
| ------------------------------------------- | -----------------: |
| Static book / paper / stable visual         |           365 days |
| Maintained course or documentation          |           180 days |
| Fast-moving roadmap / product documentation |            90 days |
| Job-market evidence                         |         30-90 days |

The interval is metadata, not a claim that the content becomes wrong on that date.

## CI behavior

CI enforces freshness only for registered sources that are actively used by a **ready** route and declare `review_interval_days`.

Coverage-only resources can be reviewed during the promotion process instead of blocking unrelated work.

## If a source moves or disappears

Do not silently replace the learning objective.

1. verify whether the competency/outcome still belongs in the curriculum;
2. find a replacement source that covers the same capability;
3. update the locator;
4. rerun the practice/assessment if the teaching route changed materially;
5. record the change in the changelog when it affects learners.

This follows the same separation used elsewhere in the repository: competency is stable; teaching resources can change.
