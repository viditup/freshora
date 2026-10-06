import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pymongo.errors import PyMongoError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.db import database as mongo
from app.routes import admin, auth, cart, catalog, orders


log = logging.getLogger("freshora")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await mongo.connect()  # raises a clear error if MongoDB is down
    yield
    mongo.close()


app = FastAPI(title="Freshora API", version="1.0.0", description="Grocery delivery backend (FastAPI + MongoDB)", lifespan=lifespan)
# Native Expo apps ignore CORS. Only the listed origins (Expo web / admin panel) are allowed; no wildcard.
app.add_middleware(CORSMiddleware, allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# PART 3B: product / category / banner photos are plain files in backend/static/{products,categories,banners}.
# They are served at  http://<HOST>:8000/static/products/<slug>.jpg  (no auth, read-only).
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

for r in (auth.router, auth.users, catalog.router, cart.router, orders.addresses, orders.router, admin.router):
    app.include_router(r, prefix="/api")


@app.middleware("http")
async def remember_public_base(request: Request, call_next):
    """PART 15: remember the address the client used to reach the API so image URLs always point back to it."""
    host = request.headers.get("host")
    if host:
        mongo.request_base.set(f"{request.url.scheme}://{host}")
    return await call_next(request)


def fail(message: str, code: int):
    return JSONResponse({"success": False, "message": message}, status_code=code)


@app.exception_handler(StarletteHTTPException)
async def http_error(request: Request, exc: StarletteHTTPException):
    return fail(str(exc.detail), exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    msg = "; ".join(f"{'.'.join(str(x) for x in e['loc'][1:])}: {e['msg']}" for e in exc.errors())
    return fail(msg or "Invalid request data", 422)


@app.exception_handler(PyMongoError)
async def db_error(request: Request, exc: PyMongoError):
    log.error("Database error on %s", request.url.path, exc_info=exc)
    return fail("Database error. Please try again.", 503)


@app.exception_handler(Exception)
async def unknown_error(request: Request, exc: Exception):
    log.error("Unhandled error on %s", request.url.path, exc_info=exc)
    return fail("Something went wrong. Please try again.", 500)


@app.get("/", tags=["Health"])
async def health():
    return {"success": True, "message": "Freshora API is running. Docs at /docs"}
