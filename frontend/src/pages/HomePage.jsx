import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mountain, Waves, MoveVertical, Lock, Car, Baby, ShieldCheck, DoorClosed, Trees, Trash2 } from "lucide-react";
import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import UnitCard from "@/components/shared/UnitCard";
import DownloadForm from "@/components/shared/DownloadForm";
import MapSection from "@/components/shared/MapSection";
import CtaButton from "@/components/shared/CtaButton";
import { useUnits, useDownloads } from "@/hooks/useData";
import { PROJECT, AMENITY_FEATURES, STARTING_PRICE, HERO_IMAGE, AERIAL_IMAGE } from "@/lib/constants";

const ICONS = { views: Mountain, pool: Waves, elevator: MoveVertical, lock: Lock, parking: Car, playground: Baby, security: ShieldCheck, gate: DoorClosed, garden: Trees, garbage: Trash2 };

const reveal = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
};

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
                overline="Manor Park · Kingston 8 · Jamaica"
                title="Elevate"
                titleAccent="Your View"
                subtitle="Forty-three considered residences set within the established hills of Grosvenor Heights."
                note={`From ${STARTING_PRICE}`}
                primary={{ to: "/residences", children: "Explore Residences" }}
                secondary={{ to: "/contact", children: "Book a Visit" }}
            />

            {/* Welcome / intro */}
            <section className="container-x py-28 md:py-36" data-testid="home-intro">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                    <motion.div {...reveal}>
                        <p className="overline text-brand-gold">Welcome to</p>
                        <h2 className="display mt-4 text-5xl uppercase leading-[0.95] text-brand-blue sm:text-6xl lg:text-7xl">Grosvenor<br />Vistas</h2>
                        <p className="mt-8 font-display text-5xl font-light text-brand-gold">43 units</p>
                    </motion.div>
                    <motion.div {...reveal} className="flex flex-col justify-center space-y-6 text-lg leading-relaxed text-muted-foreground">
                        <p>Grosvenor Vistas is a community of forty-three bright, spacious residences in one of Kingston's most coveted addresses — with sweeping hillside and city views from every block.</p>
                        <p>A showroom and fully staged model residence are open on the property. Experience the finishes, the space and the view in person.</p>
                        <p className="text-brand-blue">Residences from <span className="font-semibold">{STARTING_PRICE}</span>.</p>
                    </motion.div>
                </div>
            </section>

            {/* Amenities — pushed up front */}
            <section className="bg-brand-blue py-28 text-white md:py-36" data-testid="home-amenities">
                <div className="container-x">
                    <SectionHeading overline="Amenities & Lifestyle" title="Designed for" titleAccent="the way you live" subtitle="An exceptional offering of shared amenities — and views you'll never tire of." light className="mb-16" />
                    <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
                        {AMENITY_FEATURES.map((a, i) => {
                            const Icon = ICONS[a.icon] || Mountain;
                            return (
                                <motion.div
                                    key={a.label}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-40px" }}
                                    transition={{ duration: 0.6, delay: (i % 5) * 0.08 }}
                                    data-testid={`amenity-feature-${i}`}
                                    className="flex flex-col items-center text-center"
                                >
                                    <Icon className="h-9 w-9 text-white" strokeWidth={1.2} />
                                    <p className="mt-4 text-sm leading-snug text-white/85">{a.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="mt-16 text-center"><CtaButton to="/amenities" variant="outline-light">Explore Lifestyle</CtaButton></div>
                </div>
            </section>

            {/* Single full-bleed parallax image */}
            <ParallaxImage src="/gallery/rooftop-pool.png">
                <motion.div {...reveal}>
                    <p className="overline mb-5 text-white">The View</p>
                    <h2 className="display text-5xl leading-[0.98] sm:text-7xl lg:text-8xl">Wake up above it all</h2>
                    <p className="mx-auto mt-7 max-w-xl text-lg text-white/90">Rooftop pools and panoramic outlooks across Manor Park and the Kingston hills.</p>
                </motion.div>
            </ParallaxImage>

            {/* Featured residences */}
            <section className="container-x py-28 md:py-36" data-testid="home-residences">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <SectionHeading overline="Residences" title="Available" titleAccent="now" subtitle={`Live availability and pricing — from ${STARTING_PRICE}.`} />
                    <CtaButton to="/residences" variant="outline">View All Residences</CtaButton>
                </div>
                <motion.div {...reveal} className="mt-14 divide-y divide-border border-y border-border">
                    {featured.map((u) => <UnitCard key={u.slug} unit={u} />)}
                </motion.div>
            </section>

            {/* Location */}
            <section className="container-x pb-28 md:pb-36" data-testid="home-location">
                <SectionHeading overline="Location" title="A coveted" titleAccent="Kingston 8 address" className="mb-14" />
                <MapSection />
            </section>

            {/* Downloads — image-led, redesigned */}
            <section className="bg-brand-blue py-28 text-white md:py-32" data-testid="home-downloads">
                <div className="container-x grid items-center gap-16 lg:grid-cols-2">
                    <div className="overflow-hidden">
                        <img src="/gallery/townhouse-facade.png" alt="" className="aspect-[4/3] w-full object-cover" />
                    </div>
                    <div>
                        <p className="overline text-white">Resources</p>
                        <h2 className="display mt-4 text-5xl text-white lg:text-6xl">Brochure & price list</h2>
                        <p className="mt-6 text-lg text-white/80">Everything you need, in two downloads.</p>
                        <div className="mt-10 space-y-3">
                            {downloads.map((d) => <DownloadForm key={d._id} download={d} dark />)}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-brand-gold py-24" data-testid="home-cta">
                <div className="container-x flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
                    <div>
                        <p className="overline text-white/80">Visit the Showroom</p>
                        <h2 className="mt-3 display text-4xl text-white md:text-5xl">Experience Grosvenor Vistas in person</h2>
                    </div>
                    <CtaButton to="/contact" variant="secondary" className="flex-shrink-0">Book a Visit</CtaButton>
                </div>
            </section>
        </div>
    );
}
