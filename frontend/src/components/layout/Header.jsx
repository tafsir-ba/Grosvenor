import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Instagram, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import Logo from "@/components/brand/Logo";
import { NAV, PROJECT, LEAD_TYPE } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";
import { cn } from "@/lib/utils";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const atTop = !scrolled;
    // White logo/text at the top over the hero scrim; blue once scrolled.
    const lightTone = atTop;
    const tone = lightTone ? "text-white" : "text-brand-blue";

    return (
        <header
            data-testid="site-header"
            className={cn(
                "fixed top-0 z-40 w-full transition-colors duration-500",
                atTop ? "bg-transparent" : "border-b border-border bg-white/95 backdrop-blur-xl"
            )}
        >
            <div className={cn("container-x flex items-center justify-between transition-all duration-500", atTop ? "h-28" : "h-20")}>
                {/* Left: Menu drawer */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button data-testid="menu-trigger" className={cn("flex items-center gap-3 transition-colors", tone)}>
                            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-current">
                                <Menu className="h-5 w-5" />
                            </span>
                            <span className="hidden text-xs font-medium uppercase tracking-[0.22em] sm:inline">Menu</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full border-none bg-brand-blue p-0 text-white sm:max-w-md" data-testid="menu-drawer">
                        <div className="flex h-full flex-col p-10">
                            <div className="mb-12 flex items-center justify-between">
                                <Logo color="white" layout="horizontal" className="h-10" />
                                <SheetClose asChild>
                                    <button data-testid="menu-close" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30"><X className="h-5 w-5" /></button>
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
                    <Logo color={lightTone ? "white" : "blue"} layout="horizontal" className="h-9 w-auto md:h-11" />
                </Link>

                {/* Right: Instagram + Contact */}
                <div className="flex items-center gap-5">
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        data-testid="header-instagram"
                        className={cn("transition-colors hover:text-brand-gold", tone)}
                    >
                        <Instagram className="h-5 w-5" />
                    </a>
                    <Link
                        to="/contact"
                        data-testid="header-contact"
                        className={cn(
                            "rounded-full border px-7 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-300",
                            lightTone ? "border-white/50 text-white hover:bg-white hover:text-brand-blue" : "border-brand-blue/40 text-brand-blue hover:bg-brand-blue hover:text-white"
                        )}
                    >
                        Contact
                    </Link>
                </div>
            </div>
        </header>
    );
}
