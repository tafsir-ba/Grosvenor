import { motion } from "framer-motion";

// Full-bleed image tile with overlay text — no box.
export default function AmenityCard({ amenity, index = 0, tall = false }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
            data-testid={`amenity-card-${index}`}
            className={`group relative overflow-hidden ${tall ? "aspect-[3/4]" : "aspect-[4/5]"}`}
        >
            <img src={amenity.image} alt={amenity.title} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/80 via-brand-blue/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8">
                <h3 className="font-display text-2xl font-light text-white md:text-3xl">{amenity.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/0 transition-all duration-500 group-hover:text-white/85">{amenity.body}</p>
            </div>
        </motion.div>
    );
}
