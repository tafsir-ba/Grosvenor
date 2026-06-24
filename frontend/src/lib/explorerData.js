// Protected explorer metadata. PUBLIC pages must never import this.
// Maps each residence type to bedroom/bathroom counts, room breakdown and
// floor-plan images. Resolved by (building + total surface) since the same
// "Type" letter is reused across buildings. CRM can later own this data.

const ROOMS_2BR = ["Living / Dining", "Kitchen", "Primary Bedroom", "Bedroom 2", "Bathroom", "Ensuite Bathroom", "Balcony", "Laundry / Utility"];
const ROOMS_3BR = ["Living / Dining", "Kitchen", "Primary Bedroom", "Bedroom 2", "Bedroom 3", "Bathroom", "Ensuite Bathroom", "Guest WC", "Balcony", "Laundry / Utility"];
const ROOMS_PH = ["Living / Dining", "Kitchen", "Primary Suite", "Bedroom 2", "Bedroom 3", "Family / Lounge", "3 Bathrooms", "Guest WC", "Private Terrace", "Laundry / Utility"];
const ROOMS_TH = ["Living / Dining", "Kitchen", "Primary Suite", "Bedroom 2", "Bedroom 3", "Bedroom 4", "Bathrooms", "Guest WC", "Rooftop Terrace", "Basement / Parking", "Laundry / Utility", "Storage"];

const TYPES = {
    "2br": {
        typeName: "2 Bedroom Residence", bedrooms: 2, bathrooms: 2, rooms: ROOMS_2BR,
        floorPlans: [{ label: "Residence Plan", image: "/floorplans/type-a-2br.jpg" }],
    },
    "3br-b": {
        typeName: "3 Bedroom Residence — Type B", bedrooms: 3, bathrooms: 3, rooms: ROOMS_3BR,
        floorPlans: [{ label: "Residence Plan", image: "/floorplans/type-b-3br.jpg" }],
    },
    "3br-c": {
        typeName: "3 Bedroom Residence — Type C", bedrooms: 3, bathrooms: 3, rooms: ROOMS_3BR,
        floorPlans: [{ label: "Residence Plan", image: "/floorplans/type-c-3br.jpg" }],
    },
    "ph-heliconia": {
        typeName: "3 Bedroom Penthouse — Type C", bedrooms: 3, bathrooms: 3, rooms: ROOMS_PH,
        floorPlans: [{ label: "Lower Level", image: "/floorplans/heliconia-ph-lower.png" }, { label: "Upper Level", image: "/floorplans/heliconia-ph-upper.png" }],
    },
    "ph-gingerlily": {
        typeName: "3 Bedroom Penthouse — Type A", bedrooms: 3, bathrooms: 3, rooms: ROOMS_PH,
        floorPlans: [{ label: "Lower Level", image: "/floorplans/gingerlily-ph-lower.png" }, { label: "Upper Level", image: "/floorplans/gingerlily-ph-upper.png" }],
    },
    "ph-hibiscus": {
        typeName: "3 Bedroom Penthouse — Type D", bedrooms: 3, bathrooms: 3, rooms: ROOMS_PH,
        floorPlans: [{ label: "Lower Level", image: "/floorplans/hibiscus-ph-lower.png" }, { label: "Upper Level", image: "/floorplans/hibiscus-ph-upper.png" }],
    },
    "townhouse": {
        typeName: "4 Bedroom Townhouse", bedrooms: 4, bathrooms: 4, rooms: ROOMS_TH,
        floorPlans: [
            { label: "Basement", image: "/floorplans/town-basement.png" },
            { label: "1st Floor", image: "/floorplans/town-1st.png" },
            { label: "2nd Floor", image: "/floorplans/town-2nd.png" },
            { label: "Rooftop", image: "/floorplans/town-rooftop.png" },
        ],
    },
};

// Full plan set (Dropbox) — downloadable from the protected area only.
export const FULL_PLANS_URL = "https://www.dropbox.com/t/AFmAd6YGYSts96Eq";

export function getUnitType(unit) {
    const b = unit.building || "";
    const s = unit.total_surface;
    if (s >= 4500) return TYPES["townhouse"];
    if (s >= 3400) return TYPES["ph-hibiscus"];        // 3,644 — Block B
    if (s >= 3000) return b.includes("Heliconia") ? TYPES["ph-heliconia"] : TYPES["ph-gingerlily"]; // 3,135
    if (s >= 2000) return TYPES["3br-b"];              // 2,141 / 2,322 — Type B
    if (s >= 1750) return TYPES["3br-c"];              // 1,779 — Type C (Hibiscus)
    return TYPES["2br"];                                // 1,671 — Type A
}
