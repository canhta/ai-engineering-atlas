# Verification

**Status:** seeded — approved RFC, route under validation  
**Target:** L3 deep engineering competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | Sections "The structure of an evaluation", "Types of graders for agents", "Design the eval harness and graders", and guidance on transcript versus final environment outcome | Separate trajectory from outcome and choose deterministic, model-based, or human graders based on the property being checked. |
| [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) | Sections "Workflow: Prompt chaining", "Workflow: Evaluator-optimizer", "Agents", and "Appendix 1: Coding agents" | Connect intermediate checks, evaluator-optimizer loops, environment feedback, and objective tests to agent execution. |
| [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps) | Sections "Frontend design: making subjective quality gradable", "Scaling to full-stack coding" → "The architecture" (Evaluator), and "Removing the sprint construct" | Study explicit grading criteria, Playwright/environment verification, evaluator calibration, and ablation of evaluator overhead. |
| [CRITIC: Large Language Models Can Self-Correct with Tool-Interactive Critiquing](https://arxiv.org/abs/2305.11738) | Abstract and method framing comparing unsupported self-correction with tool-interactive critique | Reinforce that external feedback can provide stronger correction evidence than unconstrained self-critique. |
| [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://arxiv.org/abs/2310.06770) | Abstract and benchmark formulation using real repository issues and test suites to grade patches | Ground verification in outcome artifacts and executable environment checks rather than plausible-looking trajectories. |

### Prerequisite patches

Use these only when the diagnostic exposes the specific gap.

| Gap | Source | Read / inspect | Why |
| --- | --- | --- | --- |
| `software.testing` | [Made With ML — Testing Machine Learning Systems](https://madewithml.com/courses/mlops/testing/) | Testing lesson sections "Types of tests" and system/regression testing discussion | Patch only the testing discipline needed to design deterministic verification and reproduce failures without requiring the full software-testing route. |
<!-- learning-sources:end -->

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
