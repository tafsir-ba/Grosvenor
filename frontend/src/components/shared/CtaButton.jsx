import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Shared CTA button. variant: primary (gold) | secondary (blue) | outline | ghost-light
const VARIANTS = {
    primary: "bg-brand-gold text-white hover:bg-brand-gold/90",
    secondary: "bg-brand-blue text-white hover:bg-brand-blue/90",
    outline: "border border-brand-blue/30 text-brand-blue hover:bg-brand-blue hover:text-white",
    "outline-light": "border border-white/40 text-white hover:bg-white hover:text-brand-ink",
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
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none px-8 py-4 text-base font-medium uppercase tracking-[0.12em] transition-colors duration-300",
        VARIANTS[variant],
        className
    );
    if (to) return <Link to={to} className={classes} onClick={onClick} {...rest}>{children}</Link>;
    if (href) return <a href={href} className={classes} onClick={onClick} {...rest}>{children}</a>;
    return <button type={type} className={classes} onClick={onClick} {...rest}>{children}</button>;
}
