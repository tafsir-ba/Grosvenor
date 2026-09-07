import { Phone, Mail, MessageCircle, MapPin, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import Hero from "@/components/shared/Hero";
import LeadForm from "@/components/shared/LeadForm";
import DownloadForm from "@/components/shared/DownloadForm";
import WhatsAppLeadDialog from "@/components/shared/WhatsAppLeadDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eyebrow, fadeUp, ROUND } from "@/components/shared/luxe";
import { PROJECT, LEAD_TYPE } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";
import { requestWhatsApp } from "@/lib/whatsapp";
import { useDownloads } from "@/hooks/useData";

function LiveMap({ className = `h-[56vh] lg:h-[64vh] ${ROUND}` }) {
    return (
        <div
            data-testid="contact-live-map"
            className={`relative overflow-hidden border border-brand-beige ${className}`}
        >
            <iframe
                title="Grosvenor Vistas location map"
                src={PROJECT.contact.mapEmbed}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 bg-gradient-to-t from-brand-warm/95 via-brand-warm/70 to-transparent p-6">
                <span className="lux-title text-2xl text-brand-blue md:text-3xl">Grosvenor Heights</span>
                <a
                    href={PROJECT.contact.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="contact-open-maps"
                    className="pointer-events-auto lux-eyebrow flex items-center gap-2 rounded-full bg-brand-warm/95 px-4 py-2 text-brand-ink backdrop-blur transition-colors hover:text-brand-gold"
                >
                    Open in Maps <ArrowRight className="h-4 w-4" />
                </a>
            </div>
        </div>
    );
}

export default function ContactPage() {
    const { downloads, loading: downloadsLoading } = useDownloads();
    const [whatsappOpen, setWhatsappOpen] = useState(false);

    return (
        <div data-testid="contact-page">
            <Hero image="/gallery/homestaging-living-dinning-room-kitchen-2.png" overline="Contact" title="Let's talk" subtitle="Book a showroom visit or send a message — we'll be in touch." />

            <section className="container-wide py-16 md:py-24">
                <div className="grid gap-14 px-2 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                    <motion.div {...fadeUp}>
                        <Eyebrow>Get in Touch</Eyebrow>
                        <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">We're here to help</h2>
                        <div className="mt-10 space-y-3">
                            <div
                                data-testid="contact-call-whatsapp"
                                className="flex items-start gap-4 rounded-2xl border border-brand-beige bg-brand-ivory p-5"
                            >
                                <Phone className="mt-1 h-5 w-5 flex-shrink-0 text-brand-gold" />
                                <div className="min-w-0 flex-1">
                                    <p className="lux-eyebrow text-brand-ink/50">Call + WhatsApp</p>
                                    <p className="font-sans font-medium text-brand-ink">{PROJECT.contact.phone}</p>
                                    <div className="mt-3 flex flex-wrap gap-4">
                                        <a
                                            href={PROJECT.contact.phoneHref}
                                            onClick={() => trackClick(LEAD_TYPE.PHONE_CLICK)}
                                            data-testid="contact-phone"
                                            className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-brand-gold transition-opacity hover:opacity-75"
                                        >
                                            <Phone className="h-3.5 w-3.5" /> Call
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => requestWhatsApp({ openDialog: () => setWhatsappOpen(true) })}
                                            data-testid="contact-whatsapp"
                                            className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-brand-gold transition-opacity hover:opacity-75"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <a
                                href={PROJECT.contact.emailHref}
                                onClick={() => trackClick(LEAD_TYPE.EMAIL_CLICK)}
                                data-testid="contact-email"
                                className="flex items-center gap-4 rounded-2xl border border-brand-beige bg-brand-ivory p-5 transition-colors hover:border-brand-gold"
                            >
                                <Mail className="h-5 w-5 text-brand-gold" />
                                <div>
                                    <p className="lux-eyebrow text-brand-ink/50">Email</p>
                                    <p className="font-sans font-medium text-brand-ink">{PROJECT.contact.email}</p>
                                </div>
                            </a>
                            <div className="flex items-start gap-4 rounded-2xl border border-brand-beige bg-brand-ivory p-5">
                                <MapPin className="mt-1 h-5 w-5 text-brand-gold" />
                                <div>
                                    <p className="lux-eyebrow text-brand-ink/50">Showroom</p>
                                    <p className="font-sans font-medium text-brand-ink">{PROJECT.contact.address}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12" data-testid="contact-downloads">
                            <Eyebrow>Downloads</Eyebrow>
                            <h3 className="lux-title mt-4 text-2xl text-brand-blue sm:text-3xl">Brochure & price list</h3>
                            <p className="mt-3 max-w-md font-sans text-sm text-brand-ink/60">
                                Share your details to download the brochure or the current price list.
                            </p>
                            <div className="mt-6 space-y-1">
                                {downloadsLoading && <p className="font-sans text-sm text-brand-ink/55">Loading downloads…</p>}
                                {!downloadsLoading && downloads.length === 0 && (
                                    <p className="font-sans text-sm text-brand-ink/55">Downloads will appear here shortly.</p>
                                )}
                                {downloads.map((d) => (
                                    <DownloadForm key={d._id || d.id} download={d} />
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div {...fadeUp} className="rounded-[1.75rem] border border-brand-beige bg-brand-ivory p-8 md:p-10" data-testid="contact-form-card">
                        <Tabs defaultValue="visit">
                            <TabsList className="mb-8 grid w-full grid-cols-2" data-testid="contact-tabs" aria-label="Contact enquiry type">
                                <TabsTrigger value="visit" data-testid="tab-visit" aria-label="Book Showroom Visit">Book Showroom Visit</TabsTrigger>
                                <TabsTrigger value="general" data-testid="tab-general" aria-label="General Contact">General Contact</TabsTrigger>
                            </TabsList>
                            <TabsContent value="visit">
                                <LeadForm
                                    leadType={LEAD_TYPE.BOOK_SHOWROOM_VISIT}
                                    submitLabel="Request a Visit"
                                    messagePlaceholder="Anything else we should know?"
                                    testIdPrefix="visit"
                                    showVisitPreferences
                                />
                            </TabsContent>
                            <TabsContent value="general">
                                <LeadForm leadType={LEAD_TYPE.GENERAL_CONTACT} submitLabel="Send Message" messagePlaceholder="How can we help?" testIdPrefix="general" />
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </div>
            </section>

            <section className="container-wide pb-24 md:pb-32">
                <LiveMap />
            </section>

            <WhatsAppLeadDialog open={whatsappOpen} onOpenChange={setWhatsappOpen} />
        </div>
    );
}
