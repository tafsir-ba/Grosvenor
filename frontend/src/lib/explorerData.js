// Protected explorer metadata. PUBLIC pages must never import this.
// Maps each residence type to bedroom/bathroom counts and room breakdown.
// Resolved by (building + total surface). Floor plans are served via admin PDF API.

const ROOMS_2BR = ["Living / Dining", "Kitchen", "Primary Bedroom", "Bedroom 2", "Bathroom", "Ensuite Bathroom", "Balcony", "Laundry / Utility"];
const ROOMS_3BR = ["Living / Dining", "Kitchen", "Primary Bedroom", "Bedroom 2", "Bedroom 3", "Bathroom", "Ensuite Bathroom", "Guest WC", "Balcony", "Laundry / Utility"];
const ROOMS_PH = ["Living / Dining", "Kitchen", "Primary Suite", "Bedroom 2", "Bedroom 3", "Family / Lounge", "3 Bathrooms", "Guest WC", "Private Terrace", "Laundry / Utility"];
const ROOMS_TH = ["Living / Dining", "Kitchen", "Primary Suite", "Bedroom 2", "Bedroom 3", "Bedroom 4", "Bathrooms", "Guest WC", "Rooftop Terrace", "Basement / Parking", "Laundry / Utility", "Storage"];

const TYPES = {
    "2br": {
        typeName: "2 Bedroom Residence", bedrooms: 2, bathrooms: 2, rooms: ROOMS_2BR,
    },
    "3br-b": {
        typeName: "3 Bedroom Residence — Type B", bedrooms: 3, bathrooms: 3, rooms: ROOMS_3BR,
    },
    "3br-c": {
        typeName: "3 Bedroom Residence — Type C", bedrooms: 3, bathrooms: 3, rooms: ROOMS_3BR,
    },
    "ph-heliconia": {
        typeName: "3 Bedroom Penthouse — Type C", bedrooms: 3, bathrooms: 3, rooms: ROOMS_PH,
    },
    "ph-gingerlily": {
        typeName: "3 Bedroom Penthouse — Type A", bedrooms: 3, bathrooms: 3, rooms: ROOMS_PH,
    },
    "ph-hibiscus": {
        typeName: "3 Bedroom Penthouse — Type D", bedrooms: 3, bathrooms: 3, rooms: ROOMS_PH,
    },
    "townhouse": {
        typeName: "4 Bedroom Townhouse", bedrooms: 4, bathrooms: 4, rooms: ROOMS_TH,
    },
};

export const EXPLORER_TYPE_OPTIONS = Object.values(TYPES).map((t) => t.typeName);

export function getUnitType(unit) {
    const b = unit.building || "";
    const s = unit.total_surface;
    if (s >= 4500) return TYPES["townhouse"];
    if (s >= 3400) return TYPES["ph-hibiscus"];
    if (s >= 3000) return b.includes("Heliconia") ? TYPES["ph-heliconia"] : TYPES["ph-gingerlily"];
    if (s >= 2000) return TYPES["3br-b"];
    if (s >= 1750) return TYPES["3br-c"];
    return TYPES["2br"];
}
