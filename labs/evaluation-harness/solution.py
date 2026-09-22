from __future__ import annotations

import statistics
import time
from collections import defaultdict


def evaluate(cases, system, *, system_version: str, eval_version: str):
    records = []
    latencies = []

    for case in cases:
        start = time.perf_counter()
        output = system(case["input"])
        elapsed_ms = (time.perf_counter() - start) * 1000
        latencies.append(elapsed_ms)

        records.append(
            {
                "id": case["id"],
                "slice": case["slice"],
                "expected": case["expected"],
                "output": output,
                "correct": output == case["expected"],
                "latency_ms": elapsed_ms,
            }
        )

    overall = sum(r["correct"] for r in records) / len(records)

    by_slice = defaultdict(list)
    for record in records:
        by_slice[record["slice"]].append(record["correct"])

    slice_accuracy = {
        name: sum(values) / len(values)
        for name, values in sorted(by_slice.items())
    }

    sorted_latencies = sorted(latencies)
    p95_index = max(0, min(len(sorted_latencies) - 1, round(0.95 * (len(sorted_latencies) - 1))))

    return {
        "system_version": system_version,
        "eval_version": eval_version,
        "num_cases": len(records),
        "overall_accuracy": overall,
        "slice_accuracy": slice_accuracy,
        "mean_latency_ms": statistics.mean(latencies),
        "p95_latency_ms": sorted_latencies[p95_index],
        "records": records,
    }
