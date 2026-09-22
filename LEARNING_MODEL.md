# Learning Model

This document defines how learning is expected to work in AI Engineering Atlas.

The curriculum, resources, assessments, labs, projects, progress tracking, and future AI tutor should follow this model.

## Design goal

The unit of progress is **demonstrated capability**, not a completed chapter, video, course, or checklist item.

A learner should be able to enter with existing experience, identify gaps, use the smallest amount of instruction needed, demonstrate the skill, transfer it to a new problem, and retain or apply it later.

## What informed this model

The model combines useful patterns from several learning systems rather than copying one course format.

### OSSU: curriculum before courses

OSSU maps courses to independent curricular guidelines, keeps prerequisites explicit, supports different study orders, looks for alternate assessments when a course does not provide them, and uses a final project to consolidate and display learning.

The important pattern is:

~~~text
learning outcome
    ↓
coverage requirement
    ↓
course / book / assessment
~~~

The resource can change without redefining the outcome.

References:

- https://github.com/ossu/computer-science
- https://github.com/ossu/computer-science/blob/master/CURRICULAR_GUIDELINES.md
- https://github.com/ossu/computer-science/blob/master/FAQ.md
- https://github.com/ossu/computer-science/blob/master/CONTRIBUTING.md

### Microsoft learning repositories: complete lesson loop

Microsoft learning repositories often connect a concrete scenario with learning goals, explanation, examples, an assignment, a solution, a knowledge check, a challenge, and a next step.

A useful abstraction is:

~~~text
scenario
  ↓
learning goals
  ↓
concept + example
  ↓
assignment
  ↓
feedback / solution
  ↓
knowledge check
  ↓
challenge / transfer
~~~

The assignment is not an appendix. It is part of the learning loop.

Reference:

- https://github.com/microsoft/generative-ai-for-beginners

### Made With ML: one system evolves over time

Made With ML starts with product design before model work, then carries one application through data, modeling, evaluation, scripting, testing, reproducibility, deployment, monitoring, and iteration.

Each new technique is tied back to the same system and its constraints.

The important pattern is:

~~~text
user problem
  ↓
product objective
  ↓
system constraints
  ↓
data / model / software decisions
  ↓
evaluation
  ↓
production
  ↓
feedback and iteration
~~~

References:

- https://madewithml.com/courses/mlops/product-design/
- https://madewithml.com/courses/mlops/evaluation/
- https://madewithml.com/courses/mlops/testing/
- https://github.com/GokuMohandas/Made-With-ML

### Learning science: retrieval, spacing, and adaptive guidance

Practice testing and distributed practice have strong support as learning techniques. Retrieval can improve later retention rather than merely measure it.

Guidance should depend on prior knowledge. Worked examples are especially useful when a learner lacks a usable mental model; as expertise grows, excessive guidance becomes redundant and independent problem solving becomes more useful.

References:

- Dunlosky et al., Improving Students' Learning With Effective Learning Techniques: https://doi.org/10.1177/1529100612453266
- Roediger & Karpicke, Test-Enhanced Learning: https://doi.org/10.1111/j.1467-9280.2006.01693.x
- Cognitive Load Theory review of worked examples and expertise effects: https://link.springer.com/article/10.1007/s10648-023-09782-w

These findings guide the design. They are not used to claim that one fixed schedule works for every learner.

---

# Learner lifecycle

A learner should move through the following lifecycle.

~~~text
Goal / role
    ↓
Baseline scan
    ↓
Gap selection
    ↓
Why / context
    ↓
Mental model
    ↓
Guided practice
    ↓
Independent practice
    ↓
Experiment / debug
    ↓
Exit evidence
    ↓
Transfer
    ↓
Project integration
    ↓
Delayed retrieval
    ↓
Applied competence
~~~

Not every competency requires every step at the same depth.

## 1. Goal and role

Before selecting topics, define what the learner is trying to become capable of doing.

Examples:

- applied AI engineer;
- AI platform engineer;
- software engineer moving into AI;
- LLM systems specialist.

The role determines required depth. It should not silently change the underlying competency definition.

## 2. Baseline scan

The first interaction with a domain is assessment, not content consumption.

A baseline scan may include:

- explanation questions;
- code reading;
- implementation tasks;
- debugging tasks;
- architecture decisions;
- interpreting an experiment;
- reviewing an existing system.

The purpose is to identify **which capability is missing**.

A learner with substantial software engineering experience should not be required to study introductory material simply because the topic exists in the roadmap.

## 3. Gap selection

A diagnostic result should point to the smallest meaningful gap.

Example:

~~~text
"RAG" is too broad.

Possible gaps:
- lexical vs semantic retrieval
- embedding selection
- chunking
- reranking
- retrieval evaluation
- ACL-aware retrieval
- freshness and deletion
~~~

Study should target the gap rather than restart the whole subject.

## 4. Why and context

Before instruction, the learner should understand the problem the competency solves.

A topic page should answer:

- What engineering problem creates the need for this?
- What fails without it?
- Where does it appear in a real AI system?
- What constraint or trade-off makes it non-trivial?

## 5. Mental model

The learner builds a compact model of the mechanism.

Possible material:

- a textbook section;
- a lecture segment;
- a worked example;
- a diagram;
- an interactive visualization;
- a small trace through an algorithm.

The goal is not broad content coverage. The goal is enough structure to reason about the next task.


## 6. Guided practice

When prior knowledge is weak, practice may start with:

- worked examples;
- partially completed code;
- annotated traces;
- guided notebooks;
- small exercises with immediate feedback.

Guidance should fade as competence increases.

## 7. Independent practice

The learner should then solve a task without step-by-step instructions.

Examples:

- implement a simplified attention mechanism;
- build a lexical + vector retrieval baseline;
- design retry and idempotency behavior;
- create an evaluation dataset;
- add tracing to an agent workflow.

This is the first strong evidence that knowledge has become usable.

## 8. Experiment and debug

Engineering competence requires more than producing a happy-path implementation.

The learner should change, compare, or break the system.

Examples:

- vary chunk size and measure Recall@K;
- increase sequence length and inspect attention memory;
- inject a tool timeout into an agent;
- compare two models on quality, latency, and cost;
- introduce a stale index and diagnose the retrieval failure.

The learner should make a prediction before running the experiment when practical.

## 9. Exit evidence

A competency is **demonstrated** only when the required evidence is present.

An exit test should be derived from the competency outcomes, not generated arbitrarily.

It may require a combination of:

- explanation;
- calculation;
- implementation;
- debugging;
- measurement;
- design choice;
- production operation.

Passing an exit test does **not** yet mean the capability is retained or transferable.

## 10. Transfer

The learner should solve a related task in a context that was not used during instruction.

Examples:

- after learning attention from text examples, reason about attention in a vision transformer;
- after building retrieval on documentation, design retrieval for support tickets with ACLs;
- after evaluating a classifier, design an evaluation strategy for a stochastic agent.

Transfer separates pattern copying from usable understanding.

## 11. Project integration

Important competencies should eventually be used inside a larger system.

A small lab proves a local skill. A project exposes interactions, constraints, and trade-offs between skills.

## 12. Delayed retrieval

Important knowledge should be recalled after a delay rather than only tested immediately after study.

The exact schedule is configurable. A reasonable default for important competencies is to revisit them after roughly:

- one day;
- one week;
- one month.

The review should begin with retrieval or a task, not rereading.

## 13. Applied competence

The strongest evidence comes from using the competency to make or improve a real system.

Examples include:

- finding a production failure;
- choosing between competing designs;
- reducing latency without harming quality;
- adding a release gate that catches a regression;
- changing a retrieval architecture after failure analysis.

---

# Learner states

Progress should not be represented by a single "done" checkbox.

| State | Meaning |
| --- | --- |
| unassessed | No meaningful evidence yet |
| gap | Diagnostic found missing capability |
| learning | Instruction or guided practice is in progress |
| demonstrated | Exit evidence was produced successfully |
| transferred | Capability was used on a sufficiently different task |
| retained | Capability was retrieved successfully after a delay |
| applied | Capability was used in an integrated or real system |

These states are evidence states, not badges for time spent.

A competency does not have to reach applied for every learner. Required state depends on the role and target depth.

---

# Competency types and evidence

Different competencies require different forms of proof.

| Competency type | Typical evidence |
| --- | --- |
| Concept | explain, distinguish, recall, calculate |
| Mechanism | trace, visualize, implement, predict behavior |
| Engineering skill | build, test, debug, modify |
| System operation | configure, observe, recover, automate |
| Design judgment | compare alternatives, reason from constraints, defend a choice |
| Production competency | ship, measure, detect failure, mitigate, rollback or improve |

## Example: cosine similarity

Appropriate evidence:

- explain what the score represents;
- calculate a simple example;
- interpret similarities;
- explain when cosine similarity is insufficient.

A deployment project is unnecessary.

## Example: self-attention

Appropriate evidence:

- explain Q/K/V and scaling;
- trace tensor shapes;
- implement simplified causal attention;
- visualize the matrix;
- diagnose a masking error;
- reason about sequence-length cost.

## Example: retrieval-augmented generation

Appropriate evidence:

- construct a baseline;
- evaluate retrieval separately from generation;
- analyze false positives and misses;
- compare chunking or retrieval strategies;
- handle update, deletion, provenance, or access constraints.

## Example: production AI

Appropriate evidence:

- deploy a service;
- collect useful traces and metrics;
- define a release gate;
- simulate or analyze a failure;
- degrade or roll back safely.

---

# Mastery model

The roadmap should separate several questions that are often collapsed into "Do I know this?"

~~~text
Can I recognize it?
Can I explain it?
Can I perform it?
Can I diagnose it?
Can I use it in a new context?
Can I still do it later?
Can I use it inside a real system?
~~~

A competency's required depth should specify which of these are necessary.

~~~text
L1 working knowledge
→ explain + distinguish

L2 practical competence
→ explain + perform + diagnose

L3 deep engineering competence
→ perform + diagnose + transfer + design under constraints

L4 specialist depth
→ reproduce, optimize, extend, or teach the mechanism
~~~

Retention and applied evidence are tracked separately because a learner may demonstrate L2 today and still fail delayed retrieval later.
