import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import CtaButton from "@/components/shared/CtaButton";
import { useUnits } from "@/hooks/useData";
import { PROJECT, GALLERY, STARTING_PRICE } from "@/lib/constants";

// Temporary aspirational hero. Drop a 6–10s loop into HERO_VIDEO when footage is ready.
const HERO_IMG = "/gallery/hero-rooftop-sunset.png";
const HERO_VIDEO = null;

const VIEW_IMG = "/gallery/rooftop-pool.png";
const LIFESTYLE_IMG = "/gallery/model-unit-living-and-dining-room.png";
const MOMENT_IMG = "/gallery/terrace-2.png";
const FINAL_IMG = "/gallery/homestaging-evening-terrace.png";
const GYM_IMG = "https://images.unsplash.com/photo-1758957646695-ec8bce3df462?crop=entropy&cs=srgb&fm=jpg&q=80&w=1400";

const AMENITIES = [
    { title: "Infinity Pool", line: "Rooftop water that meets the horizon.", image: "/gallery/rooftop-pool.png" },
    { title: "Fitness Centre", line: "Move well, with the view as your backdrop.", image: GYM_IMG },
    { title: "Rooftop Spaces", line: "Evenings made for gathering, above it all.", image: "/gallery/homestaging-evening-terrace.png" },
    { title: "Landscaped Grounds", line: "Greenery woven through the community.", image: "/gallery/terrace.png" },
    { title: "24/7 Security", line: "Armed response and a gated, watched community.", image: "/gallery/townhouse-facade.png" },
];

const RESIDENCE_TIERS = [
    { key: "vista", name: "The Vista Residences", image: "/gallery/model-unit-living-room.png", test: (u) => u.total_surface < 2500 },
    { key: "signature", name: "Signature Residences", image: "/gallery/model-unit-living-and-dining-room.png", test: (u) => u.total_surface >= 2500 && u.total_surface < 4000 },
    { key: "townhouses", name: "Begonia Townhouses", image: "/gallery/townhouse-facade.png", test: (u) => u.total_surface >= 4000 },
];

// Curves live on images/containers only — never as section dividers.
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

export default function HomePage() {
    const { units } = useUnits({ status: "available", sort: "price_asc" });

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
            {/* 1. HERO — large curved image container */}
            <section className="container-x pb-12 pt-32 md:pt-40" data-testid="hero-section">
                <div className={`relative h-[80vh] overflow-hidden ${ROUND}`}>
                    {HERO_VIDEO ? (
                        <video autoPlay muted loop playsInline poster={HERO_IMG} className="absolute inset-0 h-full w-full object-cover" data-testid="hero-video">
                            <source src={HERO_VIDEO} type="video/mp4" />
                        </video>
                    ) : (
                        <motion.img
                            initial={{ scale: 1.08 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                            src={HERO_IMG}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/65 via-brand-ink/10 to-transparent" />
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-x-0 bottom-0 p-8 md:p-14 lg:p-16"
                    >
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

            {/* 2. THE VIEW */}
            <section className="container-x py-20 md:py-32" data-testid="home-view">
                <motion.div {...fadeUp} className="mb-10 max-w-3xl">
                    <Eyebrow>The View</Eyebrow>
                    <h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">Wake up above Kingston</h2>
                    <p className="mt-6 font-sans text-lg text-brand-ink/70">Every day begins with a different horizon.</p>
                </motion.div>
                <ParallaxImage src={VIEW_IMG} className={`h-[72vh] ${ROUND}`} />
            </section>

            {/* 3. LIFESTYLE */}
            <section className="container-x py-20 md:py-32" data-testid="home-lifestyle">
                <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
                    <motion.div {...fadeUp}>
                        <Eyebrow>The Lifestyle</Eyebrow>
                        <h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">A life, elevated</h2>
                        <ul className="mt-10 divide-y divide-brand-beige border-y border-brand-beige">
                            {["Privacy", "Elevation", "Modern Living", "Uninterrupted Views", "Effortless Convenience"].map((t) => (
                                <li key={t} className="lux-title py-5 text-3xl font-light text-brand-ink/80 md:text-4xl">{t}</li>
                            ))}
                        </ul>
                    </motion.div>
                    <ParallaxImage src={LIFESTYLE_IMG} className={`h-[60vh] lg:h-[78vh] ${ROUND}`} />
                </div>
            </section>

            {/* 4. AMENITIES */}
            <section className="container-x py-20 md:py-32" data-testid="home-amenities">
                <motion.div {...fadeUp} className="mb-16"><Eyebrow>The Experience</Eyebrow><h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">Amenities for the everyday</h2></motion.div>
                <div className="flex flex-col gap-20 md:gap-32">
                    {AMENITIES.map((a, i) => (
                        <motion.div
                            key={a.title}
                            {...fadeUp}
                            data-testid={`amenity-${i}`}
                            className={`grid items-center gap-10 md:grid-cols-2 md:gap-20 ${i % 2 ? "md:[direction:rtl]" : ""}`}
                        >
                            <ParallaxImage src={a.image} className={`h-[52vh] md:h-[64vh] md:[direction:ltr] ${ROUND}`} />
                            <div className="md:[direction:ltr]">
                                <span className="lux-title text-6xl font-light text-brand-gold/30 md:text-7xl">{String(i + 1).padStart(2, "0")}</span>
                                <h3 className="lux-title mt-2 text-4xl text-brand-blue md:text-5xl">{a.title}</h3>
                                <p className="mt-4 max-w-sm font-sans text-lg text-brand-ink/70">{a.line}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 5. FULL-WIDTH VISUAL MOMENT — curved image container */}
            <section className="container-x py-20 md:py-32" data-testid="home-moment">
                <div className={`relative flex h-[70vh] items-center justify-center overflow-hidden ${ROUND}`}>
                    <ParallaxImage src={MOMENT_IMG} className="absolute inset-0 h-full w-full" />
                    <div className="absolute inset-0 bg-brand-ink/35" />
                    <motion.h2 {...fadeUp} className="lux-title relative z-10 max-w-4xl px-6 text-center text-4xl text-white sm:text-6xl lg:text-7xl">
                        Elevated living.<br />Uninterrupted views.
                    </motion.h2>
                </div>
            </section>

            {/* 6. RESIDENCES */}
            <section className="container-x py-20 md:py-32" data-testid="home-residences">
                <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
                    <div><Eyebrow>The Residences</Eyebrow><h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">Find your space</h2></div>
                    <p className="max-w-sm font-sans text-brand-ink/60">Forty-three residences, defined by space and position — from {STARTING_PRICE}.</p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                    {tiers.map((t) => (
                        <Link
                            key={t.key}
                            to="/residences"
                            data-testid={`residence-tier-${t.key}`}
                            className={`group relative block h-[64vh] overflow-hidden ${ROUND}`}
                        >
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
            <section className="container-x py-20 md:py-32" data-testid="home-location">
                <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
                    <motion.div {...fadeUp}>
                        <Eyebrow>The Setting</Eyebrow>
                        <h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">Perfectly positioned in Grosvenor Heights</h2>
                        <p className="mt-7 flex items-center gap-3 font-sans text-lg text-brand-ink/70"><MapPin className="h-5 w-5 text-brand-gold" /> Kingston, Jamaica</p>
                        <div className="mt-9 flex flex-wrap gap-4">
                            <CtaButton href={PROJECT.contact.mapUrl} variant="primary" data-testid="home-directions">Get Directions</CtaButton>
                            <CtaButton to="/location" variant="outline" data-testid="home-explore-location">Explore Location</CtaButton>
                        </div>
                    </motion.div>
                    <div className={`h-[50vh] overflow-hidden lg:h-[60vh] ${ROUND}`}>
                        <iframe title="Grosvenor Vistas location" src={PROJECT.contact.mapEmbed} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                    </div>
                </div>
            </section>

            {/* 8. GALLERY PREVIEW */}
            <GalleryPreview />

            {/* 9. FINAL CTA — curved image container */}
            <section className="container-x py-20 md:py-32" data-testid="home-final-cta">
                <div className={`relative flex min-h-[72vh] items-center justify-center overflow-hidden ${ROUND}`}>
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
        <section className="py-20 md:py-32" data-testid="home-gallery">
            <div className="container-x mb-12 flex flex-wrap items-end justify-between gap-6">
                <div><Eyebrow>The Gallery</Eyebrow><h2 className="lux-title mt-7 text-5xl text-brand-blue sm:text-6xl lg:text-7xl">Feel this luxury</h2></div>
                <div className="flex items-center gap-5">
                    <span className="lux-eyebrow text-brand-ink/60">{String(index + 1).padStart(2, "0")} / {String(GALLERY.length).padStart(2, "0")}</span>
                    <div className="flex gap-3">
                        <button onClick={() => scrollBy(-1)} data-testid="gallery-prev" aria-label="Previous" className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-ink/20 text-brand-ink transition-colors hover:border-brand-gold hover:text-brand-gold"><ArrowLeft className="h-5 w-5" /></button>
                        <button onClick={() => scrollBy(1)} data-testid="gallery-next" aria-label="Next" className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-ink/20 text-brand-ink transition-colors hover:border-brand-gold hover:text-brand-gold"><ArrowRight className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>
            <div ref={ref} onScroll={onScroll} className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 md:px-12 lg:px-16" style={{ scrollbarWidth: "none" }} data-testid="gallery-scroller">
                {GALLERY.map((g, i) => (
                    <figure key={i} className={`relative h-[58vh] w-[84vw] flex-shrink-0 snap-start overflow-hidden sm:w-[560px] ${ROUND}`}>
                        <img src={g.src} alt={g.caption} loading="lazy" className="h-full w-full object-cover" />
                        <figcaption className="absolute bottom-0 left-0 p-7"><span className="lux-eyebrow rounded-full bg-brand-warm/85 px-4 py-2 text-brand-ink backdrop-blur">{g.caption}</span></figcaption>
                    </figure>
                ))}
            </div>
        </section>
    );
}
