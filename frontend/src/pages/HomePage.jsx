import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Waves, Dumbbell, KeyRound, Car } from "lucide-react";
import CtaButton from "@/components/shared/CtaButton";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";
import { useUnits } from "@/hooks/useData";
import {
    PROJECT,
    HOME_RESIDENCE_CATEGORIES,
    HOME_MEDIA,
    HOME_AMENITY_HIGHLIGHTS,
    HOME_LIFESTYLE_PANELS,
    unitMatchesHomeCategory,
} from "@/lib/constants";
import { homePageHighlights } from "@/lib/format";

const AMENITY_ICONS = { waves: Waves, dumbbell: Dumbbell, key: KeyRound, car: Car };
const FINAL_IMG = "/gallery/ext-aerial.png";

export default function HomePage() {
    const { units: allUnits, loading, error } = useUnits({ sort: "price_asc" });
    const availableUnits = useMemo(() => allUnits.filter((u) => u.status === "available"), [allUnits]);

    const tiers = useMemo(() => {
        return HOME_RESIDENCE_CATEGORIES.map((c) => {
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
        });
    }, [availableUnits]);

    const highlights = homePageHighlights(allUnits, availableUnits, loading);

    return (
        <div data-testid="home-page" className="bg-brand-warm text-brand-ink">
            <HeroSection />

            <section className="container-wide py-14 md:py-20" data-testid="home-residences">
                <div className="mb-10 px-2 md:mb-12 md:px-6">
                    <Eyebrow>The Residences</Eyebrow>
                    <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Find your space</h2>
                </div>

                <ProjectHighlights highlights={highlights} error={error} />

                {loading ? (
                    <p className="px-2 font-sans text-brand-ink/55 md:px-6">Loading available residences…</p>
                ) : error ? (
                    <p className="px-2 font-sans text-sm text-destructive md:px-6">We could not load residence availability. Please try again shortly.</p>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {tiers.map((t) => (
                            <Link
                                key={t.key}
                                to={`/residences?tier=${t.key}`}
                                data-testid={`residence-tier-${t.key}`}
                                className={`group relative block h-[48vh] overflow-hidden md:h-[52vh] ${ROUND}`}
                            >
                                <img src={t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/15 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-7">
                                    <h3 className="lux-title text-2xl md:text-3xl">{t.name}</h3>
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
                                        View Residence <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <AmenitiesShowcase />
            <LifestyleShowcase />

            <section className="container-wide py-14 md:py-20" data-testid="home-location">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    <motion.div {...fadeUp} className="px-2 md:px-6">
                        <Eyebrow>The Setting</Eyebrow>
                        <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Perfectly positioned in Grosvenor Heights</h2>
                        <p className="mt-6 flex items-center gap-3 font-sans text-lg text-brand-ink/70">
                            <MapPin className="h-5 w-5 text-brand-gold" />
                            Kingston, Jamaica
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <CtaButton href={PROJECT.contact.mapUrl} variant="primary" data-testid="home-directions">Get Directions</CtaButton>
                            <CtaButton to="/location" variant="outline" data-testid="home-explore-location">Explore Location</CtaButton>
                        </div>
                    </motion.div>
                    <LocationMapImage />
                </div>
            </section>

            <section className="container-wide py-14 md:py-20" data-testid="home-final-cta">
                <div className={`relative flex min-h-[56vh] items-center justify-center overflow-hidden md:min-h-[60vh] ${ROUND}`}>
                    <img src={FINAL_IMG} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-brand-ink/55" />
                    <motion.div {...fadeUp} className="relative z-10 px-6 text-center text-white">
                        <h2 className="lux-title text-4xl sm:text-6xl lg:text-7xl">Ready to elevate your view?</h2>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <CtaButton to="/contact" variant="primary" data-testid="final-book-visit">Book a Visit</CtaButton>
                            <CtaButton to="/residences" variant="outline-light" data-testid="final-explore">Explore Residences</CtaButton>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

function ProjectHighlights({ highlights, error }) {
    return (
        <motion.div
            {...fadeUp}
            className="mb-10 grid grid-cols-2 gap-3 px-2 md:mb-12 md:grid-cols-4 md:gap-4 md:px-6"
            data-testid="home-highlights"
        >
            {highlights.map((h) => (
                <div key={h.label} className={`flex flex-col items-center justify-center bg-brand-ivory px-3 py-8 text-center ${ROUND}`}>
                    <span className="font-display text-3xl text-brand-gold md:text-4xl">{h.value}</span>
                    <span className="mt-2 font-sans text-xs uppercase tracking-[0.14em] text-brand-ink/55">{h.label}</span>
                </div>
            ))}
            {error && (
                <p className="col-span-full font-sans text-sm text-destructive">Some highlights may be incomplete.</p>
            )}
        </motion.div>
    );
}

function HeroSection() {
    const [videoFailed, setVideoFailed] = useState(false);

    return (
        <section className="container-wide pb-8 pt-32 md:pb-10 md:pt-36" data-testid="hero-section">
            <div className={`relative h-[86vh] overflow-hidden ${ROUND}`}>
                {!videoFailed ? (
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster={HOME_MEDIA.heroFallback}
                        data-testid="hero-video"
                        onError={() => setVideoFailed(true)}
                        className="absolute inset-0 h-full w-full object-cover"
                    >
                        <source src={HOME_MEDIA.heroVideo} type="video/mp4" />
                    </video>
                ) : (
                    <img
                        src={HOME_MEDIA.heroFallback}
                        alt="Rooftop terrace and pool at Grosvenor Vistas"
                        data-testid="hero-fallback-image"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/65 via-brand-ink/10 to-transparent" />
                <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-x-0 bottom-0 p-8 md:p-16 lg:p-20">
                    <Eyebrow light>Grosvenor Heights · Kingston 8</Eyebrow>
                    <h1 className="lux-title mt-6 text-6xl text-white sm:text-7xl lg:text-8xl">Elevate Your View</h1>
                    <p className="mt-5 max-w-xl font-sans text-lg text-white/85">Luxury residences in Grosvenor Heights, Manor Park.</p>
                    <div className="mt-9 flex flex-wrap gap-4">
                        <CtaButton to="/contact" variant="primary" data-testid="hero-book-visit">Book a Visit</CtaButton>
                        <CtaButton to="/residences" variant="outline-light" data-testid="hero-explore">Explore Residences</CtaButton>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function AmenitiesShowcase() {
    return (
        <section className="container-wide py-14 md:py-20" data-testid="home-amenities">
            <motion.div {...fadeUp} className="mb-10 flex flex-col gap-6 px-2 md:mb-12 md:flex-row md:items-end md:justify-between md:px-6">
                <div>
                    <Eyebrow>The Experience</Eyebrow>
                    <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Amenities for the everyday</h2>
                </div>
                <Link to="/amenities" data-testid="amenities-view-all" className="inline-flex items-center gap-2 border-b border-brand-gold pb-1 font-sans text-sm uppercase tracking-[0.14em] text-brand-gold transition-opacity hover:opacity-70">
                    View all amenities <ArrowRight className="h-4 w-4" />
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 md:px-6 lg:grid-cols-4" data-testid="amenity-highlights">
                {HOME_AMENITY_HIGHLIGHTS.map((a, i) => {
                    const Icon = AMENITY_ICONS[a.icon];
                    return (
                        <motion.div
                            key={a.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                            data-testid={`amenity-highlight-${i}`}
                            className={`group flex h-full flex-col gap-4 bg-brand-ivory p-8 transition-colors duration-300 hover:bg-brand-warm ${ROUND}`}
                        >
                            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-gold/30 text-brand-gold transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-white">
                                <Icon className="h-6 w-6" strokeWidth={1.4} />
                            </span>
                            <div>
                                <h3 className="lux-title text-xl font-light text-brand-blue md:text-2xl">{a.title}</h3>
                                <p className="mt-3 min-h-[3.25rem] font-sans text-sm leading-relaxed text-brand-ink/65">{a.line}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}

function LifestyleShowcase() {
    return (
        <section className="container-wide py-14 md:py-20" data-testid="home-lifestyle-features">
            <motion.div {...fadeUp} className="mb-10 px-2 md:mb-12 md:px-6">
                <Eyebrow>The Lifestyle</Eyebrow>
                <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">A life, elevated</h2>
            </motion.div>
            <div className="grid gap-4 px-2 md:grid-cols-3 md:gap-5 md:px-6">
                {HOME_LIFESTYLE_PANELS.map((panel) => (
                    <motion.div
                        key={panel.title}
                        {...fadeUp}
                        data-testid={`lifestyle-feature-${panel.title.toLowerCase().replace(/ /g, "-")}`}
                        className={`group relative h-[52vh] overflow-hidden md:h-[60vh] ${ROUND}`}
                    >
                        <img
                            src={panel.image}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-8">
                            <h3 className="lux-title text-3xl md:text-4xl">{panel.title}</h3>
                            <p className="mt-2 max-w-xs font-sans text-sm text-white/85">{panel.line}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function LocationMapImage() {
    return (
        <a
            href={PROJECT.contact.mapUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="home-map"
            aria-label="Open Grosvenor Vistas location in Google Maps"
            className={`group block overflow-hidden border border-brand-beige bg-brand-ivory ${ROUND}`}
        >
            <div className="flex min-h-[48vh] items-center justify-center p-4 md:min-h-[52vh] md:p-6">
                <img
                    src={HOME_MEDIA.locationMap}
                    alt="Map showing Grosvenor Vistas in Grosvenor Heights, Kingston"
                    loading="lazy"
                    className="max-h-[44vh] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02] md:max-h-[48vh]"
                />
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-brand-beige px-5 py-4 md:px-6">
                <span className="lux-title text-xl text-brand-blue md:text-2xl">Grosvenor Heights</span>
                <span className="lux-eyebrow flex items-center gap-2 text-brand-gold">
                    Open in Maps <ArrowRight className="h-4 w-4" />
                </span>
            </div>
        </a>
    );
}
