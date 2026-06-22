import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatPrice, formatSurface, floorLabel } from "@/lib/format";
import { BUILDINGS } from "@/lib/constants";

function shortBuilding(value) {
    return BUILDINGS.find((b) => b.value === value)?.short || value;
}

// Clean borderless unit row — no overline labels.
export default function UnitCard({ unit }) {
    const sold = unit.status === "sold";
    return (
        <Link
            to={`/residences/${unit.slug}`}
            data-testid={`unit-card-${unit.slug}`}
            className="group flex flex-col gap-4 py-8 transition-all duration-300 hover:pl-4 md:flex-row md:items-center md:justify-between"
        >
            <div className="flex items-baseline gap-5">
                <h3 className="font-display text-4xl font-light text-brand-blue transition-colors group-hover:text-brand-gold md:text-5xl">
                    {unit.unit_number}
                </h3>
                <span className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{shortBuilding(unit.building)} · {floorLabel(unit.floor)}</span>
            </div>

            <div className="flex items-center gap-8 md:gap-12">
                <span className="text-base text-brand-ink">{formatSurface(unit.total_surface)}</span>
                <span className="hidden text-sm text-muted-foreground sm:inline">+{formatSurface(unit.balcony_surface)} balcony</span>
                <span className="min-w-[120px] font-display text-xl text-brand-ink">{sold ? "—" : formatPrice(unit.price, unit.currency)}</span>
                <StatusBadge status={unit.status} />
                <ArrowUpRight className="hidden h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-gold lg:block" />
            </div>
        </Link>
    );
}
