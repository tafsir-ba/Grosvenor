import { PROJECT } from "@/lib/constants";

const STORE_KEY = "gv_whatsapp_lead";

export function hasWhatsAppLeadCapture() {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(STORE_KEY) === "1";
}

export function markWhatsAppLeadCaptured() {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(STORE_KEY, "1");
}

export function openWhatsApp() {
    if (typeof window === "undefined") return false;
    const opened = window.open(PROJECT.contact.whatsapp, "_blank", "noopener");
    return !!opened;
}

/** Open WhatsApp immediately if already captured this session; otherwise open the soft-gate dialog. */
export function requestWhatsApp({ openDialog } = {}) {
    if (hasWhatsAppLeadCapture()) {
        openWhatsApp();
        return;
    }
    openDialog?.();
}
