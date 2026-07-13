import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { PROJECT } from "@/lib/constants";

// Shared luxury design primitives — single source for the site-wide system.
export const ROUND = "rounded-[1.75rem] md:rounded-[2.5rem]";

export const fadeUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
};

export function Eyebrow({ children, light = false }) {
    return (
        <span className={`lux-eyebrow flex items-center gap-3 ${light ? "text-white/80" : "text-brand-gold"}`}>
            <span className={`h-px w-8 ${light ? "bg-white/50" : "bg-brand-gold/50"}`} />
            {children}
        </span>
    );
}

export function ParallaxImage({ src, alt = "", className = "" }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
    return (
        <div ref={ref} className={`overflow-hidden ${className}`}>
            <motion.img style={{ y }} src={src} alt={alt} loading="lazy" className="h-[116%] w-full object-cover" />
        </div>
    );
}

export function useIsDesktop() {
    const [desktop, setDesktop] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const update = () => setDesktop(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);
    return desktop;
}

// Designed placeholder map that links to the real Google Maps location.
export function PlaceholderMap({ className = `h-[58vh] lg:h-[64vh] ${ROUND}`, testId = "placeholder-map" }) {
    return (
        <a
            href={PROJECT.contact.mapUrl}
            target="_blank"
            rel="noreferrer"
            data-testid={testId}
            aria-label="Open Grosvenor Vistas location in Google Maps"
            className={`group relative block overflow-hidden border border-brand-beige ${className}`}
        >
            <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
                <rect width="800" height="600" fill="#F2EFE9" />
                <path d="M0 0H320V210H0Z" fill="#EAE5DB" opacity="0.7" />
                <path d="M470 90H800V330H470Z" fill="#EAE5DB" opacity="0.6" />
                <path d="M120 380H520V600H120Z" fill="#EAE5DB" opacity="0.55" />
                <g stroke="#D8CFBF" strokeWidth="6" fill="none" strokeLinecap="round">
                    <path d="M-20 250H820" /><path d="M400 -20V620" /><path d="M-20 430H820" /><path d="M180 -20V620" /><path d="M620 -20V620" /><path d="M-20 120H820" />
                </g>
                <g stroke="#E3DACB" strokeWidth="3" fill="none" strokeLinecap="round">
                    <path d="M-20 340H820" /><path d="M300 -20V620" /><path d="M520 -20V620" />
                </g>
                <circle cx="690" cy="470" r="60" fill="#C9D2BE" opacity="0.5" />
                <circle cx="80" cy="520" r="40" fill="#C9D2BE" opacity="0.45" />
            </svg>
            <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
                <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-brand-gold/25" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-gold text-white shadow-[0_10px_30px_rgba(198,134,43,0.45)]">
                    <MapPin className="h-6 w-6" />
                </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 p-6">
                <span className="lux-title text-2xl text-brand-blue md:text-3xl">Grosvenor Heights</span>
                <span className="lux-eyebrow flex items-center gap-2 rounded-full bg-brand-warm/90 px-4 py-2 text-brand-ink backdrop-blur transition-colors group-hover:text-brand-gold">
                    Open in Maps <ArrowRight className="h-4 w-4" />
                </span>
            </div>
        </a>
    );
}
