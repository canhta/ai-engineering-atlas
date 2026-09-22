# Authoring Templates

These templates encode the learning contract for new ready routes.

They are **authoring aids**, not requirements to create every possible file.

Before using them:

1. verify the competency exists in [../curriculum/catalog.yaml](../curriculum/catalog.yaml);
2. read [../LEARNING_MODEL.md](../LEARNING_MODEL.md);
3. inspect the two ready examples:
   - [Self-Attention](../curriculum/06-llm-foundations/self-attention/)
   - [AI Evaluation](../curriculum/07-ai-engineering/evaluation/)

## Templates

- [competency.yaml](competency.yaml) — machine-readable route contract
- [competency-readme.md](competency-readme.md) — learner-facing route
- [lab-readme.md](lab-readme.md) — implementation/practice package

## Authoring sequence

Do not start by filling every field.

Use this order:

```text
catalog capability
→ curriculum evidence
→ observable outcomes
→ prerequisites
→ diagnostic
→ source verification
→ practice
→ exit evidence
→ transfer/review/project only where justified
→ learner-facing route
→ validation
```

A route should remain coverage rather than be promoted to ready when important evidence or source mapping is still unresolved.
