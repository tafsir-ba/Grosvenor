"""Shared pytest configuration — set required env vars before app imports."""
import os

os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "grosvenor_test")
os.environ.setdefault("JWT_SECRET", "test-secret")
