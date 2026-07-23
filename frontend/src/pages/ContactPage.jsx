import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Hero from "@/components/shared/Hero";
import LeadForm from "@/components/shared/LeadForm";
import DownloadForm from "@/components/shared/DownloadForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eyebrow, fadeUp, PlaceholderMap, ROUND } from "@/components/shared/luxe";
import { PROJECT, LEAD_TYPE } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";
import { useDownloads } from "@/hooks/useData";

export default function ContactPage() {
    const { downloads, loading: downloadsLoading } = useDownloads();
    const channels = [
        { icon: Phone, label: "Call", value: PROJECT.contact.phone, href: PROJECT.contact.phoneHref, type: LEAD_TYPE.PHONE_CLICK, testid: "contact-phone" },
        { icon: MessageCircle, label: "WhatsApp", value: PROJECT.contact.whatsappNumber, href: PROJECT.contact.whatsapp, type: LEAD_TYPE.WHATSAPP_CLICK, testid: "contact-whatsapp", external: true },
        { icon: Mail, label: "Email", value: PROJECT.contact.email, href: PROJECT.contact.emailHref, type: LEAD_TYPE.EMAIL_CLICK, testid: "contact-email" },
    ];

    return (
        <div data-testid="contact-page">
            <Hero image="/gallery/homestaging-living-dinning-room-kitchen-2.png" overline="Contact" title="Let's talk" subtitle="Book a showroom visit or send a message — we'll be in touch." />

            <section className="container-wide py-16 md:py-24">
                <div className="grid gap-14 px-2 md:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
                    <motion.div {...fadeUp}>
                        <Eyebrow>Get in Touch</Eyebrow>
                        <h2 className="lux-title mt-7 text-4xl text-brand-blue sm:text-5xl lg:text-6xl">We're here to help</h2>
                        <div className="mt-10 space-y-3">
                            {channels.map((c) => (
                                <a
                                    key={c.label}
                                    href={c.href}
                                    onClick={() => trackClick(c.type)}
                                    data-testid={c.testid}
                                    {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                                    className="flex items-center gap-4 rounded-2xl border border-brand-beige bg-brand-ivory p-5 transition-colors hover:border-brand-gold"
                                >
                                    <c.icon className="h-5 w-5 text-brand-gold" />
                                    <div>
                                        <p className="lux-eyebrow text-brand-ink/50">{c.label}</p>
                                        <p className="font-sans font-medium text-brand-ink">{c.value}</p>
                                    </div>
                                </a>
                            ))}
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
                                Save the project brochure (details required) or open the current price list.
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
                <PlaceholderMap className={`h-[56vh] lg:h-[64vh] ${ROUND}`} />
            </section>
        </div>
    );
}
