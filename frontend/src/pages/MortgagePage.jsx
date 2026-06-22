import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import LeadForm from "@/components/shared/LeadForm";
import DownloadForm from "@/components/shared/DownloadForm";
import { useDownloads } from "@/hooks/useData";
import { LEAD_TYPE } from "@/lib/constants";

const STEPS = [
    { title: "Understand your budget", body: "Review your deposit and the financing you may qualify for in USD terms." },
    { title: "Speak with a lender", body: "We can point you to mortgage options suited to overseas and local buyers." },
    { title: "Reserve with confidence", body: "Place a reservation once your financing path is clear and straightforward." },
];

export default function MortgagePage() {
    const downloads = useDownloads();
    const priceList = downloads.find((d) => d.type === "pricelist");

    return (
        <div data-testid="mortgage-page">
            <Hero
                image="/gallery/model-unit-living-and-dining-room.png"
                height="min-h-[56vh]"
                overline="Mortgage & Financing"
                title="Financing made simple"
                subtitle="Clear guidance to help you move forward with confidence."
            />

            <section className="container-x py-24 md:py-32">
                <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr]">
                    <div>
                        <SectionHeading overline="Getting Started" title="A straightforward route to ownership" subtitle="Grosvenor Vistas residences are priced in USD. Whether you are buying locally or from overseas, the Grosvenor Agent can help you understand your options." />
                        <div className="mt-10 space-y-8">
                            {STEPS.map((s, i) => (
                                <div key={s.title} data-testid={`mortgage-step-${i}`} className="flex gap-5">
                                    <span className="font-display text-3xl text-brand-gold/40">{String(i + 1).padStart(2, "0")}</span>
                                    <div>
                                        <h3 className="font-display text-xl text-brand-ink">{s.title}</h3>
                                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {priceList && <div className="mt-12"><DownloadForm download={priceList} /></div>}
                    </div>

                    <div className="h-fit rounded-none border border-border bg-card p-8 lg:sticky lg:top-28" data-testid="mortgage-enquiry">
                        <h2 className="font-display text-2xl text-brand-ink">Request mortgage information</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Tell us a little about you and we'll share relevant financing details.</p>
                        <div className="mt-6">
                            <LeadForm
                                leadType={LEAD_TYPE.MORTGAGE_INFO_REQUEST}
                                submitLabel="Request Information"
                                messagePlaceholder="Anything we should know about your plans?"
                                testIdPrefix="mortgage"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
