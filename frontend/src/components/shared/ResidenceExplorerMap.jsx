import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { EXPLORER_SVG } from "@/lib/explorerSvg";
import { formatUnitListPrice, formatSurface, floorLabel, statusMeta } from "@/lib/format";
import { UNIT_STATUSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_FILL = { available: "#2f7d52", reserved: "#C6862B", sold: "#9a948c" };
const VIEW_TITLE = { AB: "Block A & B — Heliconia / Hibiscus", C: "Block C — Ginger Lily", TH: "Townhouses — Begonia" };

const GOLD = "#C6862B";

function centroid(points) {
    const pts = points.trim().split(/\s+/).map((p) => p.split(",").map(Number));
    const x = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const y = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return { x, y };
}

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

function collectExplorerImages() {
    const urls = new Set([EXPLORER_SVG.aerial.image, EXPLORER_SVG.TH.image]);
    EXPLORER_SVG.AB.floors.forEach((f) => urls.add(f.image));
    EXPLORER_SVG.C.floors.forEach((f) => urls.add(f.image));
    return [...urls];
}

function resolveScene(view, level) {
    if (view === "aerial") {
        const { image, viewBox, regions } = EXPLORER_SVG.aerial;
        return { view, level: null, image, viewBox, regions, floors: null };
    }
    if (view === "TH") {
        const { image, viewBox, regions } = EXPLORER_SVG.TH;
        return { view, level: null, image, viewBox, regions, floors: null };
    }
    const cfg = EXPLORER_SVG[view];
    const floors = cfg.floors;
    const f = floors.find((x) => x.level === level) || floors[0];
    return { view, level: f.level, image: f.image, viewBox: cfg.viewBox, regions: f.regions, floors };
}

function preloadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        const finish = () => resolve(src);
        img.onload = finish;
        img.onerror = finish;
        img.src = src;
        if (img.complete && img.naturalWidth > 0) finish();
    });
}

function aspectPadding(viewBox) {
    const [, , w, h] = viewBox.split(" ").map(Number);
    if (!w || !h) return "56.25%";
    return `${(h / w) * 100}%`;
}

export default function ResidenceExplorerMap({
    units,
    selectedSlug,
    onSelect,
    pass,
    onViewChange,
    resetSignal,
    variant = "admin",
}) {
    const [view, setView] = useState("aerial");
    const [level, setLevel] = useState(1);
    const [hover, setHover] = useState(null);
    // Only ever paint a scene whose image has finished loading.
    const [painted, setPainted] = useState(null);

    const clickHint = variant === "public" ? "Click to highlight below" : "Click to open details";
    const target = useMemo(() => resolveScene(view, level), [view, level]);
    const transitioning = !painted || painted.image !== target.image;

    useEffect(() => { onViewChange?.(view); }, [view, onViewChange]);
    useEffect(() => {
        if (!resetSignal) return;
        setView("aerial");
        setHover(null);
    }, [resetSignal]);

    // Warm the browser cache so building/floor switches feel instant.
    useEffect(() => {
        collectExplorerImages().forEach((src) => { preloadImage(src); });
    }, []);

    // Hold the previous image + SVG until the next image is fully decoded,
    // then swap both together — never show polygons over a blank frame.
    useEffect(() => {
        let active = true;
        preloadImage(target.image).then(() => {
            if (!active) return;
            setPainted(target);
            setHover(null);
        });
        return () => { active = false; };
    }, [target]);

    const byUnit = useMemo(() => {
        const m = new Map();
        units.forEach((u) => m.set(u.unit_number, u));
        return m;
    }, [units]);

    const goAerial = () => { setView("aerial"); setHover(null); };
    const enter = (next) => { setView(next); setLevel(1); setHover(null); };

    const display = painted;
    const [, , vbW, vbH] = (display?.viewBox || target.viewBox).split(" ").map(Number);
    const isAerial = display?.view === "aerial";
    const hoverUnit = hover && display && !isAerial ? byUnit.get(hover) : null;
    const hoverRegion = hover && display
        ? display.regions.find((r) => (isAerial ? r.target : r.unit) === hover)
        : null;
    const hoverPos = hoverRegion ? centroid(hoverRegion.points) : null;

    return (
        <div data-testid="explorer-map">
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
                <div className="flex items-center gap-4 font-sans text-xs text-brand-ink/55" data-testid="map-legend">
                    {UNIT_STATUSES.map((k) => (
                        <span key={k} className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_FILL[k] }} /> {statusMeta(k).label}
                        </span>
                    ))}
                </div>
            </div>

            {target.floors && (
                <div className="mb-4 flex flex-wrap gap-2.5" data-testid="map-floors">
                    {target.floors.map((f) => (
                        <button
                            key={f.level}
                            onClick={() => { setLevel(f.level); setHover(null); }}
                            data-testid={`map-floor-${f.level}`}
                            className={cn(
                                "rounded-full border px-4 py-2 font-sans text-sm transition-colors",
                                (painted?.level ?? level) === f.level && !transitioning
                                    ? "border-brand-gold bg-brand-gold/10 text-brand-ink"
                                    : level === f.level && transitioning
                                        ? "border-brand-gold/50 bg-brand-gold/5 text-brand-ink/70"
                                        : "border-brand-ink/15 text-brand-ink/70 hover:border-brand-gold",
                            )}
                        >
                            {floorLabel(f.level)}
                        </button>
                    ))}
                </div>
            )}

            <div className="relative w-full overflow-hidden rounded-2xl border border-brand-beige bg-brand-ivory shadow-[0_12px_30px_rgba(74,69,63,0.10)]">
                {!display && (
                    <div
                        data-testid="map-placeholder"
                        className="w-full bg-brand-ivory"
                        style={{ paddingBottom: aspectPadding(target.viewBox) }}
                    />
                )}

                {display && (
                    <>
                        <img
                            src={display.image}
                            alt={VIEW_TITLE[display.view] || "Site view"}
                            className="block h-auto w-full select-none"
                        />
                        <svg
                            viewBox={display.viewBox}
                            preserveAspectRatio="none"
                            className={cn(
                                "absolute inset-0 h-full w-full transition-opacity duration-300 ease-out",
                                transitioning ? "pointer-events-none opacity-0" : "opacity-100",
                            )}
                        >
                            {display.regions.map((r) => {
                                const aerial = display.view === "aerial";
                                const u = aerial ? null : byUnit.get(r.unit);
                                const ok = aerial || (u && (!pass || pass(u)));
                                const status = u?.status || "available";
                                const isSel = u && selectedSlug === u.slug;
                                const key = aerial ? r.target : r.unit;
                                const isHov = !transitioning && hover === key;
                                return (
                                    <polygon
                                        key={key}
                                        points={r.points}
                                        data-testid={aerial ? `map-region-${r.target}` : `map-unit-${r.unit}`}
                                        onMouseEnter={() => ok && !transitioning && setHover(key)}
                                        onMouseLeave={() => setHover(null)}
                                        onClick={() => {
                                            if (!ok || transitioning) return;
                                            aerial ? enter(r.target) : onSelect(u);
                                        }}
                                        style={regionStyle({ isAerial: aerial, ok, status, isSel, isHov })}
                                    />
                                );
                            })}
                        </svg>
                    </>
                )}

                {transitioning && (
                    <div
                        data-testid="map-loading"
                        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-brand-warm/20 backdrop-blur-[1px]"
                    >
                        <span className="inline-flex items-center gap-2 rounded-full bg-brand-warm/95 px-4 py-2 font-sans text-xs text-brand-ink/65 shadow-sm">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-gold" /> Loading view…
                        </span>
                    </div>
                )}

                {hoverUnit && hoverPos && !transitioning && (
                    <div
                        data-testid="map-hover-card"
                        className="pointer-events-none absolute z-10 w-44 -translate-x-1/2 -translate-y-full rounded-xl border border-brand-beige bg-brand-warm/95 p-3 shadow-lg backdrop-blur"
                        style={{ left: `${(hoverPos.x / vbW) * 100}%`, top: `${(hoverPos.y / vbH) * 100}%` }}>
                        <div className="flex items-center justify-between">
                            <span className="font-display text-xl text-brand-blue">{hoverUnit.unit_number}</span>
                            <span className="inline-flex items-center gap-1 font-sans text-[0.65rem] uppercase tracking-wide text-brand-ink/55">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_FILL[hoverUnit.status] }} />
                                {statusMeta(hoverUnit.status).label}
                            </span>
                        </div>
                        <p className="mt-1 font-sans text-xs text-brand-ink/60">{formatSurface(hoverUnit.total_surface)}</p>
                        <p className="font-sans text-sm text-brand-ink/85">{formatUnitListPrice(hoverUnit)}</p>
                        <p className="mt-1 font-sans text-[0.65rem] text-brand-gold">{clickHint}</p>
                    </div>
                )}
            </div>

            {view === "aerial" && (
                <div className="mt-4 flex flex-wrap gap-2.5" data-testid="map-aerial-shortcuts">
                    {[["AB", "Block A & B"], ["C", "Block C"], ["TH", "Townhouses"]].map(([t, lbl]) => (
                        <button
                            key={t}
                            onClick={() => enter(t)}
                            disabled={transitioning}
                            data-testid={`map-enter-${t}`}
                            className="rounded-full border border-brand-ink/15 px-4 py-2 font-sans text-sm text-brand-ink/70 transition-colors hover:border-brand-gold hover:text-brand-gold disabled:cursor-wait disabled:opacity-60"
                        >
                            {lbl}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
