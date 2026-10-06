"""Repairs the image URLs stored in MongoDB WITHOUT resetting users / carts / orders / addresses.

Run from the backend folder (venv active, MongoDB running):
    python fix_image_urls.py http://10.11.193.215:8000

What it does
 - products + categories: for every document it looks for backend/static/<kind>/<slug>.(jpg|jpeg|png|webp)
   (and <slug>-2 ... <slug>-5 for gallery photos) and stores http://<PC-IP>:8000/static/... .
   This also replaces the old green "text" placeholder images (placehold.co) that were saved when the seed ran
   before the photos existed. If no photo file exists for a document, its current image is left untouched.
 - banners: only the host of existing /static/ URLs is changed.
Re-run it whenever your PC's IP changes."""
import re
import sys

from pymongo import MongoClient

from app.core.config import settings
from seed.images import image_urls

if len(sys.argv) != 2 or not re.fullmatch(r"https?://[\w.\-]+(:\d+)?", sys.argv[1].rstrip("/")):
    sys.exit("Usage: python fix_image_urls.py http://<PC-IP>:8000")
BASE = sys.argv[1].rstrip("/")
STATIC = re.compile(r"^https?://[^/]+(/static/.+)$")


def rehost(u):
    m = STATIC.match(u) if isinstance(u, str) else None
    return BASE + m.group(1) if m else u


def real_files(kind, slug, name):
    """URLs of photos that exist on disk, or [] when there are none (image_urls() then returns a placeholder)."""
    urls = image_urls(kind, slug, name, base=BASE)
    return [u for u in urls if u.startswith(BASE + "/static/")]


db = MongoClient(settings.mongo_url, serverSelectionTimeoutMS=3000)[settings.database_name]
stats = {"products": 0, "categories": 0, "banners": 0}
for col, kind in (("products", "products"), ("categories", "categories")):
    for d in db[col].find({}, {"slug": 1, "name": 1, "images": 1, "image": 1}):
        urls = real_files(kind, d.get("slug") or "", d.get("name") or "")
        if not urls:
            continue
        upd = {"images": urls} if col == "products" else {"image": urls[0]}
        cur = d.get("images") if col == "products" else d.get("image")
        if (upd.get("images") or upd.get("image")) != cur:
            db[col].update_one({"_id": d["_id"]}, {"$set": upd})
            stats[col] += 1
for d in db.banners.find({}, {"image": 1}):
    new = rehost(d.get("image"))
    if new != d.get("image"):
        db.banners.update_one({"_id": d["_id"]}, {"$set": {"image": new}})
        stats["banners"] += 1
print(f"Updated: {stats['products']} products, {stats['categories']} categories, {stats['banners']} banners  ->  {BASE}")
print("Test in the phone browser: " + BASE + "/static/products/bananas-robusta.png")
