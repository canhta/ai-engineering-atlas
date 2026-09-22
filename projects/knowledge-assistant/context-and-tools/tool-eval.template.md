# Tool-Use Evaluation

## Evaluation contract

- system version:
- eval-set version:
- tool-contract version:
- model/version:

## Tasks

Include:

- should-call cases;
- should-not-call cases;
- ambiguous cases;
- malformed-argument cases;
- permission/approval cases;
- timeout/transient-error cases;
- duplicate/retry case for mutations.

## Trace evidence

For each representative case record:

- user/task;
- tool selected or skipped;
- proposed arguments;
- validation outcome;
- authorization/approval outcome;
- execution result/error;
- retry count;
- latency;
- tool result returned to model;
- final response/outcome.

## Metrics / judgments

- correct tool selection;
- argument validity;
- successful execution where allowed;
- correct refusal/skip where disallowed;
- retry/idempotency correctness;
- final task success;
- latency/cost where relevant.

## Failure taxonomy

Classify failures as:

- wrong tool selection;
- unnecessary tool call;
- missing tool call;
- malformed/ambiguous arguments;
- validation failure;
- authorization/approval failure;
- execution/transient failure;
- retry/idempotency failure;
- poor tool-result shaping;
- post-tool reasoning failure.

## Decision

Should this workflow:

- remain deterministic with model-assisted arguments;
- use a deterministic multi-step workflow;
- justify later agentic control;
- remove the tool because value is not demonstrated?
