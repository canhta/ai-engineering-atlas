# Project spines

Project spines provide persistent contexts in which separate competencies can be combined.

They are not fixed capstone projects and they are not required to progress in lockstep. A learner can enter a spine at the point appropriate to their current knowledge.

See [../LEARNING_MODEL.md](../LEARNING_MODEL.md#project-spines) for the rationale.

## Foundation spine

Purpose: expose model internals and connect mathematical mechanisms to code.

~~~text
numerical operations
→ autograd
→ small neural network
→ tokenizer
→ attention
→ transformer
→ decoding
→ inference measurements
~~~

Artifacts should stay small enough that the learner can inspect the mechanism.

## AI system spine

Purpose: build an AI application whose capability grows as new engineering concepts are introduced.

~~~text
keyword search
→ embeddings
→ vector search
→ hybrid retrieval
→ reranking
→ RAG
→ evaluation
→ tool use
→ agent workflow
→ multimodal input
~~~

The same system should be revisited so that new topics introduce real trade-offs rather than isolated toy examples.

## Production spine

Purpose: turn an AI prototype into a system that can be operated and changed safely.

~~~text
API
→ model/provider abstraction
→ logging
→ tracing
→ evaluation gates
→ caching and routing
→ security boundaries
→ deployment
→ incident simulation
→ production feedback
~~~

A production-spine task should include operational evidence such as traces, metrics, failure recovery, rollout decisions, or post-incident learning.

## Integration rule

A project task should only exist when it adds integration pressure that a smaller competency task cannot provide.

Do not require a large project to prove a small concept such as cosine similarity.

Do require integration when the capability is about system design, production behavior, or interactions between multiple components.
