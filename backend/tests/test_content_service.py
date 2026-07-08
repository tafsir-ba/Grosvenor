from content.site_content import AMENITY_CATEGORIES, FAQ_ITEMS
from services.content_service import get_amenities, get_faq


def test_faq_items():
    items = get_faq()
    assert len(items) >= 5
    assert items[0]["q"]
    assert items[0]["a"]
    assert items == FAQ_ITEMS


def test_amenity_categories():
    cats = get_amenities()
    assert len(cats) == 3
    assert cats[0]["items"]
    assert cats[0]["items"][0]["icon"]
    assert cats == AMENITY_CATEGORIES
