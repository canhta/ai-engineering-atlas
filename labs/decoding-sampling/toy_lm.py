"""A fixed bigram "language model" so decoding can be studied without training anything.

`next_logits(ids)` returns the logits for the token after the last one in `ids`. A real model
returns the same kind of vector: one score per vocabulary entry for the next position.
Read the table before running anything: it is small enough to predict greedy output by hand.
"""

from __future__ import annotations

import numpy as np

VOCAB = ["<eos>", "the", "cat", "sat", "on", "mat", "dog", "."]
EOS = 0

# Row = current token, column = next token. Higher means more likely next.
_BIGRAM = np.array(
    [
        # <eos>  the   cat   sat   on    mat   dog   .
        [-9.0, 2.0, -9.0, -9.0, -9.0, -9.0, -9.0, -9.0],  # <eos>
        [-9.0, -9.0, 2.2, -9.0, -9.0, 1.4, 1.9, -9.0],  # the
        [-9.0, -9.0, -9.0, 2.5, 0.3, -9.0, -9.0, 0.5],  # cat
        [-9.0, -9.0, -9.0, -9.0, 2.4, -9.0, -9.0, 1.0],  # sat
        [-9.0, 3.0, -9.0, -9.0, -9.0, -9.0, -9.0, -9.0],  # on
        [-9.0, -9.0, -9.0, -9.0, -9.0, -9.0, -9.0, 2.0],  # mat
        [-9.0, -9.0, -9.0, 2.0, 0.5, -9.0, -9.0, 0.8],  # dog
        [2.0, 0.5, -9.0, -9.0, -9.0, -9.0, -9.0, -9.0],  # .
    ]
)


def next_logits(ids: list[int]) -> np.ndarray:
    return _BIGRAM[ids[-1]].copy()


def detokenize(ids: list[int]) -> str:
    return " ".join(VOCAB[i] for i in ids)
