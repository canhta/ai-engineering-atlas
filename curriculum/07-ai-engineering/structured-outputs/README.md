# Structured Outputs

**Status:** ready  
**Target:** L2 practical competence  
**Evidence target:** demonstrated → transferred → applied

<!-- learning-sources:start -->
## Learning sources

Open these exact source locations, then return to the practice and evidence tasks below.

| Source | Read / inspect | Why |
| --- | --- | --- |
| [Introducing Structured Outputs in the API](https://openai.com/index/introducing-structured-outputs-in-the-api/) | Sections "How to use Structured Outputs", "Safe Structured Outputs", "Under the hood", and "Constrained decoding" | Understand schema-constrained generation, refusal and incomplete-output handling, and the difference between valid JSON and schema adherence. |
| [Google Gemini API — Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output) | Sections "JSON schema support", "Structured outputs versus function calling", "Best practices", and "Limitations" | Compare another provider's schema subset, semantic-validation guidance, and the boundary between structured final responses and tool execution. |
| [JSON Schema — Object](https://json-schema.org/understanding-json-schema/reference/object) | Sections "Properties", "Required Properties", and "Additional Properties" | Ground basic object-contract semantics in the schema standard rather than provider-specific syntax. |
<!-- learning-sources:end -->

## Why this matters

A parser-friendly response is useful only if downstream code can trust the contract it receives.

There are separate questions:

1. Is it valid JSON?
2. Does it satisfy the declared schema?
3. Are the values semantically valid?
4. Is the answer actually correct for the task?

Structured generation improves the second question. It does not eliminate the other three.

## 1. Diagnostic first

Design a structured response for a cited Knowledge Assistant answer.

Explain:

- which fields are required;
- what enums or nullable states exist;
- whether extra fields are allowed;
- what the schema can validate;
- what application code must still validate;
- how refusal and incomplete output differ from normal success;
- how you would change the schema without silently breaking the consumer.

If you can do this concretely, move directly to the project experiment.

## 2. Mental model

Use the Learning sources table above.

The key distinction is:

```text
generation constraint
≠
semantic correctness
≠
task correctness
```

Provider APIs are implementation examples, not the competency definition.

## 3. Independent practice

Use the [Output and Trust evidence contract](../../../projects/knowledge-assistant/output-and-trust/).

Add a versioned response contract to the same Knowledge Assistant system.

Preserve:

- downstream consumer need;
- schema/version;
- provider/model/version;
- provider schema limitations;
- deterministic semantic checks;
- refusal/unavailable state;
- incomplete/truncated state where observable;
- migration decision.

Compare against the prior free-form response path.

## 4. Failure work

Test at least:

- malformed or interrupted output;
- refusal/unavailable result;
- schema-valid but semantically invalid value;
- unsupported or over-complex schema feature;
- consumer break caused by a schema change.

Do not count a successful parse as successful task completion.

## 5. Exit evidence

You are at **demonstrated** when another engineer can inspect the schema and tests and understand:

- what downstream code relies on;
- what the schema guarantees;
- what deterministic validation remains;
- how non-happy paths are represented;
- how one schema change is migrated safely.

## 6. Transfer

Redesign the contract for a different consumer and explain which compatibility and semantic rules must change.

## 7. Applied evidence

Applied evidence is a real consumer contract that prevents parsing/semantic regressions or enables a safer migration than the previous free-form interface.
