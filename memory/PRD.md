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

## UI Polish (2026-06-22, fork)
- Header logo enlarged (h-24→36 on landing, shrinks on scroll). Wordmark now prominent.
- All CTAs/buttons squared (rounded-none); WhatsApp float → brand-green square.
- Base body font bumped to 1.2rem for accessibility; CtaButton text-base.
- Removed "Find Us" overline kicker from MapSection. Card corners squared on Contact/Mortgage/Development.
- AmenityScroller: click-and-drag scrolling; AMENITY_GALLERY titles corrected to real amenity list (Panoramic Views, Rooftop Pools & Gyms, Landscaped Gardens, Elevator Access, Kid's Playground, Underground Parking, Smart-Lock Entry, Gated Security).
- Downloads section simplified (title + download row only, descriptions removed).
- Verified: slider drag works, brochure gated dialog opens.

## Homepage Luxury Redesign (2026-06-23)
- Full editorial redesign per client brief V2 (De Gasparin-inspired luxury hospitality feel).
- New palette: warm white / ivory / beige + champagne gold; Grosvenor Blue now an accent only. Tokens added (brand-warm/ivory/beige) without breaking other pages.
- New heading font: Cormorant Garamond (`.lux-title`, `font-heading`) + Signika body. `.lux-eyebrow` for "— Section" labels.
- 9 sections: Hero (Elevate Your View) → The View → Lifestyle → Amenities immersive reveals → Full-width visual moment → Residences-by-size (Vista/Signature/Begonia, hover reveals sqft+price+availability from live data, NO bedroom counts) → Location preview (map) → Gallery horizontal scroll w/ arrows+counter → Final CTA.
- Gold circular FAB (FloatingActionButton.jsx) bottom-right expands to Download Brochure (gated dialog) / Book a Visit / WhatsApp — REPLACED the left brochure rail + green WhatsApp button (both files deleted).
- Framer Motion fade-up + parallax throughout; lazy-loaded imagery; real Grosvenor photos + 1 stock gym image.
- Verified: all sections render, FAB brochure dialog opens, residence hover reveal works, gallery scrolls.
- NOTE: inner pages (Residences/Amenities/Development/Location/Contact/etc.) still use the previous blue/Source Sans style — to be migrated to the new luxury system next, per user (homepage first).

## Forms, Legal, Footer & CRM-Ready (2026-06-23, fork)
- All lead forms now use SEPARATE fields: First name, Last name, Telephone, Email, Message (single LeadForm — DRY). No single "Name" field anywhere.
- Required data-processing consent checkbox on every form (Evo Home wording) with inline Privacy Policy + Legal links. Backend enforces first_name+last_name+email+consent for non-click leads; same rule on gated brochure download.
- Download Brochure forms (DownloadForm + FAB) include split fields + optional message + consent before file access.
- Removed ALL "agent" language sitewide → neutral "Contact Us / Book a Visit / our team". Admin login renamed "Admin Login".
- Footer: Privacy (evo-home.ch/en/privacy) + Legal (evo-home.ch/en/legal) links (new tab), "Designed and developed by Evohome" credit, and the full sitewide legal disclaimer (subtle small text; placeholders [ADDRESS]/[DV-XXXXXX]/[APPROVAL DATE] left for client).
- Elegant warm-luxury cookie notice (CookieNotice.jsx) — Accept All / Manage Preferences (analytics toggle) / Privacy link; persists via localStorage `gv_cookie_consent`.
- Lead model migrated: name → first_name + last_name; added consent + project="Grosvenor Vistas". CRM payload (services/crm.py) maps first/last name, project, inquiry_type, residence_ref, source_page, consent_accepted — ready to wire (sync still DISABLED via env until Evohome webhook URL/key confirmed). /api/track restricted to click events only.
- Admin leads table + CSV export updated to first_name/last_name + project + consent columns.
- Image swaps: Landscaped Grounds → new Heliconia view (home + amenities); "24/7 Armed Response" → "Strata Approved Security" with gate-entrance image; removed terrace.png & townhouse-facade.png sitewide + files.
- Tested: 29/29 backend pytest pass; all frontend form/consent/cookie/footer flows pass (iteration_2.json).

## Residences + Unit Detail Redesign (2026-06-23, fork)
- Residences page: expanded to 6 lifestyle collections (Vista/Signature/Grand/Skyline/Penthouse/Begonia Townhouses) mapped to real inventory by total surface (from listing PDF). Card design preserved; each collection card auto-filters the inventory below (client-side, removable chip). Added a zoomed aerial orientation section with subtle block labels (Heliconia/Hibiscus/Ginger Lily/Begonia).
- Collections centralised in constants.js `COLLECTIONS` + `collectionForSurface()` — single source of truth shared by Residences (TIERS) and Unit Detail.
- Unit Detail page fully rebuilt to the warm-luxury system: premium cinematic hero (Residence <no.>, building · collection, size, status), representative interior gallery (5 large captioned images per collection + "indicative, not exact photos" disclaimer), editorial overview list (NO bedroom/room counts), collection context link, "Request Floor Plan" lead form (split fields + required consent), WhatsApp/Call CTAs, and "Explore similar residences" related cards.
- CRM-ready: lead payload now also carries collection, unit_surface, unit_balcony (backend LeadCreate + crm.py mapping). source_page now = route pathname. CRM sync still DISABLED.
- Representative images assigned per collection (item 9) so units inherit imagery by size band; all imagery lazy-loaded + decoding=async.
- Tested: 31/31 backend pytest pass; all unit-detail + residences flows pass (iteration_3.json).

## Phase-2: Development & Mortgage Pages (2026-06-23, fork)
- **Development** page rebuilt in the warm luxury system: project overview with 43/3/2 stat blocks, a Masterplan section using the brochure aerial (colored leaf markers) + 4 building legend cards, "At a Glance" feature list, four building collection cards (→ Residences filter), amenities preview (→ Amenities), and a final CTA. Route: `/the-development`.
- **Mortgage** page made action-oriented: intro, 5-step buying journey (Choose → Apply → Review → Reserve → Welcome), a working client-side **Mortgage Calculator** (price/deposit/rate/term → monthly payment + loan amount), a Sagicor financing-partner section (CTAs to sagicor.com), prominent "Start Your Application" lead form (`#apply`), a FAQ accordion (shared FAQ data), and final CTA. Route: `/mortgage`.
- New shared data in constants: COLLECTIONS reuse, DEVELOPMENT_BUILDINGS, DEV_STATS, DEV_FEATURES, AMENITY_PREVIEW, MORTGAGE_STEPS, SAGICOR. New MortgageCalculator component. Masterplan image at /site/masterplan.png.
- Verified via screenshots; calculator math confirmed (420k − 63k @ 9.5%/25y → ~US$3,119/mo).

## Interactive Masterplan + Sagicor finalisation (2026-06-23, fork)
- Development masterplan is now interactive: hover/tap the four printed pins (hotspots positioned via analyzed coordinates) → soft gold glow + a premium ivory info card showing live numbers (total, available, size range, from-price) + View Residences. A compact colour-matched legend sits directly under the image and stays in sync; clicking a pin or legend item opens the filtered Residences page. Removed the redundant separate building-cards section.
- Sagicor: CTAs now link to the exact URL (sagicor.com/en-jm/personal-solution/mortgage/home-purchase); official logo added; "Your Sagicor Advisor" contact block added (Woodrow Smallwood, phone, email).

## Protected Residence Explorer (Internal Sales Tool) — 2026-06-24, fork
- New protected page at `/admin/residence-explorer` (behind admin JWT, added to admin nav, noindex meta + robots.txt Disallow /admin). Public site stays legally clean.
- Drill-down Building → Floor → Unit with status dots, breadcrumbs, back & reset, and Status/Type filters. Sticky detail panel shows FULL protected info: residence type, bedroom & bathroom counts, total/living/balcony surface, price, status, room breakdown, and floor-plan thumbnails with a zoom modal (penthouses = 2 levels, townhouses = 4 levels). "Download full plan set (PDF)" links to the Dropbox set.
- Floor-plan / bed-bath / room data is a static client mapping in `lib/explorerData.js` (resolved by building+surface) so the public API never exposes it; live status/price come from inventory. Floor-plan images copied to /public/floorplans.
- CRM-ready inquiry: new `sales_explorer` lead type; LeadCreate + crm.py + buildLeadPayload extended with residence_type, unit_living, unit_floor, unit_status (plus existing unit/building/surface/balcony/consent). Verified persisted end-to-end. CRM sync still DISABLED.
- Tested: 32/32 backend pytest + full frontend flow pass (iteration_5.json). Public compliance confirmed (no bed/bath/floorplan/rooms on /residences or unit pages).
- NOTE: consent text intentionally says "Evo Home" per client instruction (data processor) — not a bug.

## Interactive SVG Residence Explorer (Internal) — 2026-06-24, fork
- Rebuilt the visual building/floor selector inside `/admin/residence-explorer` using the client's actual vector overlays (`SVG appartments.zip`). New `lib/explorerSvg.js` (auto-generated from the SVGs) + `components/admin/ExplorerMap.jsx`.
- Drill-down: **Aerial site view** (gold hover-glow on the 3 building footprints + shortcut chips) → **Block A&B** (5 floor renders, A01–A16 / B01–B16 polygons), **Block C** (4 floors, C01–C09), **Townhouses** (2 units). All 43 SVG polygons map exactly to inventory unit numbers via `floor=ceil(n/4), pos=((n-1)%4)+1` (A/B) + explicit C/TH maps.
- Unit polygons are tinted by live status (green=available, gold=reserved, grey=sold) always-on, gold outline on hover; hover shows an inline info card (unit/surface/price/status); click selects → existing full protected detail panel (beds/baths/floor plans/rooms). Status & Type filters dim non-matching units.
- Floor renders + aerial copied to `/public/explorer/`. SVG overlays use `preserveAspectRatio="none"` over `object-fill` images (viewBox aspect ≈ image aspect) for exact alignment. ADMIN-ONLY — public pages never import explorerSvg/explorerData, compliance intact.
- Verified via screenshots: aerial, AB, C, TH views, hover card, click-to-detail, breadcrumb all working.
- Refinements (same fork): aerial "Select a building" step now spans full width (detail panel hidden until a building is entered) so the render isn't cramped; floor-plan modal got prev/next arrows + counter + floor chips so multi-level units (penthouses/townhouses) can be browsed without closing. "Site View"/Reset returns the map to the aerial.


- P1: Wire the real CRM (endpoint, auth, field names) — leads OUT + units IN sync.
- P1: Replace placeholder brochure/pricelist PDFs with real files (admin Downloads page edits file_url).
- P2: Reserved-status units (none currently) styling already supported.
- P2: Optional — interactive site map, multilingual, analytics provider (GA4) hook in tracking.js.
- P2: Confirm USD/sq ft assumptions with client (assumed per approval).
