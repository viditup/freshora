"""Run from the backend folder:  python -m seed.seed_data"""
import asyncio
import os
import random
from datetime import datetime, timezone
from urllib.parse import quote_plus

from app.core.security import hash_password
from app.routes.catalog import slugify
from seed.images import image_url, image_urls

DEFAULT_PASSWORD = os.getenv("SEED_PASSWORD", "Freshora@123")  # dev-only demo password

# PART 6A: the design's 12 categories (All Categories screen), in design order.
CATEGORIES = [("Fruits & Vegetables", "Fresh produce, picked daily"), ("Dairy & Breakfast", "Milk, eggs, bread and cereals"),
              ("Snacks & Beverages", "Chips, cookies and cold drinks"), ("Atta, Rice & Staples", "Atta, rice, dal and oils"),
              ("Household Essentials", "Kitchen and home basics"), ("Personal Care", "Everyday personal care"),
              ("Baby Care", "Gentle care for little ones"), ("Pet Care", "Food and care for pets"),
              ("Organic Products", "Natural and organic picks"), ("Healthy Snacks", "Nuts, makhana and bars"),
              ("Beverages", "Tea, coffee and juices"), ("Cleaning Essentials", "Cleaners and detergents")]

# (name, category, subcategory, price, original_price, unit, brand, organic)
# subcategory drives the chip row, brand + organic drive the filter bar.
PRODUCTS = [
    # Fruits & Vegetables (chips: Fresh Fruits, Fresh Vegetables, Leafy Greens, Exotic Fruits, Herbs & Seasonings, Organic)
    ("Fresh Apples (Shimla)", "Fruits & Vegetables", "Fresh Fruits", 149, 179, "1 kg", "Orchard Fresh", False),
    ("Bananas (Robusta)", "Fruits & Vegetables", "Fresh Fruits", 49, 55, "1 dozen", "Freshora Farm", False),
    ("Green Grapes (Nashik)", "Fruits & Vegetables", "Fresh Fruits", 99, 120, "500 g", "Freshora Farm", False),
    ("Pomegranate (Bhagwa)", "Fruits & Vegetables", "Exotic Fruits", 189, 220, "1 kg", "Orchard Fresh", False),
    ("Dragon Fruit", "Fruits & Vegetables", "Exotic Fruits", 120, 140, "2 pcs", "Orchard Fresh", False),
    ("Kiwi", "Fruits & Vegetables", "Exotic Fruits", 99, 115, "3 pcs", "Orchard Fresh", False),
    ("Tomato (Hybrid)", "Fruits & Vegetables", "Fresh Vegetables", 32, 40, "1 kg", "Freshora Farm", False),
    ("Potato (Agra)", "Fruits & Vegetables", "Fresh Vegetables", 30, 36, "1 kg", "Freshora Farm", False),
    ("Onion (Nashik)", "Fruits & Vegetables", "Fresh Vegetables", 35, 42, "1 kg", "Freshora Farm", False),
    ("Cauliflower", "Fruits & Vegetables", "Fresh Vegetables", 45, 55, "1 pc", "Freshora Farm", False),
    ("Carrot", "Fruits & Vegetables", "Fresh Vegetables", 40, 48, "500 g", "Freshora Farm", False),
    ("Cucumber", "Fruits & Vegetables", "Fresh Vegetables", 30, 36, "500 g", "Freshora Farm", False),
    ("Broccoli", "Fruits & Vegetables", "Fresh Vegetables", 69, 80, "1 pc", "Freshora Farm", False),
    ("Spinach", "Fruits & Vegetables", "Leafy Greens", 25, 30, "250 g", "GreenLeaf Organics", True),
    ("Coriander Leaves", "Fruits & Vegetables", "Herbs & Seasonings", 15, 20, "100 g", "Freshora Farm", False),
    ("Fresh Mint", "Fruits & Vegetables", "Herbs & Seasonings", 12, 15, "50 g", "Freshora Farm", False),
    ("Green Chilli", "Fruits & Vegetables", "Herbs & Seasonings", 20, 25, "100 g", "Freshora Farm", False),
    ("Organic Bananas", "Fruits & Vegetables", "Organic", 69, 80, "1 dozen", "GreenLeaf Organics", True),
    # Dairy & Breakfast
    ("Full Cream Milk", "Dairy & Breakfast", "Milk & Curd", 33, 33, "500 ml", "Daily Dairy", False),
    ("Fresh Curd", "Dairy & Breakfast", "Milk & Curd", 40, 45, "400 g", "Daily Dairy", False),
    ("Paneer", "Dairy & Breakfast", "Cheese & Paneer", 95, 110, "200 g", "Daily Dairy", False),
    ("Salted Butter", "Dairy & Breakfast", "Butter & Ghee", 58, 62, "100 g", "Daily Dairy", False),
    ("Farm Eggs", "Dairy & Breakfast", "Eggs", 84, 96, "12 pcs", "Daily Dairy", False),
    ("Brown Bread", "Dairy & Breakfast", "Breads", 45, 50, "400 g", "Bakers Oven", False),
    ("Pav Buns", "Dairy & Breakfast", "Buns & Pav", 35, 40, "6 pcs", "Bakers Oven", False),
    ("Chocolate Muffin", "Dairy & Breakfast", "Cakes & Muffins", 60, 75, "2 pcs", "Bakers Oven", False),
    ("Corn Flakes", "Dairy & Breakfast", "Cereals", 185, 210, "475 g", "Pantry Pure", False),
    ("Rolled Oats", "Dairy & Breakfast", "Cereals", 120, 140, "1 kg", "Pantry Pure", False),
    # Snacks & Beverages
    ("Potato Chips", "Snacks & Beverages", "Chips & Namkeen", 20, 20, "90 g", "Pantry Pure", False),
    ("Namkeen Mix", "Snacks & Beverages", "Chips & Namkeen", 55, 60, "200 g", "Pantry Pure", False),
    ("Salted Peanuts", "Snacks & Beverages", "Nuts & Dry Fruits", 45, 50, "200 g", "Pantry Pure", False),
    ("Dark Cookies", "Snacks & Beverages", "Cookies", 80, 95, "150 g", "Bakers Oven", False),
    ("Cold Coffee", "Snacks & Beverages", "Cold Drinks", 55, 65, "200 ml", "Pantry Pure", False),
    # Atta, Rice & Staples
    ("Basmati Rice", "Atta, Rice & Staples", "Rice & Atta", 499, 580, "5 kg", "Pantry Pure", False),
    ("Whole Wheat Atta", "Atta, Rice & Staples", "Rice & Atta", 265, 295, "5 kg", "Pantry Pure", False),
    ("Toor Dal", "Atta, Rice & Staples", "Dals & Pulses", 165, 190, "1 kg", "Pantry Pure", False),
    ("Sunflower Oil", "Atta, Rice & Staples", "Oils", 155, 175, "1 L", "Pantry Pure", False),
    ("Iodised Salt", "Atta, Rice & Staples", "Salt & Sugar", 28, 30, "1 kg", "Pantry Pure", False),
    ("Sugar", "Atta, Rice & Staples", "Salt & Sugar", 52, 58, "1 kg", "Pantry Pure", False),
    # Household Essentials
    ("Kitchen Towels", "Household Essentials", "Kitchen Basics", 99, 120, "2 rolls", "HomeShine", False),
    ("Garbage Bags", "Household Essentials", "Kitchen Basics", 85, 100, "30 pcs", "HomeShine", False),
    ("Aluminium Foil", "Household Essentials", "Kitchen Basics", 110, 130, "9 m", "HomeShine", False),
    # Personal Care
    ("Toothpaste", "Personal Care", "Oral Care", 89, 99, "150 g", "CareOne", False),
    ("Bath Soap", "Personal Care", "Bath & Body", 120, 140, "Pack of 4", "CareOne", False),
    ("Hand Wash", "Personal Care", "Bath & Body", 79, 90, "250 ml", "CareOne", False),
    ("Shampoo", "Personal Care", "Hair Care", 180, 210, "340 ml", "CareOne", False),
    # Baby Care
    ("Baby Diapers", "Baby Care", "Diapers", 599, 699, "54 pcs", "TinyCare", False),
    ("Baby Wipes", "Baby Care", "Wipes", 149, 175, "72 pcs", "TinyCare", False),
    ("Baby Lotion", "Baby Care", "Baby Skin Care", 210, 240, "200 ml", "TinyCare", False),
    # Pet Care
    ("Dog Food", "Pet Care", "Dog Food", 399, 450, "3 kg", "PawPals", False),
    ("Cat Food", "Pet Care", "Cat Food", 249, 280, "1.2 kg", "PawPals", False),
    ("Pet Shampoo", "Pet Care", "Grooming", 199, 230, "250 ml", "PawPals", False),
    # Organic Products
    ("Organic Honey", "Organic Products", "Organic Pantry", 249, 299, "500 g", "GreenLeaf Organics", True),
    ("Organic Jaggery", "Organic Products", "Organic Sweeteners", 89, 105, "500 g", "GreenLeaf Organics", True),
    ("Organic Turmeric Powder", "Organic Products", "Organic Pantry", 120, 140, "200 g", "GreenLeaf Organics", True),
    # Healthy Snacks
    ("Roasted Makhana", "Healthy Snacks", "Makhana", 149, 180, "100 g", "Pantry Pure", False),
    ("Mixed Nuts", "Healthy Snacks", "Nuts & Dry Fruits", 349, 400, "250 g", "Pantry Pure", False),
    ("Almonds", "Healthy Snacks", "Nuts & Dry Fruits", 299, 350, "250 g", "Pantry Pure", False),
    ("Granola Bars", "Healthy Snacks", "Protein Bars", 120, 140, "6 bars", "Pantry Pure", False),
    # Beverages
    ("Orange Juice", "Beverages", "Juices", 99, 120, "1 L", "Orchard Fresh", False),
    ("Coconut Water", "Beverages", "Juices", 45, 50, "200 ml", "Orchard Fresh", False),
    ("Mixed Fruit Juice", "Beverages", "Juices", 99, 110, "1 L", "Orchard Fresh", False),
    ("Green Tea", "Beverages", "Tea & Coffee", 150, 180, "25 bags", "Pantry Pure", True),
    ("Instant Coffee", "Beverages", "Tea & Coffee", 220, 250, "100 g", "Pantry Pure", False),
    # Cleaning Essentials
    ("Dishwash Liquid", "Cleaning Essentials", "Dishwashing", 99, 115, "500 ml", "HomeShine", False),
    ("Floor Cleaner", "Cleaning Essentials", "Floor & Surface", 149, 175, "1 L", "HomeShine", False),
    ("Glass Cleaner", "Cleaning Essentials", "Floor & Surface", 99, 115, "500 ml", "HomeShine", False),
    ("Toilet Cleaner", "Cleaning Essentials", "Bathroom", 95, 110, "500 ml", "HomeShine", False),
    ("Laundry Detergent", "Cleaning Essentials", "Laundry", 249, 280, "1 kg", "HomeShine", False),
]
# PART 7A: short tagline under the product title (design: "Fresh & Juicy"), by sub-category.
TAGLINES = {"Fresh Fruits": "Fresh & Juicy", "Exotic Fruits": "Exotic & Sweet", "Fresh Vegetables": "Farm Fresh & Crisp", "Leafy Greens": "Green & Tender",
            "Herbs & Seasonings": "Aromatic & Fresh", "Organic": "Naturally Grown", "Milk & Curd": "Pure & Creamy", "Cheese & Paneer": "Soft & Fresh",
            "Eggs": "Farm Fresh", "Breads": "Soft & Freshly Baked", "Cereals": "Wholesome Breakfast"}
DEFAULT_TAGLINE = "Quality Checked & Fresh"

FEATURED = {"Fresh Apples (Shimla)", "Tomato (Hybrid)", "Bananas (Robusta)", "Full Cream Milk", "Paneer", "Brown Bread", "Orange Juice",
            "Basmati Rice", "Organic Honey", "Spinach", "Carrot", "Farm Eggs", "Dragon Fruit", "Broccoli"}


def img(text: str) -> str:  # stable public placeholder, never broken
    return f"https://placehold.co/600x600/E6F2E6/1B7F3B/png?text={quote_plus(text)}"


async def seed(db):
    now = datetime.now(timezone.utc)
    rnd = random.Random(42)
    for col in ("categories", "products", "banners", "cart", "orders", "addresses"):
        await db[col].delete_many({})
    cats = {}
    for name, desc in CATEGORIES:
        doc = {"name": name, "slug": slugify(name), "image": image_url("categories", slugify(name), name), "description": desc, "active": True}
        doc["_id"] = (await db.categories.insert_one(doc)).inserted_id
        cats[name] = doc
    for name, cat, sub, price, orig, unit, brand, organic in PRODUCTS:
        c = cats[cat]
        await db.products.insert_one({
            "name": name, "slug": slugify(name), "description": f"Fresh, quality-checked {name.lower()} delivered to your door.",
            "price": price, "original_price": orig, "discount": round((orig - price) / orig * 100), "images": image_urls("products", slugify(name), name),
            "category_id": str(c["_id"]), "category_name": cat, "category_slug": c["slug"],
            "tagline": TAGLINES.get(sub, DEFAULT_TAGLINE), "subcategory": sub, "subcategory_slug": slugify(sub), "brand": brand, "organic": organic,
            "stock": rnd.randint(20, 100),
            "unit": unit, "rating": round(rnd.uniform(4.0, 4.9), 1), "review_count": rnd.randint(10, 400),
            "featured": name in FEATURED, "active": True, "created_at": now})
    await db.banners.insert_many([
        {"title": "Freshness at your doorstep in minutes", "subtitle": "Fresh groceries, delivered fast", "image": image_url("banners", "banner-fresh", "Fresh and Healthy"), "action_type": "category", "action_value": "fruits-vegetables", "active": True},
        {"title": "Groceries in 10 Minutes", "subtitle": "Free delivery above Rs 499", "image": image_url("banners", "banner-delivery", "10 Minute Delivery"), "action_type": "none", "action_value": "", "active": True},
        {"title": "Go Organic", "subtitle": "Pure and natural picks", "image": image_url("banners", "banner-organic", "Go Organic"), "action_type": "category", "action_value": "organic-products", "active": True}])
    for name, email, phone, role in [("Freshora Admin", "admin@freshora.com", "9000000000", "admin"),
                                     ("Aryan Mangla", "aryan@freshora.com", "9000000001", "customer"),
                                     ("Priya Sharma", "priya@freshora.com", "9000000002", "customer")]:
        await db.users.update_one({"email": email}, {"$set": {"name": name, "phone": phone, "role": role, "active": True,
                                  "password_hash": hash_password(DEFAULT_PASSWORD), "profile_image": None},
                                  "$setOnInsert": {"created_at": now}}, upsert=True)
    return len(CATEGORIES), len(PRODUCTS)


async def main():
    from app.db import database as mongo
    await mongo.connect()
    c, p = await seed(mongo.db)
    print(f"Seeded {c} categories, {p} products, banners and 3 users (password: {DEFAULT_PASSWORD})")
    mongo.close()


if __name__ == "__main__":
    asyncio.run(main())
