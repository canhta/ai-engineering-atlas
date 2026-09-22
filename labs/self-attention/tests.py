import math

import numpy as np
from solution import causal_self_attention as reference_attention
from starter import causal_self_attention

TOL = 1e-9


def fixtures(seed=11, seq_len=5, model_dim=8, head_dim=4):
    rng = np.random.default_rng(seed)
    return (
        rng.standard_normal((seq_len, model_dim)),
        rng.standard_normal((model_dim, head_dim)),
        rng.standard_normal((model_dim, head_dim)),
        rng.standard_normal((model_dim, head_dim)),
    )


def main():
    x, w_q, w_k, w_v = fixtures()
    seq_len, head_dim = x.shape[0], w_q.shape[1]

    output, scores, mask, probs = causal_self_attention(x, w_q, w_k, w_v)

    assert output.shape == (seq_len, head_dim)
    assert scores.shape == (seq_len, seq_len)
    assert mask.shape == (seq_len, seq_len)
    assert probs.shape == (seq_len, seq_len)
    assert mask.dtype == bool

    # The mask blocks the future and nothing else.
    assert np.array_equal(mask, np.triu(np.ones((seq_len, seq_len), dtype=bool), k=1))

    # Every row of attention weights is a distribution over the keys it may see.
    assert np.allclose(probs.sum(axis=-1), np.ones(seq_len), atol=1e-6)
    assert np.all(probs >= 0)

    # A blocked position contributes exactly nothing, not merely a small amount.
    assert np.all(probs[mask] == 0)

    # Scores are Q @ K.T scaled by 1/sqrt(head_dim). Unscaled scores fail here.
    q, k = x @ w_q, x @ w_k
    assert np.allclose(scores, (q @ k.T) / math.sqrt(head_dim), atol=1e-6)

    # Each output row mixes only the values the row is allowed to see.
    v = x @ w_v
    for i in range(seq_len):
        assert np.allclose(output[i], probs[i, : i + 1] @ v[: i + 1], atol=1e-6)

    # Causality: changing a later token cannot change an earlier output.
    perturbed = x.copy()
    perturbed[-1] += 10.0
    later_output, _, _, _ = causal_self_attention(perturbed, w_q, w_k, w_v)
    assert np.allclose(output[:-1], later_output[:-1], atol=1e-6)

    # Softmax is shift-invariant: adding a constant to a row of scores leaves the weights alone.
    scaled = x * 1.0
    shifted_output, _, _, shifted_probs = causal_self_attention(scaled, w_q, w_k, w_v)
    assert np.allclose(shifted_probs, probs, atol=TOL)
    assert np.allclose(shifted_output, output, atol=TOL)

    # Finally, the whole contract against the reference.
    expected = reference_attention(x, w_q, w_k, w_v)
    for actual_part, expected_part in zip(
        (output, scores, mask, probs), expected, strict=True
    ):
        if actual_part.dtype == bool:
            assert np.array_equal(actual_part, expected_part)
        else:
            assert np.allclose(actual_part, expected_part, atol=1e-6)

    print("All contract tests passed.")


if __name__ == "__main__":
    main()
