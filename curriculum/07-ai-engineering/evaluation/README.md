# AI Evaluation and Experimentation

**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

## Why this matters

AI systems are probabilistic and compound. A single average score rarely tells you whether a change is better, which component failed, or whether the system is safe to release.

The competency is therefore not "know evaluation metrics." It is the ability to turn a product or system objective into repeatable evidence and a release decision.

## Start with the diagnostic

Without reading the sources, design an evaluation for one change to a prompt, retriever, model, or agent.

Your design should answer:

- what success means;
- what data represents the task;
- what is evaluated at component level;
- what is evaluated end to end;
- what needs repeated runs;
- how failures are categorized;
- which latency or cost constraints matter;
- what result blocks a release.

If you can already do this concretely, move directly to the independent harness and transfer task.

## Learning route

### Mental model

Primary source:

- Chip Huyen, *AI Engineering*:
  - **Chapter 3 — Evaluation Methodology**
  - **Chapter 4 — Design Your Evaluation Pipeline**

Focus on evaluation criteria, exact and model-based evaluation, comparative evaluation, component-level evaluation, evaluation guidelines, methods, and data.

Practical companion:

- Made With ML — **Evaluation** lesson.

Use it to see how an evaluation moves from global metrics toward per-class analysis, slices, behavioral tests, and online evaluation.

### Guided practice

Take an AI feature you already know and create an evaluation matrix:

| Item | Question |
| --- | --- |
| Objective | What product/system behavior are we trying to improve? |
| Unit | Model output, retrieval result, trajectory, latency event, etc.? |
| Data | What examples represent real use? |
| Metric | What measurement matches the objective? |
| Failure taxonomy | How will failures be grouped? |
| Operational constraints | Latency, cost, reliability? |
| Gate | What blocks release? |

### Independent practice

Build a small harness that compares at least two configurations.

Record:

- configuration version;
- evaluation-set version;
- quality metrics;
- repeated-run variance where relevant;
- failure categories;
- latency;
- cost;
- release result.

## Experiments

1. Repeat the same stochastic configuration and inspect variance.
2. Compare overall score with slice-level results.
3. Create a small human-reviewed set and test whether an LLM judge agrees well enough for the intended use.
4. Add one production-style failure and verify that the regression suite catches it.

## Exit evidence

You are at **demonstrated** when you can:

- version an evaluation set;
- choose metrics from the system objective rather than convenience;
- evaluate important components separately;
- compare two changes repeatably;
- analyze failures beyond aggregate scores;
- define a release gate with quality and operational constraints.

## Transfer

Now evaluate an agent workflow.

Your design must include evidence about actions or trajectory — for example tool selection, arguments, retries, or recovery — rather than measuring only the final answer.

Passing this moves the competency toward **transferred**.

## Applied evidence

The strongest evidence is using evaluation to make a real decision:

- catch a regression;
- reject a release;
- change a retrieval or model choice;
- convert a production failure into a permanent regression test.

## Project connection

This competency connects the **AI system spine** and **Production spine**. Evaluation becomes the gate between system iteration and release.
