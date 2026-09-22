# RFC: Structured Outputs and Abstention Slice

- Status: Accepted
- Author: AI-assisted draft for repository owner review
- Created: 2026-09-22
- Reviewed: 2026-09-22
- Review decision: Approved by repository owner

## Problem

The Applied AI path now has measured retrieval, evaluation, context engineering, and tool calling. Two remaining application-core catalog nodes should be resolved before expanding agent autonomy:

- `ai.structured-outputs`
- `ai.uncertainty-abstention-trust`

Both are easy to teach superficially.

Structured outputs can become "turn on JSON mode" while skipping schema design, semantic validation, refusals, truncation, unsupported schema features, versioning, and downstream contract tests.

Uncertainty can become "ask the model for a confidence score" while skipping calibration, coverage, error cost, threshold selection, distribution shift, fallback behavior, and the fact that abstaining on everything trivially avoids wrong answers.

This RFC proposes a small reliability slice:

```text
free-form output
→ explicit output contract
→ schema-constrained generation
→ deterministic semantic validation
→ measured confidence / evidence signals
→ calibrated decision rule
→ answer / abstain / fallback / escalate
→ risk–coverage evaluation
```

The slice should strengthen the existing Knowledge Assistant without turning it into an agent.

## Evidence

### Structured outputs

#### OpenAI — Introducing Structured Outputs in the API

https://openai.com/index/introducing-structured-outputs-in-the-api/

Verified sections include:

- **How to use Structured Outputs**
- **Safe Structured Outputs**
- **Under the hood**
- **Constrained decoding**

The source distinguishes valid JSON from adherence to a supplied schema and explains constrained decoding as a mechanism for limiting generated tokens to those valid under the schema.

It also exposes operational cases that matter for application code:

- refusals can be represented separately from schema-conforming normal output;
- interrupted generations must not be assumed complete;
- schema adherence does not establish that field values are semantically correct.

The route should extract these engineering boundaries rather than teach one API parameter.

#### Google Gemini API — Structured outputs

https://ai.google.dev/gemini-api/docs/structured-output

Verified sections include:

- **JSON schema support**
- **Structured outputs versus function calling**
- **Best practices**
- **Limitations**

The documentation reinforces:

- structured output is for a typed/controlled final response;
- function calling is a separate action/execution mechanism;
- supported providers commonly implement only a subset of JSON Schema;
- applications still need to validate schema-compliant values for semantic correctness;
- schema complexity and provider support are real constraints.

This is useful cross-provider evidence that the competency is not OpenAI-specific.

#### JSON Schema — Object

https://json-schema.org/understanding-json-schema/reference/object

Verified sections include:

- **Properties**
- **Required Properties**
- **Additional Properties**

These sections provide the source-of-truth semantics for basic object contracts used in the practice route.

### Uncertainty, abstention, and trust

#### Geifman & El-Yaniv — SelectiveNet

https://proceedings.mlr.press/v97/geifman19a.html

Verified paper sections:

- **1. Introduction**
- **2. Selective Prediction Problem Formulation**
- **5. Coverage Accuracy**

The paper formalizes a selective model as one that may emit a prediction or "don't know." It separates:

- **coverage** — the fraction of inputs for which the system predicts;
- **selective risk** — error/loss over the covered region.

The resulting **risk–coverage trade-off** is the key curriculum evidence. The proposed route should use this decision framework without requiring the learner to implement SelectiveNet.

Section 5 also demonstrates an important engineering pattern: thresholds/coverage targets require calibration on independent validation data rather than being chosen from intuition.

#### Guo et al. — On Calibration of Modern Neural Networks

https://proceedings.mlr.press/v70/guo17a.html

Verified paper sections include:

- **2. Definitions**
- **Reliability Diagrams**
- **Expected Calibration Error (ECE)**
- calibration methods using held-out validation data

The paper distinguishes predictive accuracy from calibration: a model can be accurate yet its confidence values can fail to represent empirical correctness likelihood.

The curriculum should use calibration concepts and reliability evidence, not prescribe temperature scaling as a universal LLM solution.

#### Kadavath et al. — Language Models (Mostly) Know What They Know

https://arxiv.org/abs/2207.05221

Verified sections include:

- calibration results on multiple-choice tasks;
- **3. From Calibration to Knowing What You Know**;
- experiments using `P(True)` self-evaluation.

The paper provides evidence that model self-evaluation signals can contain useful information under specific task formats. It also reports sensitivity to task formatting and imperfect generalization/calibration on new tasks.

Therefore this RFC treats model self-reported confidence as **one candidate signal to validate**, never as a trustworthy abstention rule by itself.

## Proposal

Create a two-competency **Output + Decision Reliability Slice** in the Knowledge Assistant.

```text
existing measured assistant
→ versioned output schema
→ deterministic parsing + semantic validation
→ explicit refusal / unavailable / malformed states
→ candidate confidence/evidence signals
→ threshold/fallback policy chosen on validation data
→ risk–coverage + failure-slice evaluation
→ production/release decision
```

## 1. `ai.structured-outputs`

**Proposed level:** L2

**Competency types:**

- engineering skill
- system operation

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `ai.evaluation`

No hard dependency on `ai.tool-calling` is proposed. Structured output is a response contract; tool calling is an action/execution contract.

No hard dependency on `ai.prompt-engineering` is proposed. Clear field descriptions and task instructions matter, but this narrow capability can be taught from the schema and validation contract without forcing the full prompt-engineering node.

### Boundary with adjacent competencies

`ai.structured-outputs` should **not** absorb:

- `ai.tool-calling` — a structured final response does not execute an action;
- `ai.prompt-engineering` — wording may improve semantic quality but does not define the output-contract capability;
- `software.testing` — contract tests are required evidence here, while general testing remains a broader competency;
- `ai.uncertainty-abstention-trust` — a schema may encode abstention, but the policy deciding when to abstain is separate.

### Observable outcomes

The learner should be able to:

- design a small JSON Schema or equivalent typed contract from downstream application needs;
- distinguish valid JSON, schema validity, semantic/business validity, and task correctness;
- use required fields, enums, nullability, and additional-property policy intentionally;
- explain constrained generation at a conceptual level and provider-specific schema subsets/limitations;
- handle refusal, incomplete/truncated output, malformed transport state, and schema-compliant-but-wrong values separately;
- validate semantic invariants deterministically after generation;
- version output schemas and detect breaking versus compatible changes;
- compare free-form parsing, JSON-only output, and schema-constrained output on reliability/latency/cost where supported.

### Required evidence

Extend the Knowledge Assistant with a versioned response contract, for example:

```json
{
  "answer": "...",
  "citations": [...],
  "status": "answered | abstained | needs_review"
}
```

The exact schema is not prescribed.

Evidence must include:

- schema/version;
- downstream consumer requirement;
- contract tests;
- semantic validation rules;
- normal output;
- refusal/unavailable path;
- truncated/interrupted path where the provider exposes it;
- schema-valid but semantically invalid test;
- provider/version and supported-schema constraints;
- migration decision for one schema change;
- comparison against the prior free-form baseline.

A successful parse is not sufficient exit evidence.

## 2. `ai.uncertainty-abstention-trust`

**Proposed level:** L3

**Competency types:**

- engineering skill
- design judgment
- production-competency

**Target states:**

- demonstrated
- transferred
- applied

### Proposed prerequisites

- `ai.evaluation`
- `math.probability`

`math.probability` is coverage-only, so a ready route would require a targeted bridge.

The bridge should cover only what is needed to interpret a confidence/reliability statement:

- probability as frequency/reliability over comparable cases;
- conditional accuracy versus score/confidence;
- why a single case cannot prove calibration;
- why validation and test data must remain separated when selecting thresholds.

Guo et al. Section 2 and the reliability-diagram material are proposed as the bridge source rather than requiring a broad probability course.

### Boundary with adjacent competencies

`ai.uncertainty-abstention-trust` should **not** become:

- full Bayesian uncertainty quantification;
- a survey of every confidence estimator;
- "ask the LLM how confident it feels";
- safety policy/governance in general;
- only calibration metrics without a user/system action policy.

The competency is the engineering ability to choose **when the system should answer versus abstain/fallback/escalate**, based on validated signals and explicit risk/cost constraints.

### Candidate signals

The route may compare signals such as:

- retrieval sufficiency/relevance evidence;
- deterministic validation failures;
- citation/evidence coverage;
- model log probabilities when available and appropriate;
- consistency/disagreement across samples or models;
- model self-evaluation;
- task-specific classifiers/checkers;
- rule-based risk indicators.

No signal is trustworthy merely because it has the label "confidence."

### Observable outcomes

The learner should be able to:

- define what abstention means for the product and what fallback/escalation follows it;
- define answer risk, coverage, and the cost of wrong answer versus unnecessary abstention;
- choose candidate uncertainty/evidence signals from observed failure modes;
- validate whether a signal separates safer from riskier cases on held-out data;
- select a decision threshold/policy on validation data rather than on the final test set;
- produce a risk–coverage curve or equivalent decision evidence;
- measure false abstention, unsafe answered cases, fallback success, and relevant slices;
- test the policy under distribution/freshness/retrieval shift;
- avoid presenting model self-reported confidence as calibrated probability unless evidence actually supports that claim;
- define a production/release decision from the measured trade-off.

### Required evidence

For the Knowledge Assistant, create a three-way policy such as:

```text
answer
abstain
escalate / fallback
```

The exact states are product-dependent.

Required evidence:

- versioned evaluation data with answerability/risk labels;
- candidate signal definitions and provenance;
- validation/test split for threshold selection;
- baseline without abstention;
- risk–coverage curve or equivalent threshold sweep;
- answered-case quality/risk;
- overall coverage;
- false/unnecessary abstention rate;
- unsafe answered cases;
- fallback/escalation outcome;
- at least one failure slice;
- at least one shifted/stale/insufficient-evidence scenario;
- comparison of at least two candidate policies or signals;
- release/architecture decision.

A policy that abstains on nearly everything must not be scored as reliable merely because answered-case error is low.

## Knowledge Assistant integration

If approved, add a new evidence package such as:

`projects/knowledge-assistant/output-and-trust/`

It should reuse the existing product objective, query/eval lineage, RAG evidence, context policy, and tool boundary.

Proposed progression:

```text
existing answer
→ typed response contract
→ semantic validation
→ explicit status/refusal states
→ answerability/risk labels
→ signal comparison
→ threshold sweep
→ answer/abstain/fallback policy
→ regression + release evidence
```

Proposed artifacts:

- response-schema record;
- structured-output failure cases;
- schema migration record;
- answerability/risk labels;
- uncertainty-signal experiment;
- threshold/risk-coverage record;
- abstention/fallback traces;
- release decision.

## Promotion gate

Neither node should move from `coverage` to `ready` until:

1. this RFC is reviewed;
2. requested changes are resolved;
3. exact source locators are rechecked during route authoring;
4. the probability prerequisite bridge is complete if retained;
5. competency YAML + learner README are complete;
6. learner-facing source blocks are generated and current;
7. Knowledge Assistant evidence integration is inspectable;
8. structured-output practice includes semantic validation and non-happy-path handling;
9. abstention practice includes a baseline, threshold sweep, risk/coverage, false abstention, and fallback behavior;
10. seeded-state validation passes;
11. final `make check` / CI passes;
12. review outcome is recorded before promotion.

## Alternatives considered

### Merge Structured Outputs into Tool Calling

Rejected. Tools use structured arguments, but many applications need typed final responses without any action. The downstream failure and lifecycle contracts differ.

### Treat schema compliance as correctness

Rejected. Provider documentation explicitly distinguishes syntactic/schema validity from semantically correct values and recommends application validation.

### Use model self-reported confidence as the abstention mechanism

Rejected as a default. Research shows self-evaluation can carry signal under some conditions, but calibration depends on task/format and does not justify treating a self-reported number as ground truth.

### Teach uncertainty as a broad statistics module

Rejected for this slice. The Applied AI capability is a product/system decision problem: validated signal → threshold/policy → answer/abstain/fallback → measured risk and coverage.

### Optimize only answered-case accuracy

Rejected because abstaining on more cases can mechanically improve answered-case accuracy. Coverage and unnecessary abstention must be measured alongside risk.

## Impact

- affected competencies:
  - `ai.structured-outputs`
  - `ai.uncertainty-abstention-trust`
- proposed prerequisite relationships:
  - `ai.structured-outputs` ← `ai.evaluation`
  - `ai.uncertainty-abstention-trust` ← `ai.evaluation`, `math.probability`
- proposed new resources:
  - `article.openai-structured-outputs`
  - `docs.google-structured-outputs`
  - `docs.json-schema-object`
  - `paper.selectivenet`
  - `paper.calibration-modern-neural-networks`
  - `paper.language-models-know`
- proposed project integration:
  - Knowledge Assistant output-and-trust evidence package
- catalog/generated status:
  - **no promotion before review and seeded validation**

## Review checklist

- [ ] Evidence is traceable and source locators are specific enough to author routes.
- [ ] Structured Outputs is distinct from Tool Calling and Prompt Engineering.
- [ ] Schema validity is explicitly separated from semantic/task correctness.
- [ ] Structured-output failure handling includes refusal, incomplete output, and semantic validation.
- [ ] Structured-output target depth L2 is appropriate.
- [ ] Abstention is framed as a risk/coverage decision rather than self-reported confidence.
- [ ] Probability prerequisite and targeted bridge are justified.
- [ ] Threshold selection uses validation data and preserves a held-out test.
- [ ] Abstention evidence penalizes unnecessary abstention and unsafe answers.
- [ ] Fallback/escalation behavior is part of the capability.
- [ ] Shift/freshness/insufficient-evidence cases are represented.
- [ ] Knowledge Assistant integration extends existing evidence lineage.
- [ ] Reviewer explicitly approves or requests changes before any route promotion.
