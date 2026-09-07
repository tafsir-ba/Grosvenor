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
    SALES_EXPLORER = "sales_explorer"
    WHATSAPP_ENQUIRY = "whatsapp_enquiry"  # form-gated WhatsApp open (CRM contact)
    WHATSAPP_CLICK = "whatsapp_click"      # legacy anonymous click (kept for /track)
    PHONE_CLICK = "phone_click"
    EMAIL_CLICK = "email_click"


# Form leads that also require a phone number (on top of name + email + consent).
REQUIRED_PHONE_LEAD_TYPES = {
    LeadType.WHATSAPP_ENQUIRY,
    LeadType.DOWNLOAD_PRICE_LIST,
    LeadType.DOWNLOAD_BROCHURE,
}


class DownloadType(str, Enum):
    BROCHURE = "brochure"              # website: form-gated, then opens in browser
    BROCHURE_EMAIL = "brochure_email"  # CRM drip: open public URL, not shown on the site
    PRICELIST = "pricelist"            # website: form-gated, then opens in browser


# Website brochure + price list require a captured lead, then a short-lived file token.
GATED_DOWNLOAD_TYPES = {DownloadType.BROCHURE, DownloadType.PRICELIST}

# Shown on the public site. The email brochure is admin/CRM-only.
PUBLIC_WEBSITE_DOWNLOAD_TYPES = {DownloadType.BROCHURE, DownloadType.PRICELIST}

# Anonymous interaction lead-types — captured without name/email (click tracking).
CLICK_LEAD_TYPES = {
    LeadType.WHATSAPP_CLICK,
    LeadType.PHONE_CLICK,
    LeadType.EMAIL_CLICK,
}

# Lead types that may be recorded without contact details (click tracking only).
ANONYMOUS_LEAD_TYPES = CLICK_LEAD_TYPES
