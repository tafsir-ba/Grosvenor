import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import Hero from "@/components/shared/Hero";
import SectionHeading from "@/components/shared/SectionHeading";
import LeadForm from "@/components/shared/LeadForm";
import MapSection from "@/components/shared/MapSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PROJECT, LEAD_TYPE } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";

export default function ContactPage() {
    const channels = [
        { icon: Phone, label: "Call", value: PROJECT.contact.phone, href: PROJECT.contact.phoneHref, type: LEAD_TYPE.PHONE_CLICK, testid: "contact-phone" },
        { icon: MessageCircle, label: "WhatsApp", value: PROJECT.contact.whatsappNumber, href: PROJECT.contact.whatsapp, type: LEAD_TYPE.WHATSAPP_CLICK, testid: "contact-whatsapp", external: true },
        { icon: Mail, label: "Email", value: PROJECT.contact.email, href: PROJECT.contact.emailHref, type: LEAD_TYPE.EMAIL_CLICK, testid: "contact-email" },
    ];

    return (
        <div data-testid="contact-page">
            <Hero
                image="/gallery/homestaging-living-dinning-room-kitchen-2.png"
                height="min-h-[52vh]"
                overline="Contact"
                title="Let's talk"
                subtitle="Book a showroom visit or send us a message — the Grosvenor Agent will be in touch."
            />

            <section className="container-x py-24 md:py-32">
                <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr]">
                    {/* Details */}
                    <div>
                        <SectionHeading overline="Get in Touch" title="We're here to help" />
                        <div className="mt-10 space-y-4">
                            {channels.map((c) => (
                                <a
                                    key={c.label}
                                    href={c.href}
                                    onClick={() => trackClick(c.type)}
                                    data-testid={c.testid}
                                    {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})}
                                    className="flex items-center gap-4 rounded-none border border-border bg-card p-5 transition-colors hover:border-brand-gold"
                                >
                                    <c.icon className="h-5 w-5 text-brand-gold" />
                                    <div>
                                        <p className="overline text-muted-foreground">{c.label}</p>
                                        <p className="font-medium text-brand-ink">{c.value}</p>
                                    </div>
                                </a>
                            ))}
                            <div className="flex items-start gap-4 rounded-none border border-border bg-card p-5">
                                <MapPin className="mt-1 h-5 w-5 text-brand-gold" />
                                <div>
                                    <p className="overline text-muted-foreground">Showroom</p>
                                    <p className="font-medium text-brand-ink">{PROJECT.contact.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form with tabs */}
                    <div className="rounded-none border border-border bg-card p-8 md:p-10" data-testid="contact-form-card">
                        <Tabs defaultValue="visit">
                            <TabsList className="mb-8 grid w-full grid-cols-2" data-testid="contact-tabs">
                                <TabsTrigger value="visit" data-testid="tab-visit">Book Showroom Visit</TabsTrigger>
                                <TabsTrigger value="general" data-testid="tab-general">General Contact</TabsTrigger>
                            </TabsList>
                            <TabsContent value="visit">
                                <LeadForm
                                    leadType={LEAD_TYPE.BOOK_SHOWROOM_VISIT}
                                    submitLabel="Request a Visit"
                                    messagePlaceholder="Let us know your preferred day or time."
                                    testIdPrefix="visit"
                                />
                            </TabsContent>
                            <TabsContent value="general">
                                <LeadForm
                                    leadType={LEAD_TYPE.GENERAL_CONTACT}
                                    submitLabel="Send Message"
                                    messagePlaceholder="How can we help?"
                                    testIdPrefix="general"
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </section>

            <section className="container-x pb-24 md:pb-32">
                <MapSection />
            </section>
        </div>
    );
}
