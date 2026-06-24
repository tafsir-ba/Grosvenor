import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { EXPLORER_SVG } from "@/lib/explorerSvg";
import { formatPrice, formatSurface, floorLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_FILL = { available: "#2f7d52", reserved: "#C6862B", sold: "#9a948c" };
const STATUS_LABEL = { available: "Available", reserved: "Reserved", sold: "Sold" };
const VIEW_TITLE = { AB: "Block A & B — Heliconia / Hibiscus", C: "Block C — Ginger Lily", TH: "Townhouses — Begonia" };

const GOLD = "#C6862B";

function centroid(points) {
    const pts = points.trim().split(/\s+/).map((p) => p.split(",").map(Number));
    const x = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const y = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return { x, y };
}

// Resolve polygon visual style for the three cases: building region (aerial),
// disabled (filtered out), and an interactive unit (status-tinted).
function regionStyle({ isAerial, ok, status, isSel, isHov }) {
    const base = { cursor: ok ? "pointer" : "not-allowed", strokeOpacity: ok ? 0.95 : 0.2, transition: "fill-opacity 0.18s ease, stroke-width 0.18s ease" };
    if (isAerial) {
        return { ...base, fill: GOLD, fillOpacity: isHov ? 0.24 : 0, stroke: GOLD, strokeWidth: isHov ? 3 : 0 };
    }
    if (!ok) {
        return { ...base, fill: STATUS_FILL[status], fillOpacity: 0.04, stroke: STATUS_FILL[status], strokeWidth: 2 };
    }
    let fillOpacity = 0.38;
    if (isSel) fillOpacity = 0.62;
    else if (isHov) fillOpacity = 0.58;
    const highlighted = isSel || isHov;
    return { ...base, fill: STATUS_FILL[status], fillOpacity, stroke: highlighted ? GOLD : STATUS_FILL[status], strokeWidth: highlighted ? 4 : 2 };
}

export default function ExplorerMap({ units, selectedSlug, onSelect, pass, onViewChange, resetSignal }) {
    const [view, setView] = useState("aerial");
    const [level, setLevel] = useState(1);
    const [hover, setHover] = useState(null);

    useEffect(() => { onViewChange?.(view); }, [view, onViewChange]);
    useEffect(() => { if (resetSignal) { setView("aerial"); setHover(null); } }, [resetSignal]);

    const byUnit = useMemo(() => {
        const m = new Map();
        units.forEach((u) => m.set(u.unit_number, u));
        return m;
    }, [units]);

    const goAerial = () => { setView("aerial"); setHover(null); };
    const enter = (target) => { setView(target); setLevel(1); setHover(null); };

    // Resolve current image, viewBox and regions for the active view/level.
    let image, viewBox, regions, floors = null;
    if (view === "aerial") {
        ({ image, viewBox, regions } = EXPLORER_SVG.aerial);
    } else if (view === "TH") {
        ({ image, viewBox, regions } = EXPLORER_SVG.TH);
    } else {
        const cfg = EXPLORER_SVG[view];
        viewBox = cfg.viewBox;
        floors = cfg.floors;
        const f = cfg.floors.find((x) => x.level === level) || cfg.floors[0];
        image = f.image;
        regions = f.regions;
    }

    const [, , vbW, vbH] = viewBox.split(" ").map(Number);

    const hoverUnit = hover ? byUnit.get(hover) : null;
    const hoverRegion = hover ? regions.find((r) => r.unit === hover) : null;
    const hoverPos = hoverRegion ? centroid(hoverRegion.points) : null;

    return (
        <div data-testid="explorer-map">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {view !== "aerial" && (
                        <button onClick={goAerial} data-testid="map-back" className="inline-flex items-center gap-2 rounded-full border border-brand-ink/15 px-4 py-2 font-sans text-sm text-brand-ink/70 transition-colors hover:border-brand-gold hover:text-brand-gold">
                            <ArrowLeft className="h-4 w-4" /> Site view
                        </button>
                    )}
                    <p className="font-sans text-sm text-brand-ink/60">
                        {view === "aerial" ? "Select a building" : VIEW_TITLE[view]}
                    </p>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 font-sans text-xs text-brand-ink/55" data-testid="map-legend">
                    {Object.entries(STATUS_LABEL).map(([k, lbl]) => (
                        <span key={k} className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_FILL[k] }} /> {lbl}
                        </span>
                    ))}
                </div>
            </div>

            {/* Floor tabs */}
            {floors && (
                <div className="mb-4 flex flex-wrap gap-2.5" data-testid="map-floors">
                    {floors.map((f) => (
                        <button key={f.level} onClick={() => { setLevel(f.level); setHover(null); }} data-testid={`map-floor-${f.level}`}
                            className={cn("rounded-full border px-4 py-2 font-sans text-sm transition-colors",
                                level === f.level ? "border-brand-gold bg-brand-gold/10 text-brand-ink" : "border-brand-ink/15 text-brand-ink/70 hover:border-brand-gold")}>
                            {floorLabel(f.level)}
                        </button>
                    ))}
                </div>
            )}

            {/* Interactive image */}
            <div className="relative w-full overflow-hidden rounded-2xl border border-brand-beige bg-brand-ivory shadow-[0_12px_30px_rgba(74,69,63,0.10)]">
                <img src={image} alt={VIEW_TITLE[view] || "Site view"} className="block h-auto w-full select-none" />
                <svg viewBox={viewBox} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                    {regions.map((r) => {
                        const isAerial = view === "aerial";
                        const u = isAerial ? null : byUnit.get(r.unit);
                        const ok = isAerial || (u && (!pass || pass(u)));
                        const status = u?.status || "available";
                        const isSel = u && selectedSlug === u.slug;
                        const key = isAerial ? r.target : r.unit;
                        const isHov = hover === key;
                        return (
                            <polygon
                                key={key}
                                points={r.points}
                                data-testid={isAerial ? `map-region-${r.target}` : `map-unit-${r.unit}`}
                                onMouseEnter={() => ok && setHover(key)}
                                onMouseLeave={() => setHover(null)}
                                onClick={() => { if (!ok) return; isAerial ? enter(r.target) : onSelect(u); }}
                                style={regionStyle({ isAerial, ok, status, isSel, isHov })}
                            />
                        );
                    })}
                </svg>

                {/* Hover info card */}
                {hoverUnit && hoverPos && (
                    <div
                        data-testid="map-hover-card"
                        className="pointer-events-none absolute z-10 w-44 -translate-x-1/2 -translate-y-full rounded-xl border border-brand-beige bg-brand-warm/95 p-3 shadow-lg backdrop-blur"
                        style={{ left: `${(hoverPos.x / vbW) * 100}%`, top: `${(hoverPos.y / vbH) * 100}%` }}>
                        <div className="flex items-center justify-between">
                            <span className="font-display text-xl text-brand-blue">{hoverUnit.unit_number}</span>
                            <span className="inline-flex items-center gap-1 font-sans text-[0.65rem] uppercase tracking-wide text-brand-ink/55">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_FILL[hoverUnit.status] }} />
                                {STATUS_LABEL[hoverUnit.status]}
                            </span>
                        </div>
                        <p className="mt-1 font-sans text-xs text-brand-ink/60">{formatSurface(hoverUnit.total_surface)}</p>
                        <p className="font-sans text-sm text-brand-ink/85">{hoverUnit.status === "sold" ? "Now sold" : formatPrice(hoverUnit.price, hoverUnit.currency)}</p>
                        <p className="mt-1 font-sans text-[0.65rem] text-brand-gold">Click to open details</p>
                    </div>
                )}
            </div>

            {/* Aerial helper chips */}
            {view === "aerial" && (
                <div className="mt-4 flex flex-wrap gap-2.5" data-testid="map-aerial-shortcuts">
                    {[["AB", "Block A & B"], ["C", "Block C"], ["TH", "Townhouses"]].map(([t, lbl]) => (
                        <button key={t} onClick={() => enter(t)} data-testid={`map-enter-${t}`}
                            className="rounded-full border border-brand-ink/15 px-4 py-2 font-sans text-sm text-brand-ink/70 transition-colors hover:border-brand-gold hover:text-brand-gold">
                            {lbl}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
