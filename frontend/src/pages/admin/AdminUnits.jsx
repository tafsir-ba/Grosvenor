import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CtaButton from "@/components/shared/CtaButton";
import StatusBadge from "@/components/shared/StatusBadge";
import { api, formatApiError } from "@/lib/api";
import { formatPrice, formatSurface, floorLabel } from "@/lib/format";
import { BUILDINGS } from "@/lib/constants";

const STATUSES = ["available", "reserved", "sold"];
const EMPTY = { building: BUILDINGS[0].value, unit_number: "", floor: 1, total_surface: "", balcony_surface: "", price: "", status: "available" };

export default function AdminUnits() {
    const [units, setUnits] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY);

    const load = () => api.get("/admin/units").then(({ data }) => setUnits(data)).catch(() => {});
    useEffect(() => { load(); }, []);

    const changeStatus = async (id, status) => {
        try {
            await api.patch(`/admin/units/${id}`, { status });
            toast.success("Status updated.");
            load();
        } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this unit?")) return;
        try { await api.delete(`/admin/units/${id}`); toast.success("Unit deleted."); load(); }
        catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    };

    const create = async (e) => {
        e.preventDefault();
        try {
            await api.post("/admin/units", {
                ...form,
                floor: Number(form.floor),
                total_surface: Number(form.total_surface),
                balcony_surface: Number(form.balcony_surface || 0),
                price: form.price === "" ? null : Number(form.price),
            });
            toast.success("Unit created.");
            setOpen(false); setForm(EMPTY); load();
        } catch (e2) { toast.error(formatApiError(e2.response?.data?.detail)); }
    };

    return (
        <div data-testid="admin-units">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl text-brand-ink">Units</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{units.length} residences</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <CtaButton variant="primary" data-testid="add-unit-btn"><Plus className="h-4 w-4" /> New Unit</CtaButton>
                    </DialogTrigger>
                    <DialogContent data-testid="unit-form-dialog">
                        <DialogHeader><DialogTitle className="font-display text-2xl">New Unit</DialogTitle></DialogHeader>
                        <form onSubmit={create} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Building</Label>
                                <Select value={form.building} onValueChange={(v) => setForm({ ...form, building: v })}>
                                    <SelectTrigger data-testid="unit-building"><SelectValue /></SelectTrigger>
                                    <SelectContent>{BUILDINGS.map((b) => <SelectItem key={b.value} value={b.value}>{b.short}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><Label>Unit Number</Label><Input data-testid="unit-number" value={form.unit_number} onChange={(e) => setForm({ ...form, unit_number: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Floor</Label><Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Total Surface</Label><Input type="number" value={form.total_surface} onChange={(e) => setForm({ ...form, total_surface: e.target.value })} required /></div>
                            <div className="space-y-2"><Label>Balcony Surface</Label><Input type="number" value={form.balcony_surface} onChange={(e) => setForm({ ...form, balcony_surface: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Price (USD)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="blank = on request" /></div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <CtaButton type="submit" variant="primary" className="col-span-2 mt-2" data-testid="unit-save">Create Unit</CtaButton>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="mt-8 overflow-x-auto rounded-sm border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Building</TableHead><TableHead>Unit</TableHead><TableHead>Floor</TableHead>
                            <TableHead>Surface</TableHead><TableHead>Balcony</TableHead><TableHead>Price</TableHead>
                            <TableHead>Status</TableHead><TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {units.map((u) => (
                            <TableRow key={u._id} data-testid={`admin-unit-row-${u.slug}`}>
                                <TableCell>{BUILDINGS.find((b) => b.value === u.building)?.short || u.building}</TableCell>
                                <TableCell className="font-medium">{u.unit_number}</TableCell>
                                <TableCell>{floorLabel(u.floor)}</TableCell>
                                <TableCell>{formatSurface(u.total_surface)}</TableCell>
                                <TableCell>{formatSurface(u.balcony_surface)}</TableCell>
                                <TableCell>{u.status === "sold" ? "—" : formatPrice(u.price)}</TableCell>
                                <TableCell>
                                    <Select value={u.status} onValueChange={(v) => changeStatus(u._id, v)}>
                                        <SelectTrigger className="h-8 w-32" data-testid={`status-select-${u.slug}`}><SelectValue /></SelectTrigger>
                                        <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <button onClick={() => remove(u._id)} data-testid={`delete-unit-${u.slug}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
