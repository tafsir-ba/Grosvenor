import { useEffect, useMemo, useState } from "react";
import { ChevronRight, RotateCcw, ArrowLeft, Download, BedDouble, Bath, Maximize2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import LeadForm from "@/components/shared/LeadForm";
import CtaButton from "@/components/shared/CtaButton";
import { useUnits } from "@/hooks/useData";
import { formatPrice, formatSurface, unitFloor } from "@/lib/format";
import { BUILDINGS, LEAD_TYPE } from "@/lib/constants";
import { getUnitType, FULL_PLANS_URL } from "@/lib/explorerData";
import { cn } from "@/lib/utils";

const STATUS_DOT = { available: "#2f7d52", reserved: "#C6862B", sold: "#9a948c" };
const TYPE_OPTS = ["2 Bedroom Residence", "3 Bedroom Residence — Type B", "3 Bedroom Residence — Type C", "3 Bedroom Penthouse — Type A", "3 Bedroom Penthouse — Type C", "3 Bedroom Penthouse — Type D", "4 Bedroom Townhouse"];

function short(b) { return BUILDINGS.find((x) => x.value === b)?.short || b; }

export default function ResidenceExplorer() {
    const { units, loading } = useUnits({ sort: "building" });
    const [building, setBuilding] = useState(null);
    const [floor, setFloor] = useState(null);
    const [slug, setSlug] = useState(null);
    const [statusF, setStatusF] = useState("all");
    const [typeF, setTypeF] = useState("all");
    const [planOpen, setPlanOpen] = useState(null);

    useEffect(() => {
        document.title = "Residence Explorer — Grosvenor Vistas (Internal)";
        const m = document.createElement("meta");
        m.name = "robots"; m.content = "noindex, nofollow";
        document.head.appendChild(m);
        return () => { document.head.removeChild(m); };
    }, []);

    const enriched = useMemo(() => units.map((u) => ({ ...u, type: getUnitType(u) })), [units]);
    const pass = (u) => (statusF === "all" || u.status === statusF) && (typeF === "all" || u.type.typeName === typeF);

    const buildingUnits = useMemo(() => enriched.filter((u) => u.building === building && pass(u)), [enriched, building, statusF, typeF]);
    const floors = useMemo(() => {
        const seen = new Map();
        buildingUnits.forEach((u) => { if (!seen.has(u.floor)) seen.set(u.floor, unitFloor(u)); });
        return [...seen.entries()].sort((a, b) => a[0] - b[0]);
    }, [buildingUnits]);
    const floorUnits = buildingUnits.filter((u) => u.floor === floor).sort((a, b) => a.unit_number.localeCompare(b.unit_number));
    const selected = enriched.find((u) => u.slug === slug) || null;

    const reset = () => { setBuilding(null); setFloor(null); setSlug(null); setStatusF("all"); setTypeF("all"); };
    const pickBuilding = (b) => { setBuilding(b); setFloor(null); setSlug(null); };

    const leadCtx = selected ? {
        unit: selected.unit_number, building: short(selected.building), collection: selected.type.typeName,
        residence_type: selected.type.typeName, unit_floor: unitFloor(selected),
        unit_surface: selected.total_surface, unit_living: selected.living_area, unit_balcony: selected.balcony_surface,
        unit_status: selected.status,
    } : {};

    return (
        <div className="min-h-screen bg-brand-warm" data-testid="residence-explorer">
            <div className="border-b border-brand-beige bg-brand-warm/90 px-6 py-5 backdrop-blur md:px-10">
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-brand-gold">Internal Sales Tool · Not Public</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                    <h1 className="lux-title text-3xl text-brand-blue md:text-4xl">Residence Explorer</h1>
                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={statusF} onValueChange={setStatusF}><SelectTrigger className="h-9 w-36" data-testid="filter-status"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="available">Available</SelectItem><SelectItem value="reserved">Reserved</SelectItem><SelectItem value="sold">Sold</SelectItem></SelectContent></Select>
                        <Select value={typeF} onValueChange={setTypeF}><SelectTrigger className="h-9 w-52" data-testid="filter-type"><SelectValue placeholder="Type" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">All types</SelectItem>{TYPE_OPTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
                        <button onClick={reset} data-testid="explorer-reset" className="inline-flex items-center gap-2 rounded-full border border-brand-ink/15 px-4 py-2 font-sans text-sm text-brand-ink/70 transition-colors hover:border-brand-gold hover:text-brand-gold"><RotateCcw className="h-3.5 w-3.5" /> Reset</button>
                    </div>
                </div>
                {/* Breadcrumbs */}
                <div className="mt-4 flex flex-wrap items-center gap-2 font-sans text-sm text-brand-ink/55" data-testid="explorer-breadcrumb">
                    <button onClick={reset} className="hover:text-brand-gold">All Buildings</button>
                    {building && (<><ChevronRight className="h-3.5 w-3.5" /><button onClick={() => { setFloor(null); setSlug(null); }} className="hover:text-brand-gold">{short(building)}</button></>)}
                    {floor != null && (<><ChevronRight className="h-3.5 w-3.5" /><button onClick={() => setSlug(null)} className="hover:text-brand-gold">{floors.find((f) => f[0] === floor)?.[1] || `Floor ${floor}`}</button></>)}
                    {selected && (<><ChevronRight className="h-3.5 w-3.5" /><span className="text-brand-ink">Residence {selected.unit_number}</span></>)}
                </div>
            </div>

            <div className="grid gap-8 px-6 py-8 md:px-10 lg:grid-cols-[1.4fr_1fr]">
                {/* Selector column */}
                <div data-testid="explorer-selector">
                    {!building && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {BUILDINGS.map((b) => {
                                const n = enriched.filter((u) => u.building === b.value && pass(u)).length;
                                const avail = enriched.filter((u) => u.building === b.value && u.status === "available").length;
                                return (
                                    <button key={b.value} onClick={() => pickBuilding(b.value)} data-testid={`explorer-building-${b.short.toLowerCase().replace(/ /g, "-")}`} className="flex items-center justify-between rounded-2xl border border-brand-beige bg-brand-ivory p-7 text-left transition-all hover:shadow-[0_12px_30px_rgba(74,69,63,0.12)]">
                                        <div><h3 className="lux-title text-2xl text-brand-blue">{b.short}</h3><p className="mt-1 font-sans text-xs uppercase tracking-[0.14em] text-brand-ink/45">{b.block}</p></div>
                                        <div className="text-right"><p className="font-display text-4xl text-brand-gold">{n}</p><p className="font-sans text-xs text-brand-ink/55">{avail} available</p></div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {building && (
                        <div>
                            <button onClick={() => pickBuilding(null) || setBuilding(null)} data-testid="explorer-back" className="mb-5 inline-flex items-center gap-2 font-sans text-sm text-brand-ink/60 hover:text-brand-gold"><ArrowLeft className="h-4 w-4" /> Back</button>
                            <div className="mb-6 flex flex-wrap gap-2.5" data-testid="explorer-floors">
                                {floors.map(([f, label]) => (
                                    <button key={f} onClick={() => { setFloor(f); setSlug(null); }} data-testid={`explorer-floor-${f}`} className={cn("rounded-full border px-4 py-2 font-sans text-sm transition-colors", floor === f ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/15 text-brand-ink/70 hover:border-brand-gold")}>{label}</button>
                                ))}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" data-testid="explorer-units">
                                {(floor != null ? floorUnits : buildingUnits).map((u) => (
                                    <button key={u.slug} onClick={() => { setFloor(u.floor); setSlug(u.slug); }} data-testid={`explorer-unit-${u.slug}`} className={cn("rounded-xl border bg-brand-ivory p-4 text-left transition-all hover:shadow-md", slug === u.slug ? "border-brand-gold ring-1 ring-brand-gold" : "border-brand-beige")}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-display text-2xl text-brand-blue">{u.unit_number}</span>
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_DOT[u.status] }} />
                                        </div>
                                        <p className="mt-1 font-sans text-xs text-brand-ink/55">{u.type.bedrooms} bed · {formatSurface(u.total_surface)}</p>
                                        <p className="font-sans text-sm text-brand-ink/80">{u.status === "sold" ? "Sold" : formatPrice(u.price, u.currency)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Detail panel */}
                <div className="lg:sticky lg:top-6 lg:self-start" data-testid="explorer-detail">
                    {!selected ? (
                        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-brand-beige text-center font-sans text-sm text-brand-ink/45">{loading ? "Loading inventory…" : "Select a residence to view full details."}</div>
                    ) : (
                        <div className="rounded-2xl border border-brand-beige bg-brand-ivory p-7 md:p-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-sans text-xs uppercase tracking-[0.16em] text-brand-ink/45">{short(selected.building)} · {unitFloor(selected)}</p>
                                    <h2 className="lux-title mt-1 text-3xl text-brand-blue">Residence {selected.unit_number}</h2>
                                    <p className="mt-1 font-sans text-sm text-brand-gold">{selected.type.typeName}</p>
                                </div>
                                <StatusBadge status={selected.status} />
                            </div>

                            <div className="mt-5 flex flex-wrap gap-5 border-y border-brand-beige py-4 font-sans text-sm text-brand-ink/75">
                                <span className="inline-flex items-center gap-2"><BedDouble className="h-4 w-4 text-brand-gold" /> {selected.type.bedrooms} Bed</span>
                                <span className="inline-flex items-center gap-2"><Bath className="h-4 w-4 text-brand-gold" /> {selected.type.bathrooms} Bath</span>
                            </div>

                            <dl className="mt-4 space-y-2.5">
                                {[["Total Surface", formatSurface(selected.total_surface)], ["Living Area", formatSurface(selected.living_area ?? selected.total_surface)], ["Balcony", formatSurface(selected.balcony_surface)], ["Price", selected.status === "sold" ? "Now sold" : formatPrice(selected.price, selected.currency)]].map(([l, v]) => (
                                    <div key={l} className="flex items-baseline justify-between"><dt className="font-sans text-xs uppercase tracking-[0.12em] text-brand-ink/45">{l}</dt><dd className="font-display text-lg text-brand-ink">{v}</dd></div>
                                ))}
                            </dl>

                            {/* Floor plans */}
                            <div className="mt-6">
                                <p className="lux-eyebrow text-brand-ink/45">Floor Plan{selected.type.floorPlans.length > 1 ? "s" : ""}</p>
                                <div className="mt-3 grid grid-cols-2 gap-3" data-testid="explorer-floorplans">
                                    {selected.type.floorPlans.map((fp) => (
                                        <button key={fp.label} onClick={() => setPlanOpen(fp)} data-testid={`floorplan-${fp.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="group relative overflow-hidden rounded-xl border border-brand-beige bg-white">
                                            <img src={fp.image} alt={fp.label} loading="lazy" className="h-28 w-full object-contain p-2" />
                                            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-brand-ink/70 py-1 font-sans text-[0.65rem] uppercase tracking-[0.12em] text-white"><Maximize2 className="h-3 w-3" /> {fp.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <a href={FULL_PLANS_URL} target="_blank" rel="noreferrer" data-testid="download-full-plans" className="mt-3 inline-flex items-center gap-2 font-sans text-sm text-brand-gold hover:text-brand-ink"><Download className="h-4 w-4" /> Download full plan set (PDF)</a>
                            </div>

                            {/* Room breakdown */}
                            <div className="mt-6">
                                <p className="lux-eyebrow text-brand-ink/45">Room Breakdown</p>
                                <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5" data-testid="explorer-rooms">
                                    {selected.type.rooms.map((r) => <li key={r} className="font-sans text-sm text-brand-ink/70">{r}</li>)}
                                </ul>
                            </div>

                            {/* Inquiry */}
                            <div className="mt-7 border-t border-brand-beige pt-6" data-testid="explorer-inquiry">
                                <p className="lux-eyebrow text-brand-ink/45">Register Interest</p>
                                <p className="mt-1 font-sans text-sm text-brand-ink/55">Inquiry for Residence {selected.unit_number}.</p>
                                <div className="mt-4">
                                    <LeadForm leadType={LEAD_TYPE.SALES_EXPLORER} ctx={leadCtx} submitLabel="Submit Inquiry" fields={["first_name", "last_name", "phone", "email", "message"]} messagePlaceholder={`Notes about Residence ${selected.unit_number}…`} testIdPrefix="explorer-lead" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={!!planOpen} onOpenChange={(v) => !v && setPlanOpen(null)}>
                <DialogContent className="max-h-[92vh] max-w-5xl overflow-auto p-4" data-testid="floorplan-modal">
                    {planOpen && (<><p className="mb-3 font-sans text-sm uppercase tracking-[0.16em] text-brand-ink/55">{planOpen.label}</p><img src={planOpen.image} alt={planOpen.label} className="w-full object-contain" /></>)}
                </DialogContent>
            </Dialog>
        </div>
    );
}
