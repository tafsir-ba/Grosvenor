import { motion } from "framer-motion";
import Hero from "@/components/shared/Hero";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";
import { GALLERY } from "@/lib/constants";

export default function GalleryPage() {
    return (
        <div data-testid="gallery-page">
            <Hero image="/gallery/homestaging-evening-terrace.png" overline="Gallery" title="A closer look" subtitle="Architecture, interiors and lifestyle at Grosvenor Vistas." />

            <section className="container-wide py-16 md:py-24">
                <motion.div {...fadeUp} className="mb-12 max-w-3xl px-2 md:px-6">
                    <Eyebrow>Imagery</Eyebrow>
                    <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Spaces to inspire</h2>
                </motion.div>

                {/* Editorial masonry */}
                <div className="columns-1 gap-6 px-2 sm:columns-2 md:px-6 lg:columns-3 [&>figure]:mb-6">
                    {GALLERY.map((g, i) => (
                        <motion.figure
                            key={g.src}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            data-testid={`gallery-item-${i}`}
                            className={`group relative block break-inside-avoid overflow-hidden ${ROUND}`}
                        >
                            <img src={g.src} alt={g.caption} loading="lazy" className="w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            <figcaption className="absolute bottom-0 left-0 p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                <span className="lux-eyebrow text-white">{g.caption}</span>
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </section>
        </div>
    );
}
