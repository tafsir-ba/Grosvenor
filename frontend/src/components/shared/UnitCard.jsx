import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatPrice, formatSurface, floorLabel } from "@/lib/format";
import { BUILDINGS } from "@/lib/constants";

function shortBuilding(value) {
    return BUILDINGS.find((b) => b.value === value)?.short || value;
}

// Inventory card — pure facts, no bedrooms/bathrooms/images.
export default function UnitCard({ unit }) {
    const sold = unit.status === "sold";
    return (
        <Link
            to={`/residences/${unit.slug}`}
            data-testid={`unit-card-${unit.slug}`}
            className="group flex flex-col justify-between rounded-sm border border-border bg-card p-7 transition-colors duration-300 hover:border-brand-gold"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="overline text-brand-gold">{shortBuilding(unit.building)}</p>
                    <h3 className="mt-2 font-display text-2xl text-brand-ink">{unit.unit_number}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{floorLabel(unit.floor)}</p>
                </div>
                <StatusBadge status={unit.status} />
            </div>

            <div className="mt-7 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
                <div>
                    <p className="overline text-muted-foreground">Total Surface</p>
                    <p className="mt-1 font-medium text-brand-ink">{formatSurface(unit.total_surface)}</p>
                </div>
                <div>
                    <p className="overline text-muted-foreground">Balcony</p>
                    <p className="mt-1 font-medium text-brand-ink">{formatSurface(unit.balcony_surface)}</p>
                </div>
            </div>

            <div className="mt-6 flex items-end justify-between">
                <div>
                    <p className="overline text-muted-foreground">Price</p>
                    <p className="mt-1 font-display text-xl text-brand-blue">
                        {sold ? "—" : formatPrice(unit.price, unit.currency)}
                    </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-brand-gold group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
        </Link>
    );
}
