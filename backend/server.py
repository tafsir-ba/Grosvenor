"""Grosvenor Vistas API — application entry point.

Loads env first, mounts every /api router, and runs startup tasks
(indexes, admin seed, inventory seed). Business logic lives in services/.
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import logging  # noqa: E402

from fastapi import APIRouter, FastAPI  # noqa: E402
from starlette.middleware.cors import CORSMiddleware  # noqa: E402

from core.config import settings  # noqa: E402
from core.db import create_indexes, db  # noqa: E402
from core.security import hash_password, verify_password  # noqa: E402
from domain.base import utc_now  # noqa: E402
from routes import admin, auth, downloads, leads, units  # noqa: E402
from seed_data import seed_inventory  # noqa: E402

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Grosvenor Vistas API")

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"service": "Grosvenor Vistas", "status": "ok"}


for r in (auth.router, units.router, leads.router, downloads.router, admin.router):
    api_router.include_router(r)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def seed_admin():
    existing = await db.users.find_one({"email": settings.ADMIN_EMAIL})
    if existing is None:
        await db.users.insert_one({
            "email": settings.ADMIN_EMAIL,
            "password_hash": hash_password(settings.ADMIN_PASSWORD),
            "name": settings.ADMIN_NAME,
            "role": "admin",
            "created_at": utc_now(),
        })
        logger.info("Seeded admin user %s", settings.ADMIN_EMAIL)
    elif not verify_password(settings.ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": settings.ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(settings.ADMIN_PASSWORD)}},
        )


@app.on_event("startup")
async def on_startup():
    await create_indexes()
    await seed_admin()
    await seed_inventory()
    logger.info("Startup complete.")


@app.on_event("shutdown")
async def on_shutdown():
    from core.db import client
    client.close()
