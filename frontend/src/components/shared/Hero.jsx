import { motion } from "framer-motion";
import CtaButton from "@/components/shared/CtaButton";
import { Eyebrow, ROUND } from "@/components/shared/luxe";

// Site-wide page hero — wide curved image container with an overlaid editorial title.
export default function Hero({ image, overline, eyebrow, title, titleAccent, subtitle, primary, secondary, height = "h-[72vh]" }) {
    const label = eyebrow || overline;
    return (
        <section className="container-wide pb-8 pt-32 md:pt-36" data-testid="hero-section">
            <div className={`relative ${height} overflow-hidden ${ROUND}`}>
                <motion.img
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                    src={image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/65 via-brand-ink/10 to-transparent" />
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-x-0 bottom-0 p-8 md:p-14 lg:p-16"
                >
                    {label && <Eyebrow light>{label}</Eyebrow>}
                    <h1 className="lux-title mt-6 text-5xl text-white sm:text-6xl lg:text-7xl">
                        {title} {titleAccent && <span className="text-white/70">{titleAccent}</span>}
                    </h1>
                    {subtitle && <p className="mt-5 max-w-xl font-sans text-lg text-white/85">{subtitle}</p>}
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
