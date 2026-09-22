# Context Engineering Experiment

## Fixed evaluation contract

- system version:
- evaluation-set version:
- model/version:
- retrieval configuration:
- success criteria:

## Context inventory

| Component | Source/version | Always present? | Selection rule | Approx. size | Why included |
| --- | --- | --- | --- | ---: | --- |

## Configurations

| Configuration | Included context | Excluded context | Selection/compaction rule | Token/context size |
| --- | --- | --- | --- | ---: |

## Results

| Configuration | Quality metric(s) | p50 latency | p95 latency | Cost | Critical failures |
| --- | ---: | ---: | ---: | ---: | --- |

## Ablation / failure cases

Include at least one:

- stale context;
- conflicting context;
- distractor context;
- long history;
- missing critical constraint.

## Failure analysis

Which failures come from missing signal, excess noise, stale state, conflicting instructions, retrieval, or generation?

## Decision

What context is deliberately kept, omitted, loaded just in time, or compacted?

## What would change the decision?
