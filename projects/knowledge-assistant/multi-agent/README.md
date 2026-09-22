# Multi-Agent Evidence Contract

This package extends the same Knowledge Assistant after single-agent orchestration is already measured.

Do not create extra agents until a baseline exposes a limitation that independent specialist roles or context windows may solve.

## Required progression

```text
single-agent orchestration baseline
→ measured breadth / specialization / context limitation
→ define agent boundaries
→ multi-agent topology
→ delegation traces
→ coordination failure work
→ aggregate verification
→ quality / latency / cost comparison
→ topology ablation
→ keep / simplify / revert decision
```

## 1. Agent contracts

Use [agent-contract.template.md](agent-contract.template.md).

For every agent record:

- objective;
- input/output contract;
- tools;
- permissions;
- context/state visibility;
- execution budget;
- termination conditions;
- parent/child ownership.

If the role cannot justify a distinct control/context boundary, keep it as a tool or deterministic stage.

## 2. Multi-agent experiment

Use [multi-agent-experiment.template.md](multi-agent-experiment.template.md).

Preserve the exact single-agent task/evaluation lineage.

Required failure work:

- duplicated delegation or overlapping work;
- delegation coverage gap;
- conflicting specialist conclusions;
- one subagent timeout/failure;
- recursive/runaway delegation attempt.

## 3. Aggregate verification

The final answer or artifact must preserve provenance to specialist outputs/evidence and pass the same end-state verification used by the baseline.

## Completion standard

Another engineer should be able to answer:

- why each specialist is a separate agent;
- who owns the user-facing/final result;
- what context/tools/permissions cross each boundary;
- how total delegated work is bounded;
- how conflicts and failed specialists are handled;
- whether the topology improves enough to justify its token, latency, and operational cost.
