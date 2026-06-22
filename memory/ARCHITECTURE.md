# Grosvenor Vistas — System Architecture & Foundation

> Marketing & lead-generation website for a **43-unit residential development** in
> Grosvenor Heights, Manor Park, Kingston 8, Jamaica. A built development with a
> showroom/model unit available for visits.
>
> **Engineering north star:** every fact, rule, workflow and calculation has exactly
> one authoritative home. Single source of truth · DRY · separation of concerns.

---

## 1. Content & Design Guardrails (enforced in code, not just copy)

**Never reference:** bedrooms · bathrooms · construction timelines · "near completion" ·
floor plans · unit-specific images · permit-sensitive room descriptions.
**Never** stack repeated sales messaging ("FOR SALE" + "NOW SELLING") in one area.
Language: simple, direct, image-led, premium, lifestyle-driven.

**Brand tokens (one place — CSS variables in `index.css`):**
| Token | Value | Use |
|---|---|---|
| `--gold` (primary) | `#C6862B` | CTAs, accents, highlights |
| `--blue` (secondary) | `#064F73` | Headings, structural elements |
| `--green` (tertiary) | `#0D572D` | Supporting accent / contrast blocks |
| `--white` | `#FFFFFF` | Surfaces |
| `--brown` (ink, **replaces black**) | warm dark brown | Text & dark sections — **no pure black anywhere** |

Logo: supplied SVG set only (`/public/brand/grosvenor_*.svg` — blue, gold, white, black-ink variants).
Type: **Source Sans (SemiBold)** headlines + **Bahnschrift-style technical sans** for labels/body (two-tone treatment).

---

## 2. Recommended Folder Architecture

### Backend (`/app/backend`) — domain-driven
```
core/        config.py · db.py · security.py        (env, mongo, auth+permissions — SoT)
domain/      base.py · enums.py · models.py          (SoT: schemas + every status enum)
services/    crm.py · units_service.py ·             (business logic only)
             leads_service.py · downloads_service.py
routes/      auth.py · units.py · leads.py ·         (HTTP/communication only)
             downloads.py · admin.py
server.py    app entry: mounts /api routers, startup (seed admin, indexes)
```

### Frontend (`/app/frontend/src`)
```
lib/         api.js (one axios client) · constants.js (labels/nav/project info — SoT)
             · format.js (price/surface formatters — SoT) · tracking.js (analytics events — SoT)
context/     AuthContext.jsx
hooks/       useUnits.js · useLeads.js · useDownloads.js   (shared data access)
components/
  ui/        (shadcn primitives)
  brand/     Logo.jsx
  shared/    CtaButton · StatusBadge · UnitCard · LeadForm · DownloadForm ·
             GalleryGrid · AmenityCard · FaqAccordion · BuyingProcessStep ·
             MapSection · WhatsappFloatingButton · Hero · SectionHeading
  layout/    Header.jsx · Footer.jsx
pages/       Home · Development · Residences · Amenities · Location · Gallery ·
             Mortgage · Faq · Contact · UnitDetail
             admin/ (Login · Dashboard · Units · Leads · Downloads)
```
**Rule:** logic is never copy-pasted between pages. Anything reused is extracted into `shared/`, `lib/` or `hooks/`.

---

## 3. Data Model Definitions (authoritative)

### Unit — pure inventory record (CRM is master)
`building` · `unit_number` · `floor` · `total_surface` · `balcony_surface` ·
`price` · `currency` · `status` · `slug` (`<building>-<unit_number>`) · `crm_id` · timestamps.
**Excluded by design:** bedrooms, bathrooms, floor plans, unit images, room descriptions.

### Lead — one shared capture model
`name` · `email` · `phone` · `message` · `lead_type` · `source_page` · `source_unit` ·
`source_building` · `source_url` · `utm_source/medium/campaign/content/term` · `status` ·
`notes` · `crm_synced` · `crm_reference` · `created_at`.

### Download — gated brochure / open price list
`title` · `type` (brochure|pricelist) · `file_url` · `description`.

### Enums (defined once in `domain/enums.py`)
- **UnitStatus:** available · reserved · sold
- **LeadType:** general_contact · book_showroom_visit · download_brochure ·
  download_price_list · contact_about_unit · mortgage_info_request ·
  whatsapp_click · phone_click · email_click
- **LeadStatus** (internal pipeline mirror): new · contacted · qualified · won · lost
- **DownloadType:** brochure (gated) · pricelist (open)

---

## 4. CRM Mapping Proposal

The CRM is the **single source of truth for unit data**. The website never hardcodes
prices/surfaces/statuses. Two integration directions, both isolated in `services/crm.py`:

**A. Units IN (CRM → website)** — a sync job/endpoint pulls units and upserts into the
`units` collection keyed by `crm_id`. The site reads only this structured source.
Proposed field map (adjust to your CRM):
```
CRM field            ->  Unit field
building / block     ->  building
unit / unit_no       ->  unit_number
floor / level        ->  floor
internal_area        ->  total_surface
balcony_area         ->  balcony_surface
price / list_price   ->  price
currency             ->  currency
status / stage       ->  status   (mapped to available|reserved|sold)
id                   ->  crm_id
```

**B. Leads OUT (website → CRM)** — every captured lead is POSTed to a configurable CRM
endpoint. Field map:
```
Lead field      ->  CRM payload
name            ->  contact.name
email           ->  contact.email
phone           ->  contact.phone
message         ->  note
lead_type       ->  lead_type / category
source_unit     ->  unit_ref
source_building ->  building_ref
source_url      ->  source_url
utm_*           ->  attribution.*
created_at      ->  created_at
```
Config-driven via env: `CRM_SYNC_ENABLED`, `CRM_WEBHOOK_URL`, `CRM_API_KEY`,
`CRM_AUTH_HEADER`. Until you share the contract, leads are stored in our DB + admin
dashboard and the sync flips on with one env change. **No code change needed later.**

---

## 5. API Contract Proposal (all under `/api`)

**Public**
```
GET  /api/units                 ?building=&status=&min_price=&max_price=&sort=   list (synced)
GET  /api/units/{slug}          single unit
POST /api/leads                 create lead (any lead_type) -> stores + CRM sync
GET  /api/downloads             list downloads (metadata)
POST /api/downloads/{id}/access brochure: requires lead body; pricelist: open -> returns file_url
GET  /api/content/faq           FAQ items
GET  /api/content/amenities     amenities
POST /api/track                 lightweight event (whatsapp/phone/email clicks)
```
**Auth**
```
POST /api/auth/login · POST /api/auth/logout · GET /api/auth/me · POST /api/auth/refresh
```
**Admin (require_admin)**
```
GET/POST/PATCH/DELETE /api/admin/units
GET/PATCH             /api/admin/leads        (view, update status/notes, export)
GET/POST/PATCH/DELETE /api/admin/downloads
POST                  /api/admin/units/sync   (trigger CRM pull)
GET                   /api/admin/stats        (dashboard)
```

---

## 6. Shared Component List
Header · Footer · Hero · CtaButton · UnitCard · StatusBadge · LeadForm · DownloadForm ·
GalleryGrid · AmenityCard · FaqAccordion · BuyingProcessStep · MapSection ·
WhatsappFloatingButton (+ SectionHeading, Logo). Each exists once and is reused everywhere.

---

## 7. Routing Structure
```
/                     Home
/the-development      The Development
/residences           Residences (unit grid + filters: building, floor, status, price, surface)
/residences/:slug     Unit detail (inventory facts + "Contact About Unit")
/amenities            Amenities & Lifestyle
/location             Location (map + neighbourhood)
/gallery              Gallery
/mortgage             Mortgage & Financing (+ info request form)
/faq                  FAQ
/contact              Contact (general + book showroom visit)
/admin/login · /admin · /admin/units · /admin/leads · /admin/downloads
```

---

## 8. Event Tracking Plan (draft — one `tracking.js`)
Events fire to backend `/api/track` and/or analytics layer, all defined in one module:
`page_view` · `view_unit` · `open_lead_form` · `submit_lead {lead_type}` ·
`download_brochure` · `download_price_list` · `whatsapp_click` · `phone_click` ·
`email_click` · `book_showroom_visit` · `mortgage_info_request`.
UTM params parsed once on load, persisted, and attached to every lead automatically.

---

## 9. Assumptions & Open Questions
1. **CRM API** — not yet provided. I'll build the config-driven adapter + a seeded sample
   inventory so the site is fully functional now, and wire your real CRM when you share
   the endpoint/auth/field names. ✅ assumed.
2. **Currency & surface unit** — assuming **price in USD** and **surface in sq ft**.
   Confirm (USD vs JMD; sq ft vs m²).
3. **Price List gating** — you said price list needs no info, but "Download Price List" is a
   lead type. Assumption: price list is **open** (click tracked as a lead-less event);
   **brochure** uses the Download Form. Confirm.
4. **Contact details** — need WhatsApp number, phone, email, and map address/coordinates
   for the showroom.
5. **Buildings & naming** — how many buildings and their names/labels (e.g. Block A/B…)?
6. **Mortgage page** — partner banks/rates to show, or a generic enquiry form only?
