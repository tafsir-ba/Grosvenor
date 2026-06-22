import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Masonry-style gallery grid with lightbox.
export default function GalleryGrid({ items }) {
    const [active, setActive] = useState(null);
    return (
        <>
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
                {items.map((item, i) => (
                    <motion.button
                        key={item.src}
                        type="button"
                        onClick={() => setActive(item)}
                        data-testid={`gallery-item-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
                        className="group relative block w-full overflow-hidden rounded-sm"
                    >
                        <img
                            src={item.src}
                            alt={item.caption}
                            className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-brand-ink/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <span className="p-5 text-sm font-medium uppercase tracking-[0.14em] text-white">
                                {item.caption}
                            </span>
                        </div>
                    </motion.button>
                ))}
            </div>

            <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
                <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none" data-testid="gallery-lightbox">
                    {active && (
                        <figure className="overflow-hidden rounded-sm bg-brand-ink">
                            <img src={active.src} alt={active.caption} className="max-h-[80vh] w-full object-contain" />
                            <figcaption className="p-4 text-center text-sm uppercase tracking-[0.14em] text-white/80">
                                {active.caption}
                            </figcaption>
                        </figure>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
