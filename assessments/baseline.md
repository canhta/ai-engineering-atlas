# Baseline Scan

The baseline scan is a routing tool, not a final exam.

Do it before studying. Use notes only after you have attempted each prompt.

## How to use the scan

For each section, mark one of:

- **strong** — you can explain and perform the task with little or no help;
- **mixed** — you recognize the topic but cannot complete part of the task;
- **gap** — you cannot yet explain or perform the task.

Record a short piece of evidence or a note about what failed.

### Routing rule

- **strong** → skip domain-level study and use competency diagnostics;
- **mixed** → identify the smallest failed capability and test that competency;
- **gap** → start from the domain page and prerequisite chain.

Do not average these into one "AI Engineer score." Different roles require different depth.

---

## Software Engineering

Without searching:

1. explain how you would make a payment-like API operation safe to retry;
2. describe how you would test code whose behavior depends on an external service;
3. given a slow endpoint, list the first measurements you would collect before optimizing it.

**Evidence to note:** idempotency, test boundaries, observability/debugging approach.

## Systems

1. explain timeout, retry, backoff, and idempotency as a system together;
2. describe one consistency trade-off in a distributed system;
3. sketch how you would prevent one slow downstream service from exhausting the whole application.

**Evidence to note:** failure propagation, backpressure, concurrency, queues/caching where relevant.

## Data Engineering

1. design an ingestion path for data that can be updated and deleted later;
2. explain how you would detect stale or malformed data;
3. describe what lineage information you would want before retraining or rebuilding an index.

## ML Foundations

1. explain the difference between train, validation, and test data;
2. describe overfitting without using only the phrase "memorizes the data";
3. given two experiment results, explain what evidence you need before claiming one is better.

## Deep Learning

1. explain what backpropagation computes;
2. trace the role of an optimizer through one training step;
3. name two signals you would inspect when training is unstable.

## LLM Foundations

1. explain tokenization, embeddings, attention, and autoregressive decoding as separate mechanisms;
2. explain why context length affects inference cost;
3. describe what a KV cache stores and why it helps.

## AI Engineering

1. given a new AI feature, define a deterministic or simple baseline before choosing a complex architecture;
2. explain when retrieval, fine-tuning, or prompt/context changes solve different problems;
3. design a minimal evaluation comparing two model or system configurations.

## Retrieval / RAG

1. separate retrieval quality from answer-generation quality;
2. explain what chunking changes in the retrieval problem;
3. describe how updates, deletions, permissions, and freshness affect a production index.

## Agents

1. explain when a deterministic workflow is preferable to an agent;
2. design a tool call that can be retried safely;
3. describe how you would evaluate an agent beyond final-answer quality.

## Production AI

1. sketch a path from a local AI prototype to a service you can release safely;
2. list the traces/metrics you would want for model, retrieval, and tool calls;
3. describe one rollback or graceful-degradation strategy.

## Security & Governance

1. explain direct and indirect prompt injection;
2. explain why tool authorization must not depend only on model instructions;
3. describe what data-retention/deletion behavior an AI system should preserve.

## Multimodal

1. explain what changes when an application accepts image, audio, or document inputs;
2. describe one latency or streaming concern for voice;
3. describe one evaluation problem unique to a multimodal system.

---

# After the scan

Create a short routing note:

```text
Target role:
Strong domains:
Mixed domains:
Clear gaps:
First competency to diagnose:
Reason:
```

Then stop scanning and begin with **one** competency.

The scan should reduce uncertainty about what to study next, not create a long backlog.
