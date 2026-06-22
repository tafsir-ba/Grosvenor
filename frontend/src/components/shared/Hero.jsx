import { motion } from "framer-motion";
import CtaButton from "@/components/shared/CtaButton";

// Full-bleed hero with image, warm overlay and primary/secondary CTAs.
export default function Hero({ image, overline, title, subtitle, primary, secondary, height = "min-h-[88vh]" }) {
    return (
        <section className={`relative flex ${height} items-end overflow-hidden`} data-testid="hero-section">
            <div className="absolute inset-0">
                <img src={image} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/85 via-brand-ink/35 to-brand-ink/10" />
            </div>
            <div className="container-x relative z-10 pb-20 pt-40 md:pb-28">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-3xl"
                >
                    {overline && <p className="overline mb-5 text-brand-gold">{overline}</p>}
                    <h1 className="font-display text-4xl font-semibold leading-[1.05] text-white md:text-6xl lg:text-7xl">
                        {title}
                    </h1>
                    {subtitle && <p className="mt-6 max-w-xl text-lg text-white/85">{subtitle}</p>}
                    {(primary || secondary) && (
                        <div className="mt-9 flex flex-wrap gap-4">
                            {primary && <CtaButton {...primary} variant="primary" />}
                            {secondary && <CtaButton {...secondary} variant="outline-light" />}
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
