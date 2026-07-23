// Single source of truth for static site content, labels and config.
// No prices/surfaces/statuses are hardcoded here — those come from the API.

export const PROJECT = {
    name: "Grosvenor Vistas",
    tagline: "Elevated living in Grosvenor Heights",
    location: "Grosvenor Heights · Manor Park · Kingston 8 · Jamaica",
    unitsCount: 43,
    contact: {
        phone: "+1 (876) 484-4244",
        phoneHref: "tel:+18764844244",
        whatsapp: "https://wa.me/18764844244",
        whatsappNumber: "+1 (876) 484-4244",
        email: "info@grosvenorvistas.com",
        emailHref: "mailto:info@grosvenorvistas.com",
        address: "3A Grosvenor Heights, Manor Park, Kingston 8, Jamaica",
        mapUrl: "https://maps.app.goo.gl/HKF8wRKzt6VaiSxW7",
        mapEmbed:
            "https://maps.google.com/maps?q=Grosvenor%20Heights%2C%20Manor%20Park%2C%20Kingston%208%2C%20Jamaica&t=k&z=17&output=embed",
    },
};

// Legal / compliance — single source of truth.
// Privacy/Legal documents are hosted by Evo Home (developer/vendor for Grosvenor Vistas / Niaviv Ltd.).
export const LEGAL = {
    privacyUrl: "https://evo-home.ch/en/privacy",
    legalUrl: "https://evo-home.ch/en/legal",
    privacyLabel: "Evo Home Privacy Policy",
    legalLabel: "Evo Home Legal",
    consentText:
        "By completing the form, you authorize Evo Home (developer partner for Grosvenor Vistas / Niaviv Ltd.) to store and process the personal data submitted above to provide you the requested content.",
    credit: "Designed and developed by Evohome",
    creditUrl: "https://evo-home.ch/en/",
    disclaimer:
        "Grosvenor Vistas is a development of Niaviv Ltd., located at 3A Grosvenor Height, Manor Park, Kingston 8, Company Registration No. 2018-00141. The development comprises 43 apartments ranging in size from 1,671 sq ft to 3,644 sq ft, and 2 townhouses measuring 4,845 sq ft each. The buildings are constructed with reinforced concrete slab roofs and feature polished concrete and tile flooring. Estimated completion is scheduled for 2026. No price escalation applies. The development was approved by the Kingston & St. Andrew Municipal Corporation on November 14th, 2023. Approved plans may be viewed at 3A Grosvenor Heights, Kingston, Jamaica.",
    disclaimerSecondary:
        "All images, renderings, dimensions, specifications, finishes, and other information contained on this website and in associated marketing materials are provided for illustrative purposes only. The developer reserves the right to modify, amend, substitute, or vary any aspect of the development, including but not limited to layouts, floor plans, specifications, materials, finishes, and amenities, without prior notice or obligation.",
};

// Starting price is derived from live inventory via format.minStartingPrice().

// Full amenity list (icons rendered in the UI). Views pushed first.
export const AMENITY_FEATURES = [
    { icon: "views", label: "Panoramic mountain & sea views" },
    { icon: "pool", label: "Rooftop swimming pools & gyms for each block and townhouse" },
    { icon: "elevator", label: "Elevator access to each unit, gym and pool deck" },
    { icon: "lock", label: "Entrance doors equipped with smart locks" },
    { icon: "parking", label: "Assigned underground parking for residents" },
    { icon: "playground", label: "Dedicated kid's playground area" },
    { icon: "security", label: "Strata-approved security services" },
    { icon: "gate", label: "Electronic gate system for enhanced safety" },
    { icon: "garden", label: "Well-maintained outdoor garden spaces" },
    { icon: "garbage", label: "Efficient garbage management with designated skips" },
];

export const NAV = [
    { label: "The Development", to: "/the-development" },
    { label: "Residences", to: "/residences" },
    { label: "Amenities & Lifestyle", to: "/amenities" },
    { label: "Location", to: "/location" },
    { label: "Gallery", to: "/gallery" },
    { label: "Mortgage & Financing", to: "/mortgage" },
    { label: "FAQ", to: "/faq" },
    { label: "Contact", to: "/contact" },
];

// Buildings (labels only — inventory data is dynamic from the API).
export const BUILDINGS = [
    { value: "Block A — Heliconia", short: "Heliconia", block: "Block A" },
    { value: "Block B — Hibiscus", short: "Hibiscus", block: "Block B" },
    { value: "Block C — Ginger Lily", short: "Ginger Lily", block: "Block C" },
    { value: "Townhouses — Begonia", short: "Begonia", block: "Townhouses" },
];

// Lifestyle collections — single source of truth (Residences + Unit Detail).
// Mapped to real inventory by total surface (sq ft). No bedroom/room data shown.
export const COLLECTIONS = [
    {
        key: "vista", name: "The Vista Residences", min: 0, max: 1750,
        blurb: "Poised entry residences with elegant proportions, natural light and an elevated outlook.",
        cardImage: "/gallery/home-staging-kitchen-2.png",
        heroImage: "/gallery/ext-heliconia-view.png",
        gallery: [
            { label: "Living Spaces", image: "/gallery/model-unit-living-room.png" },
            { label: "Gourmet Kitchen", image: "/gallery/home-staging-kitchen-2.png" },
            { label: "Interior Detail", image: "/gallery/model-unit-bedroom.png" },
            { label: "Terrace & Views", image: "/gallery/ext-heliconia-view.png" },
            { label: "Spa Finishes", image: "/gallery/model-unit-bathroom.png" },
        ],
    },
    {
        key: "signature", name: "Signature Residences", min: 1750, max: 2100,
        blurb: "Generously scaled residences with refined finishes and considered living spaces.",
        cardImage: "/gallery/homestaging-bathroom-4.png",
        heroImage: "/gallery/terrace-2.png",
        gallery: [
            { label: "Living Spaces", image: "/gallery/homestaging-living-room-2.png" },
            { label: "Gourmet Kitchen", image: "/gallery/homestaging-kitchen.png" },
            { label: "Interior Detail", image: "/gallery/homestaging-ginger-lily-bedroom.png" },
            { label: "Terrace & Views", image: "/gallery/terrace-2.png" },
            { label: "Spa Finishes", image: "/gallery/homestaging-bathroom-4.png" },
        ],
    },
    {
        key: "grand", name: "Grand Residences", min: 2100, max: 2600,
        blurb: "Expansive residences designed for entertaining, with open-plan living and wide outlooks.",
        cardImage: "/gallery/model-unit-living-and-dining-room.png",
        heroImage: "/gallery/ext-rooftop-mountain.png",
        gallery: [
            { label: "Living & Dining", image: "/gallery/model-unit-living-and-dining-room.png" },
            { label: "Gourmet Kitchen", image: "/gallery/model-unit-dining-kitchen.png" },
            { label: "Interior Detail", image: "/gallery/model-unit-bedroom-2.png" },
            { label: "Terrace & Views", image: "/gallery/ext-rooftop-mountain.png" },
            { label: "Spa Finishes", image: "/gallery/model-unit-bathroom-2.png" },
        ],
    },
    {
        key: "skyline", name: "Skyline Residences", min: 2600, max: 3400,
        blurb: "Duplex residences across two levels, crowned by sweeping skyline and mountain views.",
        cardImage: "/gallery/ext-rooftop-seaview.png",
        heroImage: "/gallery/ext-rooftop-seaview.png",
        gallery: [
            { label: "Living Spaces", image: "/gallery/homestaging-living-dinning-room-kitchen-2.png" },
            { label: "Gourmet Kitchen", image: "/gallery/model-unit-kitchen.png" },
            { label: "Interior Detail", image: "/gallery/model-unit-bedroom-3.png" },
            { label: "Terrace & Views", image: "/gallery/ext-rooftop-seaview.png" },
            { label: "Spa Finishes", image: "/gallery/model-unit-master-bathroom-3.png" },
        ],
    },
    {
        key: "penthouse", name: "Penthouse Collection", min: 3400, max: 4500,
        blurb: "The development's most exclusive duplex residences, with the finest finishes and panoramas.",
        cardImage: "/gallery/homestaging-living-room-2.png",
        heroImage: "/gallery/hero-rooftop-sunset.png",
        gallery: [
            { label: "Living Spaces", image: "/gallery/home-staging-living-dinning-room-and-kitchen.png" },
            { label: "Gourmet Kitchen", image: "/gallery/homestaging-kitchen.png" },
            { label: "Interior Detail", image: "/gallery/model-unit-mater-bedroom.png" },
            { label: "Terrace & Views", image: "/gallery/hero-rooftop-sunset.png" },
            { label: "Spa Finishes", image: "/gallery/model-unit-master-bathroom-4.png" },
        ],
    },
    {
        key: "townhouses", name: "Begonia Townhouses", min: 4500, max: 100000,
        blurb: "Standalone townhouse residences with private rooftop space and the largest footprints.",
        cardImage: "/gallery/townhouse-new.png",
        heroImage: "/gallery/heliconia-grounds.png",
        gallery: [
            { label: "Living Spaces", image: "/gallery/model-unit-living-room.png" },
            { label: "Gourmet Kitchen", image: "/gallery/model-unit-dining-kitchen.png" },
            { label: "Interior Detail", image: "/gallery/model-unit-mater-bedroom.png" },
            { label: "Grounds & Views", image: "/gallery/heliconia-grounds.png" },
            { label: "Spa Finishes", image: "/gallery/homestaging-master-bathroom-1.png" },
        ],
    },
];

// Public residence categories — 4 simplified cards (homepage + Residences page).
export const HOME_RESIDENCE_CATEGORIES = [
    {
        key: "vista",
        name: "Vista Residences",
        subtitle: null,
        min: 0,
        max: 1750,
        cardImage: "/gallery/home-staging-kitchen-2.png",
        collectionKey: "vista",
    },
    {
        key: "signature",
        name: "Signature Residences",
        subtitle: null,
        min: 1750,
        max: 2600,
        cardImage: "/gallery/homestaging-bathroom-4.png",
        collectionKey: "signature",
    },
    {
        key: "skyline",
        name: "Skyline Residences",
        subtitle: "Penthouse",
        min: 2600,
        max: 4500,
        cardImage: "/gallery/ext-rooftop-seaview.png",
        collectionKey: "skyline",
    },
    {
        key: "town",
        name: "Town Residences",
        subtitle: "Townhouses",
        min: 4500,
        max: Infinity,
        cardImage: "/gallery/townhouse-new.png",
        collectionKey: "townhouses",
    },
];

// Homepage media — single source of truth for hero fallback and location map.
export const HOME_MEDIA = {
    heroVideo: "/video/hero.mp4",
    heroFallback: "/media/grosvenor-website-header.webp",
    locationMap: "/media/grosvenor-map.webp",
};

// Homepage amenity highlights (4 items — titles only on dedicated Amenities page).
export const HOME_AMENITY_HIGHLIGHTS = [
    { icon: "waves", title: "Rooftop Infinity Pool", line: "Infinity-edge pools with sweeping views across the hillside." },
    { icon: "dumbbell", title: "Rooftop Gym", line: "Private fitness studios on every block, open to residents." },
    { icon: "key", title: "Smart Locks", line: "Keyless entry with smart-lock technology at every door." },
    { icon: "car", title: "Underground Parking", line: "Secure underground parking provided for every residence." },
];

// Homepage lifestyle panels — image-led, minimal copy.
export const HOME_LIFESTYLE_PANELS = [
    { title: "Privacy", line: "A private, gated residential setting.", image: "/gallery/gate-entrance.png" },
    { title: "Elevation", line: "Elevated views over Kingston.", image: "/gallery/ext-rooftop-seaview.png" },
    { title: "Modern Living", line: "Contemporary spaces designed for ease.", image: "/gallery/model-unit-living-room.png" },
];

export function homeCategoryForKey(key) {
    if (!key) return null;
    return (
        HOME_RESIDENCE_CATEGORIES.find((c) => c.key === key || c.collectionKey === key)
        || null
    );
}

export function homeCategoryForSurface(surface) {
    if (surface == null) return null;
    return HOME_RESIDENCE_CATEGORIES.find((c) => surface >= c.min && surface < c.max) || null;
}

export function unitMatchesHomeCategory(unit, category) {
    if (!category || unit.total_surface == null) return false;
    return unit.total_surface >= category.min && unit.total_surface < category.max;
}

export function collectionForSurface(surface) {
    return COLLECTIONS.find((c) => surface >= c.min && surface < c.max) || COLLECTIONS[0];
}

// Mirrors backend UnitStatus enum (values are authoritative on the backend).
export const STATUS_META = {
    available: { label: "Available", classes: "bg-brand-green/10 text-brand-green" },
    reserved: { label: "Under offer", classes: "bg-brand-gold text-white" },
    sold: { label: "Under contract", classes: "bg-brand-ink/[0.06] text-brand-ink/55" },
};

export const UNIT_STATUSES = Object.keys(STATUS_META);

export const LEAD_STATUSES = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
];

// Mirrors backend LeadType enum.
export const LEAD_TYPE = {
    GENERAL_CONTACT: "general_contact",
    BOOK_SHOWROOM_VISIT: "book_showroom_visit",
    DOWNLOAD_BROCHURE: "download_brochure",
    DOWNLOAD_PRICE_LIST: "download_price_list",
    CONTACT_ABOUT_UNIT: "contact_about_unit",
    MORTGAGE_INFO_REQUEST: "mortgage_info_request",
    SALES_EXPLORER: "sales_explorer",
    WHATSAPP_CLICK: "whatsapp_click",
    PHONE_CLICK: "phone_click",
    EMAIL_CLICK: "email_click",
};

export const LEAD_TYPE_LABEL = {
    general_contact: "General Contact",
    book_showroom_visit: "Book Showroom Visit",
    download_brochure: "Brochure Download",
    download_price_list: "Price List Download",
    contact_about_unit: "Unit Enquiry",
    mortgage_info_request: "Mortgage Enquiry",
    sales_explorer: "Sales Explorer Inquiry",
    whatsapp_click: "WhatsApp Click",
    phone_click: "Phone Click",
    email_click: "Email Click",
};

export const BUYING_PROCESS = [
    { step: "01", title: "Enquire", body: "Reach out or book a visit to the on-site showroom." },
    { step: "02", title: "Visit the Showroom", body: "Experience the model residence and tour the grounds in person." },
    { step: "03", title: "Reserve", body: "Select your residence and place a reservation with our team." },
    { step: "04", title: "Finance & Close", body: "Finalise mortgage or financing arrangements and complete your purchase." },
];

// FAQ content is served from GET /api/content/faq (backend/content/site_content.py).

// Curated lifestyle imagery (neutral captions — no room-spec labelling).
export const GALLERY = [
    { src: "/gallery/buildings-01.png", caption: "The Development", group: "Exteriors" },
    { src: "/gallery/rooftop-pool.png", caption: "Rooftop Pool", group: "Amenities" },
    { src: "/gallery/terrace-2.png", caption: "Outdoor Living", group: "Amenities" },
    { src: "/gallery/homestaging-evening-terrace.png", caption: "Evening Terrace", group: "Amenities" },
    { src: "/gallery/model-unit-living-room.png", caption: "Model Residence", group: "Interiors" },
    { src: "/gallery/homestaging-living-room-2.png", caption: "Living Spaces", group: "Interiors" },
    { src: "/gallery/model-unit-living-and-dining-room.png", caption: "Living & Dining", group: "Interiors" },
    { src: "/gallery/home-staging-living-dinning-room-and-kitchen.png", caption: "Open-Plan Living", group: "Interiors" },
    { src: "/gallery/homestaging-living-dinning-room-kitchen-2.png", caption: "Entertaining Space", group: "Interiors" },
    { src: "/gallery/model-unit-kitchen.png", caption: "Gourmet Kitchen", group: "Interiors" },
    { src: "/gallery/homestaging-kitchen.png", caption: "Kitchen Detail", group: "Interiors" },
    { src: "/gallery/model-unit-dining-kitchen.png", caption: "Dining & Kitchen", group: "Interiors" },
    { src: "/gallery/walk-in-closet.png", caption: "Dressing Area", group: "Interiors" },
    { src: "/gallery/model-unit-dinning-room.png", caption: "Dining", group: "Interiors" },
];

export const HERO_IMAGE = "/gallery/buildings-01.png";
export const AERIAL_IMAGE = "/site/aerial-masterplan.jpg";
export const MASTERPLAN_IMAGE = "/site/masterplan.png";

// Masterplan — the four buildings (colours match the brochure leaf markers).
// Stats (counts, sizes, prices) are computed live from inventory.
export const DEVELOPMENT_BUILDINGS = [
    { name: "Heliconia", block: "Block A", color: "#C6862B", building: "Block A — Heliconia", collection: "vista" },
    { name: "Hibiscus", block: "Block B", color: "#1F3A5F", building: "Block B — Hibiscus", collection: "vista" },
    { name: "Ginger Lily", block: "Block C", color: "#B5571F", building: "Block C — Ginger Lily", collection: "vista" },
    { name: "Begonia", block: "Townhouses", color: "#4B2E6B", building: "Townhouses — Begonia", collection: "townhouses" },
];

export const DEV_FEATURES = [
    "Rooftop swimming pools",
    "Gyms for each block",
    "Convenient elevator access",
    "Underground parking",
    "Strata approved security",
    "Electronic gate access",
    "Landscaped outdoor areas",
    "Children's playground",
];

// Amenities preview (links through to the full Amenities page).
export const AMENITY_PREVIEW = [
    { title: "Rooftop Pools", image: "/gallery/rooftop-pool.png" },
    { title: "Gym", image: "/gallery/homestaging-living-dinning-room-kitchen-2.png" },
    { title: "Landscaped Grounds", image: "/gallery/heliconia-grounds.png" },
    { title: "Children's Playground", image: "/gallery/homestaging-evening-terrace.png" },
    { title: "Security", image: "/gallery/gate-entrance.png" },
    { title: "Outdoor Gathering Spaces", image: "/gallery/terrace-2.png" },
];

// Mortgage — buyer journey + financing partner.
export const MORTGAGE_STEPS = [
    { title: "Choose Your Residence", body: "Browse availability and select the residence that suits you." },
    { title: "Submit Your Application", body: "Complete a short online application to get started." },
    { title: "Financing Review", body: "Your financing options are reviewed with our partner." },
    { title: "Reservation & Agreement", body: "Place your reservation and sign the sale agreement." },
    { title: "Welcome to Grosvenor Vistas", body: "Complete your purchase and collect your keys." },
];
export const SAGICOR = {
    name: "Sagicor",
    blurb: "Our preferred financing partner. Sagicor offers tailored mortgage solutions for local and overseas buyers, with competitive rates and clear, supportive guidance throughout.",
    url: "https://www.sagicor.com/en-jm/personal-solution/mortgage/home-purchase",
    rep: { name: "Woodrow Smallwood", phone: "+1 (876) 838-3431", phoneHref: "tel:+18768383431", email: "woodrow_smallwood@sagicor.com" },
};

// Image-led amenity showcase — short titles only, drawn from the real amenity list.
export const AMENITY_GALLERY = [
    { title: "Panoramic Views", image: "/gallery/buildings-01.png" },
    { title: "Rooftop Pools & Gyms", image: "/gallery/rooftop-pool.png" },
    { title: "Landscaped Gardens", image: "/gallery/heliconia-grounds.png" },
    { title: "Elevator Access", image: "/gallery/terrace-2.png" },
    { title: "Kid's Playground", image: "/gallery/homestaging-evening-terrace.png" },
    { title: "Underground Parking", image: "/gallery/ext-aerial.png" },
    { title: "Smart-Lock Entry", image: "/gallery/model-unit-living-room.png" },
    { title: "Gated Security", image: "/gallery/model-unit-living-and-dining-room.png" },
];

export const SHOWROOM_IMAGE = "/gallery/model-unit-living-room.png";
