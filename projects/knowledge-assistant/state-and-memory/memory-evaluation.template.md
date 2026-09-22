# Memory Evaluation

## Product need

- cross-session task:
- why current-session context is insufficient:
- memory should improve:
- unacceptable memory failure:

## Memory schema

- memory version:
- scope/owner:
- content type:
- provenance:
- created/updated timestamp:
- freshness/expiry:
- correction/update rule:
- deletion/forget rule:

## Admission / write policy

What is remembered, what is rejected, and why?

## Read / retrieval policy

When is memory searched or loaded?

How is the result filtered before entering current model context?

## Evaluation cases

Include:

- useful prior-session information;
- irrelevant memory;
- stale memory;
- conflicting memory;
- corrected memory;
- deleted memory;
- wrong-scope / cross-user attempt where identity exists.

## Policy comparison

| Policy | Task quality | Harmful recall | Relevant-memory precision | Latency | Context/token cost |
| --- | ---: | ---: | ---: | ---: | ---: |
| No memory | | | | | |
| Policy A | | | | | |
| Policy B | | | | | |

## Trace evidence

For representative cases record:

```text
new-session task
→ memory query / skip
→ candidate memories
→ scope/freshness filtering
→ memories projected into context
→ model behavior
→ task outcome
```

## Lifecycle tests

- update/correction:
- deletion/forget:
- stale-memory handling:
- conflict handling:
- isolation:

## Decision

- keep / change / remove memory:
- chosen policy:
- rejected alternatives:
- what evidence would change the decision:
