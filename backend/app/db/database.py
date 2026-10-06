import contextvars
import re
from pathlib import Path

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError

from app.core.config import settings

client = None
db = None  # use `from app.db import database as mongo` then `mongo.db.users`


async def connect():
    global client, db
    client = AsyncIOMotorClient(settings.mongo_url, serverSelectionTimeoutMS=3000)
    try:
        await client.admin.command("ping")
    except PyMongoError as e:
        raise RuntimeError(f"Cannot connect to MongoDB at {settings.mongo_url}. Is MongoDB running?") from e
    db = client[settings.database_name]
    await db.users.create_index("email", unique=True)
    await db.categories.create_index("slug", unique=True)


def close():
    if client:
        client.close()


def oid(value, what: str = "ID") -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(400, f"Invalid {what}")


# ---------------- PART 15: image URLs are resolved when the API answers ----------------
# Old rows can hold placehold.co text images or a stale PC address (10.0.2.2, an old Wi-Fi IP).
# Instead of trusting the stored text, every product / category / banner / order line gets a URL built from
#   - the address the phone actually used to reach this server (Host header), and
#   - the file that really exists in backend/static (products/<slug>.jpg, .jpeg, .webp, .png - lightest first).
# So a changed IP or an un-run fix_image_urls.py can no longer produce missing product photos.
request_base = contextvars.ContextVar("request_base", default=None)
_STATIC_DIR = Path(__file__).resolve().parent.parent.parent / "static"
_EXTS = ("jpg", "jpeg", "webp", "png")
_STATIC_RX = re.compile(r"^https?://[^/]+/static/(products|categories|banners)/([^/?#]+)$")


def _base() -> str:
    b = request_base.get()
    if b:
        return b.rstrip("/")
    try:  # scripts / tests without a request: PUBLIC_BASE_URL from backend/.env
        from seed.images import base_url
        return base_url()
    except Exception:
        return ""


def _file(kind: str, stem: str):
    if not stem or "/" in stem or "\\" in stem or stem.startswith("."):
        return None
    for e in _EXTS:
        if (_STATIC_DIR / kind / f"{stem}.{e}").is_file():
            return f"{stem}.{e}"
    return None


def _stem(kind: str, slug: str):
    """Photo name for a slug. Exact match first; otherwise the photo whose name starts with the slug, because
    a database seeded earlier may call a product 'Fresh Apples' (slug fresh-apples) while the photo file is
    fresh-apples-shimla.jpg - same for bananas, tomato, potato, onion, pomegranate, green-grapes."""
    if _file(kind, slug):
        return slug
    try:
        stems = sorted({p.stem for p in (_STATIC_DIR / kind).iterdir()
                        if p.suffix.lower().lstrip(".") in _EXTS and p.stem.startswith(slug + "-") and not re.search(r"-\d$", p.stem)})
    except OSError:
        return None
    return stems[0] if slug and stems else None


def _local_urls(kind: str, slug: str, base: str) -> list:
    out = []
    real = _stem(kind, slug)
    if not real:
        return out
    for stem in [real] + [f"{real}-{i}" for i in range(2, 6)]:
        f = _file(kind, stem)
        if f:
            out.append(f"{base}/static/{kind}/{f}")
    return out


def _rehost(u, base: str):
    """A stored /static/ URL -> same file on the current host (lightest existing format); other URLs unchanged."""
    m = _STATIC_RX.match(u) if isinstance(u, str) else None
    if not m:
        return u
    kind, name = m.groups()
    stem = name.rsplit(".", 1)[0]
    f = _file(kind, _stem(kind, stem) or stem) or name
    return f"{base}/static/{kind}/{f}"


def _fix_images(doc: dict, out: dict) -> None:
    base = _base()
    if not base:
        return
    slug = out.get("slug") or ""
    imgs, img = out.get("images"), out.get("image")
    if "category_id" in doc and isinstance(imgs, list):  # product
        out["images"] = (_local_urls("products", slug, base) if slug else []) or [_rehost(u, base) for u in imgs]
    elif "slug" in doc and "title" not in doc and isinstance(img, str):  # category
        local = _local_urls("categories", slug, base)
        out["image"] = local[0] if local else _rehost(img, base)
    elif isinstance(img, str):  # banner
        out["image"] = _rehost(img, base)
    if isinstance(out.get("items"), list):  # order / cart lines keep a photo URL
        out["items"] = [{**i, "image": _rehost(i["image"], base)} if isinstance(i, dict) and isinstance(i.get("image"), str) else i
                        for i in out["items"]]


def ser(doc):
    """Mongo document -> JSON-safe dict (ObjectId -> str, _id -> id, no password hash, live image URLs)."""
    if doc is None:
        return None
    out = {}
    for k, v in doc.items():
        if k == "password_hash":
            continue
        out["id" if k == "_id" else k] = str(v) if isinstance(v, ObjectId) else v
    _fix_images(doc, out)
    return out
