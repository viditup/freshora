from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.config import settings
from app.db import database as mongo
from app.db.database import oid, ser
from app.dependencies.auth import current_user
from app.schemas import CartAdd, CartQty

router = APIRouter(prefix="/cart", tags=["Cart"])

# PART 8: Standard is free above the threshold; Express is a flat priority fee and never free.
DELIVERY_OPTIONS = ("standard", "express")


def norm_delivery(option: str) -> str:
    if option not in DELIVERY_OPTIONS:
        raise HTTPException(422, "delivery must be 'standard' or 'express'")
    return option


def delivery_quote(payable: float, option: str = "standard"):
    """Fee + ETA for a delivery option. 'payable' = subtotal - discount (goods actually paid for)."""
    if option == "express":
        return float(settings.express_delivery_fee), settings.express_eta_minutes
    fee = 0.0 if payable >= settings.free_delivery_above else float(settings.delivery_fee)
    return fee, settings.delivery_eta_minutes


def delivery_info(option: str) -> dict:
    """Everything the Cart free-delivery bar and the Checkout step 2 need (numbers only, mobile formats copy)."""
    return {
        "option": option,
        "free_above": settings.free_delivery_above,
        "options": [
            {"key": "standard", "label": "Standard Delivery", "eta_minutes": settings.delivery_eta_minutes,
             "fee": settings.delivery_fee, "free_above": settings.free_delivery_above},
            {"key": "express", "label": "Express Delivery", "eta_minutes": settings.express_eta_minutes,
             "fee": settings.express_delivery_fee, "free_above": None},
        ],
    }


def pack_line(p: dict, unit):
    """PART 7: when a cart line carries a pack label that exists on the product,
    the line is priced from that pack instead of the base price."""
    for pk in (p.get("pack_sizes") or []):
        if pk.get("label") == unit:
            return pk
    return None


async def build_cart(uid: str, delivery: str = "standard"):
    """Reads the user's cart and prices it from the DATABASE (never from the client).
    PART 8: the delivery option picks the fee + ETA; totals stay server-computed."""
    doc = await mongo.db.cart.find_one({"user_id": uid}) or {"items": []}
    ids = [oid(i["product_id"]) for i in doc["items"]]
    prods = {str(p["_id"]): p async for p in mongo.db.products.find({"_id": {"$in": ids}, "active": True})}
    items, subtotal, discount = [], 0.0, 0.0
    for i in doc["items"]:
        p = prods.get(i["product_id"])
        if not p:
            continue
        pk, q = pack_line(p, i.get("unit")), i["quantity"]
        price = pk["price"] if pk else p["price"]
        orig = (pk.get("original_price") or price) if pk else (p.get("original_price") or p["price"])
        items.append({"product_id": i["product_id"], "name": p["name"], "image": (ser(p).get("images") or [None])[0],
                      "price": price, "original_price": orig, "quantity": q,
                      "unit": pk["label"] if pk else (i.get("unit") or p.get("unit")),
                      "stock": p["stock"], "subtotal": round(price * q, 2)})
        subtotal += orig * q
        discount += (orig - price) * q
    payable = round(subtotal - discount, 2)
    fee, eta = delivery_quote(payable, delivery)
    if not items:
        fee = 0.0  # an empty cart never carries a delivery fee
    return items, {"subtotal": round(subtotal, 2), "discount": round(discount, 2), "delivery_fee": fee,
                   "total": round(payable + fee, 2), "delivery_option": delivery,
                   "free_delivery_above": settings.free_delivery_above,
                   "amount_for_free_delivery": round(max(0.0, settings.free_delivery_above - payable), 2),
                   "eta_minutes": eta}


async def save(uid: str, raw: list):
    await mongo.db.cart.update_one({"user_id": uid}, {"$set": {"items": raw, "updated_at": datetime.now(timezone.utc)}}, upsert=True)


async def respond(uid: str, message: str = "OK", delivery: str = "standard"):
    items, summary = await build_cart(uid, delivery)
    return {"success": True, "message": message, "items": items, "summary": summary, "delivery": delivery_info(delivery)}


async def raw_items(uid: str):
    return ((await mongo.db.cart.find_one({"user_id": uid})) or {"items": []})["items"]


async def check_stock(product_id: str, qty: int):
    p = await mongo.db.products.find_one({"_id": oid(product_id, "product ID"), "active": True})
    if not p:
        raise HTTPException(404, "Product not found")
    if qty > p["stock"]:
        raise HTTPException(409, f"Only {p['stock']} in stock for {p['name']}")


@router.get("", summary="Get my cart with totals")
async def get_cart(delivery: str = Query("standard"), user=Depends(current_user)):
    return await respond(str(user["_id"]), delivery=norm_delivery(delivery))


# PART 8: add-ons for the Cart upsell strip - same categories first, then top sellers,
# always excluding what is already in the cart. Declared before /items/{product_id}.
@router.get("/upsell", summary="Cart upsell picks (excludes cart items)")
async def upsell(limit: int = Query(6, ge=1, le=12), user=Depends(current_user)):
    uid = str(user["_id"])
    raw = await raw_items(uid)
    in_cart = {i["product_id"] for i in raw}
    ids = [oid(i["product_id"]) for i in raw]
    cats = [p["category_id"] async for p in mongo.db.products.find({"_id": {"$in": ids}}, {"category_id": 1})] if ids else []
    out, seen = [], set(in_cart)

    async def grab(f, sort=None):
        cur = mongo.db.products.find(f)
        if sort:
            cur = cur.sort(*sort)
        async for p in cur.limit(limit * 3):
            if len(out) >= limit:
                return
            s = ser(p)
            if s["id"] in seen:
                continue
            out.append(s)
            seen.add(s["id"])

    base = {"active": True, "stock": {"$gt": 0}}
    if cats:
        await grab({**base, "category_id": {"$in": cats}})
    if len(out) < limit:  # top up from the most discounted picks
        await grab(base, ("discount", -1))
    return {"success": True, "data": out}


@router.post("/items", summary="Add a product (increments if already in cart)")
async def add_item(body: CartAdd, delivery: str = Query("standard"), user=Depends(current_user)):
    uid = str(user["_id"])
    raw = await raw_items(uid)
    cur = next((i for i in raw if i["product_id"] == body.product_id), None)
    new_qty = (cur["quantity"] if cur else 0) + body.quantity
    await check_stock(body.product_id, new_qty)
    if cur:
        cur["quantity"] = new_qty
        if body.unit:
            cur["unit"] = body.unit
    else:
        raw.append({"product_id": body.product_id, "quantity": new_qty, "unit": body.unit or None})
    await save(uid, raw)
    return await respond(uid, "Added to cart", norm_delivery(delivery))


@router.put("/items/{product_id}", summary="Set quantity (0 removes)")
async def set_qty(product_id: str, body: CartQty, delivery: str = Query("standard"), user=Depends(current_user)):
    uid = str(user["_id"])
    raw = await raw_items(uid)
    cur = next((i for i in raw if i["product_id"] == product_id), None)
    if not cur:
        raise HTTPException(404, "Item not in cart")
    if body.quantity == 0:
        raw.remove(cur)
    else:
        await check_stock(product_id, body.quantity)
        cur["quantity"] = body.quantity
        if body.unit:
            cur["unit"] = body.unit
    await save(uid, raw)
    return await respond(uid, "Cart updated", norm_delivery(delivery))


@router.delete("/items/{product_id}", summary="Remove a product")
async def remove_item(product_id: str, delivery: str = Query("standard"), user=Depends(current_user)):
    uid = str(user["_id"])
    await save(uid, [i for i in await raw_items(uid) if i["product_id"] != product_id])
    return await respond(uid, "Item removed", norm_delivery(delivery))


@router.delete("", summary="Clear cart")
async def clear_cart(delivery: str = Query("standard"), user=Depends(current_user)):
    await mongo.db.cart.delete_one({"user_id": str(user["_id"])})
    return await respond(str(user["_id"]), "Cart cleared", norm_delivery(delivery))
