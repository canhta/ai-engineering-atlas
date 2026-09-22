# Latency Experiment Record

## Workload and objective

- Release/system identity:
- Workload/request-set:
- User journey:
- Latency objective/SLO:
- Quality/evaluation reference:
- Concurrency/load profile:

## Baseline distribution

Record successful and failed requests separately.

- Success count:
- Error count:
- p50:
- p95:
- p99:
- Mean, if useful:
- Time-to-first-chunk, if streaming:
- Full completion time:

## Critical path

- Root workflow duration:
- Retrieval:
- Reranking:
- Tool calls:
- Gateway:
- Provider/model:
- Retries/fallback:
- Application/post-processing:
- Queueing or wait time:
- Dominant serial path:

## Bottleneck hypothesis

- Measured bottleneck:
- Evidence:
- Proposed change:
- Expected metric affected:
- Quality/reliability risk:
- What would falsify the hypothesis:

## After change

Use the same or comparable workload.

- p50:
- p95:
- p99:
- Time-to-first-chunk, if applicable:
- Full completion:
- Error rate:
- Quality result:
- Load/tail observation:

## Decision

- Keep / reject / revert:
- Why:
- Dominant remaining constraint:
- Next experiment, if justified:
