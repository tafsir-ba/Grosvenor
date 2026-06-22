import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import FaqAccordion from "@/components/shared/FaqAccordion";
import CtaButton from "@/components/shared/CtaButton";
import { FAQ } from "@/lib/constants";

export default function FaqPage() {
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
                    <SectionHeading overline="Questions" title="Everything you need, simply explained" subtitle="Still have a question? The Grosvenor Agent is happy to help." />
                    <div>
                        <FaqAccordion items={FAQ} />
                        <CtaButton to="/contact" variant="primary" className="mt-10">Contact the Agent</CtaButton>
                    </div>
                </div>
            </section>
        </div>
    );
}
