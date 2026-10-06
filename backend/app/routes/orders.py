from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.db import database as mongo
from app.db.database import oid, ser
from app.dependencies.auth import current_user
from app.routes.cart import build_cart
from app.schemas import AddressIn, OrderIn

addresses = APIRouter(prefix="/addresses", tags=["Addresses"])
router = APIRouter(prefix="/orders", tags=["Orders"])
now = lambda: datetime.now(timezone.utc)


# ---------- Addresses ----------
async def unset_defaults(uid: str):
    await mongo.db.addresses.update_many({"user_id": uid}, {"$set": {"is_default": False}})


async def own_address(address_id: str, uid: str):
    a = await mongo.db.addresses.find_one({"_id": oid(address_id, "address ID"), "user_id": uid})
    if not a:
        raise HTTPException(404, "Address not found")
    return a


@addresses.get("", summary="My addresses")
async def list_addresses(user=Depends(current_user)):
    cur = mongo.db.addresses.find({"user_id": str(user["_id"])}).sort("is_default", -1)
    return {"success": True, "data": [ser(a) async for a in cur]}


@addresses.post("", status_code=201, summary="Add address (first one becomes default)")
async def add_address(body: AddressIn, user=Depends(current_user)):
    uid = str(user["_id"])
    doc = {**body.model_dump(), "user_id": uid, "created_at": now()}
    if await mongo.db.addresses.count_documents({"user_id": uid}) == 0:
        doc["is_default"] = True
    if doc["is_default"]:
        await unset_defaults(uid)
    doc["_id"] = (await mongo.db.addresses.insert_one(doc)).inserted_id
    return {"success": True, "message": "Address added", "address": ser(doc)}


@addresses.put("/{address_id}", summary="Update address")
async def update_address(address_id: str, body: AddressIn, user=Depends(current_user)):
    uid = str(user["_id"])
    await own_address(address_id, uid)
    if body.is_default:
        await unset_defaults(uid)
    await mongo.db.addresses.update_one({"_id": oid(address_id)}, {"$set": body.model_dump()})
    return {"success": True, "message": "Address updated", "address": ser(await own_address(address_id, uid))}


@addresses.delete("/{address_id}", summary="Delete address")
async def delete_address(address_id: str, user=Depends(current_user)):
    uid = str(user["_id"])
    a = await own_address(address_id, uid)
    await mongo.db.addresses.delete_one({"_id": a["_id"]})
    if a.get("is_default"):  # promote another address so one is always default
        nxt = await mongo.db.addresses.find_one({"user_id": uid})
        if nxt:
            await mongo.db.addresses.update_one({"_id": nxt["_id"]}, {"$set": {"is_default": True}})
    return {"success": True, "message": "Address deleted"}


@addresses.post("/{address_id}/default", summary="Make default")
async def make_default(address_id: str, user=Depends(current_user)):
    uid = str(user["_id"])
    await own_address(address_id, uid)
    await unset_defaults(uid)
    await mongo.db.addresses.update_one({"_id": oid(address_id)}, {"$set": {"is_default": True}})
    return {"success": True, "message": "Default address updated"}


# ---------- Orders ----------
async def restore_stock(order: dict):
    for i in order["items"]:
        await mongo.db.products.update_one({"_id": oid(i["product_id"])}, {"$inc": {"stock": i["quantity"]}})


@router.post("", status_code=201, summary="Place order from my cart (totals computed server-side)")
async def create_order(body: OrderIn, user=Depends(current_user)):
    uid = str(user["_id"])
    items, s = await build_cart(uid, body.delivery_option)  # PART 8: totals priced for the chosen delivery option
    if not items:
        raise HTTPException(400, "Your cart is empty")
    addr = await own_address(body.address_id, uid)
    done = []
    for i in items:  # atomic per-product stock decrement; roll back if any item is short
        r = await mongo.db.products.update_one({"_id": oid(i["product_id"]), "stock": {"$gte": i["quantity"]}},
                                               {"$inc": {"stock": -i["quantity"]}})
        if r.modified_count == 0:
            await restore_stock({"items": done})
            raise HTTPException(409, f"Insufficient stock for {i['name']}")
        done.append(i)
    order = {"user_id": uid, "items": [{k: v for k, v in i.items() if k != "stock"} for i in items], **s,
             "address": {k: v for k, v in addr.items() if k not in ("_id", "user_id", "created_at")},
             "payment_method": body.payment_method,
             "payment_status": "pending" if body.payment_method == "COD" else "paid",  # DEMO: online methods settle instantly
             "order_status": "pending", "created_at": now(), "updated_at": now()}
    order["_id"] = (await mongo.db.orders.insert_one(order)).inserted_id
    await mongo.db.cart.delete_one({"user_id": uid})
    return {"success": True, "message": "Order placed successfully", "order": ser(order)}


@router.get("", summary="My orders (newest first)")
async def my_orders(user=Depends(current_user)):
    cur = mongo.db.orders.find({"user_id": str(user["_id"])}).sort("created_at", -1)
    return {"success": True, "data": [ser(o) async for o in cur]}


async def own_order(order_id: str, uid: str):
    o = await mongo.db.orders.find_one({"_id": oid(order_id, "order ID"), "user_id": uid})
    if not o:
        raise HTTPException(404, "Order not found")
    return o


@router.get("/{order_id}", summary="Order details")
async def order_details(order_id: str, user=Depends(current_user)):
    return {"success": True, "order": ser(await own_order(order_id, str(user["_id"])))}


@router.post("/{order_id}/cancel", summary="Cancel (only while pending/confirmed)")
async def cancel(order_id: str, user=Depends(current_user)):
    o = await own_order(order_id, str(user["_id"]))
    if o["order_status"] not in ("pending", "confirmed"):
        raise HTTPException(400, f"Cannot cancel an order that is {o['order_status']}")
    pay = "refunded" if o["payment_status"] == "paid" else "cancelled"
    # SECURITY: claim the cancellation atomically first, so two parallel requests cannot both restore stock.
    r = await mongo.db.orders.update_one({"_id": o["_id"], "order_status": {"$in": ["pending", "confirmed"]}},
                                         {"$set": {"order_status": "cancelled", "payment_status": pay, "updated_at": now()}})
    if r.modified_count == 0:
        raise HTTPException(400, "This order can no longer be cancelled")
    await restore_stock(o)
    return {"success": True, "message": "Order cancelled", "order": ser(await own_order(order_id, str(user["_id"])))}
