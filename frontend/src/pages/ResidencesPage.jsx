import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { motion } from "framer-motion";
import Hero from "@/components/shared/Hero";
import UnitCard from "@/components/shared/UnitCard";
import CtaButton from "@/components/shared/CtaButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnits } from "@/hooks/useData";
import { BUILDINGS, STARTING_PRICE } from "@/lib/constants";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";

const STATUSES = [
    { value: "all", label: "All Statuses" },
    { value: "available", label: "Available" },
    { value: "reserved", label: "Reserved" },
    { value: "sold", label: "Sold" },
];
const SORTS = [
    { value: "building", label: "Building" },
    { value: "price_asc", label: "Price · Low to High" },
    { value: "price_desc", label: "Price · High to Low" },
    { value: "surface_desc", label: "Largest Surface" },
];

// Lifestyle-led collections mapped to real inventory by total surface (sq ft).
const TIERS = [
    { key: "vista", name: "The Vista Residences", image: "/gallery/home-staging-kitchen-2.png", test: (u) => u.total_surface < 1750 },
    { key: "signature", name: "Signature Residences", image: "/gallery/homestaging-bathroom-4.png", test: (u) => u.total_surface >= 1750 && u.total_surface < 2100 },
    { key: "grand", name: "Grand Residences", image: "/gallery/model-unit-living-and-dining-room.png", test: (u) => u.total_surface >= 2100 && u.total_surface < 2600 },
    { key: "skyline", name: "Skyline Residences", image: "/gallery/ext-rooftop-seaview.png", test: (u) => u.total_surface >= 2600 && u.total_surface < 3400 },
    { key: "penthouse", name: "Penthouse Collection", image: "/gallery/homestaging-living-room-2.png", test: (u) => u.total_surface >= 3400 && u.total_surface < 4500 },
    { key: "townhouses", name: "Begonia Townhouses", image: "/gallery/townhouse-new.png", test: (u) => u.total_surface >= 4500 },
];

// Aerial orientation legend — the four physical blocks within the development.
const BLOCKS = [
    { n: "01", label: "Heliconia" },
    { n: "02", label: "Hibiscus" },
    { n: "03", label: "Ginger Lily" },
    { n: "04", label: "Begonia Townhouses" },
];

export default function ResidencesPage() {
    const [params, setParams] = useSearchParams();
    const building = params.get("building") || "all";
    const status = params.get("status") || "all";
    const sort = params.get("sort") || "building";
    const collection = params.get("collection") || "all";

    const query = useMemo(() => {
        const q = { sort };
        if (building !== "all") q.building = building;
        if (status !== "all") q.status = status;
        return q;
    }, [building, status, sort]);

    const { units, loading } = useUnits(query);
    const { units: allUnits } = useUnits({ sort: "price_asc" });

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

    const activeTier = TIERS.find((t) => t.key === collection);
    const displayedUnits = activeTier ? units.filter(activeTier.test) : units;

    const setParam = (key, value) => {
        const next = new URLSearchParams(params);
        if (value === "all") next.delete(key);
        else next.set(key, value);
        setParams(next);
    };

    // A collection card becomes the filter: set collection, clear building, scroll down.
    const selectCollection = (key) => {
        const next = new URLSearchParams(params);
        next.set("collection", key);
        next.delete("building");
        setParams(next);
        setTimeout(() => document.getElementById("availability")?.scrollIntoView({ behavior: "smooth" }), 60);
    };

    return (
        <div data-testid="residences-page">
            <Hero image="/gallery/buildings-01.png" overline="Residences" title="Find your space" subtitle={`Forty-three residences, defined by space and position — from ${STARTING_PRICE}.`} />

            {/* Intro */}
            <section className="container-wide py-16 md:py-24">
                <motion.div {...fadeUp} className="max-w-3xl px-2 md:px-6">
                    <Eyebrow>The Collection</Eyebrow>
                    <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Discover the residences visually first</h2>
                    <p className="mt-6 font-sans text-lg text-brand-ink/70">A family of distinct collections, each designed around light, space and elevated views. Choose a collection to reveal its availability, or explore every residence below.</p>
                </motion.div>
            </section>

            {/* Aerial orientation */}
            <section className="container-wide pb-16 md:pb-24">
                <motion.div {...fadeUp} className="mb-8 px-2 md:px-6">
                    <Eyebrow>Orientation</Eyebrow>
                    <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl">How the community comes together</h2>
                    <p className="mt-4 max-w-2xl font-sans text-base text-brand-ink/65">Three residential blocks and the Begonia townhouses, set within landscaped, gated grounds in Grosvenor Heights.</p>
                </motion.div>
                <motion.div {...fadeUp} className={`relative overflow-hidden ${ROUND}`} data-testid="residences-aerial">
                    <img src="/gallery/ext-aerial.png" alt="Aerial view of Grosvenor Vistas" loading="lazy" className="h-[52vh] w-full scale-110 object-cover md:h-[64vh]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                        <div className="flex flex-wrap gap-x-8 gap-y-3">
                            {BLOCKS.map((b) => (
                                <div key={b.label} className="flex items-baseline gap-2.5 text-white" data-testid={`aerial-label-${b.label.split(" ")[0].toLowerCase()}`}>
                                    <span className="font-sans text-xs tracking-[0.2em] text-brand-gold">{b.n}</span>
                                    <span className="lux-title text-xl md:text-2xl">{b.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Collection tiers */}
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
                            className={`group relative block h-[64vh] w-full overflow-hidden text-left ${ROUND}`}
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

            {/* Detailed availability */}
            <section id="availability" className="container-wide pb-24 md:pb-32">
                <div className="mb-10 px-2 md:px-6"><Eyebrow>Availability</Eyebrow><h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl">Every residence, live</h2></div>

                {activeTier && (
                    <div className="mb-6 px-2 md:px-6">
                        <button onClick={() => setParam("collection", "all")} data-testid="clear-collection" className="inline-flex items-center gap-2.5 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-5 py-2 font-sans text-sm text-brand-ink transition-colors hover:bg-brand-gold/20">
                            <span className="lux-eyebrow text-brand-gold/70">Collection</span>
                            <span className="font-medium">{activeTier.name}</span>
                            <X className="h-4 w-4 text-brand-ink/60" />
                        </button>
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

                {loading ? (
                    <div className="px-2 md:px-6">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="my-4 h-16" />)}</div>
                ) : displayedUnits.length === 0 ? (
                    <p className="py-20 text-center text-brand-ink/60" data-testid="no-residences">No residences match your filters.</p>
                ) : (
                    <div className="divide-y divide-brand-beige border-y border-brand-beige px-2 md:px-6">
                        {displayedUnits.map((u) => <UnitCard key={u.slug} unit={u} />)}
                    </div>
                )}

                <div className="mt-16 flex justify-center"><CtaButton to="/contact" variant="primary" data-testid="residences-cta">Book a Visit</CtaButton></div>
            </section>
        </div>
    );
}
