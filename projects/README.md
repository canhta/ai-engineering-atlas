# Project Spines

Project spines provide persistent systems in which separate competencies can be combined.

The point is not to finish a capstone after the curriculum. The point is to revisit the same system as new capabilities are learned, so later topics expose interactions and trade-offs that isolated exercises cannot.

## Reference projects

### [Tiny Transformer](tiny-transformer/)

Used for the **Foundation spine**.

Build a small language model far enough from scratch that important mechanisms remain inspectable:

```text
numerical operations
→ autograd / training step
→ tokenization
→ embeddings
→ attention
→ transformer block
→ training
→ decoding
→ inference measurements
```

Use this project when the competency is about model mechanisms or inference behavior.

### [Knowledge Assistant](knowledge-assistant/)

Used for the **AI System** and **Production** spines.

Build one evidence-driven knowledge system and evolve it:

```text
problem + baseline
→ keyword search
→ embeddings
→ hybrid retrieval
→ reranking
→ RAG
→ evaluation
→ tool use / agent only when justified
→ API + tracing
→ security boundaries
→ deployment / release gate
→ incident + feedback loop
```

This is the main integration context for applied AI engineering.

## Project rule

A project task should exist only when integration pressure adds learning value that a smaller exercise cannot.

Do not require a deployment project to prove a small mathematical concept.

Do require project evidence for competencies about:

- system design;
- component interactions;
- release decisions;
- operational reliability;
- security boundaries;
- production feedback.

## Project evidence

Projects should produce inspectable artifacts:

- product brief;
- baseline;
- evaluation data;
- experiment results;
- code and tests;
- architecture decisions;
- traces and metrics;
- release decision;
- failure/incident analysis;
- follow-up regression test.

Use [../assessments/evidence-rubric.md](../assessments/evidence-rubric.md) when changing learner state.
