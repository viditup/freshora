# Freshora: grocery delivery platform

| Folder | What | Tech |
|---|---|---|
| `mobile/` | Customer app | React Native (Expo), Axios, React Navigation |
| `backend/` | REST API | Python, FastAPI, MongoDB (Motor), JWT |
| `admin/` | Admin web panel | React (Vite) |

No third-party APIs. Checkout payment options (UPI / Card / Wallet / COD) are **demo only** - no gateway, no real money.

## Run order (Windows)
1. **MongoDB**: install MongoDB Community Server (as a Service) and make sure it is running.
2. **Backend** (see `backend/README.md`):
```
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env        # set JWT_SECRET
python -m seed.seed_data
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
   Swagger: http://localhost:8000/docs
3. **Admin panel**: `cd admin && npm install && copy .env.example .env && npm run dev` -> http://localhost:5173
4. **Mobile**: `cd mobile && npm install && npx expo install --fix && npx expo start`.
   Set `HOST` in `mobile/src/config.js` (`10.0.2.2` Android emulator, your PC IPv4 for a real phone).
   Product images: set `PUBLIC_BASE_URL` in `backend/.env` to the same address, then seed; for an existing database run `python fix_image_urls.py http://<PC-IP>:8000`. See `docs/PART14_NETWORK_IMAGES.md`. Part 15 makes image URLs self-correcting (no `fix_image_urls.py` needed) - see `docs/PART15_IMAGES_BANNER_HOME_FIDELITY.md`.

## Mobile / Expo notes (important)
- The app targets **Expo SDK 57** (React Native 0.86, React 19.2). Expo Go from the Play Store supports only the *latest* SDK, so its SDK must match. Check in Expo Go > Settings. If it says "incompatible", update Expo Go, or run `npx expo start` and press `a` to install the matching Expo Go on the emulator.
- Node.js must be `^20.19.4`, `^22.13`, or `^24.3` (check with `node -v`).
- `mobile/.npmrc` sets `legacy-peer-deps=true` so a plain `npm install` works.
- Verified in the build environment: a real Metro/Hermes Android bundle compiles (`npx expo export --platform android`). Not verified: running on a device/emulator.

## Windows shortcuts (double-click, from the project root)
`fix-setup.bat` (first: creates backend\.env, a strong JWT_SECRET, sets your PC IP in .env and mobile config),
`seed-data.bat` (first time, and only when you want to reset demo data), `start-backend.bat`, `start-admin.bat`, `start-mobile.bat`.

## Demo accounts (dev only, password = `SEED_PASSWORD`, default `Freshora@123`)
- Admin: admin@freshora.com
- Customers: aryan@freshora.com, priya@freshora.com

## Tests
Backend API smoke test (in-memory Mongo, no install needed): `cd backend && pip install -r requirements-dev.txt && python -m tests.smoke_test`

## Customer flow
Splash > Onboarding > Signup/Login > Home (offers, product rows, Recently Viewed, Read & Learn) > Search/Categories > Product > Cart > Checkout (3 steps: address > payment > review, standard/express delivery, demo UPI/Card/Wallet/COD) > Order success (ETA + tracking) > My Orders (filters) > Order details (live tracking) > Profile (Gold card, To Deliver / Delivered / Returns). Admin changes order status in the panel and the customer sees it in the app.
