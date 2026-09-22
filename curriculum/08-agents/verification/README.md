# Verification

**Status:** seeded — approved RFC, route under validation  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

## Why this matters

An agent saying "done" is not proof that the task is done.

Verification checks the actual artifact, environment, state, or evidence against explicit success criteria.

Prefer the strongest practical evidence:

    environment / deterministic checks
    → executable tests / invariants
    → authoritative external data
    → calibrated model graders
    → human review

## 1. Diagnostic first

Take one claimed Knowledge Assistant success.

Ask:

- what real state or artifact proves it?
- can the property be tested deterministically?
- what defect would this verifier miss?
- what happens when verification fails?

If the only verifier is another unconstrained model opinion, this competency remains a gap.

## 2. Mental model

Keep trajectory and outcome separate:

    agent trace
    ≠
    environment outcome

The trace explains what the agent attempted. Verification establishes whether the required result actually exists.

## 3. Independent practice

Use the [Planning and Verification evidence contract](../../../projects/knowledge-assistant/planning-and-verification/).

Define success criteria first, then map each to an appropriate verifier.

Seed at least one defect.

## 4. Failure work

Test:

- verifier catches a real defect;
- verifier misses a defect;
- verifier rejects a valid outcome;
- model grader disagrees with human judgment, if a model grader is used;
- failed verification triggers the wrong repair/retry/replan action.

Measure verifier errors as well as agent errors.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the success criteria, verifier logic, seeded defect, environment evidence, and recovery action and reproduce the result.

A self-critique paragraph is not enough.

## 6. Transfer

Move to a task with more subjective criteria or expensive environment checks and redesign the verification hierarchy.

## 7. Applied evidence

Applied evidence is a real workflow where verification catches failures before release or causes a correct repair/replan/escalation decision—and where verifier overhead and error modes are themselves measured.
