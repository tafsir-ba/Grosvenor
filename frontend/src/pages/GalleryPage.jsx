import { useState } from "react";
import { motion } from "framer-motion";
import Hero from "@/components/shared/Hero";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";
import { GALLERY, PHOTO } from "@/lib/constants";

export default function GalleryPage() {
    const [active, setActive] = useState(null);

    return (
        <div data-testid="gallery-page">
            <Hero
                image={PHOTO.rooftopCityBlueHourHero}
                overline="Gallery"
                title="A closer look"
                subtitle="Architecture, interiors and lifestyle at Grosvenor Vistas."
                objectPosition="center 42%"
            />

            <section className="container-wide py-16 md:py-24">
                <motion.div {...fadeUp} className="mb-12 max-w-3xl px-2 md:px-6">
                    <Eyebrow>Imagery</Eyebrow>
                    <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">Spaces to inspire</h2>
                </motion.div>

                <div className="columns-1 gap-6 px-2 sm:columns-2 md:px-6 lg:columns-3 [&>figure]:mb-6">
                    {GALLERY.map((g, i) => {
                        const thumb = g.thumb || g.src;
                        const contained = g.fit === "contain";
                        return (
                            <motion.figure
                                key={g.src}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                data-testid={`gallery-item-${i}`}
                                className={`group relative block break-inside-avoid overflow-hidden ${ROUND}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setActive(g)}
                                    className="block w-full text-left"
                                    aria-label={`Open ${g.caption}`}
                                >
                                    <img
                                        src={thumb}
                                        alt={g.caption}
                                        loading="lazy"
                                        className={`w-full transition-transform duration-[1400ms] ease-out group-hover:scale-105 ${
                                            contained ? "bg-brand-ivory object-contain" : "object-cover"
                                        }`}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    <figcaption className="absolute bottom-0 left-0 p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                        <span className="lux-eyebrow text-white">{g.caption}</span>
                                    </figcaption>
                                </button>
                            </motion.figure>
                        );
                    })}
                </div>
            </section>

            <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
                <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none" data-testid="gallery-lightbox">
                    {active && (
                        <figure className="overflow-hidden rounded-sm bg-brand-ink">
                            <DialogTitle className="sr-only">{active.caption}</DialogTitle>
                            <DialogDescription className="sr-only">Gallery image: {active.caption}</DialogDescription>
                            <img src={active.src} alt={active.caption} className="max-h-[80vh] w-full object-contain" />
                            <figcaption className="p-4 text-center text-sm uppercase tracking-[0.14em] text-white/80">
                                {active.caption}
                            </figcaption>
                        </figure>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
