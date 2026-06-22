"""Single source of truth for every status / category enum used across the app.

These enums are the ONLY place statuses and types are defined. The frontend
mirrors the *labels* in one shared constants file; the values live here.
"""
from enum import Enum


class UnitStatus(str, Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    SOLD = "sold"


class LeadStatus(str, Enum):
    """Internal pipeline mirror (the external CRM remains the master)."""
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    WON = "won"
    LOST = "lost"


class LeadType(str, Enum):
    GENERAL_CONTACT = "general_contact"
    BOOK_SHOWROOM_VISIT = "book_showroom_visit"
    DOWNLOAD_BROCHURE = "download_brochure"
    DOWNLOAD_PRICE_LIST = "download_price_list"
    CONTACT_ABOUT_UNIT = "contact_about_unit"
    MORTGAGE_INFO_REQUEST = "mortgage_info_request"
    WHATSAPP_CLICK = "whatsapp_click"
    PHONE_CLICK = "phone_click"
    EMAIL_CLICK = "email_click"


class DownloadType(str, Enum):
    BROCHURE = "brochure"     # gated: requires the Download Form (lead capture)
    PRICELIST = "pricelist"   # open: freely accessible (click is tracked only)


# Downloads that require a captured lead before the file is served.
GATED_DOWNLOAD_TYPES = {DownloadType.BROCHURE}

# Anonymous interaction lead-types — captured without name/email (click tracking).
CLICK_LEAD_TYPES = {
    LeadType.WHATSAPP_CLICK,
    LeadType.PHONE_CLICK,
    LeadType.EMAIL_CLICK,
}
