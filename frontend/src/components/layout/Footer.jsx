import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { PROJECT, NAV, LEAD_TYPE } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";

export default function Footer() {
    return (
        <footer className="bg-brand-blue text-white" data-testid="site-footer">
            {/* Top: logo + statement */}
            <div className="container-x border-b border-white/10 py-16">
                <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
                    <div>
                        <Logo color="white" layout="wide" className="h-20 w-auto md:h-24" />
                        <p className="mt-6 max-w-md font-display text-2xl font-light leading-snug text-white/90 md:text-3xl">
                            Elevate your view in {PROJECT.location.split(" · ")[0]}.
                        </p>
                    </div>
                    <Link
                        to="/contact"
                        className="rounded-sm border border-white/40 px-9 py-4 text-sm font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-white hover:text-brand-blue"
                        data-testid="footer-cta"
                    >
                        Book a Visit
                    </Link>
                </div>
            </div>

            {/* Links + contact */}
            <div className="container-x grid gap-10 py-14 md:grid-cols-3">
                <nav className="grid grid-cols-2 gap-x-6 gap-y-3 text-base md:col-span-2">
                    {NAV.map((n) => (
                        <Link key={n.to} to={n.to} className="text-white/70 transition-colors hover:text-white" data-testid={`footer-nav-${n.to.replace("/", "")}`}>
                            {n.label}
                        </Link>
                    ))}
                </nav>

                <ul className="space-y-4 text-base">
                    <li>
                        <a href={PROJECT.contact.phoneHref} onClick={() => trackClick(LEAD_TYPE.PHONE_CLICK)} data-testid="footer-phone" className="flex items-center gap-3 text-white/80 transition-colors hover:text-white">
                            <Phone className="h-4 w-4" /> {PROJECT.contact.phone}
                        </a>
                    </li>
                    <li>
                        <a href={PROJECT.contact.emailHref} onClick={() => trackClick(LEAD_TYPE.EMAIL_CLICK)} data-testid="footer-email" className="flex items-center gap-3 text-white/80 transition-colors hover:text-white">
                            <Mail className="h-4 w-4" /> {PROJECT.contact.email}
                        </a>
                    </li>
                    <li className="flex items-start gap-3 text-white/80">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" /> {PROJECT.contact.address}
                    </li>
                    <li>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-white/80 transition-colors hover:text-white">
                            <Instagram className="h-4 w-4" /> Instagram
                        </a>
                    </li>
                </ul>
            </div>

            <div className="border-t border-white/10">
                <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/40 md:flex-row">
                    <p>© {new Date().getFullYear()} {PROJECT.name}. All rights reserved.</p>
                    <p>{PROJECT.location}</p>
                </div>
            </div>
        </footer>
    );
}
