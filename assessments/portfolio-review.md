# Portfolio Review

A portfolio review is a periodic integration checkpoint.

It borrows two useful ideas:

- OSSU's final project as a way to validate, consolidate, and display knowledge;
- Microsoft's Progress Assessment Tool pattern of reflecting on what was learned after a lesson group.

AI Engineering Atlas does not require one giant final capstone. Instead, use the evolving reference projects and learner evidence to review whether separate competencies have become integrated engineering judgment.

## When to run one

Run a portfolio review after a meaningful cluster of work, for example:

- completing several related ready routes;
- reaching a major project milestone;
- preparing for interviews or a role change;
- after 6-12 weeks of focused study.

Do not run it after every small competency.

## Review packet

Collect only artifacts that provide evidence.

Useful items:

- progress record;
- implementations and tests;
- experiment results;
- architecture decision records;
- evaluation sets/results;
- traces;
- release decisions;
- failure/incident analysis;
- delayed-retrieval evidence;
- project milestone artifacts.

## Questions

### 1. What can I now do that I could not do before?

Name capabilities, not material consumed.

Weak:

> Finished an LLM course.

Stronger:

> Can separate retrieval failure from generation failure and design an eval set that catches both.

### 2. Which evidence states changed?

For important competencies, list transitions such as:

```text
gap → demonstrated
demonstrated → transferred
transferred → applied
```

Explain the evidence for each transition.

### 3. Where did knowledge fail to transfer?

Identify cases where:

- a familiar exercise passed but a variant failed;
- a project exposed a missing prerequisite;
- a design choice could not be defended under different constraints.

These are candidates for the next learning cycle.

### 4. Which complexity did I reject?

Strong engineering includes choosing **not** to add:

- an agent;
- a vector database;
- a fine-tune;
- another model;
- another framework.

Record one case where a simpler design was supported by evidence.

### 5. What failed?

Pick at least one meaningful failure.

Document:

- expectation;
- actual behavior;
- diagnosis;
- fix;
- durable test or change to the mental model.

### 6. Can another engineer inspect the evidence?

A portfolio artifact should make the reasoning visible.

Prefer:

- code with tests;
- experiment table;
- trace;
- benchmark;
- design record;
- short technical write-up.

Avoid relying on claims such as "comfortable with RAG."

## Optional peer review

When useful, ask another engineer to review one artifact using the [evidence rubric](evidence-rubric.md).

Ask them to challenge:

- hidden assumptions;
- missing failure modes;
- unsupported design decisions;
- over-complexity;
- whether the evidence actually matches the claimed state.

Peer review is useful evidence, but it does not replace the underlying artifact.

## Output

Write a short review:

```text
Period:
Target:
Important state changes:
Strongest evidence:
Most important failure:
Complexity rejected:
Remaining gaps:
Next project milestone:
Next 1-3 competencies:
```

The purpose is to choose the next learning cycle, not to produce a certificate.
