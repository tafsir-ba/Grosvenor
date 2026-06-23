import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Instagram, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import Logo from "@/components/brand/Logo";
import { NAV, PROJECT } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            data-testid="site-header"
            className={cn(
                "fixed top-0 z-40 w-full transition-all duration-500",
                scrolled ? "bg-brand-warm/85 shadow-[0_12px_50px_rgba(74,69,63,0.08)] backdrop-blur-xl" : "bg-transparent"
            )}
        >
            <div className={cn("container-x flex items-center justify-between transition-all duration-500", scrolled ? "h-20 md:h-24" : "h-28 md:h-32")}>
                {/* Left: Menu */}
                <Sheet>
                    <SheetTrigger asChild>
                        <button data-testid="menu-trigger" className="group flex items-center gap-3.5 text-brand-ink">
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
                                    <button data-testid="menu-close" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 transition-colors hover:border-brand-gold hover:text-brand-gold"><X className="h-5 w-5" /></button>
                                </SheetClose>
                            </div>
                            <nav className="flex flex-1 flex-col justify-center gap-1">
                                {NAV.map((item, i) => (
                                    <SheetClose asChild key={item.to}>
                                        <NavLink
                                            to={item.to}
                                            data-testid={`nav-${item.to.replace("/", "")}`}
                                            className={({ isActive }) =>
                                                cn("lux-title text-4xl font-light tracking-tight transition-colors hover:text-brand-gold md:text-5xl", isActive ? "text-brand-gold" : "text-white")
                                            }
                                        >
                                            <span className="mr-3 align-top font-sans text-xs text-white/40">0{i + 1}</span>{item.label}
                                        </NavLink>
                                    </SheetClose>
                                ))}
                            </nav>
                            <div className="mt-10 space-y-1 border-t border-white/15 pt-8 font-sans text-sm text-white/70">
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
                        src="/brand/header-gold.svg"
                        alt="Grosvenor Vistas"
                        data-testid="brand-logo"
                        className={cn("w-auto transition-all duration-500", scrolled ? "h-12 md:h-16" : "h-20 md:h-28")}
                    />
                </Link>

                {/* Right: Instagram + Book a Visit pill */}
                <div className="flex items-center gap-5 md:gap-7">
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        data-testid="header-instagram"
                        aria-label="Instagram"
                        className="hidden text-brand-ink transition-colors hover:text-brand-gold sm:inline-flex"
                    >
                        <Instagram className="h-5 w-5" />
                    </a>
                    <Link
                        to="/contact"
                        data-testid="header-contact"
                        className="rounded-full bg-brand-gold px-7 py-3 text-[0.9rem] font-medium tracking-wide text-white transition-all duration-300 hover:bg-brand-gold/90 hover:shadow-[0_10px_30px_rgba(198,134,43,0.35)]"
                    >
                        Book a Visit
                    </Link>
                </div>
            </div>
        </header>
    );
}
