# Grosvenor Vistas — PRD & Build Log

## Problem Statement
Marketing & lead-generation website for **Grosvenor Vistas**, a 43-unit residential development in
Grosvenor Heights, Manor Park, Kingston 8, Jamaica. Built as a **system** (single source of truth,
DRY, separation of concerns) — not isolated pages. Showroom/model unit available for visits.

## Content & Brand Rules (enforced)
- NO bedrooms, bathrooms, floor plans, unit images, room descriptions, construction timelines.
- No stacked "FOR SALE / NOW SELLING" messaging. Simple, direct language.
- No black — warm brown ink. Gold `#C6862B`, Blue `#064F73`, Green `#0D572D`, White.
- Fonts: Source Sans 3 (headings) + Saira (Bahnschrift-style labels/body). Supplied SVG logo set only.
- Single "Grosvenor Agent" (no multi-agent logic).

## Architecture (single source of truth)
- **Backend** (FastAPI, domain-driven): `core/` (config, db, security), `domain/` (base, enums, models),
  `services/` (crm, units, leads, downloads), `routes/` (auth, units, leads, downloads, admin).
- **Frontend** (React): `lib/` (api, constants, format, tracking), `context/AuthContext`, `hooks/useData`,
  `components/shared` (LeadForm, DownloadForm, UnitCard, StatusBadge, Hero, etc.), `components/layout`,
  `pages/` + `pages/admin/`.
- Enums defined ONCE (UnitStatus, LeadType, LeadStatus, DownloadType). Lead capture, status display,
  formatting, CRM mapping each have one home.

## Data Models
- **Unit**: building, unit_number, floor, total_surface, balcony_surface, price (USD, nullable=on request),
  status, slug, crm_id.
- **Lead**: name, email, phone, message, lead_type, source_page/unit/building/url, 5× UTM, status,
  crm_synced, crm_reference, created_at.
- **Download**: title, type (brochure=gated / pricelist=open), file_url.

## CRM
External custom CRM is the intended master for units. Integration isolated in `services/crm.py`,
config-driven via env (`CRM_SYNC_ENABLED`, `CRM_WEBHOOK_URL`, `CRM_API_KEY`, `CRM_AUTH_HEADER`).
**Currently DISABLED** — leads stored locally + admin dashboard. Flip env to enable (no code change).
Inbound unit sync mapping (`map_crm_unit`) + endpoint stub ready for wiring.

## Implemented (2026-06-22)
- 9 marketing pages: Home, The Development, Residences (+filters), Unit Detail, Amenities, Location,
  Gallery, Mortgage & Financing, FAQ, Contact. WhatsApp float + click tracking (whatsapp/phone/email).
- Real 43-unit inventory seeded (Heliconia 16, Hibiscus 16, Ginger Lily 9, Begonia townhouses 2;
  30 available / 13 sold). Gated brochure / open price list. UTM-attributed leads.
- Admin (JWT): dashboard stats, Units CRUD + inline status, Leads (filter, status, CSV export), Downloads.
- Tested: 23/23 backend pytest pass; all frontend flows pass (iteration_1.json).
- Fixed CRA5 + webpack-dev-server@5 incompatibility via craco dev-server normalizer.

## Credentials
Admin: admin@grosvenorvistas.com / Grosvenor2026! (see test_credentials.md)

## Backlog / Next
- P1: Wire the real CRM (endpoint, auth, field names) — leads OUT + units IN sync.
- P1: Replace placeholder brochure/pricelist PDFs with real files (admin Downloads page edits file_url).
- P2: Reserved-status units (none currently) styling already supported.
- P2: Optional — interactive site map, multilingual, analytics provider (GA4) hook in tracking.js.
- P2: Confirm USD/sq ft assumptions with client (assumed per approval).
