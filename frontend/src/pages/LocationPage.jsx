import { motion } from "framer-motion";
import Hero from "@/components/shared/Hero";
import CtaButton from "@/components/shared/CtaButton";
import { Eyebrow, fadeUp, PlaceholderMap, ROUND } from "@/components/shared/luxe";
import { PROJECT } from "@/lib/constants";

const HIGHLIGHTS = [
    { title: "Manor Park", body: "An established, leafy residential district known for calm streets and everyday convenience." },
    { title: "Kingston 8", body: "Close to schools, dining, retail and the amenities of uptown Kingston." },
    { title: "Grosvenor Heights", body: "Elevated, private surroundings with open outlooks across the area." },
];

const NEARBY = [
    { group: "Schools", items: ["Immaculate Conception High", "Hillel Academy", "Campion College", "American International School"] },
    { group: "Shopping", items: ["Manor Park Plaza", "Sovereign Centre", "Liguanea shops & cafés"] },
    { group: "Business Districts", items: ["New Kingston (15 min)", "Half Way Tree (12 min)", "Downtown Kingston (25 min)"] },
    { group: "Major Roads", items: ["Constant Spring Road", "Manor Park Road", "Stony Hill main road"] },
];

export default function LocationPage() {
    return (
        <div data-testid="location-page">
            <Hero image="/gallery/terrace-2.png" overline="Location" title="Grosvenor Heights, Manor Park" subtitle="A coveted Kingston 8 address — connected, yet wonderfully private." />

            <section className="container-wide py-16 md:py-24">
                <motion.div {...fadeUp} className="mb-12 max-w-3xl px-2 md:px-6">
                    <Eyebrow>The Setting</Eyebrow>
                    <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Connected, yet wonderfully private</h2>
                </motion.div>
                <div className="grid gap-x-12 gap-y-2 px-2 md:grid-cols-3 md:px-6">
                    {HIGHLIGHTS.map((h, i) => (
                        <motion.div key={h.title} {...fadeUp} data-testid={`location-highlight-${i}`} className="border-t border-brand-beige py-8">
                            <h3 className="lux-title text-3xl font-light text-brand-blue">{h.title}</h3>
                            <p className="mt-3 font-sans text-base leading-relaxed text-brand-ink/70">{h.body}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="container-wide pb-16 md:pb-24">
                <PlaceholderMap className={`h-[60vh] lg:h-[72vh] ${ROUND}`} />
            </section>

            <section className="container-wide pb-24 md:pb-32">
                <motion.div {...fadeUp} className="mb-12 px-2 md:px-6"><Eyebrow>Nearby</Eyebrow><h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl">Everything within reach</h2></motion.div>
                <div className="grid gap-x-12 gap-y-10 px-2 md:grid-cols-2 md:px-6 lg:grid-cols-4">
                    {NEARBY.map((n) => (
                        <motion.div key={n.group} {...fadeUp} data-testid={`nearby-${n.group.toLowerCase().replace(/ /g, "-")}`}>
                            <p className="lux-eyebrow text-brand-gold">{n.group}</p>
                            <ul className="mt-5 space-y-3 border-t border-brand-beige pt-5">
                                {n.items.map((it) => <li key={it} className="font-sans text-brand-ink/70">{it}</li>)}
                            </ul>
                        </motion.div>
                    ))}
                </div>
                <div className="mt-16 flex flex-wrap justify-center gap-4">
                    <CtaButton href={PROJECT.contact.mapUrl} variant="primary" data-testid="location-directions">Get Directions</CtaButton>
                    <CtaButton to="/contact" variant="outline" data-testid="location-contact">Book a Visit</CtaButton>
                </div>
            </section>
        </div>
    );
}
