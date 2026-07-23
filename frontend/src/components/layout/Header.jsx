import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Instagram, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
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
                        <button
                            type="button"
                            data-testid="menu-trigger"
                            aria-label="Open menu"
                            className="group flex items-center gap-3.5 text-brand-ink"
                        >
                            <span className="flex flex-col items-start gap-[6px]" aria-hidden="true">
                                <span className="h-px w-7 bg-current transition-all duration-300 group-hover:w-4" />
                                <span className="h-px w-7 bg-current" />
                                <span className="h-px w-7 bg-current transition-all duration-300 group-hover:w-5" />
                            </span>
                            <span className="hidden text-[0.72rem] font-medium uppercase tracking-[0.3em] sm:inline">Menu</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full border-none bg-brand-warm p-0 text-brand-ink [&>button]:hidden sm:max-w-lg" data-testid="menu-drawer">
                        <div className="flex h-full flex-col px-8 py-10 md:px-14 md:py-12">
                            <div className="mb-auto flex items-center justify-between">
                                <img src="/brand/header-gold.svg" alt="Grosvenor Vistas" className="h-24 w-auto md:h-32" />
                                <SheetClose asChild>
                                    <button data-testid="menu-close" className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-ink/20 text-brand-ink transition-colors hover:border-brand-gold hover:text-brand-gold"><X className="h-5 w-5" /></button>
                                </SheetClose>
                            </div>
                            <nav className="flex flex-col py-10">
                                {NAV.map((item, i) => (
                                    <SheetClose asChild key={item.to}>
                                        <NavLink
                                            to={item.to}
                                            data-testid={`nav-${item.to.replace("/", "")}`}
                                            className={({ isActive }) =>
                                                cn("group flex items-baseline gap-5 py-2 transition-colors", isActive ? "text-brand-gold" : "text-brand-blue hover:text-brand-gold")
                                            }
                                        >
                                            <span className="lux-eyebrow w-6 text-brand-gold/60">0{i + 1}</span>
                                            <span className="lux-title text-2xl font-light leading-none md:text-3xl">{item.label}</span>
                                        </NavLink>
                                    </SheetClose>
                                ))}
                            </nav>
                            <div className="mt-auto space-y-1.5 border-t border-brand-beige pt-8 font-sans text-sm text-brand-ink/60">
                                <a href={PROJECT.contact.emailHref} className="block transition-colors hover:text-brand-gold">{PROJECT.contact.email}</a>
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
                    {PROJECT.social?.instagram ? (
                        <a
                            href={PROJECT.social.instagram}
                            target="_blank"
                            rel="noreferrer"
                            data-testid="header-instagram"
                            aria-label="Instagram"
                            className="hidden text-brand-ink transition-colors hover:text-brand-gold sm:inline-flex"
                        >
                            <Instagram className="h-5 w-5" />
                        </a>
                    ) : null}
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
