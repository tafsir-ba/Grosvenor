// Single source of truth for static site content, labels and config.
// No prices/surfaces/statuses are hardcoded here — those come from the API.

export const PROJECT = {
    name: "Grosvenor Vistas",
    tagline: "Elevated living in Grosvenor Heights",
    location: "Grosvenor Heights · Manor Park · Kingston 8 · Jamaica",
    unitsCount: 43,
    apartmentCount: 41,
    townhouseCount: 2,
    contact: {
        phone: "+1 (876) 484-4244",
        phoneHref: "tel:+18764844244",
        whatsapp: "https://wa.me/18764844244",
        whatsappNumber: "+1 (876) 484-4244",
        email: "info@grosvenorvistas.com",
        emailHref: "mailto:info@grosvenorvistas.com",
        address: "3A Grosvenor Heights, Manor Park, Kingston 8, Jamaica",
        mapUrl: "https://maps.app.goo.gl/HKF8wRKzt6VaiSxW7",
        // Pin on Grosvenor Vistas; center offset east/NE so Manor Park, Norbrook & Constant Spring Golf sit in frame.
        mapEmbed:
            "https://maps.google.com/maps?q=18.0477121,-76.7984781&ll=18.0502,-76.7918&z=15&t=k&output=embed",
    },
    // Official profile URL when ready; omit/empty to hide Instagram CTAs.
    social: {
        instagram: "",
    },
};

// Legal / compliance — single source of truth.
// Privacy/Legal documents are hosted by Evo Home (developer/vendor for Grosvenor Vistas / Niaviv Ltd.).
export const LEGAL = {
    privacyUrl: "https://evo-home.ch/en/privacy",
    legalUrl: "https://evo-home.ch/en/legal",
    privacyLabel: "Privacy Policy",
    legalLabel: "Legal",
    consentText:
        "By completing the form, you authorize Evo Home (developer partner for Grosvenor Vistas / Niaviv Ltd.) to store and process the personal data submitted above to provide you the requested content.",
    credit: "Designed and developed by Evohome",
    creditUrl: "https://evo-home.ch/en/",
    // Counts from PROJECT SoT. Wording offers plan *viewing* via Contact — not public floor-plan downloads.
    get disclaimer() {
        return (
            `Grosvenor Vistas is a development of Niaviv Ltd., located at 3A Grosvenor Heights, Manor Park, Kingston 8, Company Registration No. 2018-00141. ` +
            `The development comprises ${PROJECT.unitsCount} residences in total — ${PROJECT.apartmentCount} apartments ranging in size from 1,671 sq ft to 3,644 sq ft, and ${PROJECT.townhouseCount} townhouses measuring 4,845 sq ft each. ` +
            `The buildings are constructed with reinforced concrete slab roofs and feature polished concrete and tile flooring. Estimated completion is scheduled for 2026. No price escalation applies. ` +
            `The development was approved by the Kingston & St. Andrew Municipal Corporation on November 14th, 2023. Approved plans may be viewed at 3A Grosvenor Heights, Kingston, Jamaica. ` +
            `To arrange a viewing of approved plans, contact us via the Contact page or WhatsApp — our team can assist.`
        );
    },
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
// Collection galleries use Vanessa's must-use real photographs (indicative across units).
export const COLLECTIONS = [
    {
        key: "vista", name: "The Vista Residences", min: 0, max: 1750,
        blurb: "Poised entry residences with elegant proportions, natural light and an elevated outlook.",
        cardImage: "/gallery/photos/grosvenor-model-living-room.webp",
        heroImage: "/gallery/photos/grosvenor-apartment-elevated-outlook.webp",
        gallery: [
            { label: "Living Spaces", image: "/gallery/photos/grosvenor-model-living-room.webp" },
            { label: "Kitchen Detail", image: "/gallery/photos/grosvenor-kitchen-window-detail-thumb.webp", fullImage: "/gallery/photos/grosvenor-kitchen-window-detail.webp" },
            { label: "Interior Detail", image: "/gallery/photos/grosvenor-model-bedroom-suite.webp" },
            { label: "Terrace & Views", image: "/gallery/photos/grosvenor-valley-golden-hour.webp" },
            { label: "Spa Finishes", image: "/gallery/photos/grosvenor-model-bathroom.webp" },
        ],
    },
    {
        key: "signature", name: "Signature Residences", min: 1750, max: 2100,
        blurb: "Generously scaled residences with refined finishes and considered living spaces.",
        cardImage: "/gallery/photos/grosvenor-model-bathroom-angle-2.webp",
        heroImage: "/gallery/photos/grosvenor-kingston-coastal-outlook.webp",
        gallery: [
            { label: "Living Spaces", image: "/gallery/photos/grosvenor-model-living-room.webp" },
            { label: "Kitchen Detail", image: "/gallery/photos/grosvenor-kitchen-window-detail-thumb.webp", fullImage: "/gallery/photos/grosvenor-kitchen-window-detail.webp" },
            { label: "Interior Detail", image: "/gallery/photos/grosvenor-model-bedroom-suite.webp" },
            { label: "Terrace & Views", image: "/gallery/photos/grosvenor-kingston-coastal-outlook.webp" },
            { label: "Spa Finishes", image: "/gallery/photos/grosvenor-model-bathroom-angle-2.webp" },
        ],
    },
    {
        key: "grand", name: "Grand Residences", min: 2100, max: 2600,
        blurb: "Expansive residences designed for entertaining, with open-plan living and wide outlooks.",
        cardImage: "/gallery/photos/grosvenor-model-living-room.webp",
        heroImage: "/gallery/photos/grosvenor-apartment-elevated-outlook.webp",
        gallery: [
            { label: "Living Spaces", image: "/gallery/photos/grosvenor-model-living-room.webp" },
            { label: "Kitchen Detail", image: "/gallery/photos/grosvenor-kitchen-window-detail-thumb.webp", fullImage: "/gallery/photos/grosvenor-kitchen-window-detail.webp" },
            { label: "Interior Detail", image: "/gallery/photos/grosvenor-model-bedroom.webp" },
            { label: "Terrace & Views", image: "/gallery/photos/grosvenor-apartment-elevated-outlook.webp" },
            { label: "Spa Finishes", image: "/gallery/photos/grosvenor-model-bathroom.webp" },
        ],
    },
    {
        key: "skyline", name: "Skyline Residences", min: 2600, max: 3400,
        blurb: "Duplex residences across two levels, crowned by sweeping skyline and mountain views.",
        cardImage: "/gallery/photos/grosvenor-kingston-coastal-outlook.webp",
        heroImage: "/gallery/photos/grosvenor-kingston-coastal-outlook.webp",
        gallery: [
            { label: "Living Spaces", image: "/gallery/photos/grosvenor-model-living-room.webp" },
            { label: "Kitchen Detail", image: "/gallery/photos/grosvenor-kitchen-window-detail-thumb.webp", fullImage: "/gallery/photos/grosvenor-kitchen-window-detail.webp" },
            { label: "Interior Detail", image: "/gallery/photos/grosvenor-model-bedroom-suite.webp" },
            { label: "Terrace & Views", image: "/gallery/photos/grosvenor-kingston-coastal-outlook.webp" },
            { label: "Spa Finishes", image: "/gallery/photos/grosvenor-model-bathroom-angle-2.webp" },
        ],
    },
    {
        key: "penthouse", name: "Penthouse Collection", min: 3400, max: 4500,
        blurb: "The development's most exclusive duplex residences, with the finest finishes and panoramas.",
        cardImage: "/gallery/photos/grosvenor-valley-golden-hour.webp",
        heroImage: "/gallery/photos/grosvenor-valley-golden-hour.webp",
        gallery: [
            { label: "Living Spaces", image: "/gallery/photos/grosvenor-model-living-room.webp" },
            { label: "Kitchen Detail", image: "/gallery/photos/grosvenor-kitchen-window-detail-thumb.webp", fullImage: "/gallery/photos/grosvenor-kitchen-window-detail.webp" },
            { label: "Interior Detail", image: "/gallery/photos/grosvenor-model-bedroom.webp" },
            { label: "Terrace & Views", image: "/gallery/photos/grosvenor-valley-golden-hour.webp" },
            { label: "Spa Finishes", image: "/gallery/photos/grosvenor-model-bathroom.webp" },
        ],
    },
    {
        key: "townhouses", name: "Begonia Townhouses", min: 4500, max: 100000,
        blurb: "Standalone townhouse residences with private rooftop space and the largest footprints.",
        cardImage: "/gallery/photos/grosvenor-townhouses-exterior-day-16x10.webp",
        heroImage: "/gallery/photos/grosvenor-townhouses-exterior-day.webp",
        gallery: [
            { label: "Living Spaces", image: "/gallery/photos/grosvenor-model-living-room.webp" },
            { label: "Kitchen Detail", image: "/gallery/photos/grosvenor-kitchen-window-detail-thumb.webp", fullImage: "/gallery/photos/grosvenor-kitchen-window-detail.webp" },
            { label: "Interior Detail", image: "/gallery/photos/grosvenor-model-bedroom-suite.webp" },
            { label: "Grounds & Views", image: "/gallery/photos/grosvenor-landscaped-courtyard.webp" },
            { label: "Spa Finishes", image: "/gallery/photos/grosvenor-model-bathroom-angle-2.webp" },
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
        cardImage: "/gallery/photos/grosvenor-model-living-room.webp",
        collectionKey: "vista",
    },
    {
        key: "signature",
        name: "Signature Residences",
        subtitle: null,
        min: 1750,
        max: 2600,
        cardImage: "/gallery/photos/grosvenor-model-bathroom-angle-2.webp",
        collectionKey: "signature",
    },
    {
        key: "skyline",
        name: "Skyline Residences",
        subtitle: "Penthouse",
        min: 2600,
        max: 4500,
        cardImage: "/gallery/photos/grosvenor-kingston-coastal-outlook.webp",
        collectionKey: "skyline",
    },
    {
        key: "town",
        name: "Town Residences",
        subtitle: "Townhouses",
        min: 4500,
        max: Infinity,
        cardImage: "/gallery/photos/grosvenor-townhouses-exterior-day-16x10.webp",
        collectionKey: "townhouses",
    },
];

// Homepage media — single source of truth for hero fallback and location map.
export const HOME_MEDIA = {
    heroVideo: "/video/hero.mp4",
    heroFallback: "/media/grosvenor-website-header.webp",
    locationMap: "/media/grosvenor-map.jpg",
};

// Homepage amenity highlights (4 items — titles only on dedicated Amenities page).
export const HOME_AMENITY_HIGHLIGHTS = [
    { icon: "waves", title: "Rooftop Infinity Pool", line: "Infinity-edge pools with sweeping views across the hillside." },
    { icon: "dumbbell", title: "Rooftop Gym", line: "Private fitness studios on every block, open to residents." },
    { icon: "key", title: "Smart Locks", line: "Keyless entry with smart-lock technology at every door." },
    { icon: "car", title: "Underground Parking", line: "Secure underground parking provided for every residence." },
];

// Homepage lifestyle panels — image-led, minimal copy.
// Not the homepage hero (HOME_MEDIA); these sit below the fold.
export const HOME_LIFESTYLE_PANELS = [
    { title: "Privacy", line: "A private, gated residential setting.", image: "/gallery/photos/grosvenor-entrance-gate.webp" },
    { title: "Elevation", line: "Elevated views over Kingston.", image: "/gallery/photos/grosvenor-kingston-coastal-outlook.webp" },
    { title: "Modern Living", line: "Contemporary spaces designed for ease.", image: "/gallery/photos/grosvenor-model-living-room.webp" },
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

// Real-photo assets from the Nov 2026 photo brief (native WebP, no upscaling).
// Homepage hero uses HOME_MEDIA and must remain unchanged — do not point it here.
export const PHOTO = {
    apartmentExterior: "/gallery/photos/grosvenor-apartment-exterior-day.webp",
    apartmentExteriorCard: "/gallery/photos/grosvenor-apartment-exterior-day-16x10.webp",
    apartmentElevatedOutlook: "/gallery/photos/grosvenor-apartment-elevated-outlook.webp",
    developmentHero: "/gallery/photos/grosvenor-development-hero.webp",
    townhouseExterior: "/gallery/photos/grosvenor-townhouses-exterior-day.webp",
    townhouseExteriorCard: "/gallery/photos/grosvenor-townhouses-exterior-day-16x10.webp",
    rooftopPoolDay: "/gallery/photos/grosvenor-rooftop-pool-day.webp",
    rooftopPoolDayHero: "/gallery/photos/grosvenor-rooftop-pool-day-hero.webp",
    rooftopPoolBlueHour: "/gallery/photos/grosvenor-rooftop-pool-blue-hour.webp",
    neighbourhoodOutlook: "/gallery/photos/grosvenor-neighbourhood-outlook-day.webp",
    neighbourhoodOutlookHero: "/gallery/photos/grosvenor-neighbourhood-outlook-day-hero.webp",
    rooftopCityBlueHour: "/gallery/photos/grosvenor-rooftop-city-blue-hour.webp",
    rooftopCityBlueHourHero: "/gallery/photos/grosvenor-rooftop-city-blue-hour-hero.webp",
    rooftopTerraceDusk: "/gallery/photos/grosvenor-rooftop-terrace-dusk.webp",
    kingstonCoastal: "/gallery/photos/grosvenor-kingston-coastal-outlook.webp",
    valleyGoldenHour: "/gallery/photos/grosvenor-valley-golden-hour.webp",
    modelLiving: "/gallery/photos/grosvenor-model-living-room.webp",
    modelBedroom: "/gallery/photos/grosvenor-model-bedroom.webp",
    modelBedroomSuite: "/gallery/photos/grosvenor-model-bedroom-suite.webp",
    modelBathroom: "/gallery/photos/grosvenor-model-bathroom.webp",
    modelBathroomAngle2: "/gallery/photos/grosvenor-model-bathroom-angle-2.webp",
    kitchenWindow: "/gallery/photos/grosvenor-kitchen-window-detail.webp",
    kitchenWindowThumb: "/gallery/photos/grosvenor-kitchen-window-detail-thumb.webp",
    landscapedCourtyard: "/gallery/photos/grosvenor-landscaped-courtyard.webp",
    entranceGate: "/gallery/photos/grosvenor-entrance-gate.webp",
    undergroundParking: "/gallery/photos/grosvenor-underground-parking.webp",
    wayfindingSign: "/gallery/photos/grosvenor-wayfinding-sign.webp",
    wayfindingSignThumb: "/gallery/photos/grosvenor-wayfinding-sign-thumb.webp",
};

/** Shared first Exterior slot for every residence detail page. */
export function residenceExteriorImage(collection) {
    const isTownhouse = collection?.key === "townhouses";
    if (isTownhouse) {
        return {
            label: "Exterior",
            caption: "Townhouse exterior — representative photograph",
            image: PHOTO.townhouseExteriorCard,
            fullImage: PHOTO.townhouseExterior,
            objectPosition: "center 40%",
        };
    }
    return {
        label: "Exterior",
        caption: "Development exterior — representative photograph",
        image: PHOTO.apartmentExteriorCard,
        fullImage: PHOTO.apartmentExterior,
        objectPosition: "center 45%",
    };
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
    WHATSAPP_ENQUIRY: "whatsapp_enquiry",
    WHATSAPP_CLICK: "whatsapp_click",
    PHONE_CLICK: "phone_click",
    EMAIL_CLICK: "email_click",
};

export const DOWNLOAD_TYPE = {
    BROCHURE: "brochure",
    BROCHURE_EMAIL: "brochure_email",
    PRICELIST: "pricelist",
};

export const DOWNLOAD_TYPE_LABEL = {
    brochure: "Website brochure (form)",
    brochure_email: "Email brochure (open link)",
    pricelist: "Price list",
};

export const LEAD_TYPE_LABEL = {
    general_contact: "General Contact",
    book_showroom_visit: "Book Showroom Visit",
    download_brochure: "Brochure Download",
    download_price_list: "Price List Download",
    contact_about_unit: "Unit Enquiry",
    mortgage_info_request: "Mortgage Enquiry",
    sales_explorer: "Sales Explorer Inquiry",
    whatsapp_enquiry: "WhatsApp Enquiry",
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

// Curated lifestyle imagery — real photographs (Nov 2026 brief + Vanessa must-use set).
// thumb = landscape grid source; src = full-aspect lightbox original.
export const GALLERY = [
    { src: PHOTO.apartmentExterior, thumb: PHOTO.apartmentExteriorCard, caption: "Apartment architecture", group: "Exteriors" },
    { src: PHOTO.apartmentElevatedOutlook, caption: "Elevated apartment outlook", group: "Exteriors" },
    { src: PHOTO.townhouseExterior, thumb: PHOTO.townhouseExteriorCard, caption: "The townhouses", group: "Exteriors" },
    { src: PHOTO.rooftopPoolDay, caption: "Rooftop pool by day", group: "Amenities" },
    { src: PHOTO.rooftopPoolBlueHour, caption: "Rooftop pool at blue hour", group: "Amenities" },
    { src: PHOTO.rooftopTerraceDusk, caption: "Rooftop terrace at dusk", group: "Amenities" },
    { src: PHOTO.kingstonCoastal, caption: "Kingston and coastal outlook", group: "Views" },
    { src: PHOTO.valleyGoldenHour, caption: "Valley outlook at golden hour", group: "Views" },
    { src: PHOTO.modelLiving, caption: "Model residence: living room", group: "Interiors" },
    { src: PHOTO.modelBedroomSuite, caption: "Model residence: bedroom suite", group: "Interiors" },
    { src: PHOTO.modelBedroom, caption: "Model residence: bedroom", group: "Interiors" },
    { src: PHOTO.modelBathroom, caption: "Model residence: bathroom", group: "Interiors" },
    { src: PHOTO.modelBathroomAngle2, caption: "Model residence: bathroom with tub", group: "Interiors" },
    { src: PHOTO.kitchenWindow, thumb: PHOTO.kitchenWindowThumb, caption: "Kitchen window detail", group: "Interiors", fit: "contain" },
    { src: PHOTO.landscapedCourtyard, caption: "Landscaped courtyard", group: "Grounds" },
    { src: PHOTO.entranceGate, caption: "Entrance gate", group: "Grounds" },
    { src: PHOTO.wayfindingSign, thumb: PHOTO.wayfindingSignThumb, caption: "On-site wayfinding", group: "Grounds", fit: "contain" },
    { src: PHOTO.undergroundParking, caption: "Underground parking", group: "Amenities" },
];

// Legacy constant retained for any residual imports; homepage hero uses HOME_MEDIA instead.
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
// Gym / Children's Playground use icon tiles until verified photos exist.
export const AMENITY_PREVIEW = [
    { title: "Rooftop Pools", image: PHOTO.rooftopPoolDay },
    { title: "Gym", icon: "dumbbell" },
    { title: "Landscaped Grounds", image: PHOTO.landscapedCourtyard },
    { title: "Children's Playground", icon: "playground" },
    { title: "Security", image: PHOTO.entranceGate, caption: "Gated access" },
    { title: "Outdoor Gathering Spaces", image: PHOTO.rooftopTerraceDusk },
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

export const MORTGAGE_APPLICATION_URL = "https://share.hsforms.com/1xmbxR3viQzqxRX7ZfBW6dg3e5iv";

// Image-led amenity showcase — short titles only, drawn from the real amenity list.
export const AMENITY_GALLERY = [
    { title: "Panoramic Views", image: PHOTO.kingstonCoastal },
    { title: "Rooftop Pools & Gyms", image: PHOTO.rooftopPoolDay },
    { title: "Landscaped Gardens", image: PHOTO.landscapedCourtyard },
    { title: "Elevator Access", image: PHOTO.rooftopTerraceDusk },
    { title: "Kid's Playground", icon: "playground" },
    { title: "Underground Parking", image: PHOTO.undergroundParking },
    { title: "Smart-Lock Entry", image: PHOTO.entranceGate },
    { title: "Gated Security", image: PHOTO.entranceGate },
];

export const SHOWROOM_IMAGE = PHOTO.modelBedroomSuite;
