# Prompt Injection Trust-Boundary Lab

Companion practice for `security.prompt-injection`.

## Goal

Treat model output and retrieved/external content as untrusted data, then place real authorization around privileged actions.

This lab does **not** try to "solve" prompt injection with a magic prompt or string filter.

## Scenario

A knowledge assistant retrieves an external document. The document contains an instruction telling the assistant to call a privileged export tool.

Assume the model can be influenced by that content and may emit the privileged tool request.

Your application must remain safe even when the model makes the wrong decision.

## Task 1 — identify trust boundaries

Draw the flow:

```text
user
→ application
→ retrieved external content
→ model
→ proposed tool request
→ authorization
→ tool
```

Mark:

- trusted policy;
- untrusted content;
- model-controlled output;
- privileged boundary.

## Task 2 — implement authorization outside the model

Complete [starter.py](starter.py).

The executor must reject a privileged tool request when the authenticated user lacks the required permission.

The system prompt is not the authorization layer.

## Task 3 — run the checks

```bash
python tests.py
```

The tests include a simulated compromised model output.

Passing requires the application boundary to block the action.

## Task 4 — indirect injection

Treat retrieved content as untrusted.

Record how your architecture:

- labels/separates external content;
- limits available tools;
- validates tool arguments;
- prevents the model from escalating privilege;
- requests human approval for a high-risk action where appropriate.

## Task 5 — adversarial test plan

Create several benign simulated attack cases:

- direct instruction override;
- malicious instruction inside retrieved text;
- malformed privileged tool arguments;
- attempt to access a resource outside the user's authorization.

For each, state the **application control** that should contain the impact.

## Transfer challenge

Move the same architecture to an email assistant that can read messages and send replies.

Identify which trust boundaries and approval points change.

## Evidence

To claim **demonstrated**, keep:

- trust-boundary diagram;
- authorization implementation;
- passing tests against simulated compromised model output;
- adversarial test table;
- explanation of why prompting alone is insufficient.

For **applied** evidence, integrate the controls and adversarial tests into the Knowledge Assistant or a real system.
