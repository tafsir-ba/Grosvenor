import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatUnitListPrice, formatSurface, unitFloor } from "@/lib/format";
import { BUILDINGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function shortBuilding(value) {
    return BUILDINGS.find((b) => b.value === value)?.short || value;
}

// Clean borderless unit row — no overline labels.
export default function UnitCard({ unit, highlighted = false }) {
    const living = unit.living_area ?? unit.total_surface;
    return (
        <Link
            id={highlighted ? "selected-residence" : undefined}
            to={`/residences/${unit.slug}`}
            data-testid={`unit-card-${unit.slug}`}
            className={cn(
                "group relative flex flex-col gap-4 py-8 transition-all duration-300 md:flex-row md:items-center md:justify-between",
                highlighted
                    ? "z-[1] border-l-4 border-brand-gold bg-brand-gold/10 px-4 shadow-[inset_0_0_0_1px_rgba(198,134,43,0.25)] md:px-6"
                    : "hover:pl-4",
            )}
        >
            <div className="flex items-baseline gap-5">
                <h3 className={cn(
                    "font-display text-4xl font-light transition-colors md:text-5xl",
                    highlighted ? "text-brand-gold" : "text-brand-blue group-hover:text-brand-gold",
                )}>
                    {unit.unit_number}
                </h3>
                <span className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{shortBuilding(unit.building)} · {unitFloor(unit)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 md:gap-10">
                <span className="text-base text-brand-ink">{formatSurface(unit.total_surface)} <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">total</span></span>
                <span className="hidden text-sm text-muted-foreground lg:inline">{formatSurface(living)} living</span>
                <span className="hidden text-sm text-muted-foreground sm:inline">+{formatSurface(unit.balcony_surface)} balcony</span>
                <span className="min-w-[120px] font-display text-xl text-brand-ink">{formatUnitListPrice(unit)}</span>
                <StatusBadge status={unit.status} />
                {highlighted ? (
                    <span
                        data-testid={`unit-card-cta-${unit.slug}`}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-2.5 font-sans text-sm font-medium text-white shadow-[0_8px_24px_rgba(198,134,43,0.35)] transition-opacity group-hover:opacity-90"
                    >
                        View this residence <ArrowRight className="h-4 w-4" />
                    </span>
                ) : (
                    <ArrowUpRight className="hidden h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-gold lg:block" />
                )}
            </div>
        </Link>
    );
}
