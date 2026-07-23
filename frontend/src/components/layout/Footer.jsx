import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, ArrowUpRight } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { PROJECT, NAV, LEAD_TYPE, LEGAL } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";

export default function Footer() {
    return (
        <footer
            className="relative overflow-hidden border-t border-brand-beige bg-brand-ivory text-brand-ink"
            data-testid="site-footer"
        >
            <span aria-hidden="true" className="lux-title pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[22vw] leading-none text-brand-blue/[0.04] md:text-[18vw]">
                Grosvenor Vistas
            </span>

            <div className="container-x relative pb-10 pt-16 md:pb-16 md:pt-24 lg:pt-32">
                <div className="grid gap-12 md:grid-cols-[1.15fr_1fr] md:gap-16">
                    <div className="max-w-md">
                        <Logo color="blue" layout="wide" className="h-14 w-auto md:h-20" />
                        <p className="lux-title mt-6 text-3xl leading-tight text-brand-blue md:mt-8 md:text-5xl">
                            Elevate your view in {PROJECT.location.split(" · ")[0]}.
                        </p>
                        <Link
                            to="/contact"
                            data-testid="footer-cta"
                            className="group mt-8 inline-flex items-center gap-3 text-brand-ink transition-colors hover:text-brand-gold md:mt-10"
                        >
                            <span className="lux-eyebrow">Book a Visit</span>
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold text-white transition-transform duration-300 group-hover:translate-x-1">
                                <ArrowUpRight className="h-5 w-5" />
                            </span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12">
                        <nav className="flex flex-col gap-3">
                            {NAV.map((n) => (
                                <Link
                                    key={n.to}
                                    to={n.to}
                                    data-testid={`footer-nav-${n.to.replace("/", "")}`}
                                    className="font-sans text-base leading-relaxed text-brand-ink/65 transition-colors hover:text-brand-blue"
                                >
                                    {n.label}
                                </Link>
                            ))}
                        </nav>
                        <ul className="flex flex-col gap-4 font-sans text-base">
                            <li>
                                <a href={PROJECT.contact.phoneHref} onClick={() => trackClick(LEAD_TYPE.PHONE_CLICK)} data-testid="footer-phone" className="flex items-start gap-3 text-brand-ink/75 transition-colors hover:text-brand-gold">
                                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                                    <span>{PROJECT.contact.phone}</span>
                                </a>
                            </li>
                            <li>
                                <a href={PROJECT.contact.emailHref} onClick={() => trackClick(LEAD_TYPE.EMAIL_CLICK)} data-testid="footer-email" className="flex items-start gap-3 break-all text-brand-ink/75 transition-colors hover:text-brand-gold">
                                    <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                                    <span>{PROJECT.contact.email}</span>
                                </a>
                            </li>
                            <li className="flex items-start gap-3 text-brand-ink/75">
                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" />
                                <span>{PROJECT.contact.address}</span>
                            </li>
                            {PROJECT.social?.instagram ? (
                                <li>
                                    <a
                                        href={PROJECT.social.instagram}
                                        target="_blank"
                                        rel="noreferrer"
                                        data-testid="footer-instagram"
                                        className="inline-flex items-center gap-3 text-brand-ink/75 transition-colors hover:text-brand-gold"
                                    >
                                        <Instagram className="h-4 w-4 text-brand-gold" /> Instagram
                                    </a>
                                </li>
                            ) : null}
                        </ul>
                    </div>
                </div>

                <div className="mt-14 border-t border-brand-ink/10 pt-8 md:mt-20 md:pt-10" data-testid="footer-disclaimer">
                    <p className="max-w-4xl font-sans text-[0.7rem] leading-relaxed text-brand-ink/40">
                        {LEGAL.disclaimer}
                    </p>
                    <p className="mt-4 max-w-4xl font-sans text-[0.7rem] leading-relaxed text-brand-ink/40">
                        {LEGAL.disclaimerSecondary}
                    </p>
                </div>

                <div className="mt-10 flex flex-col items-start justify-between gap-5 border-t border-brand-ink/10 pt-6 text-xs tracking-[0.14em] text-brand-ink/45 md:mt-12 md:flex-row md:items-center md:pt-8">
                    <p className="uppercase">© {new Date().getFullYear()} {PROJECT.name}</p>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
                        <a href={LEGAL.privacyUrl} target="_blank" rel="noreferrer" data-testid="footer-privacy-link" className="uppercase transition-colors hover:text-brand-gold" title="Hosted by Evo Home for Grosvenor Vistas / Niaviv Ltd.">{LEGAL.privacyLabel}</a>
                        <a href={LEGAL.legalUrl} target="_blank" rel="noreferrer" data-testid="footer-legal-link" className="uppercase transition-colors hover:text-brand-gold" title="Hosted by Evo Home for Grosvenor Vistas / Niaviv Ltd.">{LEGAL.legalLabel}</a>
                        <a href={LEGAL.creditUrl} target="_blank" rel="noreferrer" data-testid="footer-credit" className="normal-case tracking-normal text-brand-ink/40 transition-colors hover:text-brand-gold">{LEGAL.credit}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
