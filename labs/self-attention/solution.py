from __future__ import annotations

import math

import numpy as np


def causal_self_attention(
    x: np.ndarray,
    w_q: np.ndarray,
    w_k: np.ndarray,
    w_v: np.ndarray,
):
    q = x @ w_q
    k = x @ w_k
    v = x @ w_v

    head_dim = q.shape[-1]
    scores = (q @ k.T) / math.sqrt(head_dim)

    seq_len = x.shape[0]
    mask = np.triu(np.ones((seq_len, seq_len), dtype=bool), k=1)

    masked_scores = np.where(mask, -np.inf, scores)
    # Subtract the row maximum before exponentiating: -inf rows would otherwise produce nan.
    shifted = masked_scores - masked_scores.max(axis=-1, keepdims=True)
    weights = np.exp(shifted)
    probs = weights / weights.sum(axis=-1, keepdims=True)
    output = probs @ v

    return output, scores, mask, probs
