import { motion } from "framer-motion";

export default function AmenityCard({ amenity, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
            data-testid={`amenity-card-${index}`}
            className="group overflow-hidden rounded-sm border border-border bg-card"
        >
            <div className="aspect-[4/3] overflow-hidden">
                <img src={amenity.image} alt={amenity.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="p-7">
                <h3 className="font-display text-xl text-brand-ink">{amenity.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{amenity.body}</p>
            </div>
        </motion.div>
    );
}
