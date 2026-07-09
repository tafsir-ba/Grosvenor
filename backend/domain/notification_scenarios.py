"""Lead notification scenario definitions — single source of truth."""

from enum import Enum


class LeadNotificationScenario(str, Enum):
    BROCHURE_DOWNLOAD = "brochure_download"
    CONTACT_FORM = "contact_form"
    CALLBACK_REQUEST = "callback_request"
    APPOINTMENT_REQUEST = "appointment_request"
    INVESTMENT_INQUIRY = "investment_inquiry"
    GENERAL_LEAD = "general_lead"


DEFAULT_SCENARIOS = [
    {
        "key": LeadNotificationScenario.BROCHURE_DOWNLOAD.value,
        "label": "Brochure Download",
        "description": "User submits contact details to download the brochure.",
    },
    {
        "key": LeadNotificationScenario.CONTACT_FORM.value,
        "label": "Contact Form",
        "description": "User submits the general contact or unit enquiry form.",
    },
    {
        "key": LeadNotificationScenario.CALLBACK_REQUEST.value,
        "label": "Callback Request",
        "description": "User clicks phone, email, or WhatsApp to request contact.",
    },
    {
        "key": LeadNotificationScenario.APPOINTMENT_REQUEST.value,
        "label": "Appointment Request",
        "description": "User requests a showroom visit or viewing.",
    },
    {
        "key": LeadNotificationScenario.INVESTMENT_INQUIRY.value,
        "label": "Investment Inquiry",
        "description": "User submits a mortgage or financing enquiry.",
    },
    {
        "key": LeadNotificationScenario.GENERAL_LEAD.value,
        "label": "General Lead",
        "description": "Any lead that does not match a more specific scenario.",
    },
]

# Map internal lead_type values to notification scenarios.
LEAD_TYPE_SCENARIO_MAP = {
    "download_brochure": LeadNotificationScenario.BROCHURE_DOWNLOAD.value,
    "general_contact": LeadNotificationScenario.CONTACT_FORM.value,
    "contact_about_unit": LeadNotificationScenario.CONTACT_FORM.value,
    "book_showroom_visit": LeadNotificationScenario.APPOINTMENT_REQUEST.value,
    "mortgage_info_request": LeadNotificationScenario.INVESTMENT_INQUIRY.value,
    "sales_explorer": LeadNotificationScenario.GENERAL_LEAD.value,
    "download_price_list": LeadNotificationScenario.GENERAL_LEAD.value,
    "whatsapp_click": LeadNotificationScenario.CALLBACK_REQUEST.value,
    "phone_click": LeadNotificationScenario.CALLBACK_REQUEST.value,
    "email_click": LeadNotificationScenario.CALLBACK_REQUEST.value,
}
