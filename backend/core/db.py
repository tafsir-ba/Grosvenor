"""Single source of truth for the database connection."""
import os
from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]


async def create_indexes():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.units.create_index("slug", unique=True)
    await db.leads.create_index("created_at")
    await db.notification_recipients.create_index("email")
    await db.notification_recipients.create_index("active")
    await db.notification_scenarios.create_index("key", unique=True)
    await db.notification_logs.create_index("lead_id")
    await db.notification_logs.create_index("created_at")
    await db.downloads.create_index("type")
