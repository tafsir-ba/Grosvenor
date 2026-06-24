import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Hero from "@/components/shared/Hero";
import LeadForm from "@/components/shared/LeadForm";
import CtaButton from "@/components/shared/CtaButton";
import MortgageCalculator from "@/components/shared/MortgageCalculator";
import { LEAD_TYPE, MORTGAGE_STEPS, SAGICOR } from "@/lib/constants";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";

const scrollToApply = () => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });

export default function MortgagePage() {
    return (
        <div data-testid="mortgage-page">
            <Hero image="/gallery/model-unit-living-and-dining-room.png" height="min-h-[58vh]" overline="Mortgage & Financing" title="Financing made simple" subtitle="Clear, supportive guidance to help you move forward with confidence." />

            {/* 1. Intro */}
            <section className="container-wide py-16 md:py-24">
                <motion.div {...fadeUp} className="max-w-3xl px-2 md:px-6">
                    <Eyebrow>Financing Your Residence</Eyebrow>
                    <h2 className="lux-title mt-6 text-4xl text-brand-blue sm:text-5xl">A straightforward route to ownership</h2>
                    <p className="mt-6 font-sans text-lg leading-relaxed text-brand-ink/65">Residences are priced in USD. Whether buying locally or from overseas, our financing partner helps you understand your options and take the next step with ease.</p>
                </motion.div>
            </section>

            {/* 2. Buying process */}
            <section className="bg-brand-ivory py-16 md:py-24">
                <div className="container-wide px-2 md:px-6">
                    <motion.div {...fadeUp} className="mb-12"><Eyebrow>The Journey</Eyebrow><h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl lg:text-5xl">Five simple steps</h2></motion.div>
                    <div className="grid gap-6 md:grid-cols-5" data-testid="mortgage-process">
                        {MORTGAGE_STEPS.map((s, i) => (
                            <motion.div {...fadeUp} key={s.title} className="border-t-2 border-brand-gold/30 pt-5" data-testid={`process-step-${i}`}>
                                <span className="font-display text-4xl text-brand-gold/40">{String(i + 1).padStart(2, "0")}</span>
                                <h3 className="lux-title mt-3 text-xl text-brand-blue">{s.title}</h3>
                                <p className="mt-2 font-sans text-sm leading-relaxed text-brand-ink/60">{s.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Calculator */}
            <section className="container-wide py-16 md:py-24">
                <motion.div {...fadeUp} className="mb-10 px-2 md:px-6"><Eyebrow>Affordability</Eyebrow><h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl lg:text-5xl">Mortgage calculator</h2></motion.div>
                <motion.div {...fadeUp} className="px-2 md:px-6"><MortgageCalculator /></motion.div>
            </section>

            {/* 5. Financing partner */}
            <section className="container-wide pb-16 md:pb-24">
                <motion.div {...fadeUp} className={`grid items-center gap-10 bg-brand-blue p-10 md:p-16 lg:grid-cols-[1fr_1.2fr] ${ROUND}`} data-testid="sagicor-section">
                    <div className="flex items-center justify-center rounded-[1.5rem] bg-white px-8 py-14">
                        <img src="/brand/sagicor.svg" alt="Sagicor" className="h-16 w-auto md:h-20" data-testid="sagicor-logo" />
                    </div>
                    <div>
                        <Eyebrow light>Financing Partner</Eyebrow>
                        <h2 className="lux-title mt-6 text-3xl text-white sm:text-4xl">Mortgages with {SAGICOR.name}</h2>
                        <p className="mt-5 max-w-lg font-sans text-base leading-relaxed text-white/75">{SAGICOR.blurb}</p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <CtaButton href={SAGICOR.url} target="_blank" rel="noreferrer" variant="white" data-testid="sagicor-visit">Visit {SAGICOR.name}</CtaButton>
                            <CtaButton href={SAGICOR.url} target="_blank" rel="noreferrer" variant="outline-light" data-testid="sagicor-learn">Learn More</CtaButton>
                        </div>
                        <div className="mt-8 border-t border-white/15 pt-6" data-testid="sagicor-rep">
                            <p className="font-sans text-xs uppercase tracking-[0.16em] text-white/45">Your Sagicor Advisor</p>
                            <p className="mt-2 font-display text-xl text-white">{SAGICOR.rep.name}</p>
                            <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 font-sans text-sm text-white/70">
                                <a href={SAGICOR.rep.phoneHref} className="transition-colors hover:text-brand-gold">{SAGICOR.rep.phone}</a>
                                <a href={`mailto:${SAGICOR.rep.email}`} className="transition-colors hover:text-brand-gold">{SAGICOR.rep.email}</a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* 3. Online application */}
            <section id="apply" className="container-wide pb-16 md:pb-24">
                <motion.div {...fadeUp} className={`overflow-hidden bg-brand-ivory ${ROUND}`}>
                    <div className="grid lg:grid-cols-2">
                        <div className="flex flex-col justify-center p-10 md:p-14">
                            <Eyebrow>Online Application</Eyebrow>
                            <h2 className="lux-title mt-6 text-4xl text-brand-blue sm:text-5xl">Start your application</h2>
                            <p className="mt-6 max-w-md font-sans text-lg text-brand-ink/65">Share your details to begin. Once submitted, our team reviews your request and follows up with financing options and next steps — usually within one business day.</p>
                        </div>
                        <div className="border-t border-brand-beige bg-brand-warm/60 p-10 md:p-14 lg:border-l lg:border-t-0" data-testid="mortgage-enquiry">
                            <LeadForm leadType={LEAD_TYPE.MORTGAGE_INFO_REQUEST} submitLabel="Start Your Application" messagePlaceholder="Tell us about your plans (residence of interest, budget, timeline)…" testIdPrefix="mortgage" />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* 7. Final CTA */}
            <section className="container-wide pb-24 md:pb-32">
                <motion.div {...fadeUp} className={`flex flex-col items-center gap-8 bg-brand-blue px-8 py-20 text-center ${ROUND}`}>
                    <Eyebrow light>Begin</Eyebrow>
                    <h2 className="lux-title max-w-2xl text-4xl text-white sm:text-5xl">Ready to begin?</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <CtaButton variant="white" onClick={scrollToApply} data-testid="mortgage-cta-apply">Start Application</CtaButton>
                        <CtaButton to="/contact" variant="outline-light" data-testid="mortgage-cta-contact">Contact Us</CtaButton>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
