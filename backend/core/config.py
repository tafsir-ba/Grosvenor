"""Single source of truth for environment-driven configuration."""
import os


class Settings:
    # Auth
    JWT_SECRET = os.environ["JWT_SECRET"]
    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_MINUTES = 60 * 12  # admin sessions: 12h
    REFRESH_TOKEN_DAYS = 7

    ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@grosvenorvistas.com")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
    ADMIN_NAME = os.environ.get("ADMIN_NAME", "Admin")

    # CRM (config-driven outbound sync — the single integration point)
    CRM_SYNC_ENABLED = os.environ.get("CRM_SYNC_ENABLED", "false").lower() == "true"
    CRM_WEBHOOK_URL = os.environ.get("CRM_WEBHOOK_URL", "")
    CRM_API_KEY = os.environ.get("CRM_API_KEY", "")
    CRM_AUTH_HEADER = os.environ.get("CRM_AUTH_HEADER", "Authorization")

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")


settings = Settings()
