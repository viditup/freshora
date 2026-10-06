"""End-to-end API test on an in-memory Mongo (no MongoDB install needed):
   pip install -r requirements-dev.txt && python -m tests.smoke_test"""
import os
os.environ.setdefault("JWT_SECRET", "test-secret-for-unit-tests-only-0123456789")
from fastapi.testclient import TestClient
from mongomock_motor import AsyncMongoMockClient
from app.db import database as mongo
from seed.seed_data import DEFAULT_PASSWORD, seed


async def fake_connect():
    mongo.client = AsyncMongoMockClient()
    mongo.db = mongo.client["test"]
    await mongo.db.users.create_index("email", unique=True)
    await seed(mongo.db)

mongo.connect = fake_connect
from app.main import app


def ok(r, code=200):
    assert r.status_code == code, (r.request.url, r.status_code, r.text)
    return r.json()

with TestClient(app) as c:
    u = {"name": "Test User", "email": "t@example.com", "phone": "9876543210", "password": "secret123"}
    j = ok(c.post("/api/auth/register", json=u), 201); H = {"Authorization": f"Bearer {j['token']}"}
    assert "password" not in str(j)
    assert ok(c.post("/api/auth/register", json=u), 409)["success"] is False
    assert ok(c.post("/api/auth/login", json={"email": u["email"], "password": "bad"}), 401)["message"]
    H = {"Authorization": "Bearer " + ok(c.post("/api/auth/login", json=u))["token"]}
    assert ok(c.get("/api/auth/me", headers=H))["user"]["email"] == u["email"]
    ok(c.get("/api/auth/me", headers={"Authorization": "Bearer junk"}), 401)
    ok(c.put("/api/users/me", json={"name": "New Name"}, headers=H))
    assert len(ok(c.get("/api/categories"))["data"]) == 12
    pr = ok(c.get("/api/products?limit=5&sort=price_asc")); assert pr["pagination"]["total"] == 69
    assert ok(c.get("/api/products/featured"))["data"]
    assert ok(c.get("/api/products/search?q=apple"))["data"][0]["name"].startswith("Fresh Apples")
    assert ok(c.get("/api/products/search?q=dairy"))["data"]
    assert ok(c.get("/api/home"))["banners"]
    pid = pr["data"][0]["id"]; before = ok(c.get(f"/api/products/{pid}"))["data"]["stock"]
    ok(c.post("/api/cart/items", json={"product_id": pid, "quantity": 2}, headers=H))
    cart = ok(c.put(f"/api/cart/items/{pid}", json={"quantity": 3}, headers=H)); print("cart summary:", cart["summary"])
    ok(c.post("/api/cart/items", json={"product_id": pid, "quantity": 9999}, headers=H), 422)
    a = ok(c.post("/api/addresses", json={"name": "Test", "phone": "9876543210", "address_line": "12 MG Road", "city": "Meerut", "state": "UP", "pincode": "250001"}, headers=H), 201)["address"]
    assert a["is_default"]
    o = ok(c.post("/api/orders", json={"address_id": a["id"], "payment_method": "COD"}, headers=H), 201)["order"]
    assert o["order_status"] == "pending" and o["total"] == cart["summary"]["total"]
    assert ok(c.get(f"/api/products/{pid}"))["data"]["stock"] == before - 3
    assert ok(c.get("/api/cart", headers=H))["items"] == []
    assert len(ok(c.get("/api/orders", headers=H))["data"]) == 1
    ok(c.get(f"/api/orders/{o['id']}", headers=H))
    ok(c.get("/api/admin/orders", headers=H), 403)
    A = {"Authorization": "Bearer " + ok(c.post("/api/auth/login", json={"email": "admin@freshora.com", "password": DEFAULT_PASSWORD}))["token"]}
    assert ok(c.get("/api/admin/orders", headers=A))["data"][0]["customer"]["email"] == u["email"]
    ok(c.put(f"/api/admin/orders/{o['id']}/status", json={"status": "shipped"}, headers=A))
    assert ok(c.get(f"/api/orders/{o['id']}", headers=H))["order"]["order_status"] == "shipped"
    ok(c.post(f"/api/orders/{o['id']}/cancel", headers=H), 400)
    np = ok(c.post("/api/admin/products", json={"name": "Test Item", "price": 10, "original_price": 20, "category_id": pr["data"][0]["category_id"], "stock": 5}, headers=A), 201)
    assert np["data"]["discount"] == 50
    # ---- Admin products: update, deactivate, hidden from public ----
    npid = np["data"]["id"]
    ok(c.put(f"/api/admin/products/{npid}", json={"name": "Test Item 2", "price": 15, "original_price": 30, "category_id": np["data"]["category_id"], "stock": 3, "featured": True}, headers=H), 403)
    upd = ok(c.put(f"/api/admin/products/{npid}", json={"name": "Test Item 2", "price": 15, "original_price": 30, "category_id": np["data"]["category_id"], "stock": 3, "featured": True}, headers=A))["data"]
    assert upd["discount"] == 50 and upd["stock"] == 3 and upd["featured"] is True
    ok(c.get(f"/api/products/{npid}"))
    ok(c.delete(f"/api/admin/products/{npid}", headers=A))
    ok(c.get(f"/api/products/{npid}"), 404)
    assert any(x["id"] == npid and x["active"] is False for x in ok(c.get("/api/admin/products?limit=100", headers=A))["data"])
    assert len(ok(c.get("/api/admin/users", headers=A))["data"]) == 4
    # ---- Part 3 endpoints: password, address CRUD/default, online order, cancel ----
    ok(c.put("/api/users/me/password", json={"current_password": "wrong", "new_password": "newsecret1"}, headers=H), 400)
    ok(c.put("/api/users/me/password", json={"current_password": "secret123", "new_password": "newsecret1"}, headers=H))
    ok(c.post("/api/auth/login", json={"email": u["email"], "password": "newsecret1"}))
    ad = {"name": "Test", "phone": "9876543210", "address_line": "12 MG Road", "city": "Meerut", "state": "UP", "pincode": "250001"}
    a2 = ok(c.post("/api/addresses", json={**ad, "city": "Noida", "is_default": True}, headers=H), 201)["address"]
    lst = ok(c.get("/api/addresses", headers=H))["data"]
    assert sum(x["is_default"] for x in lst) == 1 and [x for x in lst if x["is_default"]][0]["id"] == a2["id"]
    assert ok(c.put(f"/api/addresses/{a['id']}", json={**ad, "city": "Delhi"}, headers=H))["address"]["city"] == "Delhi"
    ok(c.post(f"/api/addresses/{a['id']}/default", headers=H))
    ok(c.delete(f"/api/addresses/{a2['id']}", headers=H))
    assert len(ok(c.get("/api/addresses", headers=H))["data"]) == 1
    ok(c.post("/api/cart/items", json={"product_id": pid, "quantity": 1}, headers=H))
    o2 = ok(c.post("/api/orders", json={"address_id": a["id"], "payment_method": "upi"}, headers=H), 201)["order"]
    assert o2["payment_status"] == "paid" and "created_at" in o2
    cn = ok(c.post(f"/api/orders/{o2['id']}/cancel", headers=H))["order"]
    assert cn["order_status"] == "cancelled" and cn["payment_status"] == "refunded"
    ok(c.post(f"/api/orders/{o2['id']}/cancel", headers=H), 400)
    ok(c.post("/api/orders", json={"address_id": a["id"]}, headers=H), 400)  # empty cart rejected
    # ---- Admin: auth, categories, dashboard, order details ----
    ok(c.get("/api/admin/categories"), 401)
    ok(c.get("/api/admin/categories", headers=H), 403)
    ok(c.get("/api/admin/dashboard/stats", headers=H), 403)
    ok(c.post("/api/admin/categories", json={"name": "Hack"}, headers=H), 403)
    nc = ok(c.post("/api/admin/categories", json={"name": "Frozen Foods", "description": "Ice cream"}, headers=A), 201)["data"]
    assert nc["slug"] == "frozen-foods" and nc["image"].startswith("https://")
    ok(c.post("/api/admin/categories", json={"name": "frozen  foods"}, headers=A), 409)
    ok(c.post("/api/admin/categories", json={"name": "x"}, headers=A), 422)
    up = ok(c.put(f"/api/admin/categories/{nc['id']}", json={"name": "Frozen Items", "active": False}, headers=A))["data"]
    assert up["slug"] == "frozen-items" and up["active"] is False
    ok(c.delete(f"/api/admin/categories/{nc['id']}", headers=A))
    ok(c.delete(f"/api/admin/categories/{nc['id']}", headers=A), 404)
    cid = pr["data"][0]["category_id"]
    assert "product(s)" in ok(c.delete(f"/api/admin/categories/{cid}", headers=A), 409)["message"]
    ok(c.put(f"/api/admin/categories/{cid}", json={"name": "Fresh Fruits Deluxe"}, headers=A))
    assert ok(c.get(f"/api/products/{pid}"))["data"]["category_name"] == "Fresh Fruits Deluxe"
    assert all("product_count" in x for x in ok(c.get("/api/admin/categories", headers=A))["data"])
    st = ok(c.get("/api/admin/dashboard/stats", headers=A))["data"]
    assert st["users"] == 4 and st["orders"] == 2 and st["orders_by_status"]["cancelled"] == 1 and st["orders_by_status"]["shipped"] == 1
    assert st["revenue"] == o["total"] and st["recent_orders"][0]["customer"]["email"] == u["email"]
    assert ok(c.get(f"/api/admin/orders/{o['id']}", headers=A))["data"]["customer"]["email"] == u["email"]
    ok(c.get(f"/api/admin/orders/{o['id']}", headers=H), 403)
    ok(c.put(f"/api/admin/orders/{o2['id']}/status", json={"status": "shipped"}, headers=A), 400)  # cancelled is final
    assert ok(c.put(f"/api/admin/orders/{o['id']}/status", json={"status": "delivered"}, headers=A))["order"]["payment_status"] == "paid"
    assert ok(c.get(f"/api/orders/{o['id']}", headers=H))["order"]["order_status"] == "delivered"
    # ---- Part 8: delivery options, free-delivery bar, upsell strip, payment list ----
    ok(c.post("/api/cart/items", json={"product_id": pid, "quantity": 1}, headers=H))
    cs = ok(c.get("/api/cart", headers=H))
    payable = round(cs["summary"]["subtotal"] - cs["summary"]["discount"], 2)
    assert cs["summary"]["free_delivery_above"] == 499 and cs["summary"]["amount_for_free_delivery"] == round(499 - payable, 2)
    assert cs["summary"]["delivery_fee"] == 40 and cs["summary"]["eta_minutes"] == 10  # standard, below threshold
    assert cs["delivery"]["option"] == "standard" and [x["key"] for x in cs["delivery"]["options"]] == ["standard", "express"]
    cexp = ok(c.get("/api/cart?delivery=express", headers=H))["summary"]
    assert cexp["delivery_fee"] == 79 and cexp["eta_minutes"] == 5 and cexp["total"] == cs["summary"]["subtotal"] - cs["summary"]["discount"] + 79
    ok(c.get("/api/cart?delivery=foo", headers=H), 422)
    up = ok(c.get("/api/cart/upsell", headers=H))["data"]
    assert up and pid not in [x["id"] for x in up]
    o3 = ok(c.post("/api/orders", json={"address_id": a["id"], "payment_method": "upi", "delivery_option": "express"}, headers=H), 201)["order"]
    assert o3["payment_status"] == "paid" and o3["delivery_option"] == "express" and o3["delivery_fee"] == 79 and o3["eta_minutes"] == 5
    ok(c.post("/api/orders", json={"address_id": a["id"], "payment_method": "paypal"}, headers=H), 422)  # not an allowed demo method
    ok(c.get("/api/products/notanid"), 400)
print("ALL API TESTS PASSED")
