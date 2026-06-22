import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import CtaButton from "@/components/shared/CtaButton";
import { api, formatApiError } from "@/lib/api";

export default function AdminDownloads() {
    const [downloads, setDownloads] = useState([]);
    const [edits, setEdits] = useState({});

    const load = () => api.get("/admin/downloads").then(({ data }) => setDownloads(data)).catch(() => {});
    useEffect(() => { load(); }, []);

    const save = async (id) => {
        const change = edits[id];
        if (!change) return;
        try { await api.patch(`/admin/downloads/${id}`, change); toast.success("Saved."); setEdits((e) => ({ ...e, [id]: undefined })); load(); }
        catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    };

    return (
        <div data-testid="admin-downloads">
            <h1 className="font-display text-3xl text-brand-ink">Downloads</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage the brochure (gated) and price list (open).</p>

            <div className="mt-8 overflow-x-auto rounded-sm border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>File URL</TableHead><TableHead></TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {downloads.map((d) => (
                            <TableRow key={d._id} data-testid={`download-row-${d.type}`}>
                                <TableCell className="font-medium">{d.title}</TableCell>
                                <TableCell><span className="rounded-sm bg-muted px-2 py-1 text-xs uppercase tracking-wide">{d.type === "brochure" ? "Gated" : "Open"}</span></TableCell>
                                <TableCell>
                                    <Input
                                        defaultValue={d.file_url}
                                        data-testid={`download-url-${d.type}`}
                                        onChange={(e) => setEdits((p) => ({ ...p, [d._id]: { ...(p[d._id] || {}), file_url: e.target.value } }))}
                                        className="min-w-[260px]"
                                    />
                                </TableCell>
                                <TableCell>
                                    <CtaButton variant="outline" onClick={() => save(d._id)} data-testid={`save-download-${d.type}`} className="px-4 py-2 text-xs">Save</CtaButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
