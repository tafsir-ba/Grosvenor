import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import FaqAccordion from "@/components/shared/FaqAccordion";
import CtaButton from "@/components/shared/CtaButton";
import { useFaq } from "@/hooks/useData";
import { FAQ } from "@/lib/constants";

export default function FaqPage() {
    const { data: faq, loading, error } = useFaq();
    const items = faq.length ? faq : FAQ;

    return (
        <div data-testid="faq-page">
            <Hero
                image="/gallery/model-unit-kitchen.png"
                height="min-h-[52vh]"
                overline="FAQ"
                title="Good to know"
                subtitle="Clear answers to common questions."
            />
            <section className="container-x py-24 md:py-32">
                <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr]">
                    <SectionHeading overline="Questions" title="Everything you need, simply explained" subtitle="Still have a question? We're happy to help." />
                    <div>
                        {loading && <p className="font-sans text-brand-ink/60">Loading questions…</p>}
                        {error && !loading && (
                            <p className="mb-4 font-sans text-sm text-destructive">Could not load the latest FAQ. Showing saved answers.</p>
                        )}
                        <FaqAccordion items={items} />
                        <CtaButton to="/contact" variant="primary" className="mt-10">Contact Us</CtaButton>
                    </div>
                </div>
            </section>
        </div>
    );
}
