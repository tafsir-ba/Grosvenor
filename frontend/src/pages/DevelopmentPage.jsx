import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import BuyingProcessStep from "@/components/shared/BuyingProcessStep";
import CtaButton from "@/components/shared/CtaButton";
import { BUILDINGS, BUYING_PROCESS, AERIAL_IMAGE, GALLERY } from "@/lib/constants";

export default function DevelopmentPage() {
    return (
        <div data-testid="development-page">
            <Hero
                image="/gallery/townhouse-facade.png"
                height="min-h-[60vh]"
                overline="The Development"
                title="Grosvenor Vistas"
                subtitle="An elegant residential community in Grosvenor Heights, Manor Park."
            />

            <section className="container-x py-24 md:py-32">
                <div className="grid gap-14 lg:grid-cols-2">
                    <SectionHeading
                        overline="An Overview"
                        title="Bright, spacious living in a coveted setting"
                        subtitle="Grosvenor Vistas is a community of forty-three residences thoughtfully arranged across three blocks and a collection of townhouses. Every home is designed around light, space and comfort, with generous balconies and refined interiors."
                    />
                    <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
                        <p>Set in the established hills of Manor Park, the development offers a calm, private setting moments from the conveniences of Kingston 8.</p>
                        <p>A showroom and fully staged model residence are available on the property, so you can experience the quality of finishes and the feel of the spaces firsthand.</p>
                        <p>Pricing is presented clearly in USD, with each residence listed by its total surface and balcony surface — simple, direct information to support your decision.</p>
                    </div>
                </div>
            </section>

            {/* Masterplan */}
            <section className="container-x pb-24 md:pb-32">
                <div className="overflow-hidden rounded-sm border border-border">
                    <img src={AERIAL_IMAGE} alt="Grosvenor Vistas aerial masterplan" className="w-full object-cover" />
                </div>
            </section>

            {/* Buildings */}
            <section className="bg-muted/40 py-24 md:py-32">
                <div className="container-x">
                    <SectionHeading overline="The Collections" title="Three blocks and the Begonia townhouses" align="center" className="mb-14" />
                    <div className="grid gap-x-10 gap-y-2 md:grid-cols-2">
                        {BUILDINGS.map((b) => (
                            <a
                                key={b.value}
                                href={`/residences?building=${encodeURIComponent(b.value)}`}
                                data-testid={`building-${b.short}`}
                                className="group flex items-center justify-between border-t border-border py-8 transition-colors hover:text-brand-gold"
                            >
                                <div>
                                    <p className="overline text-brand-gold">{b.block}</p>
                                    <h3 className="mt-2 font-display text-4xl font-light text-brand-blue transition-colors group-hover:text-brand-gold md:text-5xl">{b.short}</h3>
                                </div>
                                <span className="text-sm uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-brand-gold">View →</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Buying process */}
            <section className="container-x py-24 md:py-32">
                <SectionHeading overline="Buying Process" title="A clear path to your new home" className="mb-14" />
                <div className="grid gap-10 md:grid-cols-4">
                    {BUYING_PROCESS.map((s, i) => <BuyingProcessStep key={s.step} {...s} index={i} />)}
                </div>
                <div className="mt-14"><CtaButton to="/contact" variant="primary">Start the Conversation</CtaButton></div>
            </section>
        </div>
    );
}
