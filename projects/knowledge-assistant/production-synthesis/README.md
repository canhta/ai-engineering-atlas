# Production Synthesis Evidence Contract

This is the capstone for the Production AI domain.

Do not add a new demo, platform, or architecture just to make the system look production-ready. Review the same Knowledge Assistant that accumulated evidence through retrieval, agents, gateways, observability, performance, delivery mechanisms, versioning, release engineering, and drift monitoring.

```text
product + operational constraints
→ alternative topologies
→ failure / state / trust review
→ simplify
→ selected architecture
→ operating lifecycle
→ automation + human gates
→ end-to-end change
→ production feedback
→ next iteration
```

## Stage 1 — architecture review

Use [architecture-review.template.md](architecture-review.template.md).

Start with constraints, not components.

Every independent service or mechanism needs a reason based on one or more of:

- independent change cadence;
- independent scaling;
- failure containment;
- state ownership;
- security/trust boundary;
- operational ownership;
- reuse across multiple workloads.

If no reason exists, prefer the simpler boundary.

Compare at least two viable topologies.

## Stage 2 — operating lifecycle

Use [operating-lifecycle.template.md](operating-lifecycle.template.md).

Map each change type through:

- experiment/hypothesis;
- tests and evaluation;
- artifact/version identity;
- release;
- production telemetry;
- drift/incident/feedback;
- next evaluation or change.

State explicitly whether training, tuning, or continuous training applies. A foundation-model API product does not need a training pipeline merely because the route is named MLOps/LLMOps.

## Stage 3 — production readiness

Use [production-readiness-review.template.md](production-readiness-review.template.md).

Review:

- known failure modes and degraded states;
- release/recovery evidence;
- observability and ownership;
- performance/economics constraints;
- security dependencies;
- artifact/lineage completeness;
- automation boundaries;
- remaining manual toil;
- unnecessary components.

## Exit condition

Another engineer should be able to understand why the selected architecture exists, remove any nonessential mechanism without losing the core product contract, reproduce one end-to-end change lifecycle, recover a known-good state, and follow production evidence back into the next evaluation/change.

A complicated diagram or a long list of MLOps products is not sufficient.
