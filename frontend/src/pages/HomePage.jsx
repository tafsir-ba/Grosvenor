import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import UnitCard from "@/components/shared/UnitCard";
import AmenityCard from "@/components/shared/AmenityCard";
import DownloadForm from "@/components/shared/DownloadForm";
import MapSection from "@/components/shared/MapSection";
import CtaButton from "@/components/shared/CtaButton";
import { useUnits, useDownloads } from "@/hooks/useData";
import { PROJECT, AMENITIES, GALLERY, HERO_IMAGE, AERIAL_IMAGE } from "@/lib/constants";

export default function HomePage() {
    const { units } = useUnits({ status: "available", sort: "price_desc" });
    const downloads = useDownloads();
    const featured = units.slice(0, 3);

    return (
        <div data-testid="home-page">
            <Hero
                image={HERO_IMAGE}
                overline="Manor Park · Kingston 8 · Jamaica"
                title="A refined address at Grosvenor Vistas"
                subtitle="Forty-three considered residences set within the established hills of Grosvenor Heights — bright, spacious and made for the way you live."
                primary={{ to: "/residences", children: "Explore Residences" }}
                secondary={{ to: "/contact", children: "Book a Visit" }}
            />

            {/* Overview */}
            <section className="container-x py-24 md:py-32" data-testid="home-overview">
                <div className="grid items-center gap-14 lg:grid-cols-2">
                    <div>
                        <SectionHeading
                            overline="The Development"
                            title="Considered living in the heart of Manor Park"
                            subtitle="Grosvenor Vistas brings together elegant architecture, generous outdoor space and a sought-after Kingston 8 setting. A showroom and model residence are open on the property — visit and experience it in person."
                        />
                        <div className="mt-10 grid grid-cols-3 gap-8 border-t border-border pt-8">
                            {[
                                { n: PROJECT.unitsCount, l: "Residences" },
                                { n: "3", l: "Blocks + Townhouses" },
                                { n: "USD", l: "Transparent Pricing" },
                            ].map((s) => (
                                <div key={s.l}>
                                    <p className="font-display text-3xl text-brand-blue md:text-4xl">{s.n}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
                                </div>
                            ))}
                        </div>
                        <CtaButton to="/the-development" variant="outline" className="mt-10">Discover More</CtaButton>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="overflow-hidden rounded-sm"
                    >
                        <img src={AERIAL_IMAGE} alt="Grosvenor Vistas masterplan" className="h-full w-full object-cover" />
                    </motion.div>
                </div>
            </section>

            {/* Featured residences */}
            <section className="bg-muted/40 py-24 md:py-32" data-testid="home-residences">
                <div className="container-x">
                    <div className="flex flex-wrap items-end justify-between gap-6">
                        <SectionHeading overline="Residences" title="Available now" subtitle="A selection of available residences. View the full collection with live availability and pricing." />
                        <CtaButton to="/residences" variant="outline">View All Residences</CtaButton>
                    </div>
                    <div className="mt-12 grid gap-6 md:grid-cols-3">
                        {featured.map((u) => <UnitCard key={u.slug} unit={u} />)}
                    </div>
                </div>
            </section>

            {/* Amenities */}
            <section className="container-x py-24 md:py-32" data-testid="home-amenities">
                <SectionHeading overline="Amenities & Lifestyle" title="Designed for everyday ease" align="center" />
                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {AMENITIES.slice(0, 3).map((a, i) => <AmenityCard key={a.title} amenity={a} index={i} />)}
                </div>
                <div className="mt-10 text-center"><CtaButton to="/amenities" variant="outline">Explore Lifestyle</CtaButton></div>
            </section>

            {/* Gallery strip */}
            <section className="container-x pb-24 md:pb-32" data-testid="home-gallery">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {GALLERY.slice(2, 6).map((g) => (
                        <Link key={g.src} to="/gallery" className="group relative aspect-square overflow-hidden rounded-sm">
                            <img src={g.src} alt={g.caption} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        </Link>
                    ))}
                </div>
            </section>

            {/* Location */}
            <section className="container-x pb-24 md:pb-32" data-testid="home-location">
                <SectionHeading overline="Location" title="An established Kingston 8 setting" className="mb-12" />
                <MapSection />
            </section>

            {/* Downloads */}
            <section className="bg-muted/40 py-24" data-testid="home-downloads">
                <div className="container-x max-w-3xl">
                    <SectionHeading overline="Resources" title="Brochure & price list" align="center" className="mb-12" />
                    <div className="space-y-4">
                        {downloads.map((d) => <DownloadForm key={d._id} download={d} />)}
                    </div>
                </div>
            </section>

            {/* CTA band */}
            <section className="bg-brand-blue py-20" data-testid="home-cta">
                <div className="container-x flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
                    <div>
                        <p className="overline text-brand-gold">Visit the Showroom</p>
                        <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">Experience Grosvenor Vistas in person</h2>
                    </div>
                    <CtaButton to="/contact" variant="primary" className="flex-shrink-0">Book a Visit</CtaButton>
                </div>
            </section>
        </div>
    );
}
