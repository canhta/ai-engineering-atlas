# Agents

Engineering systems in which models choose or sequence actions.

## Scope

- tool and function calling
- [deterministic workflows versus agentic control](deterministic-vs-agentic/)
- [state](state/) and [memory](memory/)
- [planning](planning/) and task decomposition
- [verification](verification/) and outcome checking
- retries, idempotency, and long-running tasks
- Model Context Protocol (MCP)
- agent traces and trajectory evaluation
- permission boundaries and tool trust
- multi-agent patterns where they provide measurable value

## Ready routes

- [Deterministic vs Agentic Design](deterministic-vs-agentic/) — start from the simplest viable architecture and add autonomy only when measured failures justify it.
- [Agent State](state/) — make execution continuity explicit with durable state, checkpoints, restart/resume, and replay-safe side effects.
- [Agent Memory](memory/) — add scoped cross-session memory only with explicit admission, retrieval, lifecycle, isolation, and measured benefit.
- [Planning](planning/) — externalize task structure, persist it in state, and replan only when observed evidence invalidates the current plan.
- [Verification](verification/) — verify actual outcomes with deterministic/environment evidence first, calibrating model graders only when needed.

The default rule is to begin with a deterministic workflow and add agentic control only when the flexibility is useful and measurable.

See [../STATUS.md](../STATUS.md) for repository-wide maturity.
