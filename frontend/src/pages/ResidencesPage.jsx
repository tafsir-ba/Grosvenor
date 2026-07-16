import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, Map, X } from "lucide-react";
import { motion } from "framer-motion";
import Hero from "@/components/shared/Hero";
import UnitCard from "@/components/shared/UnitCard";
import CtaButton from "@/components/shared/CtaButton";
import StatusBadge from "@/components/shared/StatusBadge";
import ResidenceExplorerMap from "@/components/shared/ResidenceExplorerMap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnits } from "@/hooks/useData";
import { BUILDINGS, COLLECTIONS, UNIT_STATUSES, homeCategoryForKey, unitMatchesHomeCategory } from "@/lib/constants";
import { formatPrice, formatSurface, formatUnitListPrice, minStartingPrice, statusMeta, unitFloor } from "@/lib/format";
import { Eyebrow, fadeUp } from "@/components/shared/luxe";

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

const TIERS = COLLECTIONS.map((c) => ({
    key: c.key,
    name: c.name,
    image: c.cardImage,
    test: (u) => u.total_surface >= c.min && u.total_surface < c.max,
}));

function shortBuilding(value) {
    return BUILDINGS.find((b) => b.value === value)?.short || value;
}

function scrollToSelectedResidence() {
    const el = document.getElementById("selected-residence") || document.getElementById("selected-unit-panel");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export default function ResidencesPage() {
    const [params, setParams] = useSearchParams();
    const building = params.get("building") || "all";
    const status = params.get("status") || "all";
    const sort = params.get("sort") || "building";
    const collection = params.get("collection") || "all";
    const tierKey = params.get("tier");
    const selectedSlug = params.get("unit");

    const query = useMemo(() => {
        const q = { sort };
        if (building !== "all") q.building = building;
        if (status !== "all") q.status = status;
        return q;
    }, [building, status, sort]);

    const { units, loading, error } = useUnits(query);
    const { units: allUnits } = useUnits({ sort: "price_asc" });
    const { units: mapUnits, loading: mapLoading } = useUnits({ sort: "building" });

    const tiers = useMemo(() => TIERS.map((t) => {
        const all = allUnits.filter(t.test);
        const avail = all.filter((u) => u.status === "available");
        const surfaces = all.map((u) => u.total_surface).filter(Boolean);
        const prices = avail.map((u) => u.price).filter(Boolean);
        return {
            ...t,
            count: all.length,
            availCount: avail.length,
            minSurface: surfaces.length ? Math.min(...surfaces) : null,
            minPrice: prices.length ? Math.min(...prices) : null,
        };
    }).filter((t) => t.count > 0), [allUnits]);

    const activeHomeTier = homeCategoryForKey(tierKey);
    const activeTier = !activeHomeTier && collection !== "all" ? TIERS.find((t) => t.key === collection) : null;

    const displayedUnits = useMemo(() => {
        if (activeHomeTier) {
            return units.filter((u) => unitMatchesHomeCategory(u, activeHomeTier));
        }
        if (activeTier) {
            return units.filter(activeTier.test);
        }
        return units;
    }, [units, activeHomeTier, activeTier]);

    const selectedUnit = useMemo(
        () => (selectedSlug ? allUnits.find((u) => u.slug === selectedSlug) : null),
        [allUnits, selectedSlug],
    );

    const mapPass = useCallback((u) => {
        if (building !== "all" && u.building !== building) return false;
        if (status !== "all" && u.status !== status) return false;
        return true;
    }, [building, status]);

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
        if (value === "all") next.delete(key);
        else next.set(key, value);
        setParams(next);
    };

    const clearCategoryFilter = () => {
        const next = new URLSearchParams(params);
        next.delete("collection");
        next.delete("tier");
        setParams(next);
    };

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
        // Clear collection/tier filters so the selected unit is visible in the list.
        next.delete("collection");
        next.delete("tier");
        setParams(next);
        setTimeout(scrollToSelectedResidence, 100);
    };

    const selectCollection = (key) => {
        const next = new URLSearchParams(params);
        next.set("collection", key);
        next.delete("tier");
        next.delete("building");
        next.delete("unit");
        setParams(next);
        setTimeout(() => document.getElementById("availability")?.scrollIntoView({ behavior: "smooth" }), 60);
    };

    const startingPrice = formatPrice(minStartingPrice(allUnits.filter((u) => u.status === "available")));

    return (
        <div data-testid="residences-page">
            <Hero image="/gallery/buildings-01.png" overline="Residences" title="Find your space" subtitle={`Forty-three residences, defined by space and position — from ${startingPrice}.`} />

            <section className="container-wide py-16 md:py-24">
                <motion.div {...fadeUp} className="max-w-3xl px-2 md:px-6">
                    <Eyebrow>The Collection</Eyebrow>
                    <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Discover the residences visually first</h2>
                    <p className="mt-6 font-sans text-lg text-brand-ink/70">A family of distinct collections, each designed around light, space and elevated views. Choose a collection to reveal its availability, or explore every residence below.</p>
                </motion.div>
            </section>

            <section className="container-wide pb-16 md:pb-24">
                <motion.div {...fadeUp} className="mb-8 px-2 md:px-6">
                    <Eyebrow>Collections</Eyebrow>
                    <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl">Choose your collection</h2>
                </motion.div>
                <div className="grid gap-6 md:grid-cols-3">
                    {tiers.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            onClick={() => selectCollection(t.key)}
                            data-testid={`residence-tier-${t.key}`}
                            className="group relative block h-[64vh] w-full overflow-hidden rounded-2xl text-left"
                        >
                            <img src={t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/15 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                                <h3 className="lux-title text-3xl md:text-4xl">{t.name}</h3>
                                {t.minSurface && <p className="mt-2 font-sans text-sm uppercase tracking-[0.18em] text-white/80">From {t.minSurface.toLocaleString()} sq ft</p>}
                                {t.minPrice ? (
                                    <p className="mt-1 font-sans text-white/85">From USD {t.minPrice.toLocaleString()}</p>
                                ) : (
                                    <p className="mt-1 font-sans text-white/75">Enquire for availability</p>
                                )}
                                <span className="lux-eyebrow mt-3 inline-flex items-center gap-2 text-brand-gold">View Availability <ArrowRight className="h-4 w-4" /></span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            <section id="explore" className="container-wide pb-10 md:pb-14">
                <motion.div {...fadeUp} className="mb-8 px-2 md:px-6">
                    <Eyebrow>Explore</Eyebrow>
                    <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl">Navigate the development</h2>
                    <p className="mt-4 max-w-2xl font-sans text-base text-brand-ink/65">Select a building, floor, and residence. We’ll highlight it in the live list below so you can open it with one clear step.</p>
                </motion.div>
                <motion.div {...fadeUp} className="px-2 md:px-6" id="residences-explorer" data-testid="residences-explorer">
                    {mapLoading ? (
                        <Skeleton className="h-[52vh] w-full rounded-2xl" />
                    ) : (
                        <ResidenceExplorerMap
                            units={mapUnits}
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

                {(activeTier || activeHomeTier) && (
                    <div className="mb-6 px-2 md:px-6">
                        <button onClick={clearCategoryFilter} data-testid="clear-collection" className="inline-flex items-center gap-2.5 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-5 py-2 font-sans text-sm text-brand-ink transition-colors hover:bg-brand-gold/20">
                            <span className="lux-eyebrow text-brand-gold/70">Collection</span>
                            <span className="font-medium">{activeHomeTier?.name || activeTier?.name}</span>
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

                <div className="mb-10 flex flex-col gap-4 border-b border-brand-beige px-2 pb-8 md:flex-row md:items-end md:justify-between md:px-6" data-testid="residence-filters">
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
                    <p className="font-sans text-sm text-brand-ink/60" data-testid="residence-count">{loading ? "Loading…" : `${displayedUnits.length} residence${displayedUnits.length === 1 ? "" : "s"}`}</p>
                </div>

                {error ? (
                    <p className="px-2 py-20 text-center text-sm text-destructive md:px-6" data-testid="residences-error">
                        Could not load residences. Please try again shortly.
                    </p>
                ) : loading ? (
                    <div className="px-2 md:px-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={`residence-skeleton-${i}`} className="my-4 h-16" />)}</div>
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
