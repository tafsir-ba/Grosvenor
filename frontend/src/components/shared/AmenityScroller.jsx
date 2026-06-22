import { motion } from "framer-motion";

// Horizontal, image-led amenity showcase. Short titles only — no body text.
export default function AmenityScroller({ items }) {
    return (
        <div
            data-testid="amenity-scroller"
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 md:px-12 lg:px-16"
            style={{ scrollbarWidth: "thin" }}
        >
            {items.map((a, i) => (
                <motion.figure
                    key={a.title}
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                    data-testid={`amenity-slide-${i}`}
                    className="group relative h-[62vh] w-[78vw] flex-shrink-0 snap-start overflow-hidden sm:w-[440px]"
                >
                    <img src={a.image} alt={a.title} className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent" />
                    <figcaption className="absolute bottom-0 left-0 p-8">
                        <span className="font-display text-3xl font-light text-white md:text-4xl">{a.title}</span>
                    </figcaption>
                </motion.figure>
            ))}
        </div>
    );
}
