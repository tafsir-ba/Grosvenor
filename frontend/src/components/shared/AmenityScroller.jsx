import { motion } from "framer-motion";

// Premium, image-led amenity showcase — large editorial frames with index.
export default function AmenityScroller({ items }) {
    return (
        <div
            data-testid="amenity-scroller"
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-8 md:px-12 lg:px-16"
            style={{ scrollbarWidth: "none" }}
        >
            {items.map((a, i) => (
                <motion.figure
                    key={a.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.8, delay: (i % 4) * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    data-testid={`amenity-slide-${i}`}
                    className="group relative h-[68vh] w-[82vw] flex-shrink-0 snap-start overflow-hidden sm:w-[480px]"
                >
                    <img src={a.image} alt={a.title} className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-brand-ink/10 to-transparent" />
                    <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-8">
                        <span className="font-display text-3xl font-light leading-tight text-white md:text-4xl">{a.title}</span>
                        <span className="font-display text-5xl font-light text-white/30">{String(i + 1).padStart(2, "0")}</span>
                    </figcaption>
                </motion.figure>
            ))}
        </div>
    );
}
