# Model Selection Lab

Companion practice for `ai.model-selection`.

## Goal

Choose a model from evidence and constraints rather than reputation or a single benchmark.

This lab uses synthetic candidate profiles so the decision process is reproducible. The numbers are **not claims about real providers or models**.

## Scenario

Read [scenario.md](scenario.md) and [candidates.csv](candidates.csv).

The product has:

- hard constraints that cannot be violated;
- quality requirements;
- latency and cost goals;
- an evaluation set that can be used to compare real candidates later.

## Task 1 — eliminate infeasible candidates

Before ranking anything, identify hard constraints.

For each candidate, record:

- pass/fail on hard constraints;
- missing evidence;
- assumptions.

A high-quality model that violates a hard constraint is not a candidate.

## Task 2 — define the decision rule

Write the decision rule **before** selecting a winner.

Include:

- minimum quality threshold;
- latency threshold;
- cost ceiling;
- deployment/privacy requirement;
- tie-breakers;
- what uncertainty requires another experiment.

Use [decision-template.md](decision-template.md).

## Task 3 — choose and defend

Select a candidate from the synthetic profiles.

Your explanation should show:

- why rejected candidates were rejected;
- which trade-off determined the final choice;
- what new evidence could change the choice.

There is deliberately no single reference answer.

## Task 4 — sensitivity test

Change one constraint:

- traffic grows 10×;
- p95 latency requirement is cut in half;
- data must remain inside a private environment;
- quality threshold increases;
- budget is reduced.

Re-run the decision.

If your answer never changes, inspect whether your decision process is actually constraint-driven.

## Task 5 — replace synthetic profiles with real evidence

For stronger evidence, compare 2-3 models/providers on a small versioned eval set from your own project.

Record:

- model/version/date;
- evaluation-set version;
- quality;
- p50/p95 latency;
- cost for the measured workload;
- operational constraints;
- result.

Do not copy public leaderboard scores as a substitute for task-specific evidence.

## Transfer challenge

A second product needs batch document classification rather than interactive generation.

Explain which parts of your original model-selection process remain valid and which criteria change.

## Evidence

To claim **demonstrated**, keep:

- hard-constraint filter;
- decision rule written before selection;
- comparison table;
- decision record;
- sensitivity test.

To claim **applied**, use the process to make a real choice in a project and preserve the evaluation evidence.
