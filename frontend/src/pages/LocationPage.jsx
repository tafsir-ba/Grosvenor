import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import MapSection from "@/components/shared/MapSection";

const HIGHLIGHTS = [
    { title: "Manor Park", body: "An established, leafy residential district known for its calm streets and convenience." },
    { title: "Kingston 8", body: "Close to schools, dining, retail and the everyday amenities of uptown Kingston." },
    { title: "Grosvenor Heights", body: "Elevated, private surroundings with open outlooks across the area." },
];

export default function LocationPage() {
    return (
        <div data-testid="location-page">
            <Hero
                image="/gallery/terrace-2.png"
                height="min-h-[56vh]"
                overline="Location"
                title="Grosvenor Heights, Manor Park"
                subtitle="A coveted Kingston 8 address."
            />

            <section className="container-x py-24 md:py-32">
                <SectionHeading overline="The Setting" title="Connected, yet wonderfully private" className="mb-14" />
                <div className="grid gap-6 md:grid-cols-3">
                    {HIGHLIGHTS.map((h, i) => (
                        <div key={h.title} data-testid={`location-highlight-${i}`} className="rounded-sm border border-border bg-card p-8">
                            <h3 className="font-display text-xl text-brand-ink">{h.title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{h.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="container-x pb-24 md:pb-32">
                <MapSection />
            </section>
        </div>
    );
}
