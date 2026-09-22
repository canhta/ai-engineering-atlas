from pathlib import Path

import starter
from solution import evaluate as reference_evaluate


def main():
    cases = starter.load_cases(Path(__file__).with_name("cases.jsonl"))

    result = starter.evaluate(
        cases,
        starter.system_a,
        system_version="a",
        eval_version="v1",
    )
    reference = reference_evaluate(
        cases,
        starter.system_a,
        system_version="a",
        eval_version="v1",
    )

    assert result["system_version"] == "a"
    assert result["eval_version"] == "v1"
    assert result["num_cases"] == 4
    assert result["overall_accuracy"] == 1.0
    assert result["slice_accuracy"] == reference["slice_accuracy"]
    assert len(result["records"]) == 4
    assert result["p95_latency_ms"] >= 0

    weaker = starter.evaluate(
        cases,
        starter.system_b,
        system_version="b",
        eval_version="v1",
    )
    assert weaker["overall_accuracy"] < result["overall_accuracy"]
    assert weaker["slice_accuracy"]["simple-math"] < 1.0
    assert weaker["slice_accuracy"]["instruction-following"] < 1.0

    print("All contract tests passed.")


if __name__ == "__main__":
    main()
