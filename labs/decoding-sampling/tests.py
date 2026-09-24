import numpy as np
import toy_lm
from solution import generate as reference_generate
from solution import next_token_distribution as reference_distribution
from starter import (
    generate,
    greedy,
    mask_logits,
    next_token_distribution,
    sample,
    softmax,
    top_k_filter,
    top_p_filter,
)

TOL = 1e-9


def raises_value_error(fn, *args, **kwargs):
    try:
        fn(*args, **kwargs)
    except ValueError:
        return True
    return False


def check_softmax():
    logits = np.array([2.0, 1.0, 0.1])
    probs = softmax(logits)
    assert probs.shape == logits.shape
    assert np.isclose(probs.sum(), 1.0, atol=TOL), "softmax must return a distribution that sums to one"
    assert np.allclose(probs, np.exp(logits) / np.exp(logits).sum(), atol=TOL)

    # Temperature divides the logits, before the exponential. Applying it to probabilities fails here.
    sharp = softmax(logits, temperature=0.5)
    assert np.allclose(sharp, np.exp(logits / 0.5) / np.exp(logits / 0.5).sum(), atol=TOL), (
        "temperature must scale the logits: softmax(v / tau)"
    )
    assert sharp.max() > probs.max(), "a temperature below 1 must sharpen the distribution"
    flat = softmax(logits, temperature=2.0)
    assert flat.max() < probs.max(), "a temperature above 1 must flatten the distribution"

    # Large logits must not overflow: subtract the maximum first.
    big = softmax(np.array([1000.0, 999.0]))
    assert np.all(np.isfinite(big)) and np.isclose(big.sum(), 1.0, atol=TOL), "softmax overflowed on large logits"

    # A masked logit (-inf) gets exactly zero probability.
    masked = softmax(np.array([1.0, -np.inf, 0.0]))
    assert masked[1] == 0.0

    assert raises_value_error(softmax, logits, temperature=0.0), "temperature 0 is greedy, not a softmax"
    assert raises_value_error(softmax, logits, temperature=-1.0)


def check_greedy():
    assert greedy(np.array([0.1, 3.0, 2.9])) == 1
    # On a tie, the lowest index wins (np.argmax behaviour); deterministic output depends on it.
    assert greedy(np.array([2.0, 5.0, 5.0])) == 1


def check_top_k():
    probs = np.array([0.1, 0.4, 0.2, 0.3])
    before = probs.copy()
    kept = top_k_filter(probs, 2)
    assert np.array_equal(probs, before), "top_k_filter must not modify its input"
    assert np.isclose(kept.sum(), 1.0, atol=TOL), "renormalize after filtering: sampling needs a distribution"
    assert np.allclose(kept, [0.0, 0.4 / 0.7, 0.0, 0.3 / 0.7], atol=TOL)
    assert np.all(kept[[0, 2]] == 0.0), "excluded tokens must get exactly zero probability"
    assert np.allclose(top_k_filter(probs, 4), probs, atol=TOL), "k >= vocabulary size keeps every token"
    assert np.allclose(top_k_filter(probs, 10), probs, atol=TOL)
    # A tie at the boundary keeps the lower index, so the result is reproducible.
    tied = top_k_filter(np.array([0.3, 0.3, 0.3, 0.1]), 2)
    assert np.allclose(tied, [0.5, 0.5, 0.0, 0.0], atol=TOL)
    assert raises_value_error(top_k_filter, probs, 0)


def check_top_p():
    # Dyadic probabilities are exact in binary, so the boundary cases below are not rounding luck.
    probs = np.array([0.125, 0.5, 0.25, 0.125])

    # Sorted: 0.5, 0.25, 0.125, 0.125 -> cumulative 0.5, 0.75, 0.875, 1.0.
    # V(p) is the smallest set whose mass is >= p: the token that crosses p is inside the set.
    assert np.allclose(top_p_filter(probs, 0.75), [0.0, 2 / 3, 1 / 3, 0.0], atol=TOL), (
        "top-p with p=0.75 keeps the two most likely tokens (0.5 + 0.25 reaches 0.75)"
    )
    assert np.allclose(top_p_filter(probs, 0.7), [0.0, 2 / 3, 1 / 3, 0.0], atol=TOL), (
        "the token that crosses p belongs to the nucleus"
    )
    assert np.allclose(top_p_filter(probs, 0.5), [0.0, 1.0, 0.0, 0.0], atol=TOL), (
        "the most likely token alone already reaches p=0.5; no second token is needed"
    )
    assert np.allclose(top_p_filter(probs, 0.51), [0.0, 2 / 3, 1 / 3, 0.0], atol=TOL)
    assert np.allclose(top_p_filter(probs, 1.0), probs, atol=TOL), "p=1 keeps every token"

    # Smallest set: removing its least likely member must drop the mass below p.
    rng = np.random.default_rng(3)
    for _ in range(20):
        q = rng.dirichlet(np.ones(12))
        p = float(rng.uniform(0.05, 0.99))
        kept = top_p_filter(q, p)
        members = np.flatnonzero(kept > 0)
        assert np.isclose(kept.sum(), 1.0, atol=TOL)
        mass = q[members].sum()
        assert mass >= p - 1e-12, "the nucleus must reach p"
        assert mass - q[members].min() < p, "the nucleus must be the smallest set that reaches p"
        outside = np.setdiff1d(np.arange(q.size), members)
        if outside.size:
            assert q[outside].max() <= q[members].min(), "the nucleus must hold the most likely tokens"

    assert raises_value_error(top_p_filter, probs, 0.0)
    assert raises_value_error(top_p_filter, probs, 1.5)


def check_distribution():
    logits = np.log(np.array([0.5, 0.25, 0.125, 0.125]))

    plain = next_token_distribution(logits)
    assert np.isclose(plain.sum(), 1.0, atol=TOL), "the next-token distribution must sum to one"
    assert np.allclose(plain, [0.5, 0.25, 0.125, 0.125], atol=1e-12)

    # Temperature first, then the nucleus (CS336 A1 equation 24 defines q as the temperature-scaled
    # softmax). At tau=0.5 the top token has about 0.727 of the mass, so p=0.7 keeps it alone.
    # Filtering before the temperature would keep two tokens.
    ordered = next_token_distribution(logits, temperature=0.5, top_p=0.7)
    assert np.allclose(ordered, [1.0, 0.0, 0.0, 0.0], atol=TOL), (
        "apply the temperature before top-p: the nucleus is computed on the temperature-scaled distribution"
    )

    both = next_token_distribution(logits, top_k=3, top_p=0.8)
    # top-k=3 -> [4/7, 2/7, 1/7, 0]; cumulative 0.571, 0.857 -> p=0.8 keeps two tokens.
    assert np.allclose(both, [2 / 3, 1 / 3, 0.0, 0.0], atol=TOL)

    zero = next_token_distribution(np.array([0.2, 1.5, 1.4]), temperature=0)
    assert np.array_equal(zero, [0.0, 1.0, 0.0]), "temperature 0 means greedy: all mass on the argmax"


def check_sample():
    probs = np.array([0.1, 0.0, 0.6, 0.3])

    # Inverse-CDF sampling: one rng.random() draw u, return the first index whose cumulative
    # probability is greater than u. The same seed must give the same token.
    for seed in range(10):
        u = np.random.default_rng(seed).random()
        expected = int(np.flatnonzero(np.cumsum(probs) > u)[0])
        assert sample(probs, np.random.default_rng(seed)) == expected, (
            "sample must draw exactly one rng.random() and invert the cumulative distribution"
        )

    rng = np.random.default_rng(0)
    draws = np.array([sample(probs, rng) for _ in range(4000)])
    assert not np.any(draws == 1), "a token with zero probability was sampled"
    frequencies = np.bincount(draws, minlength=probs.size) / draws.size
    assert np.allclose(frequencies, probs, atol=0.03), f"sample frequencies {frequencies} do not follow {probs}"


def check_generate():
    the = toy_lm.VOCAB.index("the")

    # Greedy decoding on this model never reaches <eos>: it repeats a cycle until the limit.
    out = generate(toy_lm.next_logits, [the], 12, toy_lm.EOS, np.random.default_rng(0), temperature=0)
    assert len(out) == 12, "generation must stop at max_new_tokens when no <eos> appears"
    assert toy_lm.EOS not in out
    assert out[:4] == out[4:8] == out[8:12], f"expected a greedy loop, got: {toy_lm.detokenize(out)}"

    # Sampling can leave the loop. Generation stops right after <eos> and returns only new tokens.
    out = generate(toy_lm.next_logits, [the], 60, toy_lm.EOS, np.random.default_rng(1), temperature=1.0)
    assert out and out[-1] == toy_lm.EOS and out.count(toy_lm.EOS) == 1, (
        "generation must stop right after the first <eos> and must not include the prompt"
    )
    expected = reference_generate(toy_lm.next_logits, [the], 60, toy_lm.EOS, np.random.default_rng(1), temperature=1.0)
    assert out == expected, "same seed, same settings: the generated tokens must match the reference"


def check_constrained():
    # Transfer: force the next token into an allowed set (the mechanism behind constrained decoding).
    logits = np.array([3.0, 1.0, 2.0, 0.5])
    before = logits.copy()
    masked = mask_logits(logits, [1, 3])
    assert np.array_equal(logits, before), "mask_logits must not modify its input"
    assert masked[0] == -np.inf and masked[2] == -np.inf
    assert masked[1] == 1.0 and masked[3] == 0.5
    assert raises_value_error(mask_logits, logits, [])

    probs = next_token_distribution(logits, temperature=1.5, allowed=[1, 3])
    assert np.all(probs[[0, 2]] == 0.0), "a token outside the allowed set must have exactly zero probability"
    assert greedy(mask_logits(logits, [1, 3])) == 1

    allowed = [toy_lm.VOCAB.index("mat"), toy_lm.VOCAB.index(".")]
    out = generate(
        toy_lm.next_logits, [toy_lm.VOCAB.index("cat")], 10, toy_lm.EOS, np.random.default_rng(5), allowed=allowed
    )
    assert out and set(out) <= set(allowed), f"generated outside the allowed set: {toy_lm.detokenize(out)}"


def check_against_reference():
    rng = np.random.default_rng(11)
    settings = [
        {},
        {"temperature": 0.7},
        {"temperature": 1.3, "top_k": 5},
        {"temperature": 0.9, "top_p": 0.9},
        {"temperature": 0.8, "top_k": 8, "top_p": 0.6},
        {"temperature": 0},
        {"temperature": 1.0, "allowed": [2, 4, 6]},
    ]
    for _ in range(5):
        logits = rng.normal(scale=3.0, size=16)
        for decoding in settings:
            actual = next_token_distribution(logits, **decoding)
            expected = reference_distribution(logits, **decoding)
            assert np.allclose(actual, expected, atol=1e-9), f"distribution differs from the reference for {decoding}"


def main():
    check_softmax()
    check_greedy()
    check_top_k()
    check_top_p()
    check_distribution()
    check_sample()
    check_generate()
    check_constrained()
    check_against_reference()
    print("All decoding tests passed.")


if __name__ == "__main__":
    main()
