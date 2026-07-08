import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CtaButton from "@/components/shared/CtaButton";
import { api, formatApiError } from "@/lib/api";
import { formatPrice, formatSurface, unitFloor } from "@/lib/format";
import { BUILDINGS, UNIT_STATUSES } from "@/lib/constants";

const STATUSES = UNIT_STATUSES;
const EMPTY = { building: BUILDINGS[0].value, unit_number: "", floor: 1, floor_label: "", total_surface: "", balcony_surface: "", living_area: "", price: "", status: "available", amenities: "" };

function toPayload(form) {
    return {
        ...form,
        floor: Number(form.floor),
        floor_label: form.floor_label || null,
        total_surface: Number(form.total_surface),
        balcony_surface: Number(form.balcony_surface || 0),
        living_area: form.living_area === "" ? null : Number(form.living_area),
        price: form.price === "" ? null : Number(form.price),
        amenities: form.amenities.split("\n").map((s) => s.trim()).filter(Boolean),
    };
}

function UnitFields({ form, setForm }) {
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    return (
        <>
            <div className="col-span-2 space-y-2">
                <Label>Building</Label>
                <Select value={form.building} onValueChange={(v) => setForm({ ...form, building: v })}>
                    <SelectTrigger data-testid="unit-building"><SelectValue /></SelectTrigger>
                    <SelectContent>{BUILDINGS.map((b) => <SelectItem key={b.value} value={b.value}>{b.short}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-2"><Label>Unit Number</Label><Input data-testid="unit-number" value={form.unit_number} onChange={set("unit_number")} required /></div>
            <div className="space-y-2"><Label>Floor Label</Label><Input data-testid="unit-floor-label" value={form.floor_label} onChange={set("floor_label")} placeholder="e.g. 4th & 5th Floor" /></div>
            <div className="space-y-2"><Label>Living Area (sq ft)</Label><Input type="number" data-testid="unit-living" value={form.living_area} onChange={set("living_area")} /></div>
            <div className="space-y-2"><Label>Balcony Surface</Label><Input type="number" value={form.balcony_surface} onChange={set("balcony_surface")} /></div>
            <div className="space-y-2"><Label>Total Surface</Label><Input type="number" value={form.total_surface} onChange={set("total_surface")} required /></div>
            <div className="space-y-2"><Label>Price (USD)</Label><Input type="number" value={form.price} onChange={set("price")} placeholder="blank = on request" /></div>
            <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="col-span-2 space-y-2">
                <Label>Residence Features (one per line)</Label>
                <Textarea data-testid="unit-amenities-input" value={form.amenities} onChange={set("amenities")} rows={8} placeholder={"Master bedroom with ensuite bathroom\nOpen floor plans\n..."} />
            </div>
        </>
    );
}

export default function AdminUnits() {
    const [units, setUnits] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState(EMPTY);

    const load = () => api.get("/admin/units").then(({ data }) => setUnits(data)).catch(() => {});
    useEffect(() => { load(); }, []);

    const changeStatus = async (id, status) => {
        try { await api.patch(`/admin/units/${id}`, { status }); toast.success("Status updated."); load(); }
        catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this unit?")) return;
        try { await api.delete(`/admin/units/${id}`); toast.success("Unit deleted."); load(); }
        catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    };

    const create = async (e) => {
        e.preventDefault();
        try { await api.post("/admin/units", toPayload(form)); toast.success("Unit created."); setOpen(false); setForm(EMPTY); load(); }
        catch (e2) { toast.error(formatApiError(e2.response?.data?.detail)); }
    };

    const openEdit = (u) => {
        setEditId(u._id);
        setEditForm({
            building: u.building, unit_number: u.unit_number, floor: u.floor ?? 1,
            floor_label: u.floor_label || "", total_surface: u.total_surface ?? "",
            balcony_surface: u.balcony_surface ?? "", living_area: u.living_area ?? "",
            price: u.price ?? "", status: u.status, amenities: (u.amenities || []).join("\n"),
        });
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        try { await api.patch(`/admin/units/${editId}`, toPayload(editForm)); toast.success("Unit updated."); setEditId(null); load(); }
        catch (e2) { toast.error(formatApiError(e2.response?.data?.detail)); }
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
                    <DialogContent data-testid="unit-form-dialog" className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle className="font-display text-2xl">New Unit</DialogTitle></DialogHeader>
                        <form onSubmit={create} className="grid grid-cols-2 gap-4">
                            <UnitFields form={form} setForm={setForm} />
                            <CtaButton type="submit" variant="primary" className="col-span-2 mt-2" data-testid="unit-save">Create Unit</CtaButton>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog open={!!editId} onOpenChange={(v) => !v && setEditId(null)}>
                <DialogContent data-testid="unit-edit-dialog" className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="font-display text-2xl">Edit {editForm.unit_number}</DialogTitle></DialogHeader>
                    <form onSubmit={saveEdit} className="grid grid-cols-2 gap-4">
                        <UnitFields form={editForm} setForm={setEditForm} />
                        <CtaButton type="submit" variant="primary" className="col-span-2 mt-2" data-testid="unit-edit-save">Save Changes</CtaButton>
                    </form>
                </DialogContent>
            </Dialog>

            <div className="mt-8 overflow-x-auto rounded-sm border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Building</TableHead><TableHead>Unit</TableHead><TableHead>Floor</TableHead>
                            <TableHead>Living</TableHead><TableHead>Total</TableHead><TableHead>Price</TableHead>
                            <TableHead>Status</TableHead><TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {units.map((u) => (
                            <TableRow key={u._id} data-testid={`admin-unit-row-${u.slug}`}>
                                <TableCell>{BUILDINGS.find((b) => b.value === u.building)?.short || u.building}</TableCell>
                                <TableCell className="font-medium">{u.unit_number}</TableCell>
                                <TableCell>{unitFloor(u)}</TableCell>
                                <TableCell>{formatSurface(u.living_area ?? u.total_surface)}</TableCell>
                                <TableCell>{formatSurface(u.total_surface)}</TableCell>
                                <TableCell>{u.status === "sold" ? "—" : formatPrice(u.price)}</TableCell>
                                <TableCell>
                                    <Select value={u.status} onValueChange={(v) => changeStatus(u._id, v)}>
                                        <SelectTrigger className="h-8 w-32" data-testid={`status-select-${u.slug}`}><SelectValue /></SelectTrigger>
                                        <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => openEdit(u)} data-testid={`edit-unit-${u.slug}`} className="text-muted-foreground hover:text-brand-gold"><Pencil className="h-4 w-4" /></button>
                                        <button onClick={() => remove(u._id)} data-testid={`delete-unit-${u.slug}`} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
