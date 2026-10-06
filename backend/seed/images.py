"""PART 3B: resolve image URLs for the seed.
Looks for real files in backend/static/<kind>/<slug>.(jpg|jpeg|png|webp); extra gallery photos are
<slug>-2.jpg, <slug>-3.jpg ... If no file exists the old placehold.co image is used, so the app never breaks.
PUBLIC_BASE_URL must be reachable from the phone (e.g. http://192.168.1.5:8000) - set it in backend/.env.
"""
import os
from pathlib import Path
from urllib.parse import quote_plus

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
EXTS = ("jpg", "jpeg", "png", "webp")


ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


def _from_env_file(key: str, env_file: Path = None):
    """The app's Settings class reads backend/.env but does NOT export it to os.environ, so os.getenv() alone
    never saw PUBLIC_BASE_URL. Read the file directly (no extra package, no secret validation needed)."""
    try:
        for line in (env_file or ENV_FILE).read_text(encoding="utf-8").splitlines():
            k, sep, v = line.strip().partition("=")
            if sep and k.strip() == key:
                return v.strip().strip("\"'")
    except OSError:
        pass
    return None


def base_url() -> str:
    """Order: real environment variable, then backend/.env, then the Android-emulator default."""
    v = os.getenv("PUBLIC_BASE_URL") or _from_env_file("PUBLIC_BASE_URL") or "http://10.0.2.2:8000"
    return v.rstrip("/")


def placeholder(text: str) -> str:
    return f"https://placehold.co/600x600/E6F2E6/1B7F3B/png?text={quote_plus(text)}"


def _find(kind: str, stem: str, static_dir: Path = STATIC_DIR):
    for ext in EXTS:
        if (static_dir / kind / f"{stem}.{ext}").is_file():
            return f"{stem}.{ext}"
    return None


def image_urls(kind: str, slug: str, text: str, max_gallery: int = 5, static_dir: Path = STATIC_DIR, base: str = None):
    """List of URLs: main photo, then -2, -3 ... if present. Falls back to one placeholder."""
    base = base if base is not None else base_url()
    out = []
    for stem in [slug] + [f"{slug}-{i}" for i in range(2, max_gallery + 1)]:
        f = _find(kind, stem, static_dir)
        if f:
            out.append(f"{base}/static/{kind}/{f}")
    return out or [placeholder(text)]


def image_url(kind: str, slug: str, text: str, **kw) -> str:
    return image_urls(kind, slug, text, **kw)[0]
