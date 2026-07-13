import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Waves, Dumbbell, KeyRound, Car, ShieldCheck, Shield, Mountain, Home } from "lucide-react";
import CtaButton from "@/components/shared/CtaButton";
import { useUnits } from "@/hooks/useData";
import { PROJECT, HOME_RESIDENCE_CATEGORIES } from "@/lib/constants";
import { formatPrice, minStartingPrice } from "@/lib/format";

const HERO_IMG = "/gallery/hero-fallback.png";
const HERO_MOBILE_IMG = "/media/hero-aerial.png";
const HERO_VIDEO = "/video/hero.mp4";
const FINAL_IMG = "/gallery/ext-aerial.png";

const LIFESTYLE = [
    { title: "Privacy", line: "Strata-approved security, controlled access, and a private residential setting.", icon: Shield },
    { title: "Elevation", line: "A hillside location designed to capture cooling breezes and elevated views over Kingston.", icon: Mountain },
    { title: "Modern Living", line: "Contemporary residences with thoughtful layouts and spaces designed for everyday ease.", icon: Home },
];

const ROUND = "rounded-[1.75rem] md:rounded-[2.5rem]";

const fadeUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
};

function Eyebrow({ children, light = false }) {
    return (
        <span className={`lux-eyebrow flex items-center gap-3 ${light ? "text-white/80" : "text-brand-gold"}`}>
            <span className={`h-px w-8 ${light ? "bg-white/50" : "bg-brand-gold/50"}`} />
            {children}
        </span>
    );
}

function useIsDesktop() {
    const [desktop, setDesktop] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const update = () => setDesktop(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);
    return desktop;
}

function projectHighlights(allUnits, availableUnits, loading, error) {
    const townhouses = allUnits.filter((u) => u.total_surface >= 4500).length;
    const apartmentBuildings = new Set(
        allUnits.filter((u) => u.total_surface < 4500).map((u) => u.building),
    ).size;
    const startingPrice = formatPrice(minStartingPrice(availableUnits));

    return [
        { value: loading ? "—" : String(availableUnits.length), label: "Available Now" },
        { value: loading ? "—" : startingPrice, label: "Starting From" },
        { value: String(PROJECT.unitsCount), label: "Residences" },
        { value: loading ? "—" : `${apartmentBuildings} + ${townhouses}`, label: "Buildings + Townhouses" },
    ];
}

export default function HomePage() {
    const { units: availableUnits, loading, error } = useUnits({ status: "available", sort: "price_asc" });
    const { units: allUnits, loading: allLoading } = useUnits({ sort: "price_asc" });

    const tiers = useMemo(() => {
        return HOME_RESIDENCE_CATEGORIES.map((c) => {
            const us = availableUnits.filter((u) => u.total_surface >= c.min && u.total_surface < c.max);
            const surfaces = us.map((u) => u.total_surface).filter(Boolean);
            const prices = us.map((u) => u.price).filter(Boolean);
            return {
                key: c.key,
                name: c.name,
                subtitle: c.subtitle,
                image: c.cardImage,
                collectionKey: c.collectionKey,
                count: us.length,
                minSurface: surfaces.length ? Math.min(...surfaces) : null,
                minPrice: prices.length ? Math.min(...prices) : null,
            };
        });
    }, [availableUnits]);

    const highlights = projectHighlights(allUnits, availableUnits, loading || allLoading, error);
    const startingPrice = formatPrice(minStartingPrice(availableUnits));

    return (
        <div data-testid="home-page" className="bg-brand-warm text-brand-ink">
            <HeroSection />

            {/* 2. RESIDENCES — directly below hero */}
            <section className="container-wide py-14 md:py-20" data-testid="home-residences">
                <div className="mb-10 flex flex-wrap items-end justify-between gap-6 px-2 md:mb-12 md:px-6">
                    <div>
                        <Eyebrow>The Residences</Eyebrow>
                        <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Find your space</h2>
                    </div>
                    <p className="max-w-sm font-sans text-brand-ink/60">
                        {loading ? "Loading residences…" : error ? "Residence pricing is temporarily unavailable." : `Forty-three residences, defined by space and position — from ${startingPrice}.`}
                    </p>
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
                                to={`/residences?collection=${t.collectionKey}`}
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

            {/* 3. LIFESTYLE — 3 simple feature cards */}
            <LifestyleFeatures />

            {/* 4. AMENITIES — 4 highlights */}
            <AmenitiesShowcase />

            {/* 5. LOCATION PREVIEW */}
            <section className="container-wide py-14 md:py-20" data-testid="home-location">
                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    <motion.div {...fadeUp} className="px-2 md:px-6">
                        <Eyebrow>The Setting</Eyebrow>
                        <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Perfectly positioned in Grosvenor Heights</h2>
                        <p className="mt-6 flex items-center gap-3 font-sans text-lg text-brand-ink/70">
                            <MapPin className="h-5 w-5 text-brand-gold" /> Kingston, Jamaica
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <CtaButton href={PROJECT.contact.mapUrl} variant="primary" data-testid="home-directions">Get Directions</CtaButton>
                            <CtaButton to="/location" variant="outline" data-testid="home-explore-location">Explore Location</CtaButton>
                        </div>
                    </motion.div>
                    <PlaceholderMap />
                </div>
            </section>

            {/* 6. FINAL CTA */}
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

function ProjectHighlights({ highlights, loading, error }) {
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
    const desktop = useIsDesktop();
    return (
        <section className="container-wide pb-8 pt-32 md:pb-10 md:pt-36" data-testid="hero-section">
            <div className={`relative h-[86vh] overflow-hidden ${ROUND}`}>
                {desktop ? (
                    <video autoPlay muted loop playsInline preload="metadata" poster={HERO_IMG} data-testid="hero-video" className="absolute inset-0 h-full w-full object-cover">
                        <source src={HERO_VIDEO} type="video/mp4" />
                    </video>
                ) : (
                    <img src={HERO_MOBILE_IMG} alt="Aerial view of Grosvenor Vistas" data-testid="hero-mobile-image" className="absolute inset-0 h-full w-full object-cover object-center" />
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

function LifestyleFeatures() {
    return (
        <section className="container-wide py-14 md:py-20" data-testid="home-lifestyle-features">
            <motion.div {...fadeUp} className="mb-10 px-2 md:mb-12 md:px-6">
                <Eyebrow>The Lifestyle</Eyebrow>
                <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">A life, elevated</h2>
            </motion.div>
            <div className="grid gap-4 px-2 md:grid-cols-3 md:gap-5 md:px-6">
                {LIFESTYLE.map((l) => (
                    <motion.div
                        key={l.title}
                        {...fadeUp}
                        data-testid={`lifestyle-feature-${l.title.toLowerCase().replace(/ /g, "-")}`}
                        className={`flex flex-col gap-4 bg-brand-ivory p-8 ${ROUND}`}
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-gold/30 text-brand-gold">
                            <l.icon className="h-5 w-5" strokeWidth={1.4} />
                        </span>
                        <h3 className="lux-title text-2xl text-brand-blue md:text-3xl">{l.title}</h3>
                        <p className="font-sans text-base leading-relaxed text-brand-ink/65">{l.line}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function AmenitiesShowcase() {
    const highlights = [
        { icon: Waves, title: "Rooftop Infinity Pool" },
        { icon: Dumbbell, title: "Rooftop Gym" },
        { icon: KeyRound, title: "Smart Locks" },
        { icon: Car, title: "Assigned Underground Parking" },
    ];

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

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[1.75rem] border border-brand-beige bg-brand-beige md:rounded-[2.5rem]" data-testid="amenity-highlights">
                {highlights.map((a, i) => (
                    <motion.div
                        key={a.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        data-testid={`amenity-highlight-${i}`}
                        className="group flex flex-col items-start gap-5 bg-brand-ivory p-8 transition-colors duration-300 hover:bg-brand-warm md:p-10"
                    >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-gold/30 text-brand-gold transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-white">
                            <a.icon className="h-6 w-6" strokeWidth={1.4} />
                        </span>
                        <h3 className="lux-title text-xl font-light text-brand-blue md:text-2xl">{a.title}</h3>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

function PlaceholderMap() {
    return (
        <a
            href={PROJECT.contact.mapUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="home-map"
            aria-label="Open Grosvenor Vistas location in Google Maps"
            className={`group relative block h-[48vh] overflow-hidden border border-brand-beige lg:h-[52vh] ${ROUND}`}
        >
            <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
                <rect width="800" height="600" fill="#F2EFE9" />
                <path d="M0 0H320V210H0Z" fill="#EAE5DB" opacity="0.7" />
                <path d="M470 90H800V330H470Z" fill="#EAE5DB" opacity="0.6" />
                <path d="M120 380H520V600H120Z" fill="#EAE5DB" opacity="0.55" />
                <g stroke="#D8CFBF" strokeWidth="6" fill="none" strokeLinecap="round">
                    <path d="M-20 250H820" /><path d="M400 -20V620" /><path d="M-20 430H820" /><path d="M180 -20V620" /><path d="M620 -20V620" /><path d="M-20 120H820" />
                </g>
                <g stroke="#E3DACB" strokeWidth="3" fill="none" strokeLinecap="round">
                    <path d="M-20 340H820" /><path d="M300 -20V620" /><path d="M520 -20V620" />
                </g>
                <circle cx="690" cy="470" r="60" fill="#C9D2BE" opacity="0.5" />
                <circle cx="80" cy="520" r="40" fill="#C9D2BE" opacity="0.45" />
            </svg>
            <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
                <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-brand-gold/25" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-white shadow-[0_10px_30px_rgba(198,134,43,0.45)]">
                    <MapPin className="h-6 w-6" />
                </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-6">
                <span className="lux-title text-2xl text-brand-blue md:text-3xl">Grosvenor Heights</span>
                <span className="lux-eyebrow flex items-center gap-2 rounded-full bg-brand-warm/90 px-4 py-2 text-brand-ink backdrop-blur transition-colors group-hover:text-brand-gold">
                    Open in Maps <ArrowRight className="h-4 w-4" />
                </span>
            </div>
        </a>
    );
}
