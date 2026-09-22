# AI Release Engineering

**Status:** ready  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Google SRE Workbook — Canarying Releases](https://sre.google/workbook/canarying-releases/) | Chapter introduction and section "Minimizing Risk to SLOs and the Error Budget" | Model a canary as partial, time-limited exposure plus evaluation, and connect exposure size and duration to production risk. |
| [Argo Rollouts — Analysis & Progressive Delivery](https://argo-rollouts.readthedocs.io/en/stable/features/analysis/) | Sections "Background Analysis", "Inline Analysis", "Failure Conditions and Failure Limit", and the success/failure/inconclusive behavior described under analysis limits | Inspect concrete progressive-delivery control semantics where measured evidence can promote, abort, or remain inconclusive. |
| [Argo Rollouts — Rollback Windows](https://argo-rollouts.readthedocs.io/en/stable/features/rollback/) | Section "Rollback Windows" | Distinguish normal progressive rollout from fast restoration of a known stable revision and reason about explicit rollback targets. |
| [Argo Rollouts — Basic Usage](https://argo-rollouts.readthedocs.io/en/stable/getting-started/) | Sections "Updating a Rollout", "Promoting a Rollout", and "Aborting a Rollout" | Connect candidate update, manual promotion, abort, and fallback to stable revision into a concrete deployment lifecycle without requiring Argo as the platform. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `systems.cloud-infrastructure` | [Argo Rollouts — Basic Usage](https://argo-rollouts.readthedocs.io/en/stable/getting-started/) | Sections "Updating a Rollout", "Promoting a Rollout", and "Aborting a Rollout" | Patch the deployment-control vocabulary needed for progressive AI releases without requiring the full Cloud and Production Infrastructure curriculum. |
<!-- learning-sources:end -->

## Why this matters

A candidate can pass deployment health checks while AI behavior regresses.

Release engineering turns a concrete versioned candidate plus frozen evaluation and live telemetry into a controlled decision: expose, promote, pause, abort, roll back, or choose not to release.

## 1. Diagnostic first

Before studying the sources, define:

- which offline criteria block production exposure;
- how a bounded rollout limits risk;
- which live AI-quality signals are separate from infrastructure health;
- what an inconclusive analysis should do;
- the exact manifest restored by rollback and how restoration is verified.

If "deploy succeeded" is the release decision, keep learning.

## 2. Mental model

Use the Learning sources table above.

Keep these boundaries explicit:

```text
evaluation
→ is this candidate good enough under the defined contract?

release manifest
→ what exact system state is the candidate?

progressive delivery
→ how much production risk is exposed while learning?

observability
→ what happened during exposure?

rollback
→ restore and verify an explicit known-good state
```

Canarying is a risk-control option, not a ceremony required for every change.

## 3. Independent practice

Use the [Release Lifecycle evidence contract](../../../projects/knowledge-assistant/release-lifecycle/).

Block one candidate before exposure, abort another from live evidence, and perform one verified rollback to a concrete known-good manifest.

## 4. Failure work

Test:

- failed frozen offline quality gate;
- live latency or error regression;
- AI-quality regression with healthy service metrics;
- inconclusive analysis;
- abort;
- rollback;
- partial or incorrect rollback where one newer artifact remains active.

A rollback command is not success until identity and representative behavior are verified.

## 5. Exit evidence

You are at **demonstrated** when another engineer can reconstruct why a candidate was promoted, paused, aborted, or rolled back from the candidate manifest, frozen evaluation gate, bounded-exposure plan, live AI and operational signals, and rollback verification.

A green CI or deployment status is not sufficient.

## 6. Transfer

Move the release process to a workload with different traffic volume, delayed quality signals, rollback cost, provider behavior, and reversibility.

## 7. Applied evidence

Applied evidence is a release process that catches or limits a real regression and stays no more complex than the risk requires.
