# Runtime and Orchestration Evidence Contract

This package extends the same stateful, planned, verified Knowledge Assistant.

Do not introduce a multi-agent topology for this slice. First prove durable runtime behavior and orchestration value with the simplest architecture that satisfies the task.

## Required progression

```text
existing stateful verified workflow
→ simple synchronous baseline
→ real wait / restart boundary
→ durable run lifecycle
→ pause / resume
→ retry / cancel / timeout / budget evidence
→ identify routing / parallelism need
→ simpler-flow baseline
→ orchestrated variant
→ branch failure injection
→ aggregate verification
→ ablation
→ keep / simplify / remove decision
```

## 1. Long-running runtime

Use [long-running-experiment.template.md](long-running-experiment.template.md).

The runtime contract must define:

- durable run ID;
- lifecycle states;
- execution budget;
- pause/wait conditions;
- timeout and cancellation;
- retryable versus non-retryable failures;
- replay/idempotency boundary;
- worker ownership/concurrent-resume behavior;
- partial-progress artifacts;
- final verification.

A process staying alive is not durability.

## 2. Orchestration

Use [orchestration-experiment.template.md](orchestration-experiment.template.md).

Make control ownership explicit:

- code-controlled;
- model-controlled;
- hybrid.

Preserve a simpler-flow baseline.

Only parallelize work that is actually independent.

## 3. Failure work

Long-running failure work must include:

- worker/process loss;
- retryable failure;
- terminal/non-retryable failure;
- cancellation or timeout;
- unsafe replay boundary.

Orchestration failure work must include:

- wrong route or branch;
- branch timeout/failure;
- partial fan-out completion;
- aggregate/fan-in verification failure.

## Completion standard

Another engineer should be able to answer:

- what survives a worker restart;
- how a paused run resumes;
- what budget stops runaway execution;
- what cannot be replayed safely;
- who owns each flow decision;
- why parallel work is independent;
- how branch failures propagate;
- whether orchestration is worth its cost and operational complexity.
