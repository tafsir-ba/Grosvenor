import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { LEAD_TYPE_LABEL, STATUS_META } from "@/lib/constants";

function StatCard({ label, value, accent }) {
    return (
        <div className="rounded-sm border border-border bg-card p-6" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
            <p className="overline text-muted-foreground">{label}</p>
            <p className={`mt-2 font-display text-4xl ${accent || "text-brand-ink"}`}>{value}</p>
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
    }, []);

    if (!stats) return <p className="text-muted-foreground">Loading…</p>;

    return (
        <div data-testid="admin-dashboard">
            <h1 className="font-display text-3xl text-brand-ink">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Overview of inventory and leads.</p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Units" value={stats.units_total} />
                <StatCard label="Available" value={stats.units_by_status.available} accent="text-brand-green" />
                <StatCard label="Sold" value={stats.units_by_status.sold} accent="text-muted-foreground" />
                <StatCard label="Total Leads" value={stats.leads_total} accent="text-brand-blue" />
            </div>

            <div className="mt-5 rounded-sm border border-border bg-card p-6">
                <p className="overline text-muted-foreground">Available Inventory Value</p>
                <p className="mt-2 font-display text-3xl text-brand-gold">{formatPrice(stats.available_value_usd)}</p>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <div className="rounded-sm border border-border bg-card p-6">
                    <h2 className="font-display text-xl text-brand-ink">Leads by Type</h2>
                    <ul className="mt-4 space-y-2">
                        {Object.entries(stats.leads_by_type).length === 0 && <li className="text-sm text-muted-foreground">No leads yet.</li>}
                        {Object.entries(stats.leads_by_type).map(([k, v]) => (
                            <li key={k} className="flex items-center justify-between border-b border-border py-2 text-sm">
                                <span className="text-brand-ink">{LEAD_TYPE_LABEL[k] || k}</span>
                                <span className="font-medium text-brand-blue">{v}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-sm border border-border bg-card p-6">
                    <h2 className="font-display text-xl text-brand-ink">Recent Leads</h2>
                    <ul className="mt-4 space-y-3" data-testid="recent-leads">
                        {stats.recent_leads.length === 0 && <li className="text-sm text-muted-foreground">No leads yet.</li>}
                        {stats.recent_leads.map((l) => (
                            <li key={l.id || l._id} className="flex items-center justify-between border-b border-border py-2 text-sm">
                                <div>
                                    <p className="font-medium text-brand-ink">{[l.first_name, l.last_name].filter(Boolean).join(" ") || "Anonymous"}</p>
                                    <p className="text-xs text-muted-foreground">{LEAD_TYPE_LABEL[l.lead_type] || l.lead_type}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">{(l.created_at || "").slice(0, 10)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
