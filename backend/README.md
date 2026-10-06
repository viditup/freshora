# Freshora Backend (FastAPI + MongoDB)

## Setup (Windows, PowerShell / VS Code terminal)
1. Install **Python 3.11+** (python.org, tick "Add to PATH") and **MongoDB Community Server** (mongodb.com/try/download/community, install as a Service so it starts automatically).
2. Create and activate a virtual environment:
```
cd freshora\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
3. Create `.env`: `copy .env.example .env` then set `JWT_SECRET` to a long random string (16+ chars, the app refuses weak ones) (`python -c "import secrets; print(secrets.token_hex(32))"`).
4. Make sure MongoDB is running (`net start MongoDB` in an Admin terminal if needed).
5. Seed demo data: `python -m seed.seed_data`
6. Start API: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
7. Swagger: http://localhost:8000/docs  (ReDoc: /redoc)

## Demo accounts (password from `SEED_PASSWORD`, default `Freshora@123`, dev only)
- Admin: admin@freshora.com
- Customers: aryan@freshora.com, priya@freshora.com

## Connect the mobile app
Edit `mobile/src/config.js` and set `HOST`:
- Android emulator: `10.0.2.2`
- Real phone: your PC's IPv4 from `ipconfig` (phone and PC on same Wi-Fi)

Then `cd freshora\mobile && npx expo start`.

## Tests (no MongoDB needed, uses in-memory mock)
```
pip install -r requirements-dev.txt
python -m tests.smoke_test
```

## Troubleshooting
- **Cannot connect to MongoDB**: start the MongoDB service; check `MONGO_URL`.
- **JWT_SECRET field required**: you forgot to create `.env`.
- **Phone shows "Network error"**: use LAN IP not `localhost`; allow Python through Windows Firewall (private network); API must run with `--host 0.0.0.0`.
- **Port 8000 busy**: use `--port 8001` and change it in `mobile/src/config.js`.
- **401 after restart**: JWT_SECRET changed; log in again.
