import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import FaqAccordion from "@/components/shared/FaqAccordion";
import CtaButton from "@/components/shared/CtaButton";
import { useFaq } from "@/hooks/useData";

export default function FaqPage() {
    const { data: faq, loading, error } = useFaq();

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
                            <p className="mb-4 font-sans text-sm text-destructive">Could not load FAQ content. Please try again later.</p>
                        )}
                        {!loading && !error && faq.length > 0 && <FaqAccordion items={faq} />}
                        {!loading && !error && faq.length === 0 && (
                            <p className="font-sans text-brand-ink/60">FAQ content is not available right now.</p>
                        )}
                        <CtaButton to="/contact" variant="primary" className="mt-10">Contact Us</CtaButton>
                    </div>
                </div>
            </section>
        </div>
    );
}
