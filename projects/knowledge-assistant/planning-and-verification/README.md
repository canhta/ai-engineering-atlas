# Planning and Verification Evidence Contract

This package extends the same stateful Knowledge Assistant.

Do not introduce a multi-agent topology for this slice. First prove that explicit planning and verification improve a single-agent or deterministic/stateful workflow.

## Required progression

```text
existing stateful workflow
→ identify task that may benefit from adaptive decomposition
→ no-plan baseline
→ explicit inspectable plan
→ execute and update plan from environment results
→ inject changed condition / invalid assumption
→ replan
→ define success criteria
→ verify real outcome
→ seed a defect
→ repair / retry / replan / abstain / escalate
→ planning + verification ablation
→ keep / simplify / remove decision
```

## 1. Planning experiment

Use [planning-experiment.template.md](planning-experiment.template.md).

Compare at least:

1. no explicit planning;
2. static plan;
3. adaptive plan with replanning.

Keep the task set and core tools fixed.

A plan is an external inspectable artifact, not hidden reasoning.

## 2. Plan-to-state contract

The plan must live in durable state or an artifact referenced by state.

Record:

- plan schema/version;
- goal and deliverable;
- constraints;
- success criteria;
- ordered steps or dependencies;
- current status;
- blockers;
- artifacts/results required downstream;
- assumptions;
- invalidation/replanning triggers.

## 3. Replanning failure work

Inject at least one event that invalidates the current plan:

- required information is missing;
- a tool returns a different state than expected;
- a dependency fails;
- an external condition changes;
- a previously valid assumption becomes false.

The trace must show why the plan changed instead of silently generating a new plan.

## 4. Verification experiment

Use [verification-experiment.template.md](verification-experiment.template.md).

Map each success criterion to the strongest practical verifier:

1. deterministic/environment check;
2. executable test or invariant;
3. authoritative external data/tool;
4. calibrated model grader;
5. human review.

Prefer real outcome evidence over agent narration.

## 5. Seeded defect

Deliberately create at least one failure that a verifier should detect.

Record:

- defect;
- expected verifier;
- detection result;
- false negative if missed;
- repair/retry/replan/escalation action;
- verification after remediation.

## Completion standard

Another engineer should be able to answer:

- why planning is needed for this task;
- what part of the plan is persisted and updated;
- when replanning occurs;
- whether the planner improves outcomes enough to justify cost;
- what evidence proves each success criterion;
- whether verifier failures are themselves measured;
- how failed verification changes execution;
- whether planning or verifier scaffolding should be simplified or removed.
