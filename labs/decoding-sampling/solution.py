from __future__ import annotations

import numpy as np


def softmax(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    if temperature <= 0:
        raise ValueError("temperature must be > 0; use greedy() for temperature 0")
    scaled = np.asarray(logits, dtype=float) / temperature
    # Subtract the maximum before exponentiating: large logits would otherwise overflow.
    shifted = scaled - np.max(scaled)
    weights = np.exp(shifted)
    return weights / weights.sum()


def greedy(logits: np.ndarray) -> int:
    return int(np.argmax(logits))


def top_k_filter(probs: np.ndarray, k: int) -> np.ndarray:
    if k < 1:
        raise ValueError("k must be >= 1")
    probs = np.asarray(probs, dtype=float)
    if k >= probs.size:
        return probs.copy()
    order = np.argsort(-probs, kind="stable")
    kept = np.zeros_like(probs)
    kept[order[:k]] = probs[order[:k]]
    return kept / kept.sum()


def top_p_filter(probs: np.ndarray, p: float) -> np.ndarray:
    if not 0 < p <= 1:
        raise ValueError("p must be in (0, 1]")
    probs = np.asarray(probs, dtype=float)
    order = np.argsort(-probs, kind="stable")
    cumulative = np.cumsum(probs[order])
    # The smallest prefix whose mass reaches p includes the token that crosses p.
    size = int(np.searchsorted(cumulative, p, side="left")) + 1
    size = min(size, probs.size)
    kept = np.zeros_like(probs)
    kept[order[:size]] = probs[order[:size]]
    return kept / kept.sum()


def mask_logits(logits: np.ndarray, allowed: list[int]) -> np.ndarray:
    if not allowed:
        raise ValueError("allowed must name at least one token")
    masked = np.full(np.shape(logits), -np.inf)
    index = np.asarray(sorted(set(allowed)))
    masked[index] = np.asarray(logits, dtype=float)[index]
    return masked


def next_token_distribution(
    logits: np.ndarray,
    temperature: float = 1.0,
    top_k: int | None = None,
    top_p: float | None = None,
    allowed: list[int] | None = None,
) -> np.ndarray:
    if allowed is not None:
        logits = mask_logits(logits, allowed)
    if temperature == 0:
        probs = np.zeros(np.shape(logits))
        probs[greedy(logits)] = 1.0
        return probs
    probs = softmax(logits, temperature)
    if top_k is not None:
        probs = top_k_filter(probs, top_k)
    if top_p is not None:
        probs = top_p_filter(probs, top_p)
    return probs


def sample(probs: np.ndarray, rng: np.random.Generator) -> int:
    u = rng.random()
    cumulative = np.cumsum(probs)
    index = int(np.searchsorted(cumulative, u, side="right"))
    if index >= len(probs):
        # Rounding left u above the last cumulative value: take the last token that can occur.
        index = int(np.flatnonzero(np.asarray(probs) > 0)[-1])
    return index


def generate(
    next_logits,
    prompt: list[int],
    max_new_tokens: int,
    eos_id: int,
    rng: np.random.Generator,
    **decoding,
) -> list[int]:
    ids = list(prompt)
    new: list[int] = []
    for _ in range(max_new_tokens):
        probs = next_token_distribution(next_logits(ids), **decoding)
        token = sample(probs, rng)
        ids.append(token)
        new.append(token)
        if token == eos_id:
            break
    return new
