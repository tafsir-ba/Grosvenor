// Single source of truth for value formatting (price / surface / status).
import { STATUS_META } from "@/lib/constants";

export function formatPrice(price, currency = "USD") {
    if (price == null) return "Price on request";
    const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(price);
    return formatted;
}

export function formatSurface(sqft) {
    if (sqft == null) return "—";
    return `${new Intl.NumberFormat("en-US").format(sqft)} sq ft`;
}

export function statusMeta(status) {
    return STATUS_META[status] || STATUS_META.available;
}

export function floorLabel(floor) {
    const map = { 1: "1st floor", 2: "2nd floor", 3: "3rd floor" };
    return map[floor] || `${floor}th floor`;
}

export function unitFloor(unit) {
    return unit.floor_label || floorLabel(unit.floor);
}
