import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CtaButton from "@/components/shared/CtaButton";
import LeadDetailSheet from "@/components/admin/LeadDetailSheet";
import { api, formatApiError } from "@/lib/api";
import { LEAD_TYPE, LEAD_TYPE_LABEL, LEAD_STATUSES } from "@/lib/constants";

const PAGE_SIZE = 50;

function buildFilterParams({ statusFilter, typeFilter, search, createdFrom, createdTo, offset }) {
    const params = { limit: PAGE_SIZE, offset };
    if (statusFilter !== "all") params.status = statusFilter;
    if (typeFilter !== "all") params.lead_type = typeFilter;
    if (search.trim()) params.search = search.trim();
    if (createdFrom) params.created_from = createdFrom;
    if (createdTo) params.created_to = createdTo;
    return params;
}

export default function AdminLeads() {
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [offset, setOffset] = useState(0);
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [createdFrom, setCreatedFrom] = useState("");
    const [createdTo, setCreatedTo] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const [patchingId, setPatchingId] = useState(null);
    const [savingNotes, setSavingNotes] = useState(false);
    const [exporting, setExporting] = useState(false);

    const filterParams = useMemo(
        () => buildFilterParams({ statusFilter, typeFilter, search: debouncedSearch, createdFrom, createdTo, offset }),
        [statusFilter, typeFilter, debouncedSearch, createdFrom, createdTo, offset],
    );

    const exportParams = useMemo(() => {
        const params = buildFilterParams({
            statusFilter,
            typeFilter,
            search: debouncedSearch,
            createdFrom,
            createdTo,
            offset: 0,
        });
        delete params.limit;
        delete params.offset;
        return params;
    }, [statusFilter, typeFilter, debouncedSearch, createdFrom, createdTo]);

    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(id);
    }, [search]);

    useEffect(() => {
        setOffset(0);
    }, [statusFilter, typeFilter, debouncedSearch, createdFrom, createdTo]);

    const load = useCallback(() => {
        let active = true;
        setLoading(true);
        setError(null);
        api.get("/admin/leads", { params: filterParams })
            .then(({ data }) => {
                if (!active) return;
                setLeads(data.items || []);
                setTotal(data.total ?? 0);
            })
            .catch((err) => active && setError(err))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [filterParams]);

    useEffect(() => {
        const cleanup = load();
        return cleanup;
    }, [load]);

    const updateLeadInState = (updated) => {
        const id = updated._id || updated.id;
        setLeads((prev) => prev.map((l) => ((l._id || l.id) === id ? { ...l, ...updated } : l)));
        setSelectedLead((prev) => ((prev?._id || prev?.id) === id ? { ...prev, ...updated } : prev));
    };

    const changeStatus = async (id, status) => {
        const previous = leads.find((l) => (l._id || l.id) === id);
        if (!previous) return;
        setPatchingId(id);
        setLeads((prev) => prev.map((l) => ((l._id || l.id) === id ? { ...l, status } : l)));
        try {
            const { data } = await api.patch(`/admin/leads/${id}`, { status });
            updateLeadInState(data);
            toast.success("Lead updated.");
        } catch (e) {
            setLeads((prev) => prev.map((l) => ((l._id || l.id) === id ? previous : l)));
            toast.error(formatApiError(e.response?.data?.detail));
        } finally {
            setPatchingId(null);
        }
    };

    const saveNotes = async (id, notes) => {
        setSavingNotes(true);
        try {
            const { data } = await api.patch(`/admin/leads/${id}`, { notes });
            updateLeadInState(data);
            toast.success("Notes saved.");
        } catch (e) {
            toast.error(formatApiError(e.response?.data?.detail));
        } finally {
            setSavingNotes(false);
        }
    };

    const exportCsv = async () => {
        setExporting(true);
        try {
            const { data } = await api.get("/admin/leads/export", {
                params: exportParams,
                responseType: "blob",
            });
            const url = URL.createObjectURL(data);
            const a = document.createElement("a");
            a.href = url;
            a.download = "grosvenor-leads.csv";
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            toast.error(formatApiError(e.response?.data?.detail) || "Export failed.");
        } finally {
            setExporting(false);
        }
    };

    const page = Math.floor(offset / PAGE_SIZE) + 1;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const canPrev = offset > 0;
    const canNext = offset + PAGE_SIZE < total;

    const leadTypeOptions = Object.entries(LEAD_TYPE).map(([, value]) => ({
        value,
        label: LEAD_TYPE_LABEL[value] || value,
    }));

    return (
        <div data-testid="admin-leads">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl text-brand-ink">Leads</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {loading ? "Loading…" : `${total} lead${total === 1 ? "" : "s"}`}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Input
                        className="w-48"
                        placeholder="Search name, email…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        data-testid="lead-search"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40" data-testid="lead-filter-status"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {LEAD_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-44" data-testid="lead-filter-type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {leadTypeOptions.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input
                        type="date"
                        className="w-36"
                        value={createdFrom}
                        onChange={(e) => setCreatedFrom(e.target.value)}
                        aria-label="Created from"
                        data-testid="lead-filter-from"
                    />
                    <Input
                        type="date"
                        className="w-36"
                        value={createdTo}
                        onChange={(e) => setCreatedTo(e.target.value)}
                        aria-label="Created to"
                        data-testid="lead-filter-to"
                    />
                    <CtaButton
                        variant="outline"
                        onClick={exportCsv}
                        disabled={exporting || loading}
                        data-testid="export-leads-btn"
                    >
                        <Download className="h-4 w-4" /> {exporting ? "Exporting…" : "Export"}
                    </CtaButton>
                </div>
            </div>

            {loading && (
                <p className="mt-8 text-sm text-muted-foreground" data-testid="leads-loading">Loading leads…</p>
            )}

            {error && !loading && (
                <div className="mt-8 rounded-sm border border-destructive/30 bg-destructive/5 p-6" data-testid="leads-error">
                    <p className="text-sm text-destructive">
                        {formatApiError(error?.response?.data?.detail) || "Could not load leads."}
                    </p>
                    <CtaButton variant="outline" className="mt-4" onClick={load} data-testid="leads-retry">
                        Retry
                    </CtaButton>
                </div>
            )}

            {!loading && !error && (
                <>
                    <div className="mt-8 max-h-[60vh] overflow-y-auto overflow-x-auto rounded-sm border border-border bg-card" data-testid="leads-table-wrap">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead><TableHead>Name</TableHead><TableHead>Contact</TableHead>
                                    <TableHead>Type</TableHead><TableHead>Unit</TableHead><TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                            No leads yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {leads.map((l) => {
                                    const id = l._id || l.id;
                                    return (
                                        <TableRow
                                            key={id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            data-testid={`lead-row-${id}`}
                                            onClick={() => setSelectedLead(l)}
                                        >
                                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                                {(l.created_at || "").slice(0, 16).replace("T", " ")}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {[l.first_name, l.last_name].filter(Boolean).join(" ") || "—"}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {l.email && <div>{l.email}</div>}
                                                {l.phone && <div className="text-muted-foreground">{l.phone}</div>}
                                            </TableCell>
                                            <TableCell className="text-sm">{LEAD_TYPE_LABEL[l.lead_type] || l.lead_type}</TableCell>
                                            <TableCell className="text-sm">{l.source_unit || "—"}</TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Select
                                                    value={l.status}
                                                    onValueChange={(v) => changeStatus(id, v)}
                                                    disabled={patchingId === id}
                                                >
                                                    <SelectTrigger
                                                        className="h-8 w-32"
                                                        data-testid={`lead-status-${id}`}
                                                        data-patching={patchingId === id ? "true" : undefined}
                                                        disabled={patchingId === id}
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {LEAD_STATUSES.map((s) => (
                                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {total > 0 && (
                        <div className="mt-4 flex items-center justify-between gap-4" data-testid="leads-pagination">
                            <p className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <CtaButton
                                    variant="outline"
                                    disabled={!canPrev}
                                    onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                                    data-testid="leads-prev"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Prev
                                </CtaButton>
                                <CtaButton
                                    variant="outline"
                                    disabled={!canNext}
                                    onClick={() => setOffset((o) => o + PAGE_SIZE)}
                                    data-testid="leads-next"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </CtaButton>
                            </div>
                        </div>
                    )}
                </>
            )}

            <LeadDetailSheet
                lead={selectedLead}
                open={!!selectedLead}
                onOpenChange={(open) => !open && setSelectedLead(null)}
                onStatusChange={changeStatus}
                onNotesSave={saveNotes}
                patchingId={patchingId}
                savingNotes={savingNotes}
            />
        </div>
    );
}
