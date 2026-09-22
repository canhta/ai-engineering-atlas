# Operating Lifecycle Map

## Change types

For each applicable change, record its system of record, tests/evaluation, release path, and owner.

- Application code:
- Prompt/template:
- Model/provider configuration:
- Retrieval corpus/index:
- Tool schema/runtime:
- Safety/policy:
- Evaluation set:
- Infrastructure/configuration:
- Fine-tuning/training artifacts, if applicable:

## Lifecycle

### Hypothesis / trigger

- Trigger:
- Owner:
- Expected outcome:

### Experiment and evaluation

- Offline tests:
- AI evaluation:
- Performance/economics:
- Security/safety:
- Evidence produced:

### Version and lineage

- Release manifest:
- Metadata/artifact links:
- Reproducibility:

### Release

- CI:
- CD:
- Approval:
- Rollout:
- Rollback target:

### Production

- Observability:
- Drift:
- Feedback:
- Incident signals:

### Feedback

- Continue:
- Inspect:
- Improve:
- Rollback:
- Regression/evaluation update:

## Training / tuning decision

- Is model training performed:
- Is fine-tuning performed:
- Is continuous training required:
- Why:
- Trigger:
- Validation before promotion:

## Automation boundaries

- Automatic transition:
- Manual transition:
- Approval-required transition:
- Automation deliberately removed:
- Reason:

## Ownership

- Product:
- Application engineering:
- AI/evaluation:
- Data/retrieval:
- Platform/operations:
- Security:
