from __future__ import annotations

import math
import torch


def causal_self_attention(
    x: torch.Tensor,
    w_q: torch.Tensor,
    w_k: torch.Tensor,
    w_v: torch.Tensor,
):
    q = x @ w_q
    k = x @ w_k
    v = x @ w_v

    head_dim = q.shape[-1]
    scores = (q @ k.T) / math.sqrt(head_dim)

    seq_len = x.shape[0]
    mask = torch.triu(
        torch.ones(seq_len, seq_len, dtype=torch.bool, device=x.device),
        diagonal=1,
    )

    masked_scores = scores.masked_fill(mask, float("-inf"))
    probs = torch.softmax(masked_scores, dim=-1)
    output = probs @ v

    return output, scores, mask, probs
