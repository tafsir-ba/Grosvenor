import { cn } from "@/lib/utils";

export default function SectionHeading({ overline, title, subtitle, align = "left", light = false, className = "" }) {
    return (
        <div className={cn(align === "center" && "text-center mx-auto max-w-2xl", "max-w-3xl", className)}>
            {overline && (
                <p className={cn("overline mb-4", light ? "text-brand-gold" : "text-brand-gold")}>{overline}</p>
            )}
            <h2 className={cn("font-display text-3xl leading-tight md:text-5xl", light ? "text-white" : "text-brand-ink")}>
                {title}
            </h2>
            {subtitle && (
                <p className={cn("mt-5 text-base leading-relaxed md:text-lg", light ? "text-white/80" : "text-muted-foreground")}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
