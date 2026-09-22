# State and Memory Evidence Contract

This package extends the same Knowledge Assistant system and evaluation lineage.

Do not replace the project with a toy agent. Add state and memory only when the existing workflow creates a real continuity or cross-session need.

## Required progression

```text
existing tool-enabled workflow
→ explicit execution state
→ durable checkpoint / event history
→ injected interruption
→ resume without duplicate side effect
→ state schema migration
→ identify real cross-session information need
→ selective memory write
→ new-session retrieval
→ stale / conflict / correction / deletion tests
→ memory vs no-memory evaluation
→ keep / change / remove decision
```

## 1. Execution state

Use [state-recovery.template.md](state-recovery.template.md).

The state contract must define:

- run/session identity;
- state schema/version;
- legal transitions;
- persisted versus derived values;
- checkpoint/event boundaries;
- pending versus completed work;
- side-effect identifiers;
- terminal states.

Raw state is not the prompt. Format only the subset needed for the next model call.

## 2. Interruption and recovery

Inject a failure after at least one meaningful step has completed.

The recovery evidence must show:

- process/harness restart;
- state reload;
- next legal transition;
- no duplicate completed side effect;
- correlation/idempotency behavior;
- repeated work caused by recovery.

A workflow that simply rereads the transcript and guesses where to continue does not satisfy the contract.

## 3. State migration

Change the state schema once.

Record:

- old version;
- new version;
- compatible or breaking change;
- migration or fallback behavior;
- how old persisted runs are handled.

## 4. Memory admission and retrieval

Use [memory-evaluation.template.md](memory-evaluation.template.md).

Add one cross-session memory use case only when the product benefits from it.

A memory item must make provenance and lifecycle inspectable:

- scope/owner;
- content type;
- source/provenance;
- created/updated time;
- freshness/expiry rule where relevant;
- write/admission reason;
- correction/update path;
- deletion/forget path.

## 5. Memory evaluation

Compare at minimum:

1. no persistent memory;
2. one explicit memory policy;
3. one alternative write/read policy.

Test:

- useful prior-session information;
- irrelevant memory;
- stale memory;
- conflicting memory;
- correction/update;
- deletion/forgetting;
- cross-user or cross-scope isolation where identity exists.

Measure task quality together with latency, retrieval/context size, and harmful recall.

## Completion standard

Another engineer should be able to answer:

- what execution state is required to resume correctly;
- which values are persisted versus derived;
- where checkpoints happen;
- why a replay cannot duplicate side effects;
- what information is admitted into long-term memory;
- who/what owns each memory;
- how stale/wrong memories are corrected or removed;
- whether memory actually improves the target task enough to justify its complexity.
