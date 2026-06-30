import { motion } from "framer-motion";
import {
    Waves, Dumbbell, PartyPopper, ToyBrick, Trees,
    KeyRound, ArrowUpDown, Car, Fingerprint, Trash2,
    Power, Droplets, Filter, Sprout, ShieldCheck,
} from "lucide-react";
import Hero from "@/components/shared/Hero";
import CtaButton from "@/components/shared/CtaButton";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";

const CATEGORIES = [
    {
        name: "Lifestyle",
        blurb: "Spaces designed for leisure, wellness and connection above Kingston.",
        items: [
            { icon: Waves, title: "Infinity Pool" },
            { icon: Dumbbell, title: "Rooftop Gym" },
            { icon: PartyPopper, title: "Rooftop Entertainment Spaces" },
            { icon: ToyBrick, title: "Children's Playground" },
            { icon: Trees, title: "Landscaped Gardens" },
        ],
    },
    {
        name: "Convenience",
        blurb: "Thoughtful, everyday details that make life here effortless and secure.",
        items: [
            { icon: KeyRound, title: "Smart Locks" },
            { icon: ArrowUpDown, title: "Elevator Access" },
            { icon: Car, title: "Assigned Underground Parking" },
            { icon: Fingerprint, title: "Electronic Gate Access" },
            { icon: Trash2, title: "Efficient Garbage Management" },
        ],
    },
    {
        name: "Infrastructure & Reliability",
        blurb: "Engineered systems that keep the community running, day and night.",
        items: [
            { icon: Power, title: "Backup Generator" },
            { icon: Droplets, title: "Water Storage Tanks" },
            { icon: Filter, title: "Grey Water Filtration System" },
            { icon: Sprout, title: "Automatic Landscape Irrigation System" },
            { icon: ShieldCheck, title: "Strata Approved Security Services" },
        ],
    },
];

export default function AmenitiesPage() {
    return (
        <div data-testid="amenities-page">
            <Hero image="/gallery/rooftop-pool.png" overline="Amenities & Lifestyle" title="Live well, every day" subtitle="Spaces and surroundings designed for comfort, connection and calm." />

            <section className="container-wide py-16 md:py-24">
                <motion.div {...fadeUp} className="max-w-3xl px-2 md:px-6">
                    <Eyebrow>The Experience</Eyebrow>
                    <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">A community built around its residents</h2>
                    <p className="mt-6 font-sans text-lg text-brand-ink/70">Every amenity at Grosvenor Vistas is considered across three pillars — the lifestyle you live, the conveniences you rely on, and the infrastructure that quietly keeps it all running.</p>
                </motion.div>
            </section>

            <section className="container-wide pb-16 md:pb-24" data-testid="amenities-categories">
                <div className="flex flex-col gap-16 md:gap-24">
                    {CATEGORIES.map((cat, ci) => (
                        <motion.div key={cat.name} {...fadeUp} data-testid={`amenity-category-${ci}`}>
                            <div className="flex flex-col gap-3 px-2 md:flex-row md:items-end md:justify-between md:px-6">
                                <div>
                                    <span className="lux-title text-5xl font-light text-brand-gold/30 md:text-6xl">{String(ci + 1).padStart(2, "0")}</span>
                                    <h3 className="lux-title mt-1 text-3xl text-brand-blue md:text-4xl lg:text-5xl">{cat.name}</h3>
                                </div>
                                <p className="max-w-sm font-sans text-base text-brand-ink/60 md:text-right">{cat.blurb}</p>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-px overflow-hidden rounded-[1.5rem] border border-brand-beige bg-brand-beige md:mt-10 md:rounded-[2rem]">
                                {cat.items.map((a, i) => (
                                    <div
                                        key={a.title}
                                        data-testid={`amenity-card-${ci}-${i}`}
                                        className="group flex flex-1 basis-[300px] sm:basis-[45%] lg:basis-[30%] items-center gap-5 bg-brand-ivory p-7 transition-colors duration-300 hover:bg-brand-warm md:p-9"
                                    >
                                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-brand-gold/30 text-brand-gold transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-white">
                                            <a.icon className="h-5 w-5" strokeWidth={1.4} />
                                        </span>
                                        <h4 className="font-display text-xl leading-tight text-brand-blue md:text-2xl">{a.title}</h4>
                                    </div>
                                ))}
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
