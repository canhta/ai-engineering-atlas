# Drift Monitoring Evidence Contract

Extend the released Knowledge Assistant. Do not build a detached statistical demo.

The loop is:

```text
known-good release
→ reference population
→ current window
→ drift signal
→ segment + correlate
→ evaluate impact
→ investigate / no action / mitigate
→ new slice becomes regression evidence
```

## Reference and current windows

Use [drift-contract.template.md](drift-contract.template.md).

Record:

- release/system identity;
- known-good reference window;
- current analysis window;
- traffic volume and sampling;
- expected seasonality;
- segments that matter;
- monitored signals;
- why each signal maps to a plausible production risk.

Do not compare arbitrary adjacent time windows when weekday, campaign, tenant, or seasonal effects make them incomparable.

## Drift is not quality

Use [drift-investigation.template.md](drift-investigation.template.md).

Every material alert should ask:

- did quality actually change?
- did latency/cost/errors change?
- was there an intentional release/config/provider change?
- is the shift confined to one segment?
- is this schema/data-quality breakage rather than distribution drift?
- is the new population valid and simply different?

A harmless traffic shift should not automatically trigger rollback or retraining.

## Threshold backtesting

Use [drift-failure-matrix.template.md](drift-failure-matrix.template.md).

Backtest the selected threshold or rule on multiple windows.

Record:

- expected alerts;
- false alerts;
- missed material shifts;
- sample-size sensitivity;
- seasonality sensitivity;
- aggregate versus segmented behavior.

Remove monitors that create noise without a useful action.

## Feedback loop

When a drifted production slice exposes a real quality gap:

1. preserve the raw evidence;
2. create a durable evaluation/regression case;
3. link it to the release and drift investigation;
4. verify the later fix against that case.

## Exit condition

Another engineer should be able to reproduce reference/current comparisons, understand why the thresholds and segments exist, observe one harmless drift alert and one quality problem that drift alone misses, and follow the playbook from alert to investigation and durable regression evidence.

A dashboard that only says "drift detected" is not sufficient.
