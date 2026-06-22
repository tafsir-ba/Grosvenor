import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import Logo from "@/components/brand/Logo";
import CtaButton from "@/components/shared/CtaButton";
import { NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const overHero = location.pathname === "/" && !scrolled;

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
                "fixed top-0 z-40 w-full transition-colors duration-300",
                overHero ? "bg-transparent" : "border-b border-border bg-background/90 backdrop-blur-xl"
            )}
        >
            <div className="container-x flex h-20 items-center justify-between">
                <Link to="/" data-testid="header-logo-link" className="flex items-center">
                    <Logo color={overHero ? "white" : "blue"} layout="horizontal" className="h-9 w-auto md:h-10" />
                </Link>

                <nav className="hidden items-center gap-6 xl:flex">
                    {NAV.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            data-testid={`nav-${item.to.replace("/", "")}`}
                            className={({ isActive }) =>
                                cn(
                                    "link-underline whitespace-nowrap text-[13px] font-medium transition-colors",
                                    overHero ? "text-white/90 hover:text-white" : "text-brand-ink hover:text-brand-gold",
                                    isActive && !overHero && "text-brand-gold"
                                )
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <CtaButton to="/contact" variant={overHero ? "outline-light" : "primary"} className="hidden md:inline-flex" data-testid="header-cta">
                        Book a Visit
                    </CtaButton>

                    <Sheet>
                        <SheetTrigger asChild>
                            <button data-testid="mobile-menu-trigger" aria-label="Open menu" className={cn("xl:hidden", overHero ? "text-white" : "text-brand-ink")}>
                                <Menu className="h-7 w-7" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] bg-background" data-testid="mobile-menu">
                            <div className="mb-8 mt-2"><Logo color="blue" className="h-9" /></div>
                            <nav className="flex flex-col gap-1">
                                {NAV.map((item) => (
                                    <SheetClose asChild key={item.to}>
                                        <NavLink
                                            to={item.to}
                                            data-testid={`mobile-nav-${item.to.replace("/", "")}`}
                                            className={({ isActive }) =>
                                                cn("rounded-sm px-3 py-3 text-base font-medium text-brand-ink hover:bg-muted", isActive && "text-brand-gold")
                                            }
                                        >
                                            {item.label}
                                        </NavLink>
                                    </SheetClose>
                                ))}
                                <SheetClose asChild>
                                    <CtaButton to="/contact" variant="primary" className="mt-5">Book a Visit</CtaButton>
                                </SheetClose>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
