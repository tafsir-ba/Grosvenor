"""Unit tests for downloads gating helpers (no live API required)."""
from datetime import datetime, timedelta, timezone

from domain.enums import DownloadType
from domain.models import Download
from services.downloads_service import to_public_download, token_is_expired


def test_public_list_omits_gated_file_url():
    broch = Download(
        _id="507f1f77bcf86cd799439011",
        title="Brochure",
        type=DownloadType.BROCHURE,
        file_url="grosvenor-vistas-brochure.pdf",
    )
    public = to_public_download(broch)
    assert public["type"] == "brochure"
    assert "file_url" not in public


def test_public_list_keeps_open_file_url():
    price = Download(
        _id="507f1f77bcf86cd799439012",
        title="Price List",
        type=DownloadType.PRICELIST,
        file_url="/downloads/grosvenor-vistas-pricelist.pdf",
    )
    public = to_public_download(price)
    assert public["file_url"] == "/downloads/grosvenor-vistas-pricelist.pdf"


def test_token_is_expired_handles_naive_mongo_datetimes():
    now = datetime(2026, 7, 23, 16, 0, tzinfo=timezone.utc)
    future_naive = (now + timedelta(minutes=10)).replace(tzinfo=None)
    past_naive = (now - timedelta(minutes=1)).replace(tzinfo=None)
    future_aware = now + timedelta(minutes=10)
    past_aware = now - timedelta(minutes=1)

    assert token_is_expired(None, now=now) is True
    assert token_is_expired(future_naive, now=now) is False
    assert token_is_expired(past_naive, now=now) is True
    assert token_is_expired(future_aware, now=now) is False
    assert token_is_expired(past_aware, now=now) is True
