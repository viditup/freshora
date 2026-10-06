"""PART 8 unit tests - delivery options / fees - run with:  python -m tests.test_cart   (no MongoDB needed)"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("JWT_SECRET", "test-secret-for-unit-tests-only-0123456789")

from fastapi import HTTPException  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.routes.cart import delivery_info, delivery_quote, norm_delivery  # noqa: E402


def test_standard_is_free_above_threshold():
    fee, eta = delivery_quote(settings.free_delivery_above, "standard")
    assert fee == 0 and eta == settings.delivery_eta_minutes
    fee2, _ = delivery_quote(settings.free_delivery_above - 1, "standard")
    assert fee2 == settings.delivery_fee


def test_express_is_flat_and_faster():
    fee, eta = delivery_quote(10, "express")
    assert fee == settings.express_delivery_fee      # never waived by the free-delivery threshold
    assert eta == settings.express_eta_minutes < settings.delivery_eta_minutes


def test_delivery_info_shape_and_validation():
    info = delivery_info("express")
    assert info["option"] == "express" and info["free_above"] == settings.free_delivery_above
    assert [o["key"] for o in info["options"]] == ["standard", "express"]
    assert info["options"][1]["free_above"] is None   # express is never free
    assert norm_delivery("standard") == "standard"
    try:
        norm_delivery("teleport")
        assert False, "expected HTTPException"
    except HTTPException as e:
        assert e.status_code == 422


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_"):
            fn()
            print("PASS", name)
    print("all Part 8 unit tests passed")
