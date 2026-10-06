# Freshora - PART 11 (Security hardening + cleanup)

No new features, no UI change. Only closes gaps found in a security audit. No new packages, no re-seed.

## Already safe (checked, unchanged)
- Passwords bcrypt-hashed; `password_hash` never returned by the API.
- Every `/api/admin/*` route needs an admin JWT; users can only read / cancel their own orders and addresses.
- Prices, discounts, delivery fee and totals are computed on the server from the database, never from the client.
- Search text is regex-escaped; role cannot be set at signup; CORS has no wildcard; admin panel rejects non-admin accounts.

## Fixed in this part
1. **Weak JWT secret**: the backend now refuses to start if `JWT_SECRET` is shorter than 16 chars or still the `change_this...` placeholder.
2. **Login brute force**: 5 wrong passwords for the same IP + email lock login for 15 minutes (HTTP 429). Unknown emails now take the same time as wrong passwords.
3. **Cancel race**: customer cancel and admin cancel now claim the status change atomically, so a double tap / parallel request can never restore stock twice.
4. **Input limits**: address fields, profile image URL, product / category fields, search / brand / ids query strings and page number now have maximum sizes (stops oversized data).
5. **Errors are logged** on the server (users still see a generic message).
6. Tests use a long test secret; wrong comment in `MainTabs.js` fixed.

## Known limits (by design, not changed)
- Login lock is in server memory (resets on restart; fine for a single server).
- JWT lives 7 days and logout is client-side; an old token stays valid until it expires or the user is disabled.
- The app stores the token in AsyncStorage (not encrypted storage) and uses plain `http` in dev. Use HTTPS in production.
- Payments, wallet, coupons are demo only (as in the brief).

## Verified / not verified
All JS files parse (82), imports and navigation targets resolve, all Python files parse, and the lock logic was simulated.
The backend tests were NOT run here (no pip/Mongo access). Run: `cd backend && python -m tests.smoke_test`.
