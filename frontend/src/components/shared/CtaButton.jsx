import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Shared CTA. Primary = soft champagne-gold pill. Secondary/outline = thin minimal border.
const VARIANTS = {
    primary: "bg-brand-gold text-white hover:bg-brand-gold/90 hover:shadow-[0_10px_34px_rgba(198,134,43,0.35)]",
    secondary: "bg-brand-blue text-white hover:bg-brand-blue/90",
    outline: "border border-brand-ink/25 text-brand-ink hover:border-brand-ink hover:bg-brand-ink/[0.04]",
    "outline-light": "border border-white/50 text-white hover:bg-white/10",
    white: "bg-white text-brand-blue hover:bg-white/90",
};

export default function CtaButton({
    children,
    variant = "primary",
    to,
    href,
    onClick,
    className = "",
    type = "button",
    ...rest
}) {
    const classes = cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-9 py-3.5 text-[0.95rem] font-medium tracking-wide transition-all duration-300",
        VARIANTS[variant],
        className
    );
    if (to) return <Link to={to} className={classes} onClick={onClick} {...rest}>{children}</Link>;
    if (href) return <a href={href} className={classes} onClick={onClick} {...rest}>{children}</a>;
    return <button type={type} className={classes} onClick={onClick} {...rest}>{children}</button>;
}
