# Security Boundaries Evidence Contract

Extend the same Knowledge Assistant. The goal is not to prove that prompt injection can always be detected.

Assume the model can be mistaken or manipulated and make the deterministic boundaries survive anyway:

```text
untrusted source
→ model/control decision
→ tool or protected data source
→ sensitive data
→ output / tool / URL / log / cache / external sink
```

## Stage 1 — minimize and authorize tools

Use [tool-permission-matrix.template.md](tool-permission-matrix.template.md).

For every tool/action record:

- why the capability exists;
- user or service identity;
- resource/tenant scope;
- downstream permission;
- complete-mediation point;
- approval requirement;
- rate/blast-radius limit;
- audit evidence.

Remove unnecessary functionality before trying to secure it.

## Stage 2 — map sensitive data

Use [sensitive-data-flow.template.md](sensitive-data-flow.template.md).

Classify protected sources and every place the data can flow:

- retrieval;
- tools;
- model context;
- output;
- streaming;
- cache;
- logs/traces;
- diagnostic replay;
- files/messages;
- URLs or external APIs.

Authorize before context assembly. Do not depend on the model to decide what it is allowed to see or where it may transmit protected data.

## Stage 3 — attack the combined path

Use [security-boundary-failure-matrix.template.md](security-boundary-failure-matrix.template.md).

Use synthetic secrets or canary records.

Treat the model output as attacker-controlled and try:

- forbidden tool/action;
- wrong user/tenant resource;
- wrong-audience credential;
- approval bypass;
- indirect injection requesting sensitive retrieval;
- unapproved external sink;
- hidden URL/tool-argument sink;
- cache or telemetry leak;
- partial streaming leak.

## Exit condition

Another engineer should be able to replay the attack cases and see deterministic policy—not model obedience—prevent unauthorized actions and sensitive-data transmission.

A model refusal alone is not sufficient evidence.
