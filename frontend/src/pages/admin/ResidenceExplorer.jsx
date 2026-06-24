import { useEffect, useMemo, useState } from "react";
import { ChevronRight, ChevronLeft, RotateCcw, Download, BedDouble, Bath, Maximize2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import LeadForm from "@/components/shared/LeadForm";
import CtaButton from "@/components/shared/CtaButton";
import ExplorerMap from "@/components/admin/ExplorerMap";
import { useUnits } from "@/hooks/useData";
import { formatPrice, formatSurface, unitFloor } from "@/lib/format";
import { BUILDINGS, LEAD_TYPE } from "@/lib/constants";
import { getUnitType, FULL_PLANS_URL } from "@/lib/explorerData";
import { cn } from "@/lib/utils";

const TYPE_OPTS = ["2 Bedroom Residence", "3 Bedroom Residence — Type B", "3 Bedroom Residence — Type C", "3 Bedroom Penthouse — Type A", "3 Bedroom Penthouse — Type C", "3 Bedroom Penthouse — Type D", "4 Bedroom Townhouse"];

function short(b) { return BUILDINGS.find((x) => x.value === b)?.short || b; }

export default function ResidenceExplorer() {
    const { units, loading } = useUnits({ sort: "building" });
    const [slug, setSlug] = useState(null);
    const [statusF, setStatusF] = useState("all");
    const [typeF, setTypeF] = useState("all");
    const [planIdx, setPlanIdx] = useState(null);
    const [mapView, setMapView] = useState("aerial");
    const [resetSignal, setResetSignal] = useState(0);

    useEffect(() => {
        document.title = "Residence Explorer — Grosvenor Vistas (Internal)";
        const m = document.createElement("meta");
        m.name = "robots"; m.content = "noindex, nofollow";
        document.head.appendChild(m);
        return () => { document.head.removeChild(m); };
    }, []);

    const enriched = useMemo(() => units.map((u) => ({ ...u, type: getUnitType(u) })), [units]);
    const pass = (u) => (statusF === "all" || u.status === statusF) && (typeF === "all" || u.type.typeName === typeF);
    const selected = enriched.find((u) => u.slug === slug) || null;

    const reset = () => { setSlug(null); setStatusF("all"); setTypeF("all"); setResetSignal((s) => s + 1); };

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
                    <button onClick={reset} className="hover:text-brand-gold">Site View</button>
                    {selected && (<><ChevronRight className="h-3.5 w-3.5" /><span className="text-brand-ink">{short(selected.building)} · Residence {selected.unit_number}</span></>)}
                </div>
            </div>

            <div className={cn("grid gap-8 px-6 py-8 md:px-10", mapView !== "aerial" && "lg:grid-cols-[1.4fr_1fr]")}>
                {/* Selector column */}
                <div data-testid="explorer-selector">
                    <ExplorerMap units={enriched} selectedSlug={slug} onSelect={(u) => setSlug(u.slug)} pass={pass} onViewChange={setMapView} resetSignal={resetSignal} />
                </div>

                {/* Detail panel */}
                {mapView !== "aerial" && (
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
                                    {selected.type.floorPlans.map((fp, i) => (
                                        <button key={fp.label} onClick={() => setPlanIdx(i)} data-testid={`floorplan-${fp.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="group relative overflow-hidden rounded-xl border border-brand-beige bg-white">
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
                )}
            </div>

            <Dialog open={planIdx !== null} onOpenChange={(v) => !v && setPlanIdx(null)}>
                <DialogContent className="max-h-[92vh] max-w-5xl overflow-auto p-4" data-testid="floorplan-modal">
                    {planIdx !== null && selected && (() => {
                        const plans = selected.type.floorPlans;
                        const fp = plans[planIdx];
                        const multi = plans.length > 1;
                        const go = (d) => setPlanIdx((i) => (i + d + plans.length) % plans.length);
                        return (
                            <>
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="font-sans text-sm uppercase tracking-[0.16em] text-brand-ink/55">{fp.label}{multi ? ` · ${planIdx + 1} / ${plans.length}` : ""}</p>
                                    {multi && (
                                        <div className="mr-8 flex items-center gap-2">
                                            <button onClick={() => go(-1)} data-testid="floorplan-prev" aria-label="Previous floor" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-ink/15 text-brand-ink/70 transition-colors hover:border-brand-gold hover:text-brand-gold"><ChevronLeft className="h-4 w-4" /></button>
                                            <button onClick={() => go(1)} data-testid="floorplan-next" aria-label="Next floor" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-ink/15 text-brand-ink/70 transition-colors hover:border-brand-gold hover:text-brand-gold"><ChevronRight className="h-4 w-4" /></button>
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <img src={fp.image} alt={fp.label} className="w-full object-contain" />
                                    {multi && (
                                        <>
                                            <button onClick={() => go(-1)} aria-label="Previous floor" className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-ink/55 text-white backdrop-blur transition-colors hover:bg-brand-gold"><ChevronLeft className="h-5 w-5" /></button>
                                            <button onClick={() => go(1)} aria-label="Next floor" className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-brand-ink/55 text-white backdrop-blur transition-colors hover:bg-brand-gold"><ChevronRight className="h-5 w-5" /></button>
                                        </>
                                    )}
                                </div>
                                {multi && (
                                    <div className="mt-3 flex flex-wrap justify-center gap-2" data-testid="floorplan-thumbs">
                                        {plans.map((p, i) => (
                                            <button key={p.label} onClick={() => setPlanIdx(i)} className={cn("rounded-full border px-3 py-1.5 font-sans text-xs transition-colors", i === planIdx ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/15 text-brand-ink/60 hover:border-brand-gold")}>{p.label}</button>
                                        ))}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
