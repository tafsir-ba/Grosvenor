"""Unit tests for downloads gating helpers (no live API required)."""
from domain.enums import DownloadType
from domain.models import Download
from services.downloads_service import to_public_download


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
