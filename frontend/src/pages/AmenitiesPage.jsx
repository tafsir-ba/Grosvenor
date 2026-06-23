import { motion } from "framer-motion";
import Hero from "@/components/shared/Hero";
import CtaButton from "@/components/shared/CtaButton";
import { Eyebrow, fadeUp, ParallaxImage, ROUND } from "@/components/shared/luxe";

const AMENITIES = [
    { title: "Infinity Pool", line: "A rooftop pool where the water meets the horizon — designed for slow mornings and golden evenings above Kingston.", image: "/gallery/rooftop-pool.png" },
    { title: "Gym", line: "An indoor gym with mountain and poolside views, designed for movement, wellness, and daily convenience.", image: "/gallery/gym.jpg" },
    { title: "Rooftop Spaces", line: "Open-air spaces made for gathering, hosting and unwinding, with uninterrupted outlooks across the hills.", image: "/gallery/homestaging-evening-terrace.png" },
    { title: "Landscaped Grounds", line: "Lush, professionally maintained gardens woven through the community for calm and privacy.", image: "/gallery/heliconia-grounds.png" },
    { title: "Strata Approved Security", line: "A gated, electronically controlled and strata-secured community offering complete peace of mind.", image: "/gallery/gate-entrance.png" },
];

export default function AmenitiesPage() {
    return (
        <div data-testid="amenities-page">
            <Hero image="/gallery/rooftop-pool.png" overline="Amenities & Lifestyle" title="Live well, every day" subtitle="Spaces and surroundings designed for comfort, connection and calm." />

            <section className="container-wide py-16 md:py-24">
                <motion.div {...fadeUp} className="max-w-3xl px-2 md:px-6">
                    <Eyebrow>The Experience</Eyebrow>
                    <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">A community built around its residents</h2>
                </motion.div>
            </section>

            <section className="container-wide pb-8" data-testid="amenities-sections">
                <div className="flex flex-col gap-20 md:gap-32">
                    {AMENITIES.map((a, i) => (
                        <motion.div key={a.title} {...fadeUp} data-testid={`amenity-section-${i}`} className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${i % 2 ? "md:[direction:rtl]" : ""}`}>
                            <ParallaxImage src={a.image} alt={a.title} className={`h-[54vh] md:h-[72vh] md:[direction:ltr] ${ROUND}`} />
                            <div className="px-2 md:px-6 md:[direction:ltr]">
                                <span className="lux-title text-6xl font-light text-brand-gold/30 md:text-7xl">{String(i + 1).padStart(2, "0")}</span>
                                <h3 className="lux-title mt-2 text-4xl text-brand-blue md:text-5xl lg:text-6xl">{a.title}</h3>
                                <p className="mt-5 max-w-md font-sans text-lg text-brand-ink/70">{a.line}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="container-wide py-24 md:py-32">
                <div className={`relative flex min-h-[52vh] flex-col items-center justify-center gap-8 overflow-hidden p-10 text-center ${ROUND}`}>
                    <img src="/gallery/homestaging-evening-terrace.png" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-brand-ink/55" />
                    <h2 className="lux-title relative z-10 text-4xl text-white md:text-5xl lg:text-6xl">See it for yourself at the showroom</h2>
                    <CtaButton to="/contact" variant="primary" className="relative z-10">Book a Visit</CtaButton>
                </div>
            </section>
        </div>
    );
}
