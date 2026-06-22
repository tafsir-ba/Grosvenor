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
        mapUrl: "https://maps.app.goo.gl/cQGWC7NgNjUsAPkFA",
        mapEmbed:
            "https://maps.google.com/maps?q=Grosvenor%20Heights%2C%20Manor%20Park%2C%20Kingston%208%2C%20Jamaica&t=k&z=17&output=embed",
    },
    agentLabel: "Grosvenor Agent",
};

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

// Mirrors backend UnitStatus enum (values are authoritative on the backend).
export const STATUS_META = {
    available: { label: "Available", classes: "bg-brand-green/10 text-brand-green border-brand-green/30" },
    reserved: { label: "Reserved", classes: "bg-brand-gold/10 text-brand-gold border-brand-gold/30" },
    sold: { label: "Sold", classes: "bg-muted text-muted-foreground border-border" },
};

// Mirrors backend LeadType enum.
export const LEAD_TYPE = {
    GENERAL_CONTACT: "general_contact",
    BOOK_SHOWROOM_VISIT: "book_showroom_visit",
    DOWNLOAD_BROCHURE: "download_brochure",
    DOWNLOAD_PRICE_LIST: "download_price_list",
    CONTACT_ABOUT_UNIT: "contact_about_unit",
    MORTGAGE_INFO_REQUEST: "mortgage_info_request",
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
    whatsapp_click: "WhatsApp Click",
    phone_click: "Phone Click",
    email_click: "Email Click",
};

export const AMENITIES = [
    { title: "Rooftop Pool", body: "A serene rooftop pool with panoramic views across Manor Park.", image: "/gallery/rooftop-pool.png" },
    { title: "Private Terraces", body: "Generous outdoor terraces designed for entertaining and quiet evenings.", image: "/gallery/homestaging-evening-terrace.png" },
    { title: "Landscaped Grounds", body: "Lush, professionally landscaped gardens woven throughout the community.", image: "/gallery/terrace.png" },
    { title: "Refined Interiors", body: "Considered finishes and natural light in every elegantly staged residence.", image: "/gallery/model-unit-living-and-dining-room.png" },
    { title: "Gourmet Kitchens", body: "Contemporary kitchens crafted for both everyday living and hosting.", image: "/gallery/model-unit-kitchen.png" },
    { title: "Secure Community", body: "A gated, well-managed community offering peace of mind and privacy.", image: "/gallery/buildings-01.png" },
];

export const BUYING_PROCESS = [
    { step: "01", title: "Enquire", body: "Reach out or book a visit to the on-site showroom." },
    { step: "02", title: "Visit the Showroom", body: "Experience the model residence and tour the grounds in person." },
    { step: "03", title: "Reserve", body: "Select your residence and place a reservation with the Grosvenor Agent." },
    { step: "04", title: "Finance & Close", body: "Finalise mortgage or financing arrangements and complete your purchase." },
];

export const FAQ = [
    { q: "Where is Grosvenor Vistas located?", a: "Grosvenor Vistas is in Grosvenor Heights, Manor Park, Kingston 8, Jamaica — an established, sought-after residential area." },
    { q: "Can I visit in person?", a: "Yes. A showroom and model residence are available on the property. Book a showroom visit and the Grosvenor Agent will arrange a convenient time." },
    { q: "How many residences are there?", a: "The development comprises 43 residences across three blocks — Heliconia, Hibiscus and Ginger Lily — plus the Begonia townhouses." },
    { q: "How is pricing presented?", a: "Each residence is listed with its total surface, balcony surface and price in USD. Availability updates as residences are reserved or sold." },
    { q: "Do you offer financing?", a: "Yes. See the Mortgage & Financing page and request information — the Grosvenor Agent can guide you through the available options." },
    { q: "How do I reserve a residence?", a: "Contact the Grosvenor Agent to discuss availability and place a reservation. We keep the process simple and clear." },
];

// Curated lifestyle imagery (neutral captions — no room-spec labelling).
export const GALLERY = [
    { src: "/gallery/buildings-01.png", caption: "The Development", group: "Exteriors" },
    { src: "/gallery/townhouse-facade.png", caption: "Begonia Townhouses", group: "Exteriors" },
    { src: "/gallery/rooftop-pool.png", caption: "Rooftop Pool", group: "Amenities" },
    { src: "/gallery/terrace.png", caption: "Terrace", group: "Amenities" },
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
