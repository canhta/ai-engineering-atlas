# Workflow vs Agent Decision Rubric

| Question | Evidence |
| --- | --- |
| Can the task be decomposed into known fixed steps? | |
| Are branches/categories predictable? | |
| Must later steps react to unpredictable tool/environment results? | |
| Is success objectively measurable? | |
| What autonomy is actually required? | |
| What new failure surface does autonomy add? | |
| What are cost/latency differences? | |
| Can failures be traced and reproduced? | |
| Are tools and permissions bounded? | |
| What stop condition prevents unbounded work? | |

## Decision

Choose the **simplest architecture that meets the measured requirement**.

Architecture:

Evidence:

What would make you increase autonomy later?
