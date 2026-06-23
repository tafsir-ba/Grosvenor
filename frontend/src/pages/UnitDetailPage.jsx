import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import StatusBadge from "@/components/shared/StatusBadge";
import LeadForm from "@/components/shared/LeadForm";
import CtaButton from "@/components/shared/CtaButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnit, useUnits } from "@/hooks/useData";
import { formatPrice, formatSurface, floorLabel } from "@/lib/format";
import { BUILDINGS, LEAD_TYPE, PROJECT, collectionForSurface } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";

function shortBuilding(value) {
    return BUILDINGS.find((b) => b.value === value)?.short || value;
}

function RelatedCard({ unit, image }) {
    const sold = unit.status === "sold";
    return (
        <Link to={`/residences/${unit.slug}`} data-testid={`related-unit-${unit.slug}`} className={`group block overflow-hidden ${ROUND}`}>
            <div className="relative h-72 overflow-hidden">
                <img src={image} alt={`Residence ${unit.unit_number}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent" />
                <div className="absolute right-5 top-5"><StatusBadge status={unit.status} /></div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                    <div>
                        <h3 className="lux-title text-3xl">{unit.unit_number}</h3>
                        <p className="mt-1 font-sans text-xs uppercase tracking-[0.18em] text-white/80">{shortBuilding(unit.building)}</p>
                    </div>
                    <span className="font-sans text-sm text-white/85">{formatSurface(unit.total_surface)}</span>
                </div>
            </div>
            <div className="flex items-center justify-between px-1 pt-4">
                <span className="font-sans text-sm text-brand-ink/65">+{formatSurface(unit.balcony_surface)} balcony</span>
                <span className="lux-eyebrow inline-flex items-center gap-2 text-brand-gold">View Residence <ArrowRight className="h-4 w-4" /></span>
            </div>
        </Link>
    );
}

export default function UnitDetailPage() {
    const { slug } = useParams();
    const { unit, loading } = useUnit(slug);
    const { units: allUnits } = useUnits({ sort: "price_asc" });

    const collection = unit ? collectionForSurface(unit.total_surface) : null;

    const related = useMemo(() => {
        if (!unit || !collection) return [];
        return allUnits
            .filter((u) => u.slug !== unit.slug && u.total_surface >= collection.min && u.total_surface < collection.max)
            .slice(0, 3);
    }, [allUnits, unit, collection]);

    if (loading) {
        return <div className="container-wide py-40 pt-44"><Skeleton className={`h-[60vh] w-full ${ROUND}`} /></div>;
    }
    if (!unit) {
        return (
            <div className="container-wide py-40 pt-44 text-center" data-testid="unit-not-found">
                <h1 className="lux-title text-4xl text-brand-blue">Residence not found</h1>
                <CtaButton to="/residences" variant="primary" className="mt-8">Back to Residences</CtaButton>
            </div>
        );
    }

    const sold = unit.status === "sold";
    const overview = [
        { l: "Residence", v: unit.unit_number },
        { l: "Building", v: shortBuilding(unit.building) },
        { l: "Collection", v: collection.name },
        { l: "Floor", v: floorLabel(unit.floor) },
        { l: "Total Surface", v: formatSurface(unit.total_surface) },
        { l: "Balcony Surface", v: formatSurface(unit.balcony_surface) },
        { l: "Status", v: <StatusBadge status={unit.status} /> },
        { l: "Price", v: sold ? "Now sold" : formatPrice(unit.price, unit.currency) },
    ];

    const leadCtx = {
        unit: unit.unit_number,
        building: shortBuilding(unit.building),
        collection: collection.name,
        unit_surface: unit.total_surface,
        unit_balcony: unit.balcony_surface,
    };

    return (
        <div data-testid="unit-detail-page">
            {/* Back link */}
            <div className="container-wide pt-32 md:pt-36">
                <Link to="/residences" className="inline-flex items-center gap-2 font-sans text-sm text-brand-ink/60 transition-colors hover:text-brand-gold" data-testid="back-to-residences">
                    <ArrowLeft className="h-4 w-4" /> All Residences
                </Link>
            </div>

            {/* HERO */}
            <section className="container-wide pt-6">
                <div className={`relative h-[68vh] overflow-hidden ${ROUND}`}>
                    <motion.img
                        initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                        src={collection.heroImage} alt={`Residence ${unit.unit_number}`} loading="eager" decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-brand-ink/15 to-transparent" />
                    <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-x-0 bottom-0 p-8 md:p-14 lg:p-16">
                        <Eyebrow light>{shortBuilding(unit.building)} · {collection.name}</Eyebrow>
                        <h1 className="lux-title mt-6 text-5xl text-white sm:text-6xl lg:text-7xl">Residence {unit.unit_number}</h1>
                        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 font-sans text-white/90">
                            <span className="text-lg">{formatSurface(unit.total_surface)}</span>
                            <span className="h-4 w-px bg-white/30" />
                            <span className="text-lg">+{formatSurface(unit.balcony_surface)} balcony</span>
                            <StatusBadge status={unit.status} className="border-white/40 bg-white/10 text-white" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* REPRESENTATIVE GALLERY */}
            <section className="container-wide py-20 md:py-28">
                <motion.div {...fadeUp} className="mb-10 px-2 md:px-6">
                    <Eyebrow>Representative Interior Imagery</Eyebrow>
                    <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl lg:text-5xl">A feel for the {collection.name}</h2>
                    <p className="mt-4 max-w-2xl font-sans text-base text-brand-ink/60">Indicative imagery representative of this collection. Images illustrate the typical residence concept and are not photographs of this specific unit.</p>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
                    {collection.gallery.map((g, i) => {
                        // Editorial rhythm: first two large, remainder balanced.
                        const span = i === 0 ? "md:col-span-4 md:h-[60vh]" : i === 1 ? "md:col-span-2 md:h-[60vh]" : "md:col-span-2 md:h-[42vh]";
                        return (
                            <motion.figure {...fadeUp} key={g.label} data-testid={`unit-gallery-${i}`} className={`group relative overflow-hidden ${ROUND} h-[44vh] ${span}`}>
                                <img src={g.image} alt={g.label} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/55 to-transparent opacity-80" />
                                <figcaption className="absolute bottom-0 left-0 p-6 font-sans text-sm uppercase tracking-[0.18em] text-white">{g.label}</figcaption>
                            </motion.figure>
                        );
                    })}
                </div>
            </section>

            {/* UNIT OVERVIEW */}
            <section className="container-wide pb-20 md:pb-28">
                <div className="grid gap-12 px-2 md:px-6 lg:grid-cols-[1fr_1.1fr]">
                    <motion.div {...fadeUp}>
                        <Eyebrow>Residence Overview</Eyebrow>
                        <h2 className="lux-title mt-6 text-4xl text-brand-blue sm:text-5xl">The essentials</h2>
                        <p className="mt-6 max-w-md font-sans text-lg text-brand-ink/65">{collection.blurb}</p>
                        <Link to={`/residences?collection=${collection.key}`} data-testid="collection-link" className="lux-eyebrow mt-8 inline-flex items-center gap-2 text-brand-gold transition-colors hover:text-brand-ink">
                            Explore {collection.name} <ArrowRight className="h-4 w-4" />
                        </Link>
                    </motion.div>

                    <motion.dl {...fadeUp} className="divide-y divide-brand-beige border-y border-brand-beige">
                        {overview.map((f) => (
                            <div key={f.l} className="flex items-center justify-between py-5" data-testid={`overview-${f.l.toLowerCase().replace(/ /g, "-")}`}>
                                <dt className="font-sans text-sm uppercase tracking-[0.16em] text-brand-ink/45">{f.l}</dt>
                                <dd className="font-display text-xl text-brand-ink">{f.v}</dd>
                            </div>
                        ))}
                    </motion.dl>
                </div>
            </section>

            {/* REQUEST FLOOR PLAN + ENQUIRY */}
            <section className="container-wide pb-20 md:pb-28">
                <motion.div {...fadeUp} className={`overflow-hidden bg-brand-ivory ${ROUND}`}>
                    <div className="grid lg:grid-cols-2">
                        <div className="flex flex-col justify-center p-10 md:p-14">
                            <Eyebrow>Detailed Floor Plan</Eyebrow>
                            <h2 className="lux-title mt-6 text-4xl text-brand-blue sm:text-5xl">Interested in the detailed floor plan?</h2>
                            <p className="mt-6 max-w-md font-sans text-lg text-brand-ink/65">Detailed plans are shared privately. Share your details and we'll send the floor plan for Residence {unit.unit_number}, along with anything else you'd like to know.</p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <CtaButton href={PROJECT.contact.whatsapp} target="_blank" rel="noreferrer" variant="primary" onClick={() => trackClick(LEAD_TYPE.WHATSAPP_CLICK, leadCtx)} data-testid="unit-whatsapp">
                                    Enquire on WhatsApp
                                </CtaButton>
                                <CtaButton href={PROJECT.contact.phoneHref} variant="outline" onClick={() => trackClick(LEAD_TYPE.PHONE_CLICK, leadCtx)} data-testid="unit-call">
                                    Call Us
                                </CtaButton>
                            </div>
                        </div>
                        <div className="border-t border-brand-beige bg-brand-warm/60 p-10 md:p-14 lg:border-l lg:border-t-0" data-testid="unit-enquiry">
                            <h3 className="lux-title text-2xl text-brand-blue">Request Floor Plan</h3>
                            <p className="mt-2 font-sans text-sm text-brand-ink/55">Inquiry about Residence {unit.unit_number}. We'll respond promptly.</p>
                            <div className="mt-6">
                                <LeadForm
                                    leadType={LEAD_TYPE.CONTACT_ABOUT_UNIT}
                                    ctx={leadCtx}
                                    submitLabel="Request Floor Plan"
                                    messagePlaceholder={`I'd like the floor plan and more on Residence ${unit.unit_number}…`}
                                    testIdPrefix="unit-enquiry"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* RELATED RESIDENCES */}
            {related.length > 0 && (
                <section className="container-wide pb-24 md:pb-32">
                    <motion.div {...fadeUp} className="mb-10 px-2 md:px-6">
                        <Eyebrow>More to Explore</Eyebrow>
                        <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl lg:text-5xl">Explore similar residences</h2>
                    </motion.div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {related.map((u, i) => <RelatedCard key={u.slug} unit={u} image={collection.gallery[i % collection.gallery.length].image} />)}
                    </div>
                </section>
            )}
        </div>
    );
}
