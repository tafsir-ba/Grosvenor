import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
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
            to={`/residences/${unit.slug}`}
            data-testid={`unit-card-${unit.slug}`}
            className={cn(
                "group flex flex-col gap-4 py-8 transition-all duration-300 md:flex-row md:items-center md:justify-between",
                highlighted
                    ? "border-l-4 border-brand-gold bg-brand-gold/5 pl-4 md:pl-6"
                    : "hover:pl-4",
            )}
        >
            <div className="flex items-baseline gap-5">
                <h3 className="font-display text-4xl font-light text-brand-blue transition-colors group-hover:text-brand-gold md:text-5xl">
                    {unit.unit_number}
                </h3>
                <span className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{shortBuilding(unit.building)} · {unitFloor(unit)}</span>
            </div>

            <div className="flex items-center gap-8 md:gap-10">
                <span className="text-base text-brand-ink">{formatSurface(unit.total_surface)} <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">total</span></span>
                <span className="hidden text-sm text-muted-foreground lg:inline">{formatSurface(living)} living</span>
                <span className="hidden text-sm text-muted-foreground sm:inline">+{formatSurface(unit.balcony_surface)} balcony</span>
                <span className="min-w-[120px] font-display text-xl text-brand-ink">{formatUnitListPrice(unit)}</span>
                <StatusBadge status={unit.status} />
                <ArrowUpRight className="hidden h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-gold lg:block" />
            </div>
        </Link>
    );
}
