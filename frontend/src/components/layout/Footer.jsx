import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { PROJECT, NAV, LEAD_TYPE } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";

export default function Footer() {
    return (
        <footer className="bg-brand-blue text-white/80" data-testid="site-footer">
            <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-1">
                    <Logo color="white" layout="horizontal" className="h-10 w-auto" />
                    <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
                        {PROJECT.tagline}. A refined residential development in {PROJECT.location.split(" · ")[0]}.
                    </p>
                </div>

                <div>
                    <p className="overline text-white/90">Explore</p>
                    <ul className="mt-5 space-y-3 text-sm">
                        {NAV.slice(0, 5).map((n) => (
                            <li key={n.to}>
                                <Link to={n.to} className="transition-colors hover:text-white" data-testid={`footer-nav-${n.to.replace("/", "")}`}>{n.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="overline text-white/90">Information</p>
                    <ul className="mt-5 space-y-3 text-sm">
                        {NAV.slice(5).map((n) => (
                            <li key={n.to}>
                                <Link to={n.to} className="transition-colors hover:text-white" data-testid={`footer-nav-${n.to.replace("/", "")}`}>{n.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="overline text-white/90">Contact</p>
                    <ul className="mt-5 space-y-4 text-sm">
                        <li>
                            <a href={PROJECT.contact.phoneHref} onClick={() => trackClick(LEAD_TYPE.PHONE_CLICK)} data-testid="footer-phone" className="flex items-center gap-3 transition-colors hover:text-white">
                                <Phone className="h-4 w-4 text-white/90" /> {PROJECT.contact.phone}
                            </a>
                        </li>
                        <li>
                            <a href={PROJECT.contact.emailHref} onClick={() => trackClick(LEAD_TYPE.EMAIL_CLICK)} data-testid="footer-email" className="flex items-center gap-3 transition-colors hover:text-white">
                                <Mail className="h-4 w-4 text-white/90" /> {PROJECT.contact.email}
                            </a>
                        </li>
                        <li className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/90" /> {PROJECT.contact.address}
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-white/10">
                <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/40 md:flex-row">
                    <p>© {new Date().getFullYear()} {PROJECT.name}. All rights reserved.</p>
                    <p>{PROJECT.location}</p>
                </div>
            </div>
        </footer>
    );
}
