import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, MessageCircle, CalendarCheck, Mail } from "lucide-react";
import { motion } from "framer-motion";
import StatusBadge from "@/components/shared/StatusBadge";
import LeadForm from "@/components/shared/LeadForm";
import CtaButton from "@/components/shared/CtaButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnit, useUnits } from "@/hooks/useData";
import { formatPrice, formatSurface } from "@/lib/format";
import { BUILDINGS, LEAD_TYPE, PROJECT, collectionForSurface } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";

function shortBuilding(value) {
    return BUILDINGS.find((b) => b.value === value)?.short || value;
}

const scrollToEnquiry = () => document.getElementById("enquire")?.scrollIntoView({ behavior: "smooth" });

function Gallery({ images, unitNumber }) {
    const [active, setActive] = useState(0);
    return (
        <div data-testid="unit-gallery">
            <div className={`relative h-[42vh] overflow-hidden md:h-[56vh] ${ROUND}`}>
                <motion.img
                    key={active}
                    initial={{ opacity: 0.4, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    src={images[active].image}
                    alt={`Residence ${unitNumber} — ${images[active].label}`}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/35 to-transparent" />
                <span className="absolute bottom-5 left-6 font-sans text-sm uppercase tracking-[0.18em] text-white">{images[active].label}</span>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-3">
                {images.map((g, i) => (
                    <button
                        key={g.label}
                        type="button"
                        onClick={() => setActive(i)}
                        data-testid={`gallery-thumb-${i}`}
                        aria-label={g.label}
                        className={`relative h-16 overflow-hidden rounded-xl transition-all duration-300 md:h-20 ${active === i ? "ring-2 ring-brand-gold ring-offset-2 ring-offset-brand-warm" : "opacity-70 hover:opacity-100"}`}
                    >
                        <img src={g.image} alt={g.label} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function UnitDetailPage() {
    const { slug } = useParams();
    const { unit, loading } = useUnit(slug);
    const { units: allUnits } = useUnits({ sort: "price_asc" });

    const collection = unit ? collectionForSurface(unit.total_surface) : null;

    const galleryImages = useMemo(() => {
        if (!collection) return [];
        return [{ label: "Exterior", image: "/gallery/buildings-01.png" }, ...collection.gallery];
    }, [collection]);

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
    const building = shortBuilding(unit.building);
    const priceText = sold ? "Now sold" : formatPrice(unit.price, unit.currency);

    const leadCtx = {
        unit: unit.unit_number,
        building,
        collection: collection.name,
        unit_surface: unit.total_surface,
        unit_balcony: unit.balcony_surface,
    };

    return (
        <div data-testid="unit-detail-page">
            {/* Back link */}
            <div className="container-wide pt-28 md:pt-32">
                <Link to="/residences" className="inline-flex items-center gap-2 font-sans text-sm text-brand-ink/60 transition-colors hover:text-brand-gold" data-testid="back-to-residences">
                    <ArrowLeft className="h-4 w-4" /> All Residences
                </Link>
            </div>

            {/* SECTION 1 — Gallery + Residence information */}
            <section className="container-wide pt-6">
                <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
                    <motion.div {...fadeUp}>
                        <Gallery images={galleryImages} unitNumber={unit.unit_number} />
                    </motion.div>

                    <motion.div {...fadeUp} className="flex flex-col lg:pl-2" data-testid="unit-info-panel">
                        <Eyebrow>{collection.name}</Eyebrow>
                        <h1 className="lux-title mt-4 text-5xl text-brand-blue sm:text-6xl">Residence {unit.unit_number}</h1>
                        <p className="mt-3 font-sans text-base uppercase tracking-[0.18em] text-brand-ink/55">{building}</p>
                        <div className="mt-5"><StatusBadge status={unit.status} /></div>

                        <div className="mt-8 space-y-4 border-y border-brand-beige py-7">
                            <div className="flex items-baseline justify-between">
                                <span className="font-sans text-sm uppercase tracking-[0.16em] text-brand-ink/45">Interior</span>
                                <span className="font-display text-2xl text-brand-ink">{formatSurface(unit.total_surface)}</span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="font-sans text-sm uppercase tracking-[0.16em] text-brand-ink/45">Balcony</span>
                                <span className="font-display text-2xl text-brand-ink">{formatSurface(unit.balcony_surface)}</span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="font-sans text-sm uppercase tracking-[0.16em] text-brand-ink/45">Price</span>
                                <span className="font-display text-3xl text-brand-gold">{priceText}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3">
                            <CtaButton variant="primary" onClick={scrollToEnquiry} data-testid="unit-request-info" className="w-full">
                                <Mail className="h-4 w-4" /> Request Information
                            </CtaButton>
                            <div className="grid grid-cols-2 gap-3">
                                <CtaButton to="/contact" variant="outline" data-testid="unit-book-visit">
                                    <CalendarCheck className="h-4 w-4" /> Book a Visit
                                </CtaButton>
                                <CtaButton href={PROJECT.contact.whatsapp} target="_blank" rel="noreferrer" variant="outline" onClick={() => trackClick(LEAD_TYPE.WHATSAPP_CLICK, leadCtx)} data-testid="unit-whatsapp">
                                    <MessageCircle className="h-4 w-4" /> WhatsApp
                                </CtaButton>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* INFORMATION BLOCK — short residence description */}
            <section className="container-wide py-14 md:py-20">
                <motion.div {...fadeUp} className="max-w-3xl px-2 md:px-6">
                    <Eyebrow>Residence Overview</Eyebrow>
                    <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl">{collection.name}</h2>
                    <p className="mt-6 font-sans text-lg leading-relaxed text-brand-ink/65" data-testid="unit-description">{collection.blurb}</p>
                    <Link to={`/residences?collection=${collection.key}`} data-testid="collection-link" className="lux-eyebrow mt-8 inline-flex items-center gap-2 text-brand-gold transition-colors hover:text-brand-ink">
                        Explore {collection.name} <ArrowRight className="h-4 w-4" />
                    </Link>
                </motion.div>
            </section>

            {/* ENQUIRY — Request Information */}
            <section id="enquire" className="container-wide pb-16 md:pb-24">
                <motion.div {...fadeUp} className={`overflow-hidden bg-brand-ivory ${ROUND}`}>
                    <div className="grid lg:grid-cols-2">
                        <div className="flex flex-col justify-center p-10 md:p-14">
                            <Eyebrow>Enquire</Eyebrow>
                            <h2 className="lux-title mt-6 text-4xl text-brand-blue sm:text-5xl">Request information on Residence {unit.unit_number}</h2>
                            <p className="mt-6 max-w-md font-sans text-lg text-brand-ink/65">Share your details and we'll send pricing, availability and the detailed floor plan for this residence — along with anything else you'd like to know.</p>
                        </div>
                        <div className="border-t border-brand-beige bg-brand-warm/60 p-10 md:p-14 lg:border-l lg:border-t-0" data-testid="unit-enquiry">
                            <p className="font-sans text-sm text-brand-ink/55">Inquiry about Residence {unit.unit_number}. We'll respond promptly.</p>
                            <div className="mt-6">
                                <LeadForm
                                    leadType={LEAD_TYPE.CONTACT_ABOUT_UNIT}
                                    ctx={leadCtx}
                                    submitLabel="Request Information"
                                    messagePlaceholder={`I'd like pricing and the floor plan for Residence ${unit.unit_number}…`}
                                    testIdPrefix="unit-enquiry"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* SIMILAR RESIDENCES */}
            {related.length > 0 && (
                <section className="container-wide pb-24 md:pb-32">
                    <motion.div {...fadeUp} className="mb-10 px-2 md:px-6">
                        <Eyebrow>More to Explore</Eyebrow>
                        <h2 className="lux-title mt-6 text-3xl text-brand-blue sm:text-4xl lg:text-5xl">Explore similar residences</h2>
                    </motion.div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {related.map((u, i) => (
                            <Link key={u.slug} to={`/residences/${u.slug}`} data-testid={`related-unit-${u.slug}`} className={`group block overflow-hidden ${ROUND}`}>
                                <div className="relative h-72 overflow-hidden">
                                    <img src={collection.gallery[i % collection.gallery.length].image} alt={`Residence ${u.unit_number}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/70 via-transparent to-transparent" />
                                    <div className="absolute right-5 top-5"><StatusBadge status={u.status} /></div>
                                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                                        <div>
                                            <h3 className="lux-title text-3xl">{u.unit_number}</h3>
                                            <p className="mt-1 font-sans text-xs uppercase tracking-[0.18em] text-white/80">{shortBuilding(u.building)}</p>
                                        </div>
                                        <span className="font-sans text-sm text-white/85">{formatSurface(u.total_surface)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-1 pt-4">
                                    <span className="font-sans text-sm text-brand-ink/65">+{formatSurface(u.balcony_surface)} balcony</span>
                                    <span className="lux-eyebrow inline-flex items-center gap-2 text-brand-gold">View Residence <ArrowRight className="h-4 w-4" /></span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
