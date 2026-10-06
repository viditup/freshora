# Freshora Admin (React + Vite)
```
cd freshora\admin
npm install
copy .env.example .env     (set VITE_API_URL if the API is not on localhost:8000)
npm run dev                -> http://localhost:5173
npm run build              -> production build in dist/
```
Log in with an account whose role is `admin` (seed: admin@freshora.com, password from SEED_PASSWORD, default Freshora@123, dev only).
The backend must be running and allow your origin in `CORS_ORIGINS` (default already includes http://localhost:5173).
