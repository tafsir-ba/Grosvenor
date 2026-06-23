// Single source of truth for analytics events + UTM attribution.
import { api } from "@/lib/api";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const STORE_KEY = "gv_attribution";

// Parse UTM params once on load and persist them for the session.
export function captureAttribution() {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const existing = JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}");
    let changed = false;
    UTM_KEYS.forEach((k) => {
        const v = params.get(k);
        if (v) {
            existing[k] = v;
            changed = true;
        }
    });
    if (changed) sessionStorage.setItem(STORE_KEY, JSON.stringify(existing));
}

function getAttribution() {
    if (typeof window === "undefined") return {};
    const utm = JSON.parse(sessionStorage.getItem(STORE_KEY) || "{}");
    return {
        source_page: window.location.pathname,
        source_url: window.location.href,
        ...utm,
    };
}

// Build the full lead payload merging form data with automatic attribution.
export function buildLeadPayload(formData, leadType, ctx = {}) {
    return {
        ...formData,
        lead_type: leadType,
        source_unit: ctx.unit || null,
        source_building: ctx.building || null,
        collection: ctx.collection || null,
        unit_surface: ctx.unit_surface ?? null,
        unit_balcony: ctx.unit_balcony ?? null,
        ...getAttribution(),
    };
}

// Fire a lead-less interaction event (whatsapp/phone/email clicks).
export async function trackClick(leadType, ctx = {}) {
    try {
        await api.post("/track", buildLeadPayload({}, leadType, ctx));
    } catch (e) {
        /* tracking must never block the user */
    }
}

export async function submitLead(formData, leadType, ctx = {}) {
    const { data } = await api.post("/leads", buildLeadPayload(formData, leadType, ctx));
    return data;
}
