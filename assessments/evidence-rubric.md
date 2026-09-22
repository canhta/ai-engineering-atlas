# Evidence Rubric

Use this rubric to decide whether a learner-state change is justified.

## General rule

Evidence should match the competency outcome.

A quiz can support a concept outcome. It cannot by itself prove a production engineering outcome.

## Quality dimensions

| Dimension | Weak evidence | Strong evidence |
| --- | --- | --- |
| Independence | followed a step-by-step solution | completed with minimal guidance |
| Observability | "I understand it" | code, trace, explanation, benchmark, decision record |
| Correctness | happy path only | tests important cases and failure modes |
| Reasoning | gives a choice | explains constraints and trade-offs |
| Debugging | can build | can diagnose a broken version |
| Transfer | repeats same example | succeeds in a changed context |
| Retention | immediate recall | retrieves after a meaningful delay |
| Integration | isolated exercise | changes or improves a larger system |

## State changes

### demonstrated

Use when the learner has satisfied the competency's exit evidence now.

Typical evidence:

- implementation and tests;
- explanation without notes;
- experiment results;
- design decision with constraints;
- successful recovery from a failure scenario.

### transferred

Use when the learner solves a sufficiently different task without being given the original solution pattern.

The transfer task should change at least one important dimension: domain, data, architecture, constraints, modality, or failure mode.

### retained

Use when the learner can retrieve or reconstruct the capability after a delay without rereading first.

A quick recognition question is weak evidence. Reconstruction, explanation, implementation, or debugging is stronger.

### applied

Use when the capability affects an integrated or real system.

Examples:

- changed a design;
- caught a regression;
- improved a metric;
- resolved an incident;
- made a release decision;
- added a durable test or guardrail.

## Review note template

```text
Competency:
Target state:
Evidence:
What I did without help:
What failed or required hints:
Failure modes tested:
Trade-off or decision:
Next evidence needed:
Artifact links:
Reviewed on:
Review again:
```
