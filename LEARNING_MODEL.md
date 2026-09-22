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
