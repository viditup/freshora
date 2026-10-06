"""One-shot setup helper for Windows dev (no extra packages needed).

    python setup_env.py              -> detects this PC's Wi-Fi/LAN IP automatically
    python setup_env.py 192.168.1.23 -> use this IP instead
    python setup_env.py --secret-only -> only create .env / fix a weak JWT_SECRET (used by start-backend.bat)

It
 1. creates backend/.env from .env.example if .env is missing,
 2. replaces a missing / short / placeholder JWT_SECRET with a new random one (a good secret is never touched),
 3. sets PUBLIC_BASE_URL=http://<IP>:8000 in backend/.env,
 4. sets HOST = '<IP>' in mobile/src/config.js (nothing else in that file is changed).
Safe to run again whenever your PC's IP changes."""
import re
import secrets
import socket
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent
ENV, EXAMPLE = BACKEND / ".env", BACKEND / ".env.example"
CONFIG_JS = BACKEND.parent / "mobile" / "src" / "config.js"
IPV4 = re.compile(r"^(?:\d{1,3}\.){3}\d{1,3}$")


def detect_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))  # UDP connect sends nothing; it only picks the outgoing interface
        return s.getsockname()[0]
    finally:
        s.close()


def set_key(text: str, key: str, value: str) -> str:
    line = f"{key}={value}"
    pat = re.compile(rf"^\s*{re.escape(key)}\s*=.*$", re.M)
    if pat.search(text):
        return pat.sub(lambda _m: line, text, count=1)
    return text.rstrip("\n") + "\n" + line + "\n"


def get_key(text: str, key: str) -> str:
    m = re.search(rf"^\s*{re.escape(key)}\s*=\s*(.*)$", text, re.M)
    return m.group(1).strip().strip("\"'") if m else ""


def weak(secret: str) -> bool:  # same rule the backend enforces at start-up
    return len(secret) < 16 or secret.lower().startswith("change_this")


def secret_only() -> int:
    if not ENV.exists():
        if not EXAMPLE.exists():
            print("backend/.env.example not found.")
            return 1
        ENV.write_text(EXAMPLE.read_text(encoding="utf-8"), encoding="utf-8")
        print("Created backend/.env from .env.example")
    text = ENV.read_text(encoding="utf-8")
    if weak(get_key(text, "JWT_SECRET")):
        ENV.write_text(set_key(text, "JWT_SECRET", secrets.token_hex(32)), encoding="utf-8")
        print("JWT_SECRET was missing/weak -> a new random secret was saved to backend/.env")
    return 0


def main() -> int:
    arg = sys.argv[1].strip() if len(sys.argv) > 1 else ""
    if arg == "--secret-only":
        return secret_only()
    try:
        ip = arg or detect_ip()
    except OSError:
        print("Could not detect the IP (no network?). Run:  python setup_env.py <your-IPv4>")
        return 1
    if not IPV4.match(ip) or any(int(p) > 255 for p in ip.split(".")):
        print(f"'{ip}' is not a valid IPv4 address.")
        return 1

    if not ENV.exists():
        if not EXAMPLE.exists():
            print("backend/.env.example not found.")
            return 1
        ENV.write_text(EXAMPLE.read_text(encoding="utf-8"), encoding="utf-8")
        print("Created backend/.env from .env.example")
    text = ENV.read_text(encoding="utf-8")

    if weak(get_key(text, "JWT_SECRET")):
        text = set_key(text, "JWT_SECRET", secrets.token_hex(32))
        print("JWT_SECRET: was missing/weak -> new random secret saved")
    else:
        print("JWT_SECRET: already strong, left unchanged")
    text = set_key(text, "PUBLIC_BASE_URL", f"http://{ip}:8000")
    ENV.write_text(text, encoding="utf-8")
    print(f"PUBLIC_BASE_URL: http://{ip}:8000")

    if CONFIG_JS.exists():
        js = CONFIG_JS.read_text(encoding="utf-8")
        new, n = re.subn(r"^(export const HOST\s*=\s*)'[^']*'", lambda m: f"{m.group(1)}'{ip}'", js, count=1, flags=re.M)
        if n:
            CONFIG_JS.write_text(new, encoding="utf-8")
            print(f"mobile/src/config.js: HOST = '{ip}'")
        else:
            print("mobile/src/config.js: HOST line not found - set it by hand")
    else:
        print("mobile/src/config.js not found - set HOST by hand")

    print("\nNext: start-backend.bat, then (if images/products are missing) seed-data.bat or")
    print(f"      python fix_image_urls.py http://{ip}:8000")
    print("Then in Expo press r (or run: npx expo start -c).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
