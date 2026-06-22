import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatPrice, formatSurface, floorLabel } from "@/lib/format";
import { BUILDINGS } from "@/lib/constants";

function shortBuilding(value) {
    return BUILDINGS.find((b) => b.value === value)?.short || value;
}

// Borderless editorial unit row — no boxes. Pure facts.
export default function UnitCard({ unit }) {
    const sold = unit.status === "sold";
    return (
        <Link
            to={`/residences/${unit.slug}`}
            data-testid={`unit-card-${unit.slug}`}
            className="group grid grid-cols-2 items-center gap-4 border-t border-border py-7 transition-colors duration-300 hover:bg-muted/40 md:grid-cols-12 md:gap-6 md:py-8"
        >
            <div className="md:col-span-3">
                <p className="overline text-brand-gold">{shortBuilding(unit.building)}</p>
                <h3 className="mt-2 font-display text-3xl font-light text-brand-blue md:text-4xl">{unit.unit_number}</h3>
            </div>
            <div className="md:col-span-2">
                <p className="overline text-muted-foreground">Floor</p>
                <p className="mt-1 text-brand-ink">{floorLabel(unit.floor)}</p>
            </div>
            <div className="md:col-span-2">
                <p className="overline text-muted-foreground">Surface</p>
                <p className="mt-1 text-brand-ink">{formatSurface(unit.total_surface)}</p>
            </div>
            <div className="md:col-span-2">
                <p className="overline text-muted-foreground">Balcony</p>
                <p className="mt-1 text-brand-ink">{formatSurface(unit.balcony_surface)}</p>
            </div>
            <div className="md:col-span-2">
                <p className="overline text-muted-foreground">Price</p>
                <p className="mt-1 font-display text-lg text-brand-ink">{sold ? "—" : formatPrice(unit.price, unit.currency)}</p>
            </div>
            <div className="flex items-center justify-end gap-4 md:col-span-1">
                <StatusBadge status={unit.status} />
                <ArrowUpRight className="hidden h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-gold md:block" />
            </div>
        </Link>
    );
}
