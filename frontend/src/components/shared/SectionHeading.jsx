import { cn } from "@/lib/utils";

// Big, bold titles only — no small overline labels.
export default function SectionHeading({ title, titleAccent, subtitle, align = "left", light = false, className = "" }) {
    return (
        <div className={cn(align === "center" && "mx-auto text-center", "max-w-5xl", className)}>
            <h2 className={cn("display text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]", light ? "text-white" : "text-brand-blue")}>
                {title} {titleAccent && <span className={light ? "text-white/60" : "text-brand-gold"}>{titleAccent}</span>}
            </h2>
            {subtitle && (
                <p className={cn("mt-7 text-lg leading-relaxed md:text-xl", light ? "text-white/80" : "text-muted-foreground", align === "center" && "mx-auto max-w-2xl")}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
