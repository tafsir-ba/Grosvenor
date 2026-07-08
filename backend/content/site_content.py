"""Authoritative marketing content served via /api/content/*.

Single source of truth for FAQ and amenities page structure.
"""

FAQ_ITEMS = [
    {
        "q": "Where is Grosvenor Vistas located?",
        "a": "Grosvenor Vistas is in Grosvenor Heights, Manor Park, Kingston 8, Jamaica — an established, sought-after residential area.",
    },
    {
        "q": "Can I visit in person?",
        "a": "Yes. A showroom and model residence are available on the property. Book a showroom visit and we'll arrange a convenient time.",
    },
    {
        "q": "How many residences are there?",
        "a": "The development comprises 43 residences across three blocks — Heliconia, Hibiscus and Ginger Lily — plus the Begonia townhouses.",
    },
    {
        "q": "How is pricing presented?",
        "a": "Each residence is listed with its total surface, balcony surface and price in USD. Availability updates as residences are reserved or sold.",
    },
    {
        "q": "Do you offer financing?",
        "a": "Yes. See the Mortgage & Financing page and request information — our team can guide you through the available options.",
    },
    {
        "q": "How do I reserve a residence?",
        "a": "Contact us to discuss availability and place a reservation. We keep the process simple and clear.",
    },
]

# Icon keys map to lucide icon names on the frontend.
AMENITY_CATEGORIES = [
    {
        "name": "Lifestyle",
        "blurb": "Spaces designed for leisure, wellness and connection above Kingston.",
        "items": [
            {"icon": "Waves", "title": "Infinity Pool"},
            {"icon": "Dumbbell", "title": "Rooftop Gym"},
            {"icon": "PartyPopper", "title": "Rooftop Entertainment Spaces"},
            {"icon": "ToyBrick", "title": "Children's Playground"},
            {"icon": "Trees", "title": "Landscaped Gardens"},
        ],
    },
    {
        "name": "Convenience",
        "blurb": "Thoughtful, everyday details that make life here effortless and secure.",
        "items": [
            {"icon": "KeyRound", "title": "Smart Locks"},
            {"icon": "ArrowUpDown", "title": "Elevator Access"},
            {"icon": "Car", "title": "Assigned Underground Parking"},
            {"icon": "Fingerprint", "title": "Electronic Gate Access"},
            {"icon": "Trash2", "title": "Efficient Garbage Management"},
        ],
    },
    {
        "name": "Infrastructure & Reliability",
        "blurb": "Engineered systems that keep the community running, day and night.",
        "items": [
            {"icon": "Power", "title": "Backup Generator"},
            {"icon": "Droplets", "title": "Water Storage Tanks"},
            {"icon": "Filter", "title": "Grey Water Filtration System"},
            {"icon": "Sprout", "title": "Automatic Landscape Irrigation System"},
            {"icon": "ShieldCheck", "title": "Strata Approved Security Services"},
        ],
    },
]
