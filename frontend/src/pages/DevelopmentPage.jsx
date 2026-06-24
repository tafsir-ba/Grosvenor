import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "@/components/shared/Hero";
import CtaButton from "@/components/shared/CtaButton";
import { useUnits } from "@/hooks/useData";
import { DEVELOPMENT_BUILDINGS, DEV_STATS, DEV_FEATURES, AMENITY_PREVIEW, MASTERPLAN_IMAGE } from "@/lib/constants";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";

function buildingStats(units, b) {
    const us = units.filter((u) => u.building === b.building);
    const avail = us.filter((u) => u.status === "available");
    const sizes = us.map((u) => u.total_surface).filter(Boolean);
    const prices = avail.map((u) => u.price).filter(Boolean);
    const townhouses = us.filter((u) => u.total_surface >= 4500).length;
    return {
        total: us.length,
        available: avail.length,
        penthouses: us.filter((u) => u.total_surface >= 3000 && u.total_surface < 4500).length,
        townhouses,
        isTown: townhouses > 0,
        min: sizes.length ? Math.min(...sizes) : 0,
        max: sizes.length ? Math.max(...sizes) : 0,
        from: prices.length ? Math.min(...prices) : null,
    };
}

function StatRow({ l, v }) {
    return (
        <div className="flex items-baseline justify-between gap-6">
            <dt className="font-sans text-xs uppercase tracking-[0.12em] text-brand-ink/45">{l}</dt>
            <dd className="font-display text-base text-brand-ink">{v}</dd>
        </div>
    );
}

export default function DevelopmentPage() {
    const { units } = useUnits({ sort: "price_asc" });
    const navigate = useNavigate();
    const [active, setActive] = useState("Heliconia");

    const cards = useMemo(() => DEVELOPMENT_BUILDINGS.map((b) => ({ ...b, s: buildingStats(units, b) })), [units]);
    const activeCard = cards.find((c) => c.name === active) || cards[0];

    const goTo = (b) => navigate(`/residences?building=${encodeURIComponent(b.building)}`);
    const rowsFor = (s) => [
        { l: "Total", v: `${s.total} ${s.isTown ? "townhouses" : "residences"}` },
        { l: "Available", v: s.available },
        { l: "Sizes", v: s.min ? `${s.min.toLocaleString()}–${s.max.toLocaleString()} sq ft` : "—" },
        { l: "From", v: s.from ? `US$${s.from.toLocaleString()}` : "On request" },
    ];

    return (
        <div data-testid="development-page">
            <Hero image="/gallery/buildings-01.png" height="min-h-[62vh]" overline="The Development" title="Grosvenor Vistas" subtitle="A thoughtfully planned residential community in the hills of Grosvenor Heights." />

            {/* 1. Project overview */}
            <section className="container-wide py-16 md:py-24">
                <div className="grid gap-12 px-2 md:px-6 lg:grid-cols-[1fr_1fr] lg:items-center">
                    <motion.div {...fadeUp}>
                        <Eyebrow>An Overview</Eyebrow>
                        <h2 className="lux-title mt-6 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Elevated living, privately set</h2>
                        <p className="mt-6 max-w-md font-sans text-lg leading-relaxed text-brand-ink/65">Contemporary architecture across three apartment buildings and two townhouses — generous indoor and outdoor spaces, gated and landscaped, moments from Kingston 8.</p>
                    </motion.div>
                    <motion.div {...fadeUp} className="grid grid-cols-3 gap-4" data-testid="dev-stats">
                        {DEV_STATS.map((s) => (
                            <div key={s.label} className={`flex flex-col items-center justify-center bg-brand-ivory px-3 py-10 text-center ${ROUND}`}>
                                <span className="font-display text-5xl text-brand-gold md:text-6xl">{s.value}</span>
                                <span className="mt-2 font-sans text-xs uppercase tracking-[0.14em] text-brand-ink/55">{s.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* 2. Interactive masterplan */}
            <section className="container-wide pb-16 md:pb-24">
                <motion.div {...fadeUp} className="mb-8 px-2 md:px-6">
                    <Eyebrow>The Masterplan</Eyebrow>
                    <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl lg:text-5xl">Four buildings, one community</h2>
                    <p className="mt-4 max-w-2xl font-sans text-base text-brand-ink/60">Hover a building to see its numbers — or tap to view its residences.</p>
                </motion.div>

                <motion.div {...fadeUp} className={`relative overflow-hidden ${ROUND}`} data-testid="masterplan-image">
                    <img src={MASTERPLAN_IMAGE} alt="Grosvenor Vistas aerial masterplan" loading="lazy" decoding="async" className="w-full object-cover" />

                    {/* Interactive hotspots over the printed pins */}
                    {cards.map((c) => (
                        <button
                            key={c.name}
                            type="button"
                            data-testid={`pin-${c.name.toLowerCase().replace(/ /g, "-")}`}
                            onMouseEnter={() => setActive(c.name)}
                            onFocus={() => setActive(c.name)}
                            onClick={() => { setActive(c.name); goTo(c); }}
                            aria-label={`${c.name} — ${c.s.total} residences`}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                            style={{ left: `${c.pin.x}%`, top: `${c.pin.y}%`, width: "12%", height: "26%" }}
                        >
                            <span
                                className={`block h-full w-full rounded-full transition-all duration-300 ${active === c.name ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
                                style={{ boxShadow: `0 0 0 3px ${c.color}55, 0 0 40px 8px ${c.color}40` }}
                            />
                        </button>
                    ))}

                    {/* Floating info card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCard.name}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            data-testid="masterplan-card"
                            className="absolute bottom-4 left-4 right-4 mx-auto w-auto max-w-xs rounded-2xl border border-brand-beige bg-brand-warm/95 p-6 shadow-[0_20px_50px_rgba(74,69,63,0.22)] backdrop-blur-md sm:left-6 sm:bottom-6 sm:right-auto"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: activeCard.color }} />
                                <h3 className="lux-title text-2xl text-brand-blue">{activeCard.name}</h3>
                                <span className="ml-auto font-sans text-[0.65rem] uppercase tracking-[0.14em] text-brand-ink/40">{activeCard.block}</span>
                            </div>
                            <dl className="mt-4 space-y-2 border-t border-brand-beige pt-4">
                                {rowsFor(activeCard.s).map((r) => <StatRow key={r.l} {...r} />)}
                            </dl>
                            <button onClick={() => goTo(activeCard)} data-testid="masterplan-card-cta" className="lux-eyebrow mt-5 inline-flex items-center gap-2 text-brand-gold transition-colors hover:text-brand-ink">
                                View Residences <ArrowRight className="h-4 w-4" />
                            </button>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Compact colour-matched legend, connected to the image */}
                <div className="mt-5 grid grid-cols-2 gap-3 px-2 md:grid-cols-4 md:px-6" data-testid="masterplan-legend">
                    {cards.map((c) => (
                        <button
                            key={c.name}
                            type="button"
                            data-testid={`legend-${c.name.toLowerCase().replace(/ /g, "-")}`}
                            onMouseEnter={() => setActive(c.name)}
                            onClick={() => goTo(c)}
                            className={`rounded-xl border-l-4 bg-brand-ivory px-4 py-4 text-left transition-all duration-300 ${active === c.name ? "shadow-[0_10px_30px_rgba(74,69,63,0.12)]" : "opacity-80 hover:opacity-100"}`}
                            style={{ borderColor: c.color }}
                        >
                            <p className="lux-title text-lg text-brand-blue">{c.name}</p>
                            <p className="mt-1 font-display text-2xl" style={{ color: c.color }}>{c.s.total}<span className="ml-1.5 font-sans text-[0.65rem] uppercase tracking-[0.12em] text-brand-ink/45">{c.s.isTown ? "townhouses" : "residences"}</span></p>
                            <p className="mt-1 font-sans text-xs text-brand-ink/55">{c.s.available} available · {c.s.min ? `${c.s.min.toLocaleString()}–${c.s.max.toLocaleString()} sq ft` : "—"}</p>
                            <p className="font-sans text-xs text-brand-ink/55">{c.s.from ? `From US$${c.s.from.toLocaleString()}` : "On request"}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* 3. At a glance */}
            <section className="bg-brand-ivory py-16 md:py-24">
                <div className="container-wide px-2 md:px-6">
                    <motion.div {...fadeUp} className="mb-12">
                        <Eyebrow>At a Glance</Eyebrow>
                        <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl lg:text-5xl">Everything the community offers</h2>
                    </motion.div>
                    <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2" data-testid="dev-features">
                        {DEV_FEATURES.map((f) => (
                            <div key={f} className="flex items-center gap-4 border-b border-brand-beige pb-6">
                                <Check className="h-5 w-5 shrink-0 text-brand-gold" />
                                <span className="font-display text-xl text-brand-ink">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Amenities preview */}
            <section className="container-wide pb-16 md:pb-24">
                <motion.div {...fadeUp} className="mb-10 px-2 md:px-6">
                    <Eyebrow>Amenities</Eyebrow>
                    <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl lg:text-5xl">Designed for everyday ease</h2>
                </motion.div>
                <div className="grid grid-cols-2 gap-5 px-2 md:grid-cols-3 md:px-6">
                    {AMENITY_PREVIEW.map((a) => (
                        <motion.div {...fadeUp} key={a.title} data-testid={`amenity-preview-${a.title.toLowerCase().replace(/[^a-z]+/g, "-")}`} className={`group relative h-56 overflow-hidden md:h-64 ${ROUND}`}>
                            <img src={a.image} alt={a.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 to-transparent" />
                            <span className="absolute bottom-0 left-0 p-5 font-sans text-sm uppercase tracking-[0.16em] text-white">{a.title}</span>
                        </motion.div>
                    ))}
                </div>
                <div className="mt-10 px-2 md:px-6"><CtaButton to="/amenities" variant="outline" data-testid="explore-amenities">Explore Amenities <ArrowRight className="h-4 w-4" /></CtaButton></div>
            </section>

            {/* 6. Final CTA */}
            <section className="container-wide pb-24 md:pb-32">
                <motion.div {...fadeUp} className={`flex flex-col items-center gap-8 bg-brand-blue px-8 py-20 text-center ${ROUND}`}>
                    <Eyebrow light>Get Started</Eyebrow>
                    <h2 className="lux-title max-w-2xl text-4xl text-white sm:text-5xl">Ready to explore Grosvenor Vistas?</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <CtaButton to="/residences" variant="white" data-testid="dev-cta-residences">View Residences</CtaButton>
                        <CtaButton to="/contact" variant="outline-light" data-testid="dev-cta-visit">Book a Visit</CtaButton>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
