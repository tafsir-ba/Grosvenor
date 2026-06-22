import { motion } from "framer-motion";
import CtaButton from "@/components/shared/CtaButton";

const fade = {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
};

// Bright, image-led hero. `split` = home editorial style; otherwise full-bleed.
export default function Hero({ image, overline, title, titleAccent, subtitle, primary, secondary, split = false, height = "min-h-[78vh]" }) {
    if (split) {
        return (
            <section className="relative overflow-hidden bg-white pt-24" data-testid="hero-section">
                <div className="container-x grid min-h-[92vh] grid-cols-1 items-center gap-10 lg:grid-cols-12">
                    <motion.div {...fade} className="relative z-20 lg:col-span-5">
                        {overline && <p className="overline mb-6 text-brand-gold">{overline}</p>}
                        <h1 className="display text-[3.4rem] leading-[0.95] sm:text-7xl lg:text-[5.5rem]">
                            <span className="block text-brand-blue">{title}</span>
                            {titleAccent && <span className="block text-brand-gold">{titleAccent}</span>}
                        </h1>
                        {subtitle && <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
                        {(primary || secondary) && (
                            <div className="mt-10 flex flex-wrap gap-4">
                                {primary && <CtaButton {...primary} variant="primary" />}
                                {secondary && <CtaButton {...secondary} variant="outline" />}
                            </div>
                        )}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative h-[50vh] lg:col-span-7 lg:-mr-16 lg:h-[80vh]"
                    >
                        <img src={image} alt="" className="h-full w-full object-cover" />
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className={`relative flex ${height} items-end overflow-hidden`} data-testid="hero-section">
            <div className="absolute inset-0">
                <motion.img
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/55 via-transparent to-transparent" />
            </div>
            <div className="container-x relative z-10 pb-16 pt-40 md:pb-24">
                <motion.div {...fade} className="max-w-4xl">
                    {overline && <p className="overline mb-5 text-brand-gold">{overline}</p>}
                    <h1 className="display text-5xl text-white sm:text-7xl lg:text-8xl">
                        {title} {titleAccent && <span className="text-brand-gold">{titleAccent}</span>}
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
