import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import AmenityCard from "@/components/shared/AmenityCard";
import CtaButton from "@/components/shared/CtaButton";
import { AMENITIES } from "@/lib/constants";

export default function AmenitiesPage() {
    return (
        <div data-testid="amenities-page">
            <Hero
                image="/gallery/rooftop-pool.png"
                height="min-h-[60vh]"
                overline="Amenities & Lifestyle"
                title="Live well, every day"
                subtitle="Spaces and surroundings designed for comfort, connection and calm."
            />

            <section className="container-x py-24 md:py-32">
                <SectionHeading
                    overline="Lifestyle"
                    title="A community built around its residents"
                    subtitle="From the rooftop pool to landscaped grounds and generous private terraces, every detail at Grosvenor Vistas supports an easy, elevated way of living."
                    align="center"
                    className="mb-14"
                />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {AMENITIES.map((a, i) => <AmenityCard key={a.title} amenity={a} index={i} />)}
                </div>
            </section>

            <section className="bg-brand-green py-20">
                <div className="container-x flex flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
                    <h2 className="font-display text-3xl text-white md:text-4xl">See it for yourself at the showroom</h2>
                    <CtaButton to="/contact" variant="primary" className="flex-shrink-0">Book a Visit</CtaButton>
                </div>
            </section>
        </div>
    );
}
