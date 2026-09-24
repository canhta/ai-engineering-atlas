from __future__ import annotations

import numpy as np


def softmax(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """Temperature-scaled softmax over a 1-D logits vector (CS336 A1 equation 23).

    Returns a new array of probabilities that sums to one. A logit of -inf gets probability 0.
    Raises ValueError when temperature <= 0 (temperature 0 is greedy decoding, not a softmax).
    """
    # TODO:
    # 1. divide the logits by the temperature
    # 2. subtract the maximum, so large logits cannot overflow exp()
    # 3. exponentiate and normalize
    raise NotImplementedError


def greedy(logits: np.ndarray) -> int:
    """Index of the largest logit; on a tie, the lowest index."""
    raise NotImplementedError


def top_k_filter(probs: np.ndarray, k: int) -> np.ndarray:
    """Keep the k most likely tokens, set the rest to exactly 0, and renormalize.

    Ties at the boundary keep the lower index. k >= len(probs) keeps everything.
    Raises ValueError when k < 1. Does not modify `probs`.
    """
    raise NotImplementedError


def top_p_filter(probs: np.ndarray, p: float) -> np.ndarray:
    """Nucleus filter (CS336 A1 equation 24): keep the smallest set of most likely tokens whose
    total probability is >= p, set the rest to exactly 0, and renormalize.

    Raises ValueError unless 0 < p <= 1. Does not modify `probs`.
    """
    raise NotImplementedError


def mask_logits(logits: np.ndarray, allowed: list[int]) -> np.ndarray:
    """Transfer task: return a copy of `logits` where every token not in `allowed` is -inf.

    Raises ValueError when `allowed` is empty.
    """
    raise NotImplementedError


def next_token_distribution(
    logits: np.ndarray,
    temperature: float = 1.0,
    top_k: int | None = None,
    top_p: float | None = None,
    allowed: list[int] | None = None,
) -> np.ndarray:
    """The distribution the next token is drawn from.

    Order: mask to `allowed` (if given); if temperature == 0, put all mass on the greedy token;
    otherwise temperature softmax, then top-k (if given), then top-p (if given).
    """
    raise NotImplementedError


def sample(probs: np.ndarray, rng: np.random.Generator) -> int:
    """Draw one token by inverting the cumulative distribution.

    Call rng.random() exactly once to get u, and return the first index whose cumulative
    probability is greater than u. If rounding leaves u above the last cumulative value,
    return the last index with nonzero probability.
    """
    raise NotImplementedError


def generate(
    next_logits,
    prompt: list[int],
    max_new_tokens: int,
    eos_id: int,
    rng: np.random.Generator,
    **decoding,
) -> list[int]:
    """The autoregressive loop.

    Repeat up to max_new_tokens times: get logits for the sequence so far, build the next-token
    distribution with `decoding` (temperature, top_k, top_p, allowed), sample one token with
    `sample`, append it. Stop right after eos_id. Return only the new tokens, not the prompt.
    """
    raise NotImplementedError


if __name__ == "__main__":
    # Experiment (run locally with `python starter.py` once the tests pass).
    # Write your prediction for each temperature in your notes BEFORE running this.
    import toy_lm

    the = toy_lm.VOCAB.index("the")
    for temperature in (0.2, 0.7, 1.2):
        rng = np.random.default_rng(0)
        outputs = {
            toy_lm.detokenize(generate(toy_lm.next_logits, [the], 12, toy_lm.EOS, rng, temperature=temperature))
            for _ in range(20)
        }
        print(f"temperature {temperature}: {len(outputs)} distinct outputs out of 20")
