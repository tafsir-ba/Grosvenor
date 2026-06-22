import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import LeadForm from "@/components/shared/LeadForm";
import CtaButton from "@/components/shared/CtaButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnit } from "@/hooks/useData";
import { formatPrice, formatSurface, floorLabel } from "@/lib/format";
import { BUILDINGS, LEAD_TYPE, PROJECT } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";

function shortBuilding(value) {
    return BUILDINGS.find((b) => b.value === value)?.short || value;
}

export default function UnitDetailPage() {
    const { slug } = useParams();
    const { unit, loading } = useUnit(slug);

    if (loading) {
        return <div className="container-x py-40"><Skeleton className="h-96 w-full rounded-sm" /></div>;
    }
    if (!unit) {
        return (
            <div className="container-x py-40 text-center" data-testid="unit-not-found">
                <h1 className="font-display text-3xl text-brand-ink">Residence not found</h1>
                <CtaButton to="/residences" variant="outline" className="mt-8">Back to Residences</CtaButton>
            </div>
        );
    }

    const sold = unit.status === "sold";
    const facts = [
        { l: "Building", v: shortBuilding(unit.building) },
        { l: "Residence", v: unit.unit_number },
        { l: "Floor", v: floorLabel(unit.floor) },
        { l: "Total Surface", v: formatSurface(unit.total_surface) },
        { l: "Balcony Surface", v: formatSurface(unit.balcony_surface) },
        { l: "Price", v: sold ? "—" : formatPrice(unit.price, unit.currency) },
    ];

    return (
        <div data-testid="unit-detail-page" className="pt-28">
            <div className="container-x py-12">
                <Link to="/residences" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-brand-gold" data-testid="back-to-residences">
                    <ArrowLeft className="h-4 w-4" /> All Residences
                </Link>

                <div className="mt-8 grid gap-14 lg:grid-cols-[1.3fr_1fr]">
                    {/* Facts */}
                    <div>
                        <div className="flex items-center gap-4">
                            <p className="overline text-brand-gold">{shortBuilding(unit.building)}</p>
                            <StatusBadge status={unit.status} />
                        </div>
                        <h1 className="mt-3 font-display text-5xl text-brand-ink md:text-6xl">{unit.unit_number}</h1>
                        <p className="mt-3 text-lg text-muted-foreground">{floorLabel(unit.floor)} · {PROJECT.location.split(" · ")[0]}</p>

                        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border">
                            {facts.map((f) => (
                                <div key={f.l} className="bg-card p-6">
                                    <dt className="overline text-muted-foreground">{f.l}</dt>
                                    <dd className="mt-2 font-display text-xl text-brand-ink">{f.v}</dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <CtaButton href={PROJECT.contact.whatsapp} target="_blank" rel="noreferrer" variant="secondary" onClick={() => trackClick(LEAD_TYPE.WHATSAPP_CLICK, { unit: unit.unit_number, building: unit.building })}>
                                Enquire on WhatsApp
                            </CtaButton>
                            <CtaButton href={PROJECT.contact.phoneHref} variant="outline" onClick={() => trackClick(LEAD_TYPE.PHONE_CLICK, { unit: unit.unit_number, building: unit.building })}>
                                Call the Agent
                            </CtaButton>
                        </div>
                    </div>

                    {/* Enquiry form */}
                    <div className="h-fit rounded-sm border border-border bg-card p-8 lg:sticky lg:top-28" data-testid="unit-enquiry">
                        <h2 className="font-display text-2xl text-brand-ink">Enquire about {unit.unit_number}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">The Grosvenor Agent will respond promptly.</p>
                        <div className="mt-6">
                            <LeadForm
                                leadType={LEAD_TYPE.CONTACT_ABOUT_UNIT}
                                ctx={{ unit: unit.unit_number, building: unit.building }}
                                submitLabel="Send Enquiry"
                                messagePlaceholder={`I'm interested in ${unit.unit_number}…`}
                                testIdPrefix="unit-enquiry"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
