import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, Map, X } from "lucide-react";
import { motion } from "framer-motion";
import UnitCard from "@/components/shared/UnitCard";
import CtaButton from "@/components/shared/CtaButton";
import StatusBadge from "@/components/shared/StatusBadge";
import ResidenceExplorerMap from "@/components/shared/ResidenceExplorerMap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnits } from "@/hooks/useData";
import {
    BUILDINGS,
    HOME_RESIDENCE_CATEGORIES,
    PROJECT,
    UNIT_STATUSES,
    homeCategoryForKey,
    unitMatchesHomeCategory,
} from "@/lib/constants";
import { formatPrice, formatSurface, formatUnitListPrice, minStartingPrice, statusMeta, unitFloor } from "@/lib/format";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";

const STATUSES = [
    { value: "all", label: "All Statuses" },
    ...UNIT_STATUSES.map((value) => ({
        value,
        label: statusMeta(value).label,
    })),
];
const SORTS = [
    { value: "building", label: "Building" },
    { value: "price_asc", label: "Price · Low to High" },
    { value: "price_desc", label: "Price · High to Low" },
    { value: "surface_desc", label: "Largest Surface" },
];

function parseOptionalNumber(raw) {
    if (raw == null || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

function unitMatchesQuery(u, unitQuery) {
    if (!unitQuery) return true;
    const q = unitQuery.toLowerCase();
    const unitNumber = String(u.unit_number || "").toLowerCase();
    const slug = String(u.slug || "").toLowerCase();
    const buildingLabel = String(u.building || "").toLowerCase();
    return unitNumber.includes(q) || slug.includes(q) || `${buildingLabel}${unitNumber}`.includes(q.replace(/\s+/g, ""));
}

function unitMatchesRange(num, min, max) {
    if (min == null && max == null) return true;
    if (num == null || !Number.isFinite(Number(num))) return false;
    const n = Number(num);
    if (min != null && n < min) return false;
    if (max != null && n > max) return false;
    return true;
}

/** Single filter predicate for list + map (DRY). */
function matchesResidenceFilters(u, { building, status, activeHomeTier, unitQuery, minPrice, maxPrice, minSize, maxSize }) {
    if (building !== "all" && u.building !== building) return false;
    if (status !== "all" && u.status !== status) return false;
    if (activeHomeTier && !unitMatchesHomeCategory(u, activeHomeTier)) return false;
    if (!unitMatchesQuery(u, unitQuery)) return false;
    if (!unitMatchesRange(u.price, minPrice, maxPrice)) return false;
    if (!unitMatchesRange(u.total_surface, minSize, maxSize)) return false;
    return true;
}

function shortBuilding(value) {
    return BUILDINGS.find((b) => b.value === value)?.short || value;
}

function scrollToSelectedResidence() {
    const el = document.getElementById("selected-residence") || document.getElementById("selected-unit-panel");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function sortUnits(list, sort) {
    const next = [...list];
    if (sort === "price_asc") {
        next.sort((a, b) => (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY));
    } else if (sort === "price_desc") {
        next.sort((a, b) => (b.price ?? Number.NEGATIVE_INFINITY) - (a.price ?? Number.NEGATIVE_INFINITY));
    } else if (sort === "surface_desc") {
        next.sort((a, b) => (b.total_surface ?? 0) - (a.total_surface ?? 0));
    } else {
        next.sort((a, b) => {
            const byBuilding = String(a.building || "").localeCompare(String(b.building || ""));
            if (byBuilding !== 0) return byBuilding;
            return String(a.unit_number || "").localeCompare(String(b.unit_number || ""), undefined, { numeric: true });
        });
    }
    return next;
}

export default function ResidencesPage() {
    const [params, setParams] = useSearchParams();
    const building = params.get("building") || "all";
    const status = params.get("status") || "all";
    const sort = params.get("sort") || "building";
    const unitQuery = (params.get("q") || "").trim();
    const minPrice = parseOptionalNumber(params.get("min_price"));
    const maxPrice = parseOptionalNumber(params.get("max_price"));
    const minSize = parseOptionalNumber(params.get("min_size"));
    const maxSize = parseOptionalNumber(params.get("max_size"));
    const tierKey = params.get("tier") || params.get("collection");
    const selectedSlug = params.get("unit");

    // Single inventory fetch — filters/sorts applied client-side to avoid flashy multi-request loading.
    const { units: allUnits, loading, error } = useUnits({ sort: "building" });

    const availableUnits = useMemo(() => allUnits.filter((u) => u.status === "available"), [allUnits]);

    const tiers = useMemo(() => HOME_RESIDENCE_CATEGORIES.map((c) => {
        const us = availableUnits.filter((u) => unitMatchesHomeCategory(u, c));
        const surfaces = us.map((u) => u.total_surface).filter(Boolean);
        const prices = us.map((u) => u.price).filter(Boolean);
        return {
            key: c.key,
            name: c.name,
            subtitle: c.subtitle,
            image: c.cardImage,
            count: us.length,
            minSurface: surfaces.length ? Math.min(...surfaces) : null,
            minPrice: prices.length ? Math.min(...prices) : null,
        };
    }), [availableUnits]);

    const activeHomeTier = homeCategoryForKey(tierKey);

    const filterCtx = useMemo(
        () => ({ building, status, activeHomeTier, unitQuery, minPrice, maxPrice, minSize, maxSize }),
        [building, status, activeHomeTier, unitQuery, minPrice, maxPrice, minSize, maxSize],
    );

    const displayedUnits = useMemo(() => {
        const list = allUnits.filter((u) => matchesResidenceFilters(u, filterCtx));
        return sortUnits(list, sort);
    }, [allUnits, filterCtx, sort]);

    const selectedUnit = useMemo(
        () => (selectedSlug ? allUnits.find((u) => u.slug === selectedSlug) : null),
        [allUnits, selectedSlug],
    );

    const mapPass = useCallback((u) => matchesResidenceFilters(u, filterCtx), [filterCtx]);

    const priceBounds = useMemo(() => {
        const prices = allUnits.map((u) => u.price).filter((p) => p != null && Number.isFinite(Number(p))).map(Number);
        if (!prices.length) return null;
        return { min: Math.min(...prices), max: Math.max(...prices) };
    }, [allUnits]);

    const sizeBounds = useMemo(() => {
        const surfaces = allUnits.map((u) => u.total_surface).filter((s) => s != null && Number.isFinite(Number(s))).map(Number);
        if (!surfaces.length) return null;
        return { min: Math.min(...surfaces), max: Math.max(...surfaces) };
    }, [allUnits]);

    useEffect(() => {
        if (!activeHomeTier) return;
        const id = setTimeout(() => document.getElementById("availability")?.scrollIntoView({ behavior: "smooth" }), 60);
        return () => clearTimeout(id);
    }, [activeHomeTier?.key]);

    useEffect(() => {
        if (!selectedSlug || loading) return;
        const id = setTimeout(scrollToSelectedResidence, 80);
        return () => clearTimeout(id);
    }, [selectedSlug, loading, displayedUnits]);

    const setParam = (key, value) => {
        const next = new URLSearchParams(params);
        if (!value || value === "all") next.delete(key);
        else next.set(key, value);
        setParams(next);
    };

    const clearCategoryFilter = () => {
        const next = new URLSearchParams(params);
        next.delete("collection");
        next.delete("tier");
        setParams(next);
    };

    const clearBuyerFilters = () => {
        const next = new URLSearchParams(params);
        next.delete("q");
        next.delete("min_price");
        next.delete("max_price");
        next.delete("min_size");
        next.delete("max_size");
        // Legacy P2 band params (if bookmarked)
        next.delete("price");
        next.delete("size");
        setParams(next);
    };

    const hasBuyerFilters = Boolean(
        unitQuery || minPrice != null || maxPrice != null || minSize != null || maxSize != null,
    );

    const clearUnitSelection = () => {
        const next = new URLSearchParams(params);
        next.delete("unit");
        setParams(next);
    };

    const returnToMap = () => {
        clearUnitSelection();
        setTimeout(() => document.getElementById("residences-explorer")?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
    };

    const selectUnitFromMap = (unit) => {
        const next = new URLSearchParams(params);
        next.set("unit", unit.slug);
        next.delete("collection");
        next.delete("tier");
        setParams(next);
        setTimeout(scrollToSelectedResidence, 100);
    };

    const selectTier = (key) => {
        const next = new URLSearchParams(params);
        next.set("tier", key);
        next.delete("collection");
        next.delete("building");
        next.delete("unit");
        setParams(next);
        setTimeout(() => document.getElementById("availability")?.scrollIntoView({ behavior: "smooth" }), 60);
    };

    const startingPrice = loading ? null : formatPrice(minStartingPrice(availableUnits));

    return (
        <div data-testid="residences-page" className="bg-brand-warm text-brand-ink">
            <section className="container-wide pb-14 pt-32 md:pb-20 md:pt-40">
                <motion.div {...fadeUp} className="mb-10 px-2 md:mb-12 md:px-6">
                    <Eyebrow>The Residences</Eyebrow>
                    <h1 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Find your space</h1>
                    <p className="mt-5 max-w-2xl font-sans text-lg text-brand-ink/65">
                        {PROJECT.unitsCount} residences across four collections
                        {startingPrice ? ` — from ${startingPrice}.` : loading ? "." : ` — from ${formatPrice(null)}.`}
                    </p>
                </motion.div>

                {loading ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-testid="residence-tiers-loading" aria-busy="true" aria-live="polite">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={`tier-skeleton-${i}`} className={`h-[48vh] w-full md:h-[52vh] ${ROUND}`} />
                        ))}
                        <p className="sr-only">Loading residence collections…</p>
                    </div>
                ) : error ? (
                    <p className="px-2 font-sans text-sm text-destructive md:px-6" data-testid="residence-tiers-error">
                        We could not load residence availability. Please try again shortly.
                    </p>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {tiers.map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => selectTier(t.key)}
                                data-testid={`residence-tier-${t.key}`}
                                className={`group relative block h-[48vh] w-full overflow-hidden text-left md:h-[52vh] ${ROUND}`}
                            >
                                <img src={t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/15 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-7">
                                    <h2 className="lux-title text-2xl md:text-3xl">{t.name}</h2>
                                    {t.subtitle && <p className="mt-1 font-sans text-xs uppercase tracking-[0.16em] text-white/70">{t.subtitle}</p>}
                                    {t.minSurface && (
                                        <p className="mt-2 font-sans text-sm uppercase tracking-[0.18em] text-white/80">
                                            From {t.minSurface.toLocaleString()} sq ft
                                        </p>
                                    )}
                                    <p className="mt-2 font-sans text-white/90">
                                        {t.minPrice ? `From USD ${t.minPrice.toLocaleString()}` : "Price on request"}
                                    </p>
                                    <p className="font-sans text-sm text-white/70">{t.count} available</p>
                                    <span className="lux-eyebrow mt-3 inline-flex items-center gap-2 text-brand-gold">
                                        View Availability <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <section id="explore" className="container-wide pb-10 md:pb-14">
                <motion.div {...fadeUp} className="mb-8 px-2 md:px-6">
                    <Eyebrow>Explore</Eyebrow>
                    <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl">Navigate the development</h2>
                    <p className="mt-4 max-w-2xl font-sans text-base text-brand-ink/65">Select a building, floor, and residence. We’ll highlight it in the live list below so you can open it with one clear step.</p>
                </motion.div>
                <motion.div {...fadeUp} className="px-2 md:px-6" id="residences-explorer" data-testid="residences-explorer">
                    {loading ? (
                        <Skeleton className="h-[52vh] w-full rounded-2xl" />
                    ) : (
                        <ResidenceExplorerMap
                            units={allUnits}
                            selectedSlug={selectedSlug}
                            onSelect={selectUnitFromMap}
                            pass={mapPass}
                            variant="public"
                        />
                    )}
                </motion.div>
            </section>

            <section id="availability" className="container-wide pb-24 md:pb-32">
                <div className="mb-10 px-2 md:px-6"><Eyebrow>Availability</Eyebrow><h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl">Every residence, live</h2></div>

                {activeHomeTier && (
                    <div className="mb-6 px-2 md:px-6">
                        <button onClick={clearCategoryFilter} data-testid="clear-collection" className="inline-flex items-center gap-2.5 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-5 py-2 font-sans text-sm text-brand-ink transition-colors hover:bg-brand-gold/20">
                            <span className="lux-eyebrow text-brand-gold/70">Collection</span>
                            <span className="font-medium">{activeHomeTier.name}</span>
                            <X className="h-4 w-4 text-brand-ink/60" />
                        </button>
                    </div>
                )}

                {selectedUnit && (
                    <div
                        id="selected-unit-panel"
                        data-testid="selected-unit-panel"
                        className="sticky top-20 z-20 mb-8 scroll-mt-28 border border-brand-gold/40 bg-brand-warm/95 px-4 py-5 shadow-[0_16px_40px_rgba(74,69,63,0.12)] backdrop-blur md:px-6"
                    >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="lux-eyebrow text-brand-gold">Selected from the map</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3">
                                    <h3 className="lux-title text-3xl text-brand-blue md:text-4xl">Residence {selectedUnit.unit_number}</h3>
                                    <StatusBadge status={selectedUnit.status} />
                                </div>
                                <p className="mt-2 font-sans text-sm text-brand-ink/65">
                                    {shortBuilding(selectedUnit.building)} · {unitFloor(selectedUnit)} · {formatSurface(selectedUnit.total_surface)} · {formatUnitListPrice(selectedUnit)}
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <CtaButton to={`/residences/${selectedUnit.slug}`} data-testid="selected-unit-view" className="w-full sm:w-auto">
                                    View this residence <ArrowRight className="h-4 w-4" />
                                </CtaButton>
                                <button
                                    type="button"
                                    onClick={returnToMap}
                                    data-testid="return-to-map"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-ink/20 px-5 py-3.5 font-sans text-sm text-brand-ink/75 transition-colors hover:border-brand-gold hover:text-brand-gold"
                                >
                                    <Map className="h-4 w-4" /> Back to map
                                </button>
                                <button
                                    type="button"
                                    onClick={clearUnitSelection}
                                    data-testid="clear-unit-selection"
                                    aria-label="Clear selection"
                                    className="inline-flex items-center justify-center gap-2 self-center rounded-full p-2 text-brand-ink/50 transition-colors hover:text-brand-ink sm:self-auto"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-10 flex flex-col gap-6 border-b border-brand-beige px-2 pb-8 md:px-6" data-testid="residence-filters">
                    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label htmlFor="filter-unit-search" className="lux-eyebrow mb-2 block text-brand-ink/50">Unit ID</label>
                            <Input
                                id="filter-unit-search"
                                data-testid="filter-unit-search"
                                type="search"
                                inputMode="search"
                                placeholder="e.g. A101"
                                value={unitQuery}
                                onChange={(e) => setParam("q", e.target.value.trimStart())}
                                className="rounded-xl border-brand-ink/15 bg-white/70"
                                aria-label="Search by unit ID"
                            />
                        </div>
                        <div>
                            <p className="lux-eyebrow mb-2 text-brand-ink/50">
                                Price (USD){priceBounds ? ` · ${formatPrice(priceBounds.min)}–${formatPrice(priceBounds.max)}` : ""}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    id="filter-min-price"
                                    data-testid="filter-min-price"
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="Min"
                                    value={params.get("min_price") || ""}
                                    onChange={(e) => setParam("min_price", e.target.value)}
                                    className="rounded-xl border-brand-ink/15 bg-white/70"
                                    aria-label="Minimum price"
                                />
                                <Input
                                    id="filter-max-price"
                                    data-testid="filter-max-price"
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="Max"
                                    value={params.get("max_price") || ""}
                                    onChange={(e) => setParam("max_price", e.target.value)}
                                    className="rounded-xl border-brand-ink/15 bg-white/70"
                                    aria-label="Maximum price"
                                />
                            </div>
                        </div>
                        <div>
                            <p className="lux-eyebrow mb-2 text-brand-ink/50">
                                Size (sq ft){sizeBounds ? ` · ${Math.round(sizeBounds.min).toLocaleString()}–${Math.round(sizeBounds.max).toLocaleString()}` : ""}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    id="filter-min-size"
                                    data-testid="filter-min-size"
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="Min"
                                    value={params.get("min_size") || ""}
                                    onChange={(e) => setParam("min_size", e.target.value)}
                                    className="rounded-xl border-brand-ink/15 bg-white/70"
                                    aria-label="Minimum surface"
                                />
                                <Input
                                    id="filter-max-size"
                                    data-testid="filter-max-size"
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="Max"
                                    value={params.get("max_size") || ""}
                                    onChange={(e) => setParam("max_size", e.target.value)}
                                    className="rounded-xl border-brand-ink/15 bg-white/70"
                                    aria-label="Maximum surface"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 md:max-w-2xl">
                            <div>
                                <p className="lux-eyebrow mb-2 text-brand-ink/50">Building</p>
                                <Select value={building} onValueChange={(v) => setParam("building", v)}>
                                    <SelectTrigger data-testid="filter-building"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Buildings</SelectItem>
                                        {BUILDINGS.map((b) => <SelectItem key={b.value} value={b.value}>{b.short}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <p className="lux-eyebrow mb-2 text-brand-ink/50">Status</p>
                                <Select value={status} onValueChange={(v) => setParam("status", v)}>
                                    <SelectTrigger data-testid="filter-status"><SelectValue /></SelectTrigger>
                                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <p className="lux-eyebrow mb-2 text-brand-ink/50">Sort</p>
                                <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
                                    <SelectTrigger data-testid="filter-sort"><SelectValue /></SelectTrigger>
                                    <SelectContent>{SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
                            {hasBuyerFilters && (
                                <button
                                    type="button"
                                    onClick={clearBuyerFilters}
                                    data-testid="clear-buyer-filters"
                                    className="font-sans text-sm text-brand-ink/60 underline underline-offset-2 transition-colors hover:text-brand-gold"
                                >
                                    Clear search &amp; ranges
                                </button>
                            )}
                            <p className="font-sans text-sm text-brand-ink/60" data-testid="residence-count">
                                {loading ? "Loading residences…" : `${displayedUnits.length} residence${displayedUnits.length === 1 ? "" : "s"}`}
                            </p>
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="px-2 py-16 text-center md:px-6" data-testid="residences-error">
                        <p className="font-sans text-sm text-destructive">Could not load residences.</p>
                        <button
                            type="button"
                            className="mt-4 font-sans text-sm text-brand-gold underline underline-offset-2"
                            onClick={() => window.location.reload()}
                            data-testid="residences-retry"
                        >
                            Retry
                        </button>
                    </div>
                ) : loading ? (
                    <div className="px-2 md:px-6" data-testid="residences-loading" aria-busy="true" aria-live="polite">
                        <p className="mb-4 font-sans text-sm text-brand-ink/55">Fetching live availability…</p>
                        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={`residence-skeleton-${i}`} className="my-4 h-16" />)}
                    </div>
                ) : displayedUnits.length === 0 ? (
                    <p className="py-20 text-center text-brand-ink/60" data-testid="no-residences">No residences match your filters.</p>
                ) : (
                    <div className="divide-y divide-brand-beige border-y border-brand-beige px-2 md:px-6">
                        {displayedUnits.map((u) => (
                            <UnitCard key={u.slug} unit={u} highlighted={u.slug === selectedSlug} />
                        ))}
                    </div>
                )}

                <div className="mt-16 flex justify-center"><CtaButton to="/contact" variant="primary" data-testid="residences-cta">Book a Visit</CtaButton></div>
            </section>
        </div>
    );
}
