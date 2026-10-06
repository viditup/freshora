import re
import time
from collections import defaultdict, deque
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from pymongo.errors import DuplicateKeyError

from app.core.security import create_token, hash_password, verify_password
from app.db import database as mongo
from app.db.database import ser
from app.dependencies.auth import current_user
from app.schemas import LoginIn, PasswordIn, ProfileIn, RegisterIn

router = APIRouter(prefix="/auth", tags=["Auth"])
users = APIRouter(prefix="/users", tags=["Users"])


# SECURITY: simple in-memory brute-force guard (per IP + email): 5 failed logins -> locked for 15 minutes.
# Resets on server restart; for several server processes use a shared store (e.g. Redis).
MAX_FAILS, LOCK_SECONDS = 5, 15 * 60
FAILS: dict = defaultdict(deque)
DUMMY_HASH = hash_password("timing-equalizer")  # so unknown emails cost the same time as wrong passwords


def login_key(request: Request, email: str) -> str:
    return f"{request.client.host if request.client else 'unknown'}|{email}"


def is_locked(key: str) -> bool:
    q, t = FAILS[key], time.monotonic()
    while q and t - q[0] > LOCK_SECONDS:
        q.popleft()
    if not q:
        FAILS.pop(key, None)
    return len(q) >= MAX_FAILS


def auth_response(user: dict, message: str):
    return {"success": True, "message": message, "token": create_token(str(user["_id"]), user["role"]), "user": ser(user)}


@router.post("/register", status_code=201, summary="Create a customer account")
async def register(body: RegisterIn):
    email = body.email.lower()
    doc = {"name": body.name.strip(), "email": email, "phone": body.phone, "profile_image": None,
           "password_hash": hash_password(body.password), "role": "customer", "active": True,
           "created_at": datetime.now(timezone.utc)}
    try:
        doc["_id"] = (await mongo.db.users.insert_one(doc)).inserted_id
    except DuplicateKeyError:
        raise HTTPException(409, "An account with this email already exists")
    return auth_response(doc, "Registration successful")


def phone_digits(value: str):
    """Last 10 digits of a mobile number (drops +91 / spaces / dashes), or None if it is not a mobile number."""
    d = re.sub(r"\D", "", value)
    return d[-10:] if len(d) >= 10 else None


@router.post("/login", summary="Login with email OR mobile number and receive a JWT")
async def login(body: LoginIn, request: Request):
    ident = body.email.strip().lower()
    key = login_key(request, ident)
    if is_locked(key):
        raise HTTPException(429, "Too many failed attempts. Please try again in 15 minutes.")
    if "@" in ident:
        found = await mongo.db.users.find_one({"email": ident})
        candidates = [found] if found else []
    else:
        d = phone_digits(ident)
        candidates = await mongo.db.users.find({"phone": {"$in": [d, "+91" + d, "91" + d, "0" + d]}}).to_list(5) if d else []
    user = None
    for c in candidates:  # a mobile number could be saved on more than one account: pick the one whose password matches
        if verify_password(body.password, c["password_hash"]):
            user = c
            break
    if not candidates:
        verify_password(body.password, DUMMY_HASH)  # same cost for unknown logins
    if not user:
        FAILS[key].append(time.monotonic())
        raise HTTPException(401, "Invalid email/mobile number or password")
    if not user.get("active", True):
        raise HTTPException(403, "This account is disabled")
    FAILS.pop(key, None)
    return auth_response(user, "Login successful")


@router.get("/me", summary="Current user")
async def me(user=Depends(current_user)):
    return {"success": True, "user": ser(user)}


@router.post("/logout", summary="Logout (client discards the token)")
async def logout(user=Depends(current_user)):
    return {"success": True, "message": "Logged out"}


@users.get("/me", summary="Get profile")
async def get_profile(user=Depends(current_user)):
    return {"success": True, "user": ser(user)}


@users.put("/me", summary="Update profile (name, email, phone, profile_image only)")
async def update_profile(body: ProfileIn, user=Depends(current_user)):
    data = body.model_dump(exclude_none=True)
    if "email" in data:
        data["email"] = data["email"].lower()
        if await mongo.db.users.find_one({"email": data["email"], "_id": {"$ne": user["_id"]}}):
            raise HTTPException(409, "Email already in use")
    if data:
        await mongo.db.users.update_one({"_id": user["_id"]}, {"$set": data})
    return {"success": True, "message": "Profile updated", "user": ser(await mongo.db.users.find_one({"_id": user["_id"]}))}


@users.put("/me/password", summary="Change password")
async def change_password(body: PasswordIn, user=Depends(current_user)):
    if not verify_password(body.current_password, user["password_hash"]):
        raise HTTPException(400, "Current password is incorrect")
    await mongo.db.users.update_one({"_id": user["_id"]}, {"$set": {"password_hash": hash_password(body.new_password)}})
    return {"success": True, "message": "Password changed"}
