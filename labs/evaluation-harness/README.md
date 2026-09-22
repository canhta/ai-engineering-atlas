# Evaluation Harness Lab

Companion lab for [ai.evaluation](../../curriculum/07-ai-engineering/evaluation/).

## Goal

Build a versioned evaluation harness that compares system configurations and produces evidence for a release decision.

The fixtures are deliberately simple so the exercise focuses on evaluation design rather than model APIs.

## Task 1 — understand the eval set

Open [cases.jsonl](cases.jsonl).

Each case contains:

- ID;
- input;
- expected answer;
- slice.

Ask whether this tiny set represents the failures you care about. It should not.

## Task 2 — implement the harness

Complete [starter.py](starter.py).

The harness should:

- load cases;
- run a system function;
- record per-case correctness;
- aggregate overall and slice metrics;
- record latency;
- preserve case/system version in the result.

Run:

```bash
python tests.py
```

## Task 3 — compare configurations

Use the two mock systems in the starter.

Produce a comparison table.

Do not ask only "which average score is higher?"

Ask:

- Which slices changed?
- Is the change meaningful for the product objective?
- Did latency change?
- Which failures remain?

## Task 4 — release gate

Write an explicit rule before looking at the final result.

Example shape:

```text
release if:
- no critical regression;
- overall correctness >= threshold;
- each required slice >= threshold;
- p95 latency <= threshold
```

Choose thresholds from a stated product requirement, not from whatever result the system happened to achieve.

## Task 5 — add a regression case

Pretend one bad production answer was reported.

Add it to the versioned fixture with:

- failure category;
- slice;
- expected behavior.

Verify the weaker configuration fails it.

## Transfer challenge

Redesign the harness for an agent that can call tools.

What additional evidence is needed beyond final answer correctness?

Consider:

- tool selected;
- arguments;
- retry count;
- authorization;
- trajectory;
- recovery.

## Evidence

To claim **demonstrated**, keep:

- versioned eval set;
- harness code;
- per-slice results;
- latency result;
- failure analysis;
- written release decision.

Try the lab before opening [solution.py](solution.py).
