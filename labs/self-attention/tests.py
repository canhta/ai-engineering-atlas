import torch

from starter import causal_self_attention
from solution import causal_self_attention as reference_attention


def main():
    torch.manual_seed(11)
    x = torch.randn(5, 8)
    w_q = torch.randn(8, 4)
    w_k = torch.randn(8, 4)
    w_v = torch.randn(8, 4)

    actual = causal_self_attention(x, w_q, w_k, w_v)
    expected = reference_attention(x, w_q, w_k, w_v)

    output, scores, mask, probs = actual

    assert output.shape == (5, 4)
    assert scores.shape == (5, 5)
    assert mask.shape == (5, 5)
    assert probs.shape == (5, 5)

    assert torch.allclose(probs.sum(dim=-1), torch.ones(5), atol=1e-6)
    assert torch.all(probs[mask] == 0)

    for a, b in zip(actual, expected):
        if a.dtype == torch.bool:
            assert torch.equal(a, b)
        else:
            assert torch.allclose(a, b, atol=1e-6)

    print("All contract tests passed.")


if __name__ == "__main__":
    main()
