"""Single source of truth for environment-driven configuration."""
import os

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development").lower()
IS_PRODUCTION = ENVIRONMENT == "production"

_WEAK_ADMIN_PASSWORDS = frozenset({"admin123", "password", "changeme"})


def _resolve_admin_password() -> str:
    pwd = os.environ.get("ADMIN_PASSWORD", "")
    if IS_PRODUCTION:
        if not pwd:
            raise RuntimeError("ADMIN_PASSWORD must be set when ENVIRONMENT=production")
        if pwd in _WEAK_ADMIN_PASSWORDS or len(pwd) < 12:
            raise RuntimeError("ADMIN_PASSWORD is too weak for production")
        return pwd
    return pwd or "admin123"


def _resolve_cors_origins() -> list:
    raw = os.environ.get("CORS_ORIGINS", "")
    if IS_PRODUCTION:
        if not raw or raw.strip() == "*":
            raise RuntimeError(
                "CORS_ORIGINS must list explicit origins when ENVIRONMENT=production"
            )
        return [origin.strip() for origin in raw.split(",") if origin.strip()]
    return [origin.strip() for origin in (raw or "*").split(",") if origin.strip()]


def _resolve_cookie_secure() -> bool:
    val = os.environ.get("COOKIE_SECURE", "").lower()
    if val in ("true", "1", "yes"):
        return True
    if val in ("false", "0", "no"):
        return False
    return IS_PRODUCTION


class Settings:
    # Runtime environment
    ENVIRONMENT = ENVIRONMENT
    IS_PRODUCTION = IS_PRODUCTION

    # Auth
    JWT_SECRET = os.environ["JWT_SECRET"]
    JWT_ALGORITHM = "HS256"
    ACCESS_TOKEN_MINUTES = 60 * 12  # admin sessions: 12h
    REFRESH_TOKEN_DAYS = 7

    ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@grosvenorvistas.com")
    ADMIN_PASSWORD = _resolve_admin_password()
    ADMIN_NAME = os.environ.get("ADMIN_NAME", "Admin")
    COOKIE_SECURE = _resolve_cookie_secure()

    # CRM (config-driven outbound sync — the single integration point)
    CRM_SYNC_ENABLED = os.environ.get("CRM_SYNC_ENABLED", "false").lower() == "true"
    CRM_WEBHOOK_URL = os.environ.get("CRM_WEBHOOK_URL", "")
    CRM_API_KEY = os.environ.get("CRM_API_KEY", "")
    CRM_AUTH_HEADER = os.environ.get("CRM_AUTH_HEADER", "Authorization")

    CORS_ORIGINS = _resolve_cors_origins()


settings = Settings()
