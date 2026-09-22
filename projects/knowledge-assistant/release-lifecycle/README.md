# Release Lifecycle Evidence Contract

Extend the same Knowledge Assistant and production-boundary work. Do not create a separate deployment demo.

The release lifecycle starts from the exact system already evaluated and observed:

```text
known-good manifest
→ candidate manifest
→ manifest diff
→ frozen evaluation gate
→ bounded exposure
→ live quality + operational analysis
→ promote / pause / abort
→ explicit rollback target
→ rollback verification
→ failure becomes regression evidence
```

## Stage 1 — create release identity

Copy [release-manifest.template.yaml](release-manifest.template.yaml) for the current and candidate states.

The manifest should identify every artifact that can materially change system behavior. Use concrete versions, hashes, immutable references, or content identities where possible.

A mutable alias such as `production`, `champion`, or `latest` may be recorded as operational context, but the release record must also preserve the concrete version it resolved to.

Do not assume a prompt version freezes inference settings. Record behavior-defining runtime configuration separately when it can change independently.

## Stage 2 — diff and gate

Use the same versioned evaluation lineage already used by the Knowledge Assistant.

Before seeing candidate results, record:

- the evaluation-set/reference version;
- blocking quality thresholds;
- blocking latency/error/cost constraints;
- informational metrics;
- failure slices that must not regress.

If the candidate fails the frozen gate, production exposure should not begin.

## Stage 3 — progressive release

Use [release-decision.template.md](release-decision.template.md).

Choose the simplest rollout that matches the risk. Progressive delivery is not mandatory.

When bounded exposure is justified, define:

- population or traffic exposure;
- duration or sample requirement;
- current/control comparison where useful;
- AI-quality signals;
- operational signals;
- success;
- failure;
- inconclusive behavior.

Healthy HTTP responses are not proof that the AI release is healthy.

## Stage 4 — abort and rollback

Use [rollback-record.template.md](rollback-record.template.md).

Rollback must target a concrete known-good manifest and must be verified after execution.

Verify both:

1. **identity** — the model, prompt, retrieval, tools, application, gateway/policy, and relevant config match the target;
2. **behavior** — representative regression and smoke cases behave as expected.

## Exit condition

Another engineer should be able to identify the current and candidate systems exactly, reproduce the release decision from frozen evidence, observe at least one blocked or aborted candidate, restore the known-good state, and verify that the entire behavior-defining artifact set was restored.

A green CI run, a successful deployment command, or a rollback of only the application image is not sufficient.
