// Single source of truth for value formatting (price / surface / status).
import { STATUS_META, PROJECT, HOME_RESIDENCE_CATEGORIES } from "@/lib/constants";

function townhouseSurfaceMin() {
    return HOME_RESIDENCE_CATEGORIES.find((c) => c.key === "town")?.min ?? 4500;
}

export function developmentBuildingStats(units = []) {
    const min = townhouseSurfaceMin();
    const townhouses = units.filter((u) => u.total_surface >= min).length;
    const apartmentBuildings = new Set(
        units.filter((u) => u.total_surface < min).map((u) => u.building),
    ).size;
    return { townhouses, apartmentBuildings, total: units.length };
}

export function developmentStatCards(units = []) {
    const { townhouses, apartmentBuildings, total } = developmentBuildingStats(units);
    return [
        { value: String(total || "—"), label: "Residences" },
        { value: String(apartmentBuildings || "—"), label: "Apartment Buildings" },
        { value: String(townhouses || "—"), label: "Townhouses" },
    ];
}

export function homePageHighlights(allUnits = [], availableUnits = [], loading = false) {
    const { townhouses, apartmentBuildings } = developmentBuildingStats(allUnits);
    const startingPrice = formatPrice(minStartingPrice(availableUnits));
    return [
        { value: loading ? "—" : String(availableUnits.length), label: "Available Now" },
        { value: loading ? "—" : startingPrice, label: "Starting From" },
        { value: String(PROJECT.unitsCount), label: "Residences" },
        { value: loading ? "—" : `${apartmentBuildings} + ${townhouses}`, label: "Buildings + Townhouses" },
    ];
}

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

export function minStartingPrice(units = []) {
    const prices = units.map((u) => u.price).filter((p) => p != null);
    return prices.length ? Math.min(...prices) : null;
}
