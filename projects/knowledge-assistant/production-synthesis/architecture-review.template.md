# Architecture Review

## Drivers

- Product objective:
- Quality contract:
- Traffic/concurrency:
- Latency objective:
- Cost/unit economics:
- Availability/recovery:
- Data sensitivity/compliance:
- Team/ownership constraints:
- Expected change cadence:

## Topology A

- Components:
- Persistent state:
- External dependencies:
- Public/internal boundaries:
- Synchronous edges:
- Asynchronous edges:
- Scaling units:
- Degraded modes:
- Operational owners:

## Topology B

- Components:
- Persistent state:
- External dependencies:
- Public/internal boundaries:
- Synchronous edges:
- Asynchronous edges:
- Scaling units:
- Degraded modes:
- Operational owners:

## Boundary review

For each independent component:

- Reason it is separate:
- Change cadence:
- State:
- Scaling need:
- Failure contained:
- Trust/security boundary:
- Owner:
- Could it be merged:

## Failure propagation

- Provider outage:
- Retrieval/data outage:
- Tool failure:
- Cache failure:
- Network degradation:
- Configuration/policy error:
- Region or infrastructure failure:
- What user value remains in each case:

## Selection

- Chosen topology:
- Why:
- Component/mechanism removed or omitted:
- Complexity intentionally deferred:
- Condition that would justify adding it later:
- Provider/component replacement path:
