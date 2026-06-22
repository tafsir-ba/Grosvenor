import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import CtaButton from "@/components/shared/CtaButton";

const fade = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
};

// Bright, full-bleed, image-led hero with a parallax background.
export default function Hero({ image, overline, title, titleAccent, subtitle, primary, secondary, note, upper = false, height = "min-h-[82vh]" }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
    const overlayOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

    return (
        <section ref={ref} className={`relative flex ${height} items-end overflow-hidden`} data-testid="hero-section">
            <motion.div className="absolute inset-0" style={{ y }}>
                <motion.img
                    initial={{ scale: 1.12 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                    src={image}
                    alt=""
                    className="h-[120%] w-full object-cover"
                />
                <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-gradient-to-t from-brand-blue/75 via-brand-blue/10 to-brand-blue/5" />
                <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-brand-ink/70 via-brand-ink/25 to-transparent" />
            </motion.div>

            <div className="container-x relative z-10 pb-20 pt-44 md:pb-28">
                <motion.div {...fade} className="max-w-5xl">
                    <h1
                        className={
                            upper
                                ? "font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl xl:text-[7rem]"
                                : "display text-6xl text-white sm:text-7xl lg:text-8xl xl:text-[8rem]"
                        }
                    >
                        {title} {titleAccent && <span className="text-white/70">{titleAccent}</span>}
                    </h1>
                    {subtitle && <p className="mt-7 max-w-xl text-lg text-white/90 md:text-xl">{subtitle}</p>}
                    {note && <p className="mt-6 font-display text-2xl font-light text-white md:text-3xl">{note}</p>}
                    {(primary || secondary) && (
                        <div className="mt-10 flex flex-wrap gap-4">
                            {primary && <CtaButton {...primary} variant="primary" />}
                            {secondary && <CtaButton {...secondary} variant="outline-light" />}
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
