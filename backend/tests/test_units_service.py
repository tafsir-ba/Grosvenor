"""Unit-service and seed migration tests (no live API required)."""
import re

from services.units_service import sanitize_public_amenities
from seed_data import (
    _AMENITIES_VERSION,
    _DEFAULT_AMENITIES,
    should_apply_amenities_migration,
)


def test_sanitize_keeps_canonical_finish_features():
    kept = sanitize_public_amenities(list(_DEFAULT_AMENITIES))
    assert kept == list(_DEFAULT_AMENITIES)
    assert "Built-in wardrobes in all bedrooms" in kept
    assert "Master bathroom with bathtub and separate walk-in shower" in kept


def test_sanitize_strips_bed_bath_counts_and_floor_plans():
    raw = [
        "Large floor-to-ceiling windows",
        "2 Bedroom Residence",
        "3 bathrooms",
        "Floor plan PDF",
        "Premium bathroom fixtures and fittings",
    ]
    kept = sanitize_public_amenities(raw)
    assert kept == [
        "Large floor-to-ceiling windows",
        "Premium bathroom fixtures and fittings",
    ]


def test_sanitize_handles_empty():
    assert sanitize_public_amenities(None) == []
    assert sanitize_public_amenities([]) == []


def test_amenities_migration_runs_when_meta_missing():
    assert should_apply_amenities_migration(None) is True


def test_amenities_migration_runs_when_version_stale():
    assert should_apply_amenities_migration({"amenities_version": "old"}) is True


def test_amenities_migration_skips_when_current():
    assert should_apply_amenities_migration({"amenities_version": _AMENITIES_VERSION}) is False


def test_default_amenities_have_no_forbidden_counts():
    forbidden = re.compile(
        r"\b\d+\s*-?\s*bed(?:room)?s?\b|\b\d+\s*-?\s*bath(?:room)?s?\b|floor\s*plan",
        re.IGNORECASE,
    )
    for item in _DEFAULT_AMENITIES:
        assert not forbidden.search(item), item
