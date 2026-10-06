"""Run from the backend folder:  python -m seed.list_images
Prints which product / category photos are still missing in backend/static (file names to create)."""
from seed.seed_data import CATEGORIES, PRODUCTS
from seed.images import _find
from app.routes.catalog import slugify


def main():
    miss = 0
    for kind, names in (("categories", [c[0] for c in CATEGORIES]), ("products", [p[0] for p in PRODUCTS])):
        print(f"\n== static/{kind}/  (<slug>.jpg ; extra photos <slug>-2.jpg, <slug>-3.jpg)")
        for n in names:
            slug = slugify(n)
            ok = _find(kind, slug)
            miss += 0 if ok else 1
            print(f"  [{'OK' if ok else '--'}] {slug}.jpg   <- {n}")
    print(f"\nMissing: {miss}")


if __name__ == "__main__":
    main()
