import { cn } from "@/lib/utils";

export default function SectionHeading({ overline, title, titleAccent, subtitle, align = "left", light = false, className = "" }) {
    return (
        <div className={cn(align === "center" && "mx-auto text-center", "max-w-4xl", className)}>
            {overline && <p className="overline mb-5 text-brand-gold">{overline}</p>}
            <h2 className={cn("display text-4xl sm:text-5xl lg:text-6xl", light ? "text-white" : "text-brand-blue")}>
                {title} {titleAccent && <span className="text-brand-gold">{titleAccent}</span>}
            </h2>
            {subtitle && (
                <p className={cn("mt-6 text-lg leading-relaxed", light ? "text-white/80" : "text-muted-foreground", align === "center" && "mx-auto max-w-2xl")}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}
