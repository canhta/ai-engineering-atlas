from __future__ import annotations

import math

import numpy as np


def causal_self_attention(
    x: np.ndarray,
    w_q: np.ndarray,
    w_k: np.ndarray,
    w_v: np.ndarray,
):
    """Implement causal single-head self-attention.

    Args:
        x: [seq_len, model_dim]
        w_q/w_k/w_v: [model_dim, head_dim]

    Returns:
        output: [seq_len, head_dim]
        scores: [seq_len, seq_len] before masking
        mask: boolean [seq_len, seq_len], True where attention is blocked
        probs: [seq_len, seq_len] after masking + softmax
    """
    # TODO:
    # 1. project x to Q, K, V
    # 2. compute scaled Q @ K.T scores
    # 3. build an upper-triangular causal mask above the diagonal
    # 4. mask future scores
    # 5. softmax over keys
    # 6. mix values
    raise NotImplementedError


if __name__ == "__main__":
    rng = np.random.default_rng(7)
    x = rng.standard_normal((4, 6))
    w_q = rng.standard_normal((6, 3))
    w_k = rng.standard_normal((6, 3))
    w_v = rng.standard_normal((6, 3))

    output, scores, mask, probs = causal_self_attention(x, w_q, w_k, w_v)
    print("scores\n", scores)
    print("mask\n", mask)
    print("probs\n", probs)
    print("output\n", output)
