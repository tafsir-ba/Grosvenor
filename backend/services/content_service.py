"""Content business logic — FAQ and amenities."""
from content.site_content import AMENITY_CATEGORIES, FAQ_ITEMS


def get_faq() -> list:
    return FAQ_ITEMS


def get_amenities() -> list:
    return AMENITY_CATEGORIES
