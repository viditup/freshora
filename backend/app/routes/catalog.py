import math
import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.config import settings
from app.db import database as mongo
from app.db.database import oid, ser
from app.schemas import ProductIn

router = APIRouter(tags=["Catalog"])
SORTS = {"newest": ("created_at", -1), "price_asc": ("price", 1), "price_desc": ("price", -1),
         "rating": ("rating", -1), "popular": ("review_count", -1)}


def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


# ---------------- PART 7: product details helpers ----------------
# Pack sizes are DERIVED from the unit price so the maths is always consistent
# (e.g. "1 kg" at Rs 149 -> 500 g Rs 75, 1 kg Rs 149, 2 kg Rs 283, 5 kg Rs 671).
# An admin can override them by sending pack_sizes on the product.
UNIT_MULT = {"kg": 1000.0, "g": 1.0, "gm": 1.0, "ml": 1.0, "l": 1000.0, "ltr": 1000.0,
             "litre": 1000.0, "pc": 1.0, "pcs": 1.0, "dozen": 1.0, "pack": 1.0,
             "bunch": 1.0, "bag": 1.0, "bottle": 1.0}


def parse_unit(unit: str):
    """'1 kg' -> (1.0, 1000.0)  |  '400 g' -> (400.0, 1.0)  |  '6 pcs' -> (6.0, 1.0)"""
    m = re.match(r"\s*(\d+(?:\.\d+)?)\s*(.*)", unit or "")
    if not m:
        return None, None
    qty = float(m.group(1))
    tail = (m.group(2) or "").strip().lower()
    return qty, UNIT_MULT.get(tail, 1.0)


def pack_label(total: float, tail: str) -> str:
    """Formats a pack weight/volume/count into a human label (g/kg, ml/L, pieces)."""
    if tail in ("kg", "g", "gm"):
        return f"{total / 1000:g} kg" if total >= 1000 else f"{total:g} g"
    if tail in ("ml", "l", "ltr", "litre"):
        return f"{total / 1000:g} L" if total >= 1000 else f"{total:g} ml"
    return f"{total:g} {tail}"


def pack_sizes_for(p: dict) -> list:
    qty, mult = parse_unit(p.get("unit", ""))
    if not qty or not mult:
        return []
    base = float(p["price"])
    orig = float(p.get("original_price") or base)
    tail = re.sub(r"[\d.\s]", "", p.get("unit", "")).lower() or "pc"
    weight = tail in ("kg", "g", "gm", "ml", "l", "ltr", "litre")
    per, per_orig = base / (qty * mult), orig / (qty * mult)
    plan = [(0.5, 0), (1, 0), (2, 5), (5, 10)] if weight and qty * mult >= 200 else [(1, 0), (2, 5), (4, 10)]
    out, seen = [], set()
    for f, off in plan:
        total = qty * f
        label = p["unit"].strip() if f == 1 else pack_label(total * mult, tail)
        if label in seen:
            continue
        seen.add(label)
        if f == 1:
            price, mrp = base, orig
        else:
            price, mrp = round(per * total * mult * (1 - off / 100), 2), round(per_orig * total * mult, 2)
        if mrp <= price:
            mrp = round(price * 1.08, 2)
        out.append({"label": label, "price": price, "original_price": mrp,
                    "discount": max(0, round((mrp - price) / mrp * 100))})
    return out


NUTRITION = {
    "Fresh Fruits": [("Energy", "52 kcal"), ("Carbohydrates", "13.8 g"), ("Sugars", "10.4 g"),
                     ("Protein", "0.3 g"), ("Fat", "0.2 g"), ("Fibre", "2.4 g"), ("Vitamin C", "4.6 mg")],
    "Fresh Vegetables": [("Energy", "20 kcal"), ("Carbohydrates", "4.6 g"), ("Protein", "0.9 g"),
                         ("Fat", "0.2 g"), ("Fibre", "1.2 g"), ("Sodium", "5 mg")],
    "Dairy": [("Energy", "62 kcal"), ("Carbohydrates", "4.8 g"), ("Protein", "3.2 g"),
              ("Fat", "3.4 g"), ("Calcium", "120 mg"), ("Sodium", "44 mg")],
    "Bakery": [("Energy", "265 kcal"), ("Carbohydrates", "49 g"), ("Protein", "9 g"),
               ("Fat", "3.2 g"), ("Fibre", "2.7 g"), ("Sodium", "450 mg")],
    "Beverages": [("Energy", "45 kcal"), ("Carbohydrates", "11 g"), ("Sugars", "9.5 g"),
                  ("Protein", "0.4 g"), ("Fat", "0 g"), ("Sodium", "3 mg")],
}
NUTRITION_DEFAULT = [("Energy", "160 kcal"), ("Carbohydrates", "28 g"), ("Protein", "4 g"),
                     ("Fat", "4 g"), ("Sodium", "320 mg")]
SHELF_LIFE = {"Fresh Fruits": "3 days", "Fresh Vegetables": "2 days", "Dairy": "2 days",
              "Bakery": "4 days", "Beverages": "6 months", "Snacks": "6 months",
              "Grocery": "9 months", "Organic": "9 months", "Personal Care": "24 months", "Household": "24 months"}


def kind_for(p: dict) -> str:
    """PART 6A: map the 12 design categories (and sub-categories) onto the nutrition / shelf-life tables above.
    Unknown names (e.g. categories added from the admin panel) pass through unchanged."""
    cat, sub = p.get("category_name", ""), p.get("subcategory", "")
    if cat == "Fruits & Vegetables":
        return "Fresh Fruits" if sub in ("Fresh Fruits", "Exotic Fruits", "Organic") else "Fresh Vegetables"
    if cat == "Dairy & Breakfast":
        return "Bakery" if sub in ("Breads", "Buns & Pav", "Cakes & Muffins", "Cereals") else "Dairy"
    if cat == "Snacks & Beverages":
        return "Beverages" if sub == "Cold Drinks" else "Snacks"
    return {"Atta, Rice & Staples": "Grocery", "Organic Products": "Organic", "Healthy Snacks": "Snacks",
            "Household Essentials": "Household", "Cleaning Essentials": "Household"}.get(cat, cat)


def details_for(p: dict) -> dict:
    cat, organic = kind_for(p), bool(p.get("organic"))
    fresh = cat in ("Fresh Fruits", "Fresh Vegetables", "Dairy", "Bakery")
    return {
        "shelf_life": SHELF_LIFE.get(cat, "6 months"),
        "storage": "Refrigerate after opening" if fresh else "Store in a cool, dry place, away from direct sunlight",
        "country_of_origin": "India",
        "highlights": [
            "100% fresh and quality checked" if fresh else "Sealed pack, quality assured",
            f"Country of origin: India",
            "No added preservatives" if organic else "Quality checked before dispatch",
            f"Delivered in {settings.delivery_eta_minutes} minutes",
        ],
    }


def nutrition_for(p: dict) -> list:
    rows = NUTRITION.get(kind_for(p), NUTRITION_DEFAULT)
    return [{"label": k, "value": v} for k, v in rows]


# PART 6: the listing accepts sub-category / brand / organic / rating / stock filters
# on top of the original category, search, price and sort parameters.
def listing_params(category: Optional[str] = Query(None, max_length=100), search: Optional[str] = Query(None, max_length=100), page: int = Query(1, ge=1, le=10000),
                   limit: int = Query(20, ge=1, le=100), sort: str = "newest",
                   min_price: Optional[float] = None, max_price: Optional[float] = None,
                   subcategory: Optional[str] = Query(None, max_length=100), brand: Optional[str] = Query(None, max_length=300), organic: bool = False,
                   min_rating: Optional[float] = None, in_stock: bool = False):
    return dict(category=category, search=search, page=page, limit=limit, sort=sort, min_price=min_price,
                max_price=max_price, subcategory=subcategory, brand=brand, organic=organic,
                min_rating=min_rating, in_stock=in_stock)


def product_filter(p: dict, active_only: bool = True) -> dict:
    f = {"active": True} if active_only else {}
    ands = []
    if p["category"]:  # accepts a category id or slug
        f["$or"] = [{"category_id": p["category"]}, {"category_slug": p["category"]}]
    if p.get("subcategory"):  # accepts a sub-category name or slug
        ands.append({"$or": [{"subcategory": p["subcategory"]}, {"subcategory_slug": p["subcategory"]}]})
    if p["search"]:
        rx = {"$regex": re.escape(p["search"]), "$options": "i"}
        ands.append({"$or": [{"name": rx}, {"description": rx}, {"category_name": rx}]})
    if p.get("brand"):  # comma separated list, matched with $in
        brands = [b for b in (x.strip() for x in p["brand"].split(",")) if b]
        if brands:
            ands.append({"brand": {"$in": brands}})
    if p.get("organic"):
        ands.append({"organic": True})
    if p.get("min_rating") is not None:
        ands.append({"rating": {"$gte": p["min_rating"]}})
    if p.get("in_stock"):
        ands.append({"stock": {"$gt": 0}})
    price = {}
    if p["min_price"] is not None:
        price["$gte"] = p["min_price"]
    if p["max_price"] is not None:
        price["$lte"] = p["max_price"]
    if price:
        ands.append({"price": price})
    if ands:
        f["$and"] = ands
    return f


async def paginate(f: dict, p: dict):
    field, direction = SORTS.get(p["sort"], SORTS["newest"])
    total = await mongo.db.products.count_documents(f)
    cur = mongo.db.products.find(f).sort(field, direction).skip((p["page"] - 1) * p["limit"]).limit(p["limit"])
    return {"success": True, "data": [ser(x) async for x in cur],
            "pagination": {"page": p["page"], "limit": p["limit"], "total": total, "total_pages": math.ceil(total / p["limit"])}}


async def product_doc(body: ProductIn) -> dict:
    """Builds a product document (used by admin create/update). Discount is computed, never trusted."""
    cat = await mongo.db.categories.find_one({"_id": oid(body.category_id, "category ID")})
    if not cat:
        raise HTTPException(404, "Category not found")
    orig = body.original_price or body.price
    sub = body.subcategory.strip()
    packs = []
    for pk in body.pack_sizes:  # PART 7: optional admin override of the derived pack sizes
        o = pk.original_price or pk.price
        packs.append({"label": pk.label.strip(), "price": pk.price, "original_price": o,
                      "discount": max(0, round((o - pk.price) / o * 100))})
    return {**body.model_dump(), "slug": slugify(body.name), "original_price": orig, "pack_sizes": packs,
            "subcategory": sub, "subcategory_slug": slugify(sub) if sub else "", "brand": body.brand.strip(),
            "discount": max(0, round((orig - body.price) / orig * 100)),
            "category_name": cat["name"], "category_slug": cat["slug"]}


@router.get("/categories", summary="List active categories (with live product counts)")
async def categories():
    counts = {r["_id"]: r["n"] async for r in mongo.db.products.aggregate(
        [{"$match": {"active": True}}, {"$group": {"_id": "$category_id", "n": {"$sum": 1}}}])}
    out = []
    async for c in mongo.db.categories.find({"active": True}):
        d = ser(c)
        d["product_count"] = counts.get(d["id"], 0)
        out.append(d)
    return {"success": True, "data": out}


@router.get("/categories/{category_id}", summary="Category details")
async def category(category_id: str):
    c = await mongo.db.categories.find_one({"_id": oid(category_id, "category ID")})
    if not c:
        raise HTTPException(404, "Category not found")
    d = ser(c)
    d["product_count"] = await mongo.db.products.count_documents({"category_id": category_id, "active": True})
    return {"success": True, "data": d}


@router.get("/products", summary="List products (filters, sort, pagination)")
async def products(p: dict = Depends(listing_params)):
    return await paginate(product_filter(p), p)


@router.get("/products/featured", summary="Featured products for Home")
async def featured(limit: int = Query(10, ge=1, le=50)):
    cur = mongo.db.products.find({"featured": True, "active": True}).limit(limit)
    return {"success": True, "data": [ser(x) async for x in cur]}


# PART 6: everything the listing filter bar needs - sub-category chips, brand
# facets with counts, price range and the organic count. Declared BEFORE
# /products/{product_id} so "facets" is never parsed as a product id.
@router.get("/products/facets", summary="Filter options for the product listing")
async def facets(category: Optional[str] = None):
    f = {"active": True}
    if category:
        f["$or"] = [{"category_id": category}, {"category_slug": category}]
    col = mongo.db.products

    async def grouped(field):
        rows = [r async for r in col.aggregate([{"$match": f}, {"$group": {"_id": f"${field}", "n": {"$sum": 1}}}, {"$sort": {"n": -1}}])]
        return [{"value": r["_id"], "label": r["_id"], "count": r["n"]} for r in rows if r["_id"]]

    sub_rows = [r async for r in col.aggregate([
        {"$match": f},
        {"$group": {"_id": {"slug": "$subcategory_slug", "name": "$subcategory"}, "n": {"$sum": 1}}},
        {"$sort": {"n": -1}}])]
    subcategories = [{"value": r["_id"]["slug"], "label": r["_id"].get("name") or r["_id"]["slug"], "count": r["n"]}
                     for r in sub_rows if r["_id"].get("slug")]

    cat_rows = [r async for r in col.aggregate([
        {"$match": {"active": True}},
        {"$group": {"_id": {"slug": "$category_slug", "name": "$category_name"}, "n": {"$sum": 1}}},
        {"$sort": {"n": -1}}])]
    categories = [{"value": r["_id"]["slug"], "label": r["_id"].get("name") or r["_id"]["slug"], "count": r["n"]}
                  for r in cat_rows if r["_id"].get("slug")]

    prices = [r async for r in col.aggregate([{"$match": f},
        {"$group": {"_id": None, "min": {"$min": "$price"}, "max": {"$max": "$price"}}}, {"$limit": 1}])]

    return {"success": True, "data": {
        "total": await col.count_documents(f),
        "organic": await col.count_documents({**f, "organic": True}),
        "subcategories": subcategories, "categories": categories, "brands": await grouped("brand"),
        "price": {"min": prices[0]["min"], "max": prices[0]["max"]} if prices else None}}


@router.get("/products/search", summary="Search name, description and category")
async def search(q: str = Query(min_length=1, max_length=100), p: dict = Depends(listing_params)):
    p["search"] = q.strip()
    return await paginate(product_filter(p), p)


@router.get("/products/category/{category_id}", summary="Products in a category")
async def by_category(category_id: str, p: dict = Depends(listing_params)):
    p["category"] = category_id
    return await paginate(product_filter(p), p)


# PART 7: wishlist screen - fetch the saved ids in one call, keeping the saved order.
# Declared BEFORE /products/{product_id} so "by-ids" is never read as a product id.
@router.get("/products/by-ids", summary="Products by id list (wishlist)")
async def by_ids(ids: str = Query("", max_length=3000, description="Comma separated product ids")):
    wanted = [i.strip() for i in ids.split(",") if i.strip()][:100]
    valid = []
    for i in wanted:
        try:
            valid.append(oid(i))
        except HTTPException:
            continue
    rows = {str(r["_id"]): r async for r in mongo.db.products.find({"_id": {"$in": valid}, "active": True})}
    return {"success": True, "data": [ser(rows[i]) for i in wanted if i in rows]}


@router.get("/products/{product_id}", summary="Product details (packs, delivery, nutrition, related)")
async def product(product_id: str):
    x = await mongo.db.products.find_one({"_id": oid(product_id, "product ID"), "active": True})
    if not x:
        raise HTTPException(404, "Product not found")
    d = ser(x)
    d["pack_sizes"] = x.get("pack_sizes") or pack_sizes_for(x)
    d.update(details_for(x))
    d["nutrition"] = nutrition_for(x)
    d["delivery"] = {"eta_minutes": settings.delivery_eta_minutes, "fee": settings.delivery_fee,
                     "free_above": settings.free_delivery_above}
    # "You May Also Like": same sub-category first, topped up from the same category.
    related = [ser(r) async for r in mongo.db.products.find(
        {"active": True, "_id": {"$ne": x["_id"]}, "subcategory_slug": x.get("subcategory_slug") or "__none__"}).limit(8)]
    if len(related) < 8:
        seen = {r["id"] for r in related} | {d["id"]}
        async for r in mongo.db.products.find({"active": True, "category_id": x["category_id"]}).limit(20):
            s = ser(r)
            if s["id"] not in seen:
                related.append(s)
                seen.add(s["id"])
            if len(related) >= 8:
                break
    d["related"] = related
    return {"success": True, "data": d}


@router.get("/home", summary="Everything the Home screen needs")
async def home():
    async def grab(col, f, sort=None, limit=10):
        cur = mongo.db[col].find(f)
        if sort:
            cur = cur.sort(*sort)
        return [ser(x) async for x in cur.limit(limit)]
    return {"success": True,
            "banners": await grab("banners", {"active": True}),
            "categories": await grab("categories", {"active": True}, limit=20),
            "featured_products": await grab("products", {"featured": True, "active": True}),
            "popular_products": await grab("products", {"active": True}, ("review_count", -1)),
            "offers": await grab("products", {"active": True, "discount": {"$gte": 15}}, ("discount", -1))}
