import { useEffect, useMemo, useState } from "react";
import { ChevronRight, RotateCcw, BedDouble, Bath, FileText, ExternalLink, Loader2, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import LeadForm from "@/components/shared/LeadForm";
import CtaButton from "@/components/shared/CtaButton";
import ExplorerMap from "@/components/admin/ExplorerMap";
import { useUnits } from "@/hooks/useData";
import { api, formatApiError } from "@/lib/api";
import { formatPrice, formatSurface, unitFloor, formatUnitDetailPrice, statusMeta } from "@/lib/format";
import { BUILDINGS, LEAD_TYPE } from "@/lib/constants";
import { getUnitType, EXPLORER_TYPE_OPTIONS } from "@/lib/explorerData";
import { submitAdminLeadPayload } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TYPE_OPTS = EXPLORER_TYPE_OPTIONS;

function short(b) { return BUILDINGS.find((x) => x.value === b)?.short || b; }

export default function ResidenceExplorer() {
    const { units, loading } = useUnits({ sort: "building" });
    const [slug, setSlug] = useState(null);
    const [statusF, setStatusF] = useState("all");
    const [typeF, setTypeF] = useState("all");
    const [plan, setPlan] = useState(null); // { unit, url, loading, error }
    const [buyerEmail, setBuyerEmail] = useState("");
    const [buyerNote, setBuyerNote] = useState("");
    const [sendingBuyer, setSendingBuyer] = useState(false);
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

    const openPlan = async (unit) => {
        setPlan({ unit, url: null, loading: true, error: null });
        try {
            const res = await api.get(`/admin/floorplans/${encodeURIComponent(unit.unit_number)}`, { responseType: "blob" });
            const url = URL.createObjectURL(res.data);
            setPlan({ unit, url, loading: false, error: null });
        } catch (err) {
            console.error("Floor plan fetch failed:", err);
            setPlan({ unit, url: null, loading: false, error: "Floor plan not available for this residence." });
        }
    };
    const closePlan = () => {
        setPlan((p) => { if (p?.url) URL.revokeObjectURL(p.url); return null; });
    };

    const sendToBuyer = async () => {
        if (!selected || !buyerEmail.trim()) return;
        setSendingBuyer(true);
        try {
            await api.post("/admin/residences/send-to-buyer", {
                email: buyerEmail.trim(),
                unit_slug: selected.slug,
                message: buyerNote.trim() || undefined,
                cc_sales: true,
                residence_type: selected.type.typeName,
                bedrooms: selected.type.bedrooms,
                bathrooms: selected.type.bathrooms,
            });
            toast.success(`Residence details sent to ${buyerEmail.trim()}`);
            setBuyerEmail("");
            setBuyerNote("");
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Could not send email.");
        } finally {
            setSendingBuyer(false);
        }
    };

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
                            <SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="available">{statusMeta("available").label}</SelectItem><SelectItem value="reserved">{statusMeta("reserved").label}</SelectItem><SelectItem value="sold">{statusMeta("sold").label}</SelectItem></SelectContent></Select>
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
                                {[["Total Surface", formatSurface(selected.total_surface)], ["Living Area", formatSurface(selected.living_area ?? selected.total_surface)], ["Balcony", formatSurface(selected.balcony_surface)], ["Price", formatUnitDetailPrice(selected)]].map(([l, v]) => (
                                    <div key={l} className="flex items-baseline justify-between"><dt className="font-sans text-xs uppercase tracking-[0.12em] text-brand-ink/45">{l}</dt><dd className="font-display text-lg text-brand-ink">{v}</dd></div>
                                ))}
                            </dl>

                            {/* Floor plan (protected PDF) */}
                            <div className="mt-6">
                                <p className="lux-eyebrow text-brand-ink/45">Floor Plan</p>
                                <button onClick={() => openPlan(selected)} data-testid="view-floorplan" className="mt-3 flex w-full items-center justify-between rounded-xl border border-brand-beige bg-white px-5 py-4 text-left transition-all hover:border-brand-gold hover:shadow-md">
                                    <span className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-brand-gold" />
                                        <span>
                                            <span className="block font-display text-base text-brand-ink">Residence {selected.unit_number} — Floor Plan</span>
                                            <span className="block font-sans text-xs text-brand-ink/50">Confidential · sales use only</span>
                                        </span>
                                    </span>
                                    <span className="font-sans text-sm text-brand-gold">View PDF</span>
                                </button>
                            </div>

                            {/* Send to buyer */}
                            <div className="mt-6 border-t border-brand-beige pt-6" data-testid="explorer-send-buyer">
                                <p className="lux-eyebrow text-brand-ink/45">Send to Buyer</p>
                                <p className="mt-1 font-sans text-sm text-brand-ink/55">Email pricing, details and the floor plan PDF to a prospective buyer.</p>
                                <div className="mt-4 space-y-3">
                                    <input
                                        type="email"
                                        value={buyerEmail}
                                        onChange={(e) => setBuyerEmail(e.target.value)}
                                        placeholder="buyer@example.com"
                                        data-testid="buyer-email"
                                        className="w-full rounded-xl border border-brand-beige bg-white px-4 py-3 font-sans text-sm text-brand-ink outline-none focus:border-brand-gold"
                                    />
                                    <textarea
                                        value={buyerNote}
                                        onChange={(e) => setBuyerNote(e.target.value)}
                                        placeholder="Optional note for the buyer…"
                                        rows={3}
                                        data-testid="buyer-note"
                                        className="w-full rounded-xl border border-brand-beige bg-white px-4 py-3 font-sans text-sm text-brand-ink outline-none focus:border-brand-gold"
                                    />
                                    <button
                                        type="button"
                                        onClick={sendToBuyer}
                                        disabled={!buyerEmail.trim() || sendingBuyer}
                                        data-testid="send-to-buyer"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gold px-5 py-3 font-sans text-sm text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {sendingBuyer ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                        {sendingBuyer ? "Sending…" : "Send to Buyer"}
                                    </button>
                                </div>
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
                                    <LeadForm
                                        leadType={LEAD_TYPE.SALES_EXPLORER}
                                        ctx={leadCtx}
                                        submitLabel="Submit Inquiry"
                                        fields={["first_name", "last_name", "phone", "email", "message"]}
                                        messagePlaceholder={`Notes about Residence ${selected.unit_number}…`}
                                        testIdPrefix="explorer-lead"
                                        submitFn={(payload) => submitAdminLeadPayload(payload)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                )}
            </div>

            <Dialog open={plan !== null} onOpenChange={(v) => !v && closePlan()}>
                <DialogContent className="max-h-[94vh] max-w-5xl overflow-hidden p-4" data-testid="floorplan-modal">
                    {plan && (
                        <>
                            <div className="mb-3 flex items-center justify-between pr-8">
                                <p className="font-sans text-sm uppercase tracking-[0.16em] text-brand-ink/55">Residence {plan.unit.unit_number} — Floor Plan</p>
                                {plan.url && (
                                    <a href={plan.url} target="_blank" rel="noreferrer" data-testid="floorplan-open-tab" className="inline-flex items-center gap-1.5 font-sans text-sm text-brand-gold hover:text-brand-ink">
                                        <ExternalLink className="h-4 w-4" /> Open in new tab
                                    </a>
                                )}
                            </div>
                            {plan.loading && (
                                <div className="flex h-[70vh] items-center justify-center text-brand-ink/50" data-testid="floorplan-loading">
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading floor plan…
                                </div>
                            )}
                            {plan.error && (
                                <div className="flex h-[40vh] items-center justify-center text-center font-sans text-sm text-brand-ink/60" data-testid="floorplan-error">{plan.error}</div>
                            )}
                            {plan.url && (
                                <iframe src={plan.url} title={`Residence ${plan.unit.unit_number} floor plan`} data-testid="floorplan-iframe" className="h-[82vh] w-full rounded-lg border border-brand-beige" />
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
