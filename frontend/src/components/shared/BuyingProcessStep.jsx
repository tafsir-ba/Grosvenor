import { motion } from "framer-motion";

export default function BuyingProcessStep({ step, title, body, index = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            data-testid={`buying-step-${step}`}
            className="relative border-t-2 border-brand-gold/40 pt-6"
        >
            <span className="font-display text-5xl text-brand-gold/30">{step}</span>
            <h3 className="mt-3 font-display text-xl text-brand-ink">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </motion.div>
    );
}
