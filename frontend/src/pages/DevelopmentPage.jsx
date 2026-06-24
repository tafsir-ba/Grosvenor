import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import Hero from "@/components/shared/Hero";
import CtaButton from "@/components/shared/CtaButton";
import { DEVELOPMENT_BUILDINGS, DEV_STATS, DEV_FEATURES, AMENITY_PREVIEW, MASTERPLAN_IMAGE } from "@/lib/constants";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";

export default function DevelopmentPage() {
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

            {/* 2. Masterplan */}
            <section className="container-wide pb-16 md:pb-24">
                <motion.div {...fadeUp} className="mb-8 px-2 md:px-6">
                    <Eyebrow>The Masterplan</Eyebrow>
                    <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl lg:text-5xl">How the community comes together</h2>
                </motion.div>
                <motion.div {...fadeUp} className={`overflow-hidden ${ROUND}`} data-testid="masterplan-image">
                    <img src={MASTERPLAN_IMAGE} alt="Grosvenor Vistas aerial masterplan" loading="lazy" decoding="async" className="w-full object-cover" />
                </motion.div>
                <div className="mt-8 grid gap-5 px-2 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
                    {DEVELOPMENT_BUILDINGS.map((b) => (
                        <motion.div {...fadeUp} key={b.name} data-testid={`masterplan-${b.name.toLowerCase().replace(/ /g, "-")}`} className="border-t-2 pt-5" style={{ borderColor: b.color }}>
                            <div className="flex items-baseline justify-between">
                                <h3 className="lux-title text-2xl text-brand-blue">{b.name}</h3>
                                <span className="font-display text-3xl" style={{ color: b.color }}>{b.units}</span>
                            </div>
                            <p className="font-sans text-xs uppercase tracking-[0.16em] text-brand-ink/45">{b.block}</p>
                            <ul className="mt-4 space-y-1.5">
                                {b.items.map((it) => <li key={it} className="font-sans text-sm text-brand-ink/65">{it}</li>)}
                            </ul>
                        </motion.div>
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
                    <div className="grid gap-x-12 gap-y-6 sm:grid-cols-2 lg:grid-cols-2" data-testid="dev-features">
                        {DEV_FEATURES.map((f) => (
                            <div key={f} className="flex items-center gap-4 border-b border-brand-beige pb-6">
                                <Check className="h-5 w-5 shrink-0 text-brand-gold" />
                                <span className="font-display text-xl text-brand-ink">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Building collections */}
            <section className="container-wide py-16 md:py-24">
                <motion.div {...fadeUp} className="mb-10 px-2 md:px-6">
                    <Eyebrow>The Buildings</Eyebrow>
                    <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl lg:text-5xl">Four distinct addresses</h2>
                </motion.div>
                <div className="grid gap-6 px-2 md:grid-cols-2 md:px-6">
                    {DEVELOPMENT_BUILDINGS.map((b) => (
                        <motion.div {...fadeUp} key={b.name} data-testid={`building-${b.name.toLowerCase().replace(/ /g, "-")}`} className={`flex flex-col justify-between bg-brand-ivory p-8 md:p-10 ${ROUND}`}>
                            <div>
                                <div className="flex items-baseline justify-between">
                                    <h3 className="lux-title text-3xl text-brand-blue md:text-4xl">{b.name}</h3>
                                    <span className="font-sans text-sm uppercase tracking-[0.14em]" style={{ color: b.color }}>{b.units} Residences</span>
                                </div>
                                <p className="mt-1 font-sans text-xs uppercase tracking-[0.16em] text-brand-ink/45">{b.block}</p>
                                <ul className="mt-6 space-y-2">
                                    {b.items.map((it) => <li key={it} className="font-sans text-sm text-brand-ink/65">{it}</li>)}
                                </ul>
                            </div>
                            <Link to={`/residences?building=${encodeURIComponent(b.building)}`} className="lux-eyebrow mt-8 inline-flex items-center gap-2 text-brand-gold transition-colors hover:text-brand-ink">
                                View Residences <ArrowRight className="h-4 w-4" />
                            </Link>
                        </motion.div>
                    ))}
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
