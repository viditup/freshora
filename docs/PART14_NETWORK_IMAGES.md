# Freshora - PART 14 (login "Network error" + product images)

Base: `freshora_updated (6).zip`. Only the files below were changed. No UI screens were changed in this part.

## Problems found
1. **Login "Network error"** - `HOST` in `mobile/src/config.js` was `10.0.2.2`, which only works inside the Android *emulator*. A real phone cannot reach it.
2. **Product images show a cart emoji** - image URLs are written into MongoDB when you run the seed. The seed used `PUBLIC_BASE_URL`, but it was read with `os.getenv()` and nothing loads `backend/.env` into the environment (the app's `Settings` class reads `.env` but does not export it). So the value in `.env` was ignored and URLs always became `http://10.0.2.2:8000/...`, unreachable from a phone.

## Changes
| File | Change |
|---|---|
| `mobile/src/config.js` | `HOST` set to `10.11.193.215` (the PC IPv4 shown by Metro). **Change it if your IP changes** (`ipconfig`). Emulator: `10.0.2.2`. |
| `mobile/src/api.js` | The "network error" text now shows the URL the app is really using, so a stale `HOST` is easy to spot. |
| `backend/seed/images.py` | `PUBLIC_BASE_URL` is now read from the environment, then from `backend/.env`, then the emulator default. |
| `backend/.env.example` | `PUBLIC_BASE_URL` example uses the same IP. |
| `backend/fix_image_urls.py` (new) | Repairs stored image URLs **without** resetting users/orders/carts: products/categories get the real photo from `backend/static/` (this also replaces the green text-only placehold.co images saved when the seed ran before the photos existed); banners get the new host. |

## What you must do (existing database)
```
cd backend
venv\Scripts\activate
python fix_image_urls.py http://10.11.193.215:8000
```
(or reseed with `seed-data.bat` after setting `PUBLIC_BASE_URL` in `backend\.env` - this resets demo data). Then start the backend, reload the app.
Also allow port 8000 in Windows Firewall (Private network) and keep phone + PC on the same Wi-Fi. Test in the phone browser: `http://<IP>:8000/docs` and `http://<IP>:8000/static/products/bananas-robusta.png`.

## Verified here
- All 77 mobile JS files parse (TypeScript compiler), all relative imports resolve, all navigate() targets registered.
- `images.py`: `.env` parsing tested (value, quotes, missing key, missing file, env-var priority); result URLs checked for an existing and a missing image.
- `fix_image_urls.py`: compiles; run end-to-end against a fake in-memory database (placeholder -> photo, old 10.0.2.2 host -> new host, product without a photo left unchanged, banner placeholder untouched).

## NOT verified
- Running the app on a phone, Metro, a real MongoDB, or the backend test-suite (dependencies could not be installed here).
- `fix_image_urls.py` against a real database.
- Whether your firewall / Wi-Fi allows phone -> PC on port 8000 (use the browser test above).

## Known, not changed
- `backend/static/products` holds 69 PNGs of about 1 MB each (77 MB, 1254x1254). They work but load slowly; resize to ~600 px.
- The earlier request (make every screen match the PDF) is **not finished**: it has not been audited against this version yet.
- `package.json` already contains expo-font, expo-linear-gradient and Google font packages (added before this part); run `npm install` once.

## One-click fix (added later): `fix-setup.bat`
Double-click `fix-setup.bat` (or `fix-setup.bat 192.168.1.23` to force an IP). It runs `backend/setup_env.py`, which:
1. creates `backend/.env` from `.env.example` if missing;
2. replaces a missing / short / `change_this...` `JWT_SECRET` with a random 64-character one (a strong secret is never changed) - this was why the backend crashed with "JWT_SECRET is too weak";
3. sets `PUBLIC_BASE_URL` in `backend/.env`;
4. sets `HOST` in `mobile/src/config.js` (only that line).
Tested here on copies of the files (new .env, weak secret, strong secret kept, bad IPs rejected, config.js otherwise unchanged). Not tested on Windows / with your real network (IP auto-detect picks the interface used to reach the internet; pass the IP by hand if it picks a VPN/hotspot address).

`start-backend.bat` now also runs `python setup_env.py --secret-only` before starting: it creates `backend/.env` if missing and replaces a weak `JWT_SECRET` automatically (it does not touch the IP settings). Tested on file copies; not tested on Windows.
