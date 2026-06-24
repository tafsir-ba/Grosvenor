"""Domain models — the single authoritative schema per entity.

CONTENT RULES baked into the schema (per project brief):
  * Units carry NO bedrooms, bathrooms, floor plans, unit images or room
    descriptions. They are pure inventory records.
  * The external CRM is the master for unit data; this model is the structured
    synced/cached representation the website reads from.
"""
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

from domain.base import BaseDocument, utc_now_iso
from domain.enums import DownloadType, LeadStatus, LeadType, UnitStatus


# ----------------------------- Units -----------------------------
class UnitBase(BaseModel):
    building: str
    unit_number: str
    floor: int
    floor_label: Optional[str] = None
    total_surface: float          # total surface (living + balcony)
    balcony_surface: float = 0
    living_area: Optional[float] = None   # interior living area
    price: Optional[float] = None      # None => "Price on request"
    currency: str = "USD"
    status: UnitStatus = UnitStatus.AVAILABLE
    # Optional external reference so a synced unit maps back to the CRM record.
    crm_id: Optional[str] = None


class UnitCreate(UnitBase):
    pass


class UnitUpdate(BaseModel):
    building: Optional[str] = None
    unit_number: Optional[str] = None
    floor: Optional[int] = None
    floor_label: Optional[str] = None
    total_surface: Optional[float] = None
    balcony_surface: Optional[float] = None
    living_area: Optional[float] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[UnitStatus] = None
    crm_id: Optional[str] = None


class Unit(BaseDocument, UnitBase):
    # Deterministic public identifier: "<building>-<unit_number>" (no PII / no room data).
    slug: str
    created_at: str = Field(default_factory=utc_now_iso)
    updated_at: str = Field(default_factory=utc_now_iso)


# ----------------------------- Leads -----------------------------
class LeadCreate(BaseModel):
    # first/last name + email are optional at the schema level to support
    # anonymous click tracking; the leads service enforces them for real forms.
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    message: Optional[str] = None
    consent: bool = False
    project: str = "Grosvenor Vistas"
    lead_type: LeadType = LeadType.GENERAL_CONTACT
    # Attribution / context (captured automatically by the shared LeadForm)
    source_page: Optional[str] = None
    source_unit: Optional[str] = None
    source_building: Optional[str] = None
    collection: Optional[str] = None
    unit_surface: Optional[float] = None
    unit_balcony: Optional[float] = None
    source_url: Optional[str] = None
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None


class LeadUpdate(BaseModel):
    status: Optional[LeadStatus] = None
    notes: Optional[str] = None


class Lead(BaseDocument, LeadCreate):
    status: LeadStatus = LeadStatus.NEW
    notes: Optional[str] = None
    crm_synced: bool = False
    crm_reference: Optional[str] = None
    created_at: str = Field(default_factory=utc_now_iso)
    updated_at: str = Field(default_factory=utc_now_iso)


# --------------------------- Downloads ---------------------------
class DownloadBase(BaseModel):
    title: str
    type: DownloadType
    file_url: str
    description: Optional[str] = None


class DownloadCreate(DownloadBase):
    pass


class DownloadUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[DownloadType] = None
    file_url: Optional[str] = None
    description: Optional[str] = None


class Download(BaseDocument, DownloadBase):
    created_at: str = Field(default_factory=utc_now_iso)
