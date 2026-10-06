"""PART 7 unit tests - run with:  python -m tests.test_details   (no MongoDB needed)"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("JWT_SECRET", "test-secret-for-unit-tests-only-0123456789")

from app.routes.catalog import details_for, nutrition_for, pack_sizes_for, parse_unit  # noqa: E402


def P(unit, price, orig, cat="Fresh Fruits", organic=False):
    return {"unit": unit, "price": price, "original_price": orig, "category_name": cat, "organic": organic}


def test_parse_unit():
    assert parse_unit("1 kg") == (1.0, 1000.0)
    assert parse_unit("500 g") == (500.0, 1.0)
    assert parse_unit("6 pcs") == (6.0, 1.0)
    assert parse_unit("") == (None, None)


def test_pack_sizes_weight():
    packs = pack_sizes_for(P("1 kg", 149, 179))
    labels = [p["label"] for p in packs]
    assert labels == ["500 g", "1 kg", "2 kg", "5 kg"], labels
    base = packs[1]
    assert base["price"] == 149 and base["original_price"] == 179 and base["discount"] == 17
    assert packs[0]["price"] == 74.5            # half of 149
    assert packs[2]["price"] == 283.1           # 2 kg with 5% off
    assert packs[3]["price"] == 670.5           # 5 kg with 10% off
    for p in packs:                             # MRP is always above the price
        assert p["original_price"] > p["price"] and p["discount"] > 0


def test_pack_sizes_volume_and_pieces():
    assert [p["label"] for p in pack_sizes_for(P("1 L", 99, 120, "Beverages"))] == ["500 ml", "1 L", "2 L", "5 L"]
    assert [p["label"] for p in pack_sizes_for(P("6 pcs", 35, 40, "Bakery"))] == ["6 pcs", "12 pcs", "24 pcs"]
    assert [p["label"] for p in pack_sizes_for(P("1 pc", 45, 50, "Fresh Vegetables"))] == ["1 pc", "2 pc", "4 pc"]


def test_details_and_nutrition():
    d = details_for(P("1 kg", 149, 179, "Fresh Vegetables", organic=True))
    assert d["shelf_life"] == "2 days" and d["country_of_origin"] == "India"
    assert "Refrigerate" in d["storage"] and any("preservatives" in h for h in d["highlights"])
    assert any("minutes" in h for h in d["highlights"])
    rows = nutrition_for(P("1 kg", 149, 179, "Fresh Vegetables"))
    assert rows[0]["label"] == "Energy" and rows[0]["value"].endswith("kcal")
    assert len(nutrition_for(P("1 kg", 149, 179, "Personal Care"))) == 5   # falls back to the default table


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_"):
            fn()
            print("PASS", name)
    print("all Part 7 unit tests passed")
