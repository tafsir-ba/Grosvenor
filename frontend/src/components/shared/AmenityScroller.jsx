import { useRef, useState } from "react";
import { motion } from "framer-motion";

// Premium, image-led amenity showcase with smooth click-and-drag scrolling.
export default function AmenityScroller({ items }) {
    const ref = useRef(null);
    const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
    const [dragging, setDragging] = useState(false);

    const onPointerDown = (e) => {
        const el = ref.current;
        if (!el) return;
        drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
        setDragging(true);
        el.setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e) => {
        const el = ref.current;
        if (!el || !drag.current.active) return;
        const dx = e.clientX - drag.current.startX;
        if (Math.abs(dx) > 4) drag.current.moved = true;
        el.scrollLeft = drag.current.startScroll - dx;
    };
    const endDrag = (e) => {
        const el = ref.current;
        drag.current.active = false;
        setDragging(false);
        el?.releasePointerCapture?.(e.pointerId);
    };

    return (
        <div
            ref={ref}
            data-testid="amenity-scroller"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            className={`flex select-none gap-6 overflow-x-auto px-6 pb-8 md:px-12 lg:px-16 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
            style={{ scrollbarWidth: "none", touchAction: "pan-y" }}
        >
            {items.map((a, i) => (
                <motion.figure
                    key={a.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.8, delay: (i % 4) * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    data-testid={`amenity-slide-${i}`}
                    className="group relative h-[68vh] w-[82vw] flex-shrink-0 overflow-hidden sm:w-[480px]"
                >
                    <img
                        src={a.image}
                        alt={a.title}
                        draggable={false}
                        className="pointer-events-none h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
                    />
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
