import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Instagram, X, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import Logo from "@/components/brand/Logo";
import { NAV, PROJECT, LEAD_TYPE } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";
import { cn } from "@/lib/utils";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const atTop = !scrolled;
    const lightTone = atTop;
    const tone = lightTone ? "text-white" : "text-brand-blue";

    return (
        <header
            data-testid="site-header"
            className={cn(
                "fixed top-0 z-40 w-full transition-all duration-500",
                atTop ? "bg-transparent" : "border-b border-border bg-white/90 shadow-[0_1px_40px_rgba(15,40,70,0.07)] backdrop-blur-xl"
            )}
        >
            {/* Gold hairline accent */}
            <div className={cn("h-[2px] w-full bg-brand-gold transition-opacity duration-500", atTop ? "opacity-60" : "opacity-100")} />

            {/* Concierge utility strip — present only over the hero */}
            <div
                className={cn(
                    "overflow-hidden transition-all duration-500",
                    atTop ? "max-h-12 border-b border-white/15 opacity-100" : "max-h-0 border-b border-transparent opacity-0"
                )}
            >
                <div className="container-x flex h-11 items-center justify-between text-[0.7rem] uppercase tracking-[0.24em] text-white/75">
                    <a
                        href={PROJECT.contact.phoneHref}
                        onClick={() => trackClick(LEAD_TYPE.PHONE_CLICK)}
                        data-testid="header-utility-phone"
                        className="hidden items-center gap-2 transition-colors hover:text-brand-gold sm:flex"
                    >
                        <Phone className="h-3.5 w-3.5" /> {PROJECT.contact.phone}
                    </a>
                    <span className="hidden text-center tracking-[0.3em] md:block">Grosvenor Heights · Manor Park · Kingston 8</span>
                    <a
                        href={PROJECT.contact.emailHref}
                        onClick={() => trackClick(LEAD_TYPE.EMAIL_CLICK)}
                        data-testid="header-utility-email"
                        className="transition-colors hover:text-brand-gold"
                    >
                        {PROJECT.contact.email}
                    </a>
                </div>
            </div>

            {/* Main bar */}
            <div className={cn("container-x flex items-center justify-between transition-all duration-500", atTop ? "h-28 md:h-32" : "h-20 md:h-24")}>
                {/* Left: Menu drawer */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button data-testid="menu-trigger" className={cn("group flex items-center gap-3.5 transition-colors", tone)}>
                            <span className="flex flex-col items-start gap-[6px]">
                                <span className="h-px w-7 bg-current transition-all duration-300 group-hover:w-4" />
                                <span className="h-px w-7 bg-current" />
                                <span className="h-px w-7 bg-current transition-all duration-300 group-hover:w-5" />
                            </span>
                            <span className="hidden text-[0.72rem] font-medium uppercase tracking-[0.3em] sm:inline">Menu</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full border-none bg-brand-blue p-0 text-white sm:max-w-md" data-testid="menu-drawer">
                        <div className="flex h-full flex-col p-10">
                            <div className="mb-12 flex items-center justify-between">
                                <Logo color="white" layout="horizontal" className="h-10" />
                                <SheetClose asChild>
                                    <button data-testid="menu-close" className="flex h-11 w-11 items-center justify-center rounded-none border border-white/30 transition-colors hover:border-brand-gold hover:text-brand-gold"><X className="h-5 w-5" /></button>
                                </SheetClose>
                            </div>
                            <nav className="flex flex-1 flex-col justify-center gap-1">
                                {NAV.map((item, i) => (
                                    <SheetClose asChild key={item.to}>
                                        <NavLink
                                            to={item.to}
                                            data-testid={`nav-${item.to.replace("/", "")}`}
                                            className={({ isActive }) =>
                                                cn("font-display text-3xl font-light tracking-tight transition-colors hover:text-brand-gold md:text-4xl", isActive ? "text-brand-gold" : "text-white")
                                            }
                                        >
                                            <span className="mr-3 align-top text-xs text-white/40">0{i + 1}</span>{item.label}
                                        </NavLink>
                                    </SheetClose>
                                ))}
                            </nav>
                            <div className="mt-10 space-y-1 border-t border-white/15 pt-8 text-sm text-white/70">
                                <a href={PROJECT.contact.phoneHref} className="block hover:text-white">{PROJECT.contact.phone}</a>
                                <a href={PROJECT.contact.emailHref} className="block hover:text-white">{PROJECT.contact.email}</a>
                                <p>{PROJECT.contact.address}</p>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Center: Logo */}
                <Link to="/" data-testid="header-logo-link" className="absolute left-1/2 -translate-x-1/2">
                    <img
                        src={lightTone ? "/brand/header-white.svg" : "/brand/header-gold.svg"}
                        alt="Grosvenor Vistas"
                        data-testid="brand-logo"
                        className={cn("w-auto transition-all duration-500", atTop ? "h-20 md:h-28" : "h-12 md:h-16")}
                    />
                </Link>

                {/* Right: Instagram + Contact */}
                <div className="flex items-center gap-6">
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        data-testid="header-instagram"
                        aria-label="Instagram"
                        className={cn("hidden transition-colors hover:text-brand-gold sm:inline-flex", tone)}
                    >
                        <Instagram className="h-5 w-5" />
                    </a>
                    <Link
                        to="/contact"
                        data-testid="header-contact"
                        className={cn(
                            "group relative overflow-hidden rounded-none border px-7 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.24em] transition-colors duration-300",
                            lightTone ? "border-white/45 text-white" : "border-brand-blue/35 text-brand-blue"
                        )}
                    >
                        <span
                            className={cn(
                                "absolute inset-0 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100",
                                lightTone ? "bg-white" : "bg-brand-blue"
                            )}
                        />
                        <span className={cn("relative transition-colors duration-300", lightTone ? "group-hover:text-brand-blue" : "group-hover:text-white")}>
                            Book a Visit
                        </span>
                    </Link>
                </div>
            </div>
        </header>
    );
}
