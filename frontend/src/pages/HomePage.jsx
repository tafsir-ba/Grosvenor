import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import CtaButton from "@/components/shared/CtaButton";
import { useUnits } from "@/hooks/useData";
import { PROJECT, GALLERY, STARTING_PRICE } from "@/lib/constants";

// Hero media — looping video on desktop, image fallback on mobile (perf).
const HERO_IMG = "/gallery/hero-fallback.png";
const HERO_VIDEO = "/video/hero.mp4";

// Lifestyle media — looping rooftop video on desktop, image fallback on mobile.
const LIFESTYLE_VIDEO = "/video/lifestyle.mp4";
const LIFESTYLE_IMG = "/gallery/ext-heliconia-view.png";

const VIEW_IMG = "/gallery/ext-rooftop-seaview.png";
const MOMENT_VIDEO = "/video/poolside-shower.mp4";
const MOMENT_IMG = "/gallery/ext-rooftop-mountain.png";
const FINAL_IMG = "/gallery/ext-aerial.png";
const GYM_IMG = "/gallery/gym.jpg";

const LIFESTYLE = [
    { title: "Privacy", line: "Strata-approved security, controlled access, and a private residential setting." },
    { title: "Elevation", line: "A hillside location designed to capture cooling breezes and elevated views over Kingston." },
    { title: "Modern Living", line: "Contemporary residences with thoughtful layouts and spaces designed for everyday ease." },
];

const AMENITIES = [
    { title: "Infinity Pool", line: "Rooftop water that meets the horizon.", image: "/gallery/rooftop-pool.png" },
    { title: "Gym", line: "An indoor gym with mountain and poolside views, designed for movement, wellness, and daily convenience.", image: GYM_IMG },
    { title: "Rooftop Spaces", line: "Evenings made for gathering, above it all.", image: "/gallery/homestaging-evening-terrace.png" },
    { title: "Landscaped Grounds", line: "Greenery woven through the community.", image: "/gallery/heliconia-grounds.png" },
    { title: "Strata Approved Security", line: "A gated, watched community with peace of mind.", image: "/gallery/gate-entrance.png" },
];

const RESIDENCE_TIERS = [
    { key: "vista", name: "The Vista Residences", image: "/gallery/home-staging-kitchen-2.png", test: (u) => u.total_surface < 2500 },
    { key: "signature", name: "Signature Residences", image: "/gallery/homestaging-bathroom-4.png", test: (u) => u.total_surface >= 2500 && u.total_surface < 4000 },
    { key: "townhouses", name: "Begonia Townhouses", image: "/gallery/ext-townhouse-begonia.png", test: (u) => u.total_surface >= 4000 },
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

function ParallaxImage({ src, className = "" }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
    return (
        <div ref={ref} className={`overflow-hidden ${className}`}>
            <motion.img style={{ y }} src={src} alt="" loading="lazy" className="h-[116%] w-full object-cover" />
        </div>
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

export default function HomePage() {
    const { units } = useUnits({ status: "available", sort: "price_asc" });
    const desktop = useIsDesktop();

    const tiers = useMemo(() => {
        return RESIDENCE_TIERS.map((b) => {
            const us = units.filter(b.test);
            const surfaces = us.map((u) => u.total_surface).filter(Boolean);
            const prices = us.map((u) => u.price).filter(Boolean);
            return {
                ...b,
                count: us.length,
                minSurface: surfaces.length ? Math.min(...surfaces) : null,
                minPrice: prices.length ? Math.min(...prices) : null,
            };
        }).filter((t) => t.count > 0);
    }, [units]);

    return (
        <div data-testid="home-page" className="bg-brand-warm text-brand-ink">
            <HeroSection />

            {/* 2. THE VIEW */}
            <section className="container-wide py-20 md:py-28" data-testid="home-view">
                <motion.div {...fadeUp} className="mb-10 max-w-3xl px-2 md:px-6">
                    <Eyebrow>The View</Eyebrow>
                    <h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">Wake up above Kingston</h2>
                    <p className="mt-6 font-sans text-lg text-brand-ink/70">Every day begins with a different horizon.</p>
                </motion.div>
                <ParallaxImage src={VIEW_IMG} className={`h-[78vh] ${ROUND}`} />
            </section>

            {/* 3. LIFESTYLE */}
            <LifestyleSection />

            {/* 4. AMENITIES */}
            <AmenitiesShowcase />

            {/* 5. FULL-WIDTH VISUAL MOMENT — poolside shower loop */}
            <section className="container-wide py-20 md:py-28" data-testid="home-moment">
                <div className={`relative flex h-[76vh] items-center justify-center overflow-hidden ${ROUND}`}>
                    {desktop ? (
                        <video autoPlay muted loop playsInline preload="metadata" poster={MOMENT_IMG} data-testid="moment-video" className="absolute inset-0 h-full w-full object-cover">
                            <source src={MOMENT_VIDEO} type="video/mp4" />
                        </video>
                    ) : (
                        <img src={MOMENT_IMG} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-brand-ink/35" />
                    <motion.h2 {...fadeUp} className="lux-title relative z-10 max-w-4xl px-6 text-center text-4xl text-white sm:text-6xl lg:text-7xl">
                        Elevated living.<br />Uninterrupted views.
                    </motion.h2>
                </div>
            </section>

            {/* 6. RESIDENCES */}
            <section className="container-wide py-20 md:py-28" data-testid="home-residences">
                <div className="mb-14 flex flex-wrap items-end justify-between gap-6 px-2 md:px-6">
                    <div><Eyebrow>The Residences</Eyebrow><h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">Find your space</h2></div>
                    <p className="max-w-sm font-sans text-brand-ink/60">Forty-three residences, defined by space and position — from {STARTING_PRICE}.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {tiers.map((t) => (
                        <Link key={t.key} to="/residences" data-testid={`residence-tier-${t.key}`} className={`group relative block h-[68vh] overflow-hidden ${ROUND}`}>
                            <img src={t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/15 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                                <h3 className="lux-title text-3xl md:text-4xl">{t.name}</h3>
                                {t.minSurface && <p className="mt-2 font-sans text-sm uppercase tracking-[0.18em] text-white/80">From {t.minSurface.toLocaleString()} sq ft</p>}
                                <div className="mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-32 group-hover:opacity-100">
                                    {t.minPrice && <p className="font-sans text-white/90">From USD {t.minPrice.toLocaleString()}</p>}
                                    <p className="font-sans text-sm text-white/70">{t.count} available</p>
                                    <span className="lux-eyebrow mt-3 inline-flex items-center gap-2 text-brand-gold">View Residence <ArrowRight className="h-4 w-4" /></span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* 7. LOCATION PREVIEW */}
            <section className="container-wide py-20 md:py-28" data-testid="home-location">
                <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
                    <motion.div {...fadeUp} className="px-2 md:px-6">
                        <Eyebrow>The Setting</Eyebrow>
                        <h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">Perfectly positioned in Grosvenor Heights</h2>
                        <p className="mt-7 flex items-center gap-3 font-sans text-lg text-brand-ink/70"><MapPin className="h-5 w-5 text-brand-gold" /> Kingston, Jamaica</p>
                        <div className="mt-9 flex flex-wrap gap-4">
                            <CtaButton href={PROJECT.contact.mapUrl} variant="primary" data-testid="home-directions">Get Directions</CtaButton>
                            <CtaButton to="/location" variant="outline" data-testid="home-explore-location">Explore Location</CtaButton>
                        </div>
                    </motion.div>
                    <PlaceholderMap />
                </div>
            </section>

            {/* 8. GALLERY PREVIEW */}
            <GalleryPreview />

            {/* 9. FINAL CTA */}
            <section className="container-wide py-20 md:py-28" data-testid="home-final-cta">
                <div className={`relative flex min-h-[76vh] items-center justify-center overflow-hidden ${ROUND}`}>
                    <img src={FINAL_IMG} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-brand-ink/55" />
                    <motion.div {...fadeUp} className="relative z-10 px-6 text-center text-white">
                        <h2 className="lux-title text-5xl sm:text-7xl lg:text-8xl">Ready to elevate your view?</h2>
                        <div className="mt-10 flex flex-wrap justify-center gap-4">
                            <CtaButton to="/contact" variant="primary" data-testid="final-book-visit">Book a Visit</CtaButton>
                            <CtaButton to="/residences" variant="outline-light" data-testid="final-explore">Explore Residences</CtaButton>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

function HeroSection() {
    const desktop = useIsDesktop();
    return (
        <section className="container-wide pb-12 pt-32 md:pt-36" data-testid="hero-section">
            <div className={`relative h-[86vh] overflow-hidden ${ROUND}`}>
                {desktop ? (
                    <video autoPlay muted loop playsInline preload="metadata" poster={HERO_IMG} data-testid="hero-video" className="absolute inset-0 h-full w-full object-cover">
                        <source src={HERO_VIDEO} type="video/mp4" />
                    </video>
                ) : (
                    <img src={HERO_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
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

function LifestyleSection() {
    const [active, setActive] = useState(0);
    const desktop = useIsDesktop();

    return (
        <section className="container-wide py-20 md:py-28" data-testid="home-lifestyle">
            <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
                {/* Left: editorial text, only this area changes on hover */}
                <motion.div {...fadeUp} className="px-2 md:px-6">
                    <Eyebrow>The Lifestyle</Eyebrow>
                    <h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">A life, elevated</h2>
                    <div className="mt-10 divide-y divide-brand-beige border-y border-brand-beige">
                        {LIFESTYLE.map((l, i) => (
                            <div
                                key={l.title}
                                data-testid={`lifestyle-item-${l.title.toLowerCase().replace(/ /g, "-")}`}
                                onMouseEnter={() => setActive(i)}
                                className="cursor-default py-6"
                            >
                                <h3 className={`lux-title text-3xl font-light transition-colors duration-300 md:text-4xl ${active === i ? "text-brand-gold" : "text-brand-ink/80"}`}>{l.title}</h3>
                                <div className={`grid transition-all duration-500 ease-out ${active === i ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                                    <p className="max-w-md overflow-hidden font-sans text-base text-brand-ink/65">{l.line}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right: one strong visual — looping video on desktop, image on mobile */}
                <div className={`relative h-[64vh] overflow-hidden lg:h-[84vh] ${ROUND}`}>
                    {desktop ? (
                        <video autoPlay muted loop playsInline preload="metadata" poster={LIFESTYLE_IMG} data-testid="lifestyle-video" className="absolute inset-0 h-full w-full object-cover">
                            <source src={LIFESTYLE_VIDEO} type="video/mp4" />
                        </video>
                    ) : (
                        <img src={LIFESTYLE_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    )}
                </div>
            </div>
        </section>
    );
}

function AmenitiesShowcase() {
    const [active, setActive] = useState(0);

    return (
        <section className="container-wide py-20 md:py-28" data-testid="home-amenities">
            <motion.div {...fadeUp} className="mb-12 px-2 md:px-6">
                <Eyebrow>The Experience</Eyebrow>
                <h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">Amenities for the everyday</h2>
            </motion.div>
            <div className="grid items-center gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
                {/* List — hover or tap to explore */}
                <div className="order-2 md:order-1">
                    {AMENITIES.map((a, i) => (
                        <button
                            key={a.title}
                            type="button"
                            onMouseEnter={() => setActive(i)}
                            onClick={() => setActive(i)}
                            data-testid={`amenity-item-${i}`}
                            className="block w-full border-b border-brand-beige py-5 text-left"
                        >
                            <span className="flex items-baseline gap-4">
                                <span className="lux-eyebrow text-brand-ink/40">{String(i + 1).padStart(2, "0")}</span>
                                <span className={`lux-title text-3xl font-light transition-colors duration-300 md:text-4xl ${active === i ? "text-brand-gold" : "text-brand-ink/80"}`}>{a.title}</span>
                            </span>
                            <span className={`grid transition-all duration-500 ease-out ${active === i ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                                <span className="overflow-hidden"><span className="block max-w-md pl-10 font-sans text-base text-brand-ink/65">{a.line}</span></span>
                            </span>
                        </button>
                    ))}
                </div>
                {/* Big image — smooth crossfade */}
                <div className={`relative order-1 h-[58vh] overflow-hidden md:order-2 md:h-[80vh] ${ROUND}`}>
                    {AMENITIES.map((a, i) => (
                        <motion.img
                            key={a.title}
                            src={a.image}
                            alt={a.title}
                            loading="lazy"
                            animate={{ opacity: active === i ? 1 : 0, scale: active === i ? 1 : 1.05 }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ))}
                </div>
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
            className={`group relative block h-[58vh] overflow-hidden border border-brand-beige lg:h-[64vh] ${ROUND}`}
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

function GalleryPreview() {
    const ref = useRef(null);
    const [index, setIndex] = useState(0);

    const scrollBy = (dir) => {
        const el = ref.current;
        if (!el) return;
        el.scrollBy({ left: el.clientWidth * 0.8 * dir, behavior: "smooth" });
    };

    const onScroll = () => {
        const el = ref.current;
        if (!el) return;
        const card = el.firstChild?.clientWidth || 1;
        setIndex(Math.round(el.scrollLeft / (card + 24)));
    };

    return (
        <section className="py-20 md:py-28" data-testid="home-gallery">
            <div className="container-wide mb-12 flex flex-wrap items-end justify-between gap-6 px-2 md:px-8">
                <div><Eyebrow>The Gallery</Eyebrow><h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">Feel this luxury</h2></div>
                <div className="flex items-center gap-5">
                    <span className="lux-eyebrow text-brand-ink/60">{String(index + 1).padStart(2, "0")} / {String(GALLERY.length).padStart(2, "0")}</span>
                    <div className="flex gap-3">
                        <button onClick={() => scrollBy(-1)} data-testid="gallery-prev" aria-label="Previous" className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-ink/20 text-brand-ink transition-colors hover:border-brand-gold hover:text-brand-gold"><ArrowLeft className="h-5 w-5" /></button>
                        <button onClick={() => scrollBy(1)} data-testid="gallery-next" aria-label="Next" className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-ink/20 text-brand-ink transition-colors hover:border-brand-gold hover:text-brand-gold"><ArrowRight className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>
            <div ref={ref} onScroll={onScroll} className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 md:px-8" style={{ scrollbarWidth: "none" }} data-testid="gallery-scroller">
                {GALLERY.map((g, i) => (
                    <figure key={i} className={`relative h-[64vh] w-[88vw] flex-shrink-0 snap-start overflow-hidden sm:w-[640px] ${ROUND}`}>
                        <img src={g.src} alt={g.caption} loading="lazy" className="h-full w-full object-cover" />
                        <figcaption className="absolute bottom-0 left-0 p-7"><span className="lux-eyebrow rounded-full bg-brand-warm/90 px-4 py-2 text-brand-ink backdrop-blur">{g.caption}</span></figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}
