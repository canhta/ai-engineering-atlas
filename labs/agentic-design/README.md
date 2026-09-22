# Workflow vs Agent Lab

Companion practice for `agents.deterministic-vs-agentic`.

## Goal

Decide whether a task should use:

- a single model call;
- a deterministic workflow;
- a workflow with bounded model decisions;
- an autonomous agent loop.

The goal is not to build the most agentic system. It is to add autonomy only when measured task performance justifies the added cost, latency, and failure surface.

## Task 1 — pick a real task

Choose a task with an observable outcome.

Good examples:

- answer a support question and optionally create a ticket;
- investigate a repository issue;
- research a question across several sources;
- triage a request and route it to a specialist flow.

Write:

- success criteria;
- allowed tools/actions;
- hard safety constraints;
- maximum cost/steps/latency where relevant.

## Task 2 — build the simplest baseline

Start with the least autonomous design that could work.

Examples:

- one model call;
- fixed prompt chain;
- deterministic router;
- explicit workflow state machine.

Measure it on a small versioned task set.

## Task 3 — failure analysis

Classify failures.

Ask:

- Did fixed routing choose the wrong branch?
- Did the task require an unpredictable number of steps?
- Did the system need to react to tool results?
- Was the failure actually caused by poor context/tool design rather than lack of autonomy?

Do not introduce an agent until the failure analysis motivates it.

## Task 4 — add autonomy

Implement an agentic version only if needed.

Keep:

- tool interfaces explicit;
- stop conditions;
- maximum iterations;
- permission boundaries;
- traces of model decisions and tool results.

Measure on the **same task set**.

## Task 5 — compare

Use [decision-rubric.md](decision-rubric.md).

Compare:

- task success;
- failure types;
- number of model calls / steps;
- latency;
- cost;
- recoverability/debuggability.

A performance improvement that does not justify added complexity is a valid reason to keep the workflow.

## Transfer challenge

Take a task whose subtasks are known in advance and one whose subtasks emerge from intermediate results.

Choose an architecture for each and defend why the choices differ.

## Evidence

To claim **demonstrated**, produce:

- baseline architecture;
- failure analysis;
- agentic or more flexible alternative when justified;
- same-set comparison;
- written complexity decision.

For **applied** evidence, use the decision in a reference or real system and retain traces/eval results.
