import math
from datetime import datetime, timezone
from typing import Optional

from urllib.parse import quote_plus

from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.errors import DuplicateKeyError

from app.db import database as mongo
from app.db.database import oid, ser
from app.dependencies.auth import admin_user
from app.routes.catalog import product_doc, slugify
from app.routes.orders import restore_stock
from app.schemas import CategoryIn, ProductIn, StatusIn

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(admin_user)])


STATUSES = ("pending", "confirmed", "packed", "shipped", "delivered", "cancelled")


async def with_customers(rows: list):
    """Adds a safe `customer` object (no password hash) to serialized orders."""
    users = {str(u["_id"]): u async for u in mongo.db.users.find({"_id": {"$in": [oid(o["user_id"]) for o in rows]}})}
    for o in rows:
        u = users.get(o["user_id"])
        o["customer"] = {"name": u["name"], "email": u["email"], "phone": u.get("phone")} if u else None
    return rows


@router.get("/users", summary="All users")
async def users(page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=200)):
    cur = mongo.db.users.find().sort("created_at", -1).skip((page - 1) * limit).limit(limit)
    return {"success": True, "data": [ser(u) async for u in cur], "total": await mongo.db.users.count_documents({})}


@router.get("/products", summary="All products incl. inactive")
async def products(page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=200)):
    total = await mongo.db.products.count_documents({})
    cur = mongo.db.products.find().sort("created_at", -1).skip((page - 1) * limit).limit(limit)
    return {"success": True, "data": [ser(p) async for p in cur],
            "pagination": {"page": page, "limit": limit, "total": total, "total_pages": math.ceil(total / limit)}}


@router.post("/products", status_code=201, summary="Create product")
async def create_product(body: ProductIn):
    doc = {**await product_doc(body), "rating": 0, "review_count": 0, "created_at": datetime.now(timezone.utc)}
    doc["_id"] = (await mongo.db.products.insert_one(doc)).inserted_id
    return {"success": True, "data": ser(doc)}


@router.put("/products/{product_id}", summary="Update product")
async def update_product(product_id: str, body: ProductIn):
    r = await mongo.db.products.update_one({"_id": oid(product_id, "product ID")}, {"$set": await product_doc(body)})
    if r.matched_count == 0:
        raise HTTPException(404, "Product not found")
    return {"success": True, "data": ser(await mongo.db.products.find_one({"_id": oid(product_id)}))}


@router.delete("/products/{product_id}", summary="Deactivate product (kept so old orders stay valid)")
async def delete_product(product_id: str):
    r = await mongo.db.products.update_one({"_id": oid(product_id, "product ID")}, {"$set": {"active": False}})
    if r.matched_count == 0:
        raise HTTPException(404, "Product not found")
    return {"success": True, "message": "Product deactivated"}


@router.get("/orders", summary="All orders (optional ?status=)")
async def orders(status: Optional[str] = None, page: int = Query(1, ge=1), limit: int = Query(50, ge=1, le=200)):
    f = {"order_status": status} if status else {}
    total = await mongo.db.orders.count_documents(f)
    data = [ser(o) async for o in mongo.db.orders.find(f).sort("created_at", -1).skip((page - 1) * limit).limit(limit)]
    await with_customers(data)
    return {"success": True, "data": data, "pagination": {"page": page, "limit": limit, "total": total, "total_pages": math.ceil(total / limit)}}


@router.put("/orders/{order_id}/status", summary="Change order status")
async def set_status(order_id: str, body: StatusIn):
    o = await mongo.db.orders.find_one({"_id": oid(order_id, "order ID")})
    if not o:
        raise HTTPException(404, "Order not found")
    if o["order_status"] == "cancelled":
        raise HTTPException(400, "Cancelled orders cannot be changed")
    upd = {"order_status": body.status, "updated_at": datetime.now(timezone.utc)}
    if body.status == "cancelled":
        upd["payment_status"] = "refunded" if o["payment_status"] == "paid" else "cancelled"
    elif body.status == "delivered":
        upd["payment_status"] = "paid"
    r = await mongo.db.orders.update_one({"_id": o["_id"], "order_status": {"$ne": "cancelled"}}, {"$set": upd})
    if r.modified_count == 0:
        raise HTTPException(400, "Cancelled orders cannot be changed")
    if body.status == "cancelled":
        await restore_stock(o)
    return {"success": True, "message": f"Order marked {body.status}", "order": ser(await mongo.db.orders.find_one({"_id": o["_id"]}))}


@router.get("/orders/{order_id}", summary="Order details with customer info")
async def order_details(order_id: str):
    o = await mongo.db.orders.find_one({"_id": oid(order_id, "order ID")})
    if not o:
        raise HTTPException(404, "Order not found")
    return {"success": True, "data": (await with_customers([ser(o)]))[0]}


@router.get("/dashboard/stats", summary="Dashboard statistics (computed from the database)")
async def dashboard_stats():
    db = mongo.db
    by_status = {s: 0 for s in STATUSES}
    async for r in db.orders.aggregate([{"$group": {"_id": "$order_status", "n": {"$sum": 1}}}]):
        by_status[r["_id"]] = r["n"]
    # Revenue excludes cancelled orders (their stock is restored and online payments refunded)
    rev = [r async for r in db.orders.aggregate([{"$match": {"order_status": {"$ne": "cancelled"}}}, {"$group": {"_id": None, "t": {"$sum": "$total"}}}])]
    recent = [ser(o) async for o in db.orders.find().sort("created_at", -1).limit(8)]
    return {"success": True, "data": {
        "users": await db.users.count_documents({}), "products": await db.products.count_documents({}),
        "categories": await db.categories.count_documents({}), "orders": sum(by_status.values()),
        "revenue": round(rev[0]["t"], 2) if rev else 0, "orders_by_status": by_status,
        "recent_orders": await with_customers(recent)}}


# ---------- Categories ----------
async def ensure_unique(slug: str, exclude=None):
    f = {"slug": slug}
    if exclude:
        f["_id"] = {"$ne": exclude}
    if await mongo.db.categories.find_one(f):
        raise HTTPException(409, "A category with this name already exists")


def placeholder(name: str) -> str:
    return f"https://placehold.co/600x600/E6F2E6/1B7F3B/png?text={quote_plus(name)}"


@router.get("/categories", summary="All categories incl. inactive, with product counts")
async def admin_categories():
    counts = {r["_id"]: r["n"] async for r in mongo.db.products.aggregate([{"$group": {"_id": "$category_id", "n": {"$sum": 1}}}])}
    cats = [ser(c) async for c in mongo.db.categories.find().sort("name", 1)]
    for c in cats:
        c["product_count"] = counts.get(c["id"], 0)
    return {"success": True, "data": cats}


@router.post("/categories", status_code=201, summary="Create category")
async def create_category(body: CategoryIn):
    name = body.name.strip()
    slug = slugify(name)
    if not slug:
        raise HTTPException(422, "Category name must contain letters or numbers")
    await ensure_unique(slug)
    doc = {"name": name, "slug": slug, "image": body.image.strip() or placeholder(name), "description": body.description.strip(), "active": body.active}
    try:
        doc["_id"] = (await mongo.db.categories.insert_one(doc)).inserted_id
    except DuplicateKeyError:
        raise HTTPException(409, "A category with this name already exists")
    return {"success": True, "data": ser(doc)}


@router.put("/categories/{category_id}", summary="Update category (renames are propagated to its products)")
async def update_category(category_id: str, body: CategoryIn):
    cid = oid(category_id, "category ID")
    if not await mongo.db.categories.find_one({"_id": cid}):
        raise HTTPException(404, "Category not found")
    name = body.name.strip()
    slug = slugify(name)
    if not slug:
        raise HTTPException(422, "Category name must contain letters or numbers")
    await ensure_unique(slug, cid)
    upd = {"name": name, "slug": slug, "image": body.image.strip() or placeholder(name), "description": body.description.strip(), "active": body.active}
    try:
        await mongo.db.categories.update_one({"_id": cid}, {"$set": upd})
    except DuplicateKeyError:
        raise HTTPException(409, "A category with this name already exists")
    # products store category_name/category_slug copies: keep them in sync
    await mongo.db.products.update_many({"category_id": category_id}, {"$set": {"category_name": name, "category_slug": slug}})
    return {"success": True, "data": ser(await mongo.db.categories.find_one({"_id": cid}))}


@router.delete("/categories/{category_id}", summary="Delete category (blocked while products use it)")
async def delete_category(category_id: str):
    cid = oid(category_id, "category ID")
    if not await mongo.db.categories.find_one({"_id": cid}):
        raise HTTPException(404, "Category not found")
    n = await mongo.db.products.count_documents({"category_id": category_id})
    if n:
        raise HTTPException(409, f"Cannot delete: {n} product(s) use this category. Move or deactivate them first, or mark the category inactive.")
    await mongo.db.categories.delete_one({"_id": cid})
    return {"success": True, "message": "Category deleted"}
