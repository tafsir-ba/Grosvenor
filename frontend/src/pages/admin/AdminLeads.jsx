import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CtaButton from "@/components/shared/CtaButton";
import { api, formatApiError } from "@/lib/api";
import { LEAD_TYPE_LABEL } from "@/lib/constants";

const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"];

export default function AdminLeads() {
    const [leads, setLeads] = useState([]);
    const [filter, setFilter] = useState("all");

    const load = () => {
        const params = filter === "all" ? {} : { status: filter };
        api.get("/admin/leads", { params }).then(({ data }) => setLeads(data)).catch(() => {});
    };
    useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

    const changeStatus = async (id, status) => {
        try { await api.patch(`/admin/leads/${id}`, { status }); toast.success("Lead updated."); load(); }
        catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    };

    const exportCsv = () => {
        const cols = ["created_at", "first_name", "last_name", "email", "phone", "lead_type", "status", "project", "source_unit", "source_building", "source_page", "consent", "message"];
        const rows = leads.map((l) => cols.map((c) => `"${(l[c] ?? "").toString().replace(/"/g, '""')}"`).join(","));
        const csv = [cols.join(","), ...rows].join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        const a = document.createElement("a");
        a.href = url; a.download = "grosvenor-leads.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div data-testid="admin-leads">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl text-brand-ink">Leads</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{leads.length} leads</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-40" data-testid="lead-filter-status"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <CtaButton variant="outline" onClick={exportCsv} data-testid="export-leads-btn"><Download className="h-4 w-4" /> Export</CtaButton>
                </div>
            </div>

            <div className="mt-8 overflow-x-auto rounded-sm border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead><TableHead>Name</TableHead><TableHead>Contact</TableHead>
                            <TableHead>Type</TableHead><TableHead>Unit</TableHead><TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No leads yet.</TableCell></TableRow>}
                        {leads.map((l) => (
                            <TableRow key={l._id} data-testid={`lead-row-${l._id}`}>
                                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{(l.created_at || "").slice(0, 16).replace("T", " ")}</TableCell>
                                <TableCell className="font-medium">{[l.first_name, l.last_name].filter(Boolean).join(" ") || "—"}</TableCell>
                                <TableCell className="text-sm">
                                    {l.email && <div>{l.email}</div>}
                                    {l.phone && <div className="text-muted-foreground">{l.phone}</div>}
                                </TableCell>
                                <TableCell className="text-sm">{LEAD_TYPE_LABEL[l.lead_type] || l.lead_type}</TableCell>
                                <TableCell className="text-sm">{l.source_unit || "—"}</TableCell>
                                <TableCell>
                                    <Select value={l.status} onValueChange={(v) => changeStatus(l._id, v)}>
                                        <SelectTrigger className="h-8 w-32" data-testid={`lead-status-${l._id}`}><SelectValue /></SelectTrigger>
                                        <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
