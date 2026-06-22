import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Hero from "@/components/shared/Hero";
import UnitCard from "@/components/shared/UnitCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnits } from "@/hooks/useData";
import { BUILDINGS } from "@/lib/constants";

const STATUSES = [
    { value: "all", label: "All Statuses" },
    { value: "available", label: "Available" },
    { value: "reserved", label: "Reserved" },
    { value: "sold", label: "Sold" },
];
const SORTS = [
    { value: "building", label: "Building" },
    { value: "price_asc", label: "Price · Low to High" },
    { value: "price_desc", label: "Price · High to Low" },
    { value: "surface_desc", label: "Largest Surface" },
];

export default function ResidencesPage() {
    const [params, setParams] = useSearchParams();
    const building = params.get("building") || "all";
    const status = params.get("status") || "all";
    const sort = params.get("sort") || "building";

    const query = useMemo(() => {
        const q = { sort };
        if (building !== "all") q.building = building;
        if (status !== "all") q.status = status;
        return q;
    }, [building, status, sort]);

    const { units, loading } = useUnits(query);

    const setParam = (key, value) => {
        const next = new URLSearchParams(params);
        if (value === "all") next.delete(key);
        else next.set(key, value);
        setParams(next);
    };

    return (
        <div data-testid="residences-page">
            <Hero
                image="/gallery/buildings-01.png"
                height="min-h-[52vh]"
                overline="Residences"
                title="Find your residence"
                subtitle="Live availability and pricing across every block."
            />

            <section className="container-x py-16 md:py-20">
                {/* Filters */}
                <div className="mb-10 flex flex-col gap-4 border-b border-border pb-8 md:flex-row md:items-end md:justify-between" data-testid="residence-filters">
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 md:max-w-2xl">
                        <div>
                            <p className="overline mb-2 text-muted-foreground">Building</p>
                            <Select value={building} onValueChange={(v) => setParam("building", v)}>
                                <SelectTrigger data-testid="filter-building"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Buildings</SelectItem>
                                    {BUILDINGS.map((b) => <SelectItem key={b.value} value={b.value}>{b.short}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <p className="overline mb-2 text-muted-foreground">Status</p>
                            <Select value={status} onValueChange={(v) => setParam("status", v)}>
                                <SelectTrigger data-testid="filter-status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <p className="overline mb-2 text-muted-foreground">Sort</p>
                            <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
                                <SelectTrigger data-testid="filter-sort"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid="residence-count">
                        {loading ? "Loading…" : `${units.length} residence${units.length === 1 ? "" : "s"}`}
                    </p>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="border-t border-border">
                        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="my-4 h-16" />)}
                    </div>
                ) : units.length === 0 ? (
                    <p className="py-20 text-center text-muted-foreground" data-testid="no-residences">No residences match your filters.</p>
                ) : (
                    <div className="divide-y divide-border border-y border-border">
                        {units.map((u) => <UnitCard key={u.slug} unit={u} />)}
                    </div>
                )}
            </section>
        </div>
    );
}
