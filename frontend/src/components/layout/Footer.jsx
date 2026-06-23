import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, ArrowUpRight } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { PROJECT, NAV, LEAD_TYPE } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";

export default function Footer() {
    return (
        <footer
            className="relative overflow-hidden border-t border-brand-beige bg-brand-ivory text-brand-ink"
            data-testid="site-footer"
        >
            {/* Oversized faint brand wordmark */}
            <span aria-hidden="true" className="lux-title pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[18vw] leading-none text-brand-blue/[0.04]">
                Grosvenor Vistas
            </span>

            <div className="container-x relative pb-16 pt-24 md:pt-32">
                <div className="grid gap-16 md:grid-cols-[1.15fr_1fr]">
                    {/* Brand + statement + CTA */}
                    <div>
                        <Logo color="blue" layout="wide" className="h-16 w-auto md:h-20" />
                        <p className="lux-title mt-8 max-w-md text-4xl leading-tight text-brand-blue md:text-5xl">
                            Elevate your view in {PROJECT.location.split(" · ")[0]}.
                        </p>
                        <Link
                            to="/contact"
                            data-testid="footer-cta"
                            className="group mt-10 inline-flex items-center gap-3 text-brand-ink transition-colors hover:text-brand-gold"
                        >
                            <span className="lux-eyebrow">Book a Visit</span>
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gold text-white transition-transform duration-300 group-hover:translate-x-1">
                                <ArrowUpRight className="h-5 w-5" />
                            </span>
                        </Link>
                    </div>

                    {/* Nav + contact */}
                    <div className="grid grid-cols-2 gap-10">
                        <nav className="flex flex-col gap-3.5">
                            {NAV.map((n) => (
                                <Link
                                    key={n.to}
                                    to={n.to}
                                    data-testid={`footer-nav-${n.to.replace("/", "")}`}
                                    className="font-sans text-base text-brand-ink/65 transition-colors hover:text-brand-blue"
                                >
                                    {n.label}
                                </Link>
                            ))}
                        </nav>
                        <ul className="flex flex-col gap-4 font-sans text-base">
                            <li>
                                <a href={PROJECT.contact.phoneHref} onClick={() => trackClick(LEAD_TYPE.PHONE_CLICK)} data-testid="footer-phone" className="flex items-center gap-3 text-brand-ink/75 transition-colors hover:text-brand-gold">
                                    <Phone className="h-4 w-4 text-brand-gold" /> {PROJECT.contact.phone}
                                </a>
                            </li>
                            <li>
                                <a href={PROJECT.contact.emailHref} onClick={() => trackClick(LEAD_TYPE.EMAIL_CLICK)} data-testid="footer-email" className="flex items-center gap-3 text-brand-ink/75 transition-colors hover:text-brand-gold">
                                    <Mail className="h-4 w-4 text-brand-gold" /> {PROJECT.contact.email}
                                </a>
                            </li>
                            <li className="flex items-start gap-3 text-brand-ink/75">
                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-gold" /> {PROJECT.contact.address}
                            </li>
                            <li>
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-brand-ink/75 transition-colors hover:text-brand-gold">
                                    <Instagram className="h-4 w-4 text-brand-gold" /> Instagram
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 flex flex-col items-center justify-between gap-2 border-t border-brand-ink/10 pt-8 text-xs uppercase tracking-[0.18em] text-brand-ink/45 md:flex-row">
                    <p>© {new Date().getFullYear()} {PROJECT.name}</p>
                    <p>{PROJECT.location}</p>
                </div>
            </div>
        </footer>
    );
}
