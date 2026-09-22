# Agents

Engineering systems in which models choose or sequence actions.

## Scope

- tool and function calling
- [deterministic workflows versus agentic control](deterministic-vs-agentic/)
- state and memory
- planning and task decomposition
- retries, idempotency, and long-running tasks
- Model Context Protocol (MCP)
- agent traces and trajectory evaluation
- permission boundaries and tool trust
- multi-agent patterns where they provide measurable value

## Ready route

- [Deterministic vs Agentic Design](deterministic-vs-agentic/) — start from the simplest viable architecture and add autonomy only when measured failures justify it.

The default rule is to begin with a deterministic workflow and add agentic control only when the flexibility is useful and measurable.

See [../STATUS.md](../STATUS.md) for repository-wide maturity.
