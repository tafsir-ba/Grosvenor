import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import UnitCard from "@/components/shared/UnitCard";
import AmenityScroller from "@/components/shared/AmenityScroller";
import DownloadForm from "@/components/shared/DownloadForm";
import MapSection from "@/components/shared/MapSection";
import CtaButton from "@/components/shared/CtaButton";
import { useUnits, useDownloads } from "@/hooks/useData";
import { AMENITY_GALLERY, STARTING_PRICE, HERO_IMAGE, SHOWROOM_IMAGE } from "@/lib/constants";

const reveal = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
};

const STATS = [
    { big: "43", small: "Residences" },
    { big: STARTING_PRICE, small: "Starting from" },
    { big: "360°", small: "Mountain & Sea Views" },
];

function ParallaxImage({ src, children }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
    return (
        <section ref={ref} className="relative flex h-[90vh] items-center justify-center overflow-hidden" data-testid="home-feature-image">
            <motion.img style={{ y }} src={src} alt="" className="absolute inset-0 h-[125%] w-full object-cover" />
            <div className="absolute inset-0 bg-brand-blue/45" />
            <div className="container-x relative z-10 text-center text-white">{children}</div>
        </section>
    );
}

export default function HomePage() {
    const { units } = useUnits({ status: "available", sort: "price_asc" });
    const downloads = useDownloads();
    const featured = units.filter((u) => u.price).slice(0, 5);

    return (
        <div data-testid="home-page">
            <Hero
                image={HERO_IMAGE}
                upper
                title="Elevate"
                titleAccent="Your View"
                note={`From ${STARTING_PRICE}`}
                primary={{ to: "/residences", children: "Explore Residences" }}
                secondary={{ to: "/contact", children: "Book a Visit" }}
            />

            {/* Short, bold summary — clean centered figures */}
            <section className="border-b border-border bg-white py-24 md:py-32" data-testid="home-stats">
                <div className="container-x grid grid-cols-1 gap-14 text-center sm:grid-cols-3">
                    {STATS.map((s, i) => (
                        <motion.div key={s.small} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }}>
                            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{s.small}</p>
                            <p className="mt-4 display text-5xl font-light text-brand-blue md:text-6xl">{s.big}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Amenities — image-led gallery, minimal text */}
            <section className="bg-brand-blue py-24 text-white md:py-32" data-testid="home-amenities">
                <div className="container-x mb-12 flex flex-wrap items-end justify-between gap-4">
                    <SectionHeading title="Amenities" titleAccent="& lifestyle" light />
                    <span className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60" data-testid="amenity-drag-hint">
                        Drag to explore <span aria-hidden="true">→</span>
                    </span>
                </div>
                <AmenityScroller items={AMENITY_GALLERY} />
                <div className="container-x mt-12"><CtaButton to="/amenities" variant="outline-light">Explore Lifestyle</CtaButton></div>
            </section>

            {/* The View */}
            <ParallaxImage src="/gallery/rooftop-pool.png">
                <motion.div {...reveal}>
                    <h2 className="display text-5xl leading-[0.98] sm:text-7xl lg:text-8xl">Wake up<br />above it all</h2>
                </motion.div>
            </ParallaxImage>

            {/* Available residences */}
            <section className="container-x py-24 md:py-32" data-testid="home-residences">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <SectionHeading title="Available" titleAccent="now" />
                    <CtaButton to="/residences" variant="outline">View All Residences</CtaButton>
                </div>
                <motion.div {...reveal} className="mt-12 divide-y divide-border border-y border-border">
                    {featured.map((u) => <UnitCard key={u.slug} unit={u} />)}
                </motion.div>
            </section>

            {/* Location */}
            <section className="container-x pb-24 md:pb-32" data-testid="home-location">
                <SectionHeading title="Manor Park," titleAccent="Kingston 8" className="mb-12" />
                <MapSection />
            </section>

            {/* Downloads — minimal, image-led, single set of actions */}
            <section className="bg-brand-blue py-24 text-white md:py-28" data-testid="home-downloads">
                <div className="container-x grid items-center gap-14 lg:grid-cols-2">
                    <div className="overflow-hidden">
                        <img src="/gallery/model-unit-kitchen.png" alt="" className="aspect-[4/3] w-full object-cover" />
                    </div>
                    <div>
                        <h2 className="display text-5xl text-white lg:text-6xl">Take it with you</h2>
                        <p className="mt-6 max-w-md text-lg text-white/80">The full brochure and current price list, in your inbox.</p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            {downloads.map((d) => <DownloadForm key={d._id} download={d} dark compact />)}
                        </div>
                    </div>
                </div>
            </section>

            {/* Showroom CTA — full-bleed image */}
            <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden" data-testid="home-showroom-cta">
                <img src={SHOWROOM_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-brand-ink/55" />
                <motion.div {...reveal} className="container-x relative z-10 text-center text-white">
                    <h2 className="display text-5xl leading-[0.98] sm:text-7xl lg:text-8xl">Visit the showroom</h2>
                    <p className="mx-auto mt-6 max-w-lg text-lg text-white/85">Experience the model residence and the view in person.</p>
                    <CtaButton to="/contact" variant="primary" className="mt-10">Book a Visit</CtaButton>
                </motion.div>
            </section>
        </div>
    );
}
