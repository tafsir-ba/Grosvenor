import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import CtaButton from "@/components/shared/CtaButton";
import { api, formatApiError } from "@/lib/api";

const EMPTY_RECIPIENT = {
    name: "",
    email: "",
    label: "",
    active: true,
    scenarios: [],
};

function RecipientForm({ form, setForm, scenarios }) {
    const toggleScenario = (key) => {
        const next = form.scenarios.includes(key)
            ? form.scenarios.filter((s) => s !== key)
            : [...form.scenarios, key];
        setForm({ ...form, scenarios: next });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="recipient-name">Name</Label>
                <Input
                    id="recipient-name"
                    data-testid="recipient-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="recipient-email">Email</Label>
                <Input
                    id="recipient-email"
                    type="email"
                    data-testid="recipient-email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="recipient-label">Role / Label</Label>
                <Input
                    id="recipient-label"
                    data-testid="recipient-label"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="e.g. Sales Manager"
                />
            </div>
            <div className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                <Label htmlFor="recipient-active">Active</Label>
                <Switch
                    id="recipient-active"
                    data-testid="recipient-active"
                    checked={form.active}
                    onCheckedChange={(active) => setForm({ ...form, active })}
                />
            </div>
            <div className="space-y-2">
                <Label>Notification scenarios</Label>
                <div className="grid gap-2 rounded-sm border border-border p-3">
                    {scenarios.map((s) => (
                        <label key={s.key} className="flex cursor-pointer items-start gap-2 text-sm">
                            <Checkbox
                                data-testid={`recipient-scenario-${s.key}`}
                                checked={form.scenarios.includes(s.key)}
                                onCheckedChange={() => toggleScenario(s.key)}
                            />
                            <span>
                                <span className="font-medium">{s.label}</span>
                                {s.description && (
                                    <span className="mt-0.5 block text-xs text-muted-foreground">{s.description}</span>
                                )}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function AdminNotifications() {
    const [settings, setSettings] = useState({ recipients: [], scenarios: [], fallback_admin_email: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(EMPTY_RECIPIENT);
    const [scenarioEdits, setScenarioEdits] = useState({});

    const scenarioLabels = useMemo(
        () => Object.fromEntries((settings.scenarios || []).map((s) => [s.key, s.label])),
        [settings.scenarios],
    );

    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        api.get("/admin/notifications/settings")
            .then(({ data }) => {
                setSettings(data);
                setScenarioEdits({});
            })
            .catch((err) => setError(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => {
        setEditId(null);
        setForm(EMPTY_RECIPIENT);
        setDialogOpen(true);
    };

    const openEdit = (recipient) => {
        setEditId(recipient._id || recipient.id);
        setForm({
            name: recipient.name || "",
            email: recipient.email || "",
            label: recipient.label || "",
            active: recipient.active !== false,
            scenarios: recipient.scenarios || [],
        });
        setDialogOpen(true);
    };

    const saveRecipient = async () => {
        if (!form.name.trim() || !form.email.trim()) {
            toast.error("Name and email are required.");
            return;
        }
        if (!form.scenarios.length) {
            toast.error("Select at least one notification scenario.");
            return;
        }
        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            label: form.label.trim() || null,
            active: form.active,
            scenarios: form.scenarios,
        };
        try {
            if (editId) {
                await api.put(`/admin/notifications/recipients/${editId}`, payload);
                toast.success("Recipient updated.");
            } else {
                await api.post("/admin/notifications/recipients", payload);
                toast.success("Recipient added.");
            }
            setDialogOpen(false);
            load();
        } catch (e) {
            toast.error(formatApiError(e.response?.data?.detail));
        }
    };

    const toggleRecipientActive = async (recipient) => {
        const id = recipient._id || recipient.id;
        try {
            await api.put(`/admin/notifications/recipients/${id}`, { active: !recipient.active });
            load();
        } catch (e) {
            toast.error(formatApiError(e.response?.data?.detail));
        }
    };

    const removeRecipient = async (recipient) => {
        if (!window.confirm(`Remove ${recipient.name}?`)) return;
        const id = recipient._id || recipient.id;
        try {
            await api.delete(`/admin/notifications/recipients/${id}`);
            toast.success("Recipient removed.");
            load();
        } catch (e) {
            toast.error(formatApiError(e.response?.data?.detail));
        }
    };

    const saveScenario = async (scenario) => {
        const edits = scenarioEdits[scenario.key] || {};
        if (!Object.keys(edits).length) return;
        try {
            await api.patch(`/admin/notifications/scenarios/${scenario.key}`, edits);
            toast.success(`${scenario.label} settings saved.`);
            load();
        } catch (e) {
            toast.error(formatApiError(e.response?.data?.detail));
        }
    };

    const setScenarioField = (key, field, value) => {
        setScenarioEdits((prev) => ({
            ...prev,
            [key]: { ...(prev[key] || {}), [field]: value },
        }));
    };

    const scenarioValue = (scenario, field) => {
        if (scenarioEdits[scenario.key] && field in scenarioEdits[scenario.key]) {
            return scenarioEdits[scenario.key][field];
        }
        return scenario[field];
    };

    if (loading) {
        return <p className="text-muted-foreground" data-testid="notifications-loading">Loading notification settings…</p>;
    }

    if (error) {
        return (
            <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-6" data-testid="notifications-error">
                <p className="text-sm text-destructive">
                    {formatApiError(error.response?.data?.detail) || "Could not load notification settings."}
                </p>
                <CtaButton variant="outline" onClick={load} className="mt-4">Retry</CtaButton>
            </div>
        );
    }

    return (
        <div data-testid="admin-notifications">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl text-brand-ink">Notifications</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Configure who receives lead notifications for each scenario.
                    </p>
                    {settings.fallback_admin_email && (
                        <p className="mt-2 text-xs text-muted-foreground">
                            Default fallback: {settings.fallback_admin_email}
                        </p>
                    )}
                </div>
                <CtaButton onClick={openCreate} data-testid="add-recipient-btn">
                    <Plus className="h-4 w-4" /> Add recipient
                </CtaButton>
            </div>

            <section className="mt-8">
                <h2 className="font-display text-xl text-brand-ink">Recipients</h2>
                <div className="mt-4 overflow-x-auto rounded-sm border border-border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead>Scenarios</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {settings.recipients.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                        No recipients configured yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {settings.recipients.map((r) => (
                                <TableRow key={r._id || r.id} data-testid={`recipient-row-${r._id || r.id}`}>
                                    <TableCell className="font-medium">{r.name}</TableCell>
                                    <TableCell>{r.email}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{r.label || "—"}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={r.active !== false}
                                            onCheckedChange={() => toggleRecipientActive(r)}
                                            data-testid={`recipient-active-${r._id || r.id}`}
                                        />
                                    </TableCell>
                                    <TableCell className="max-w-xs text-xs text-muted-foreground">
                                        {(r.scenarios || []).map((key) => scenarioLabels[key] || key).join(", ") || "—"}
                                    </TableCell>
                                    <TableCell className="space-x-2 whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(r)}
                                            className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
                                            data-testid={`edit-recipient-${r._id || r.id}`}
                                        >
                                            <Pencil className="h-3.5 w-3.5" /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeRecipient(r)}
                                            className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
                                            data-testid={`delete-recipient-${r._id || r.id}`}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>

            <section className="mt-10">
                <h2 className="font-display text-xl text-brand-ink">Scenario settings</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Enable or disable notifications per scenario and set a fallback recipient.
                </p>
                <div className="mt-4 space-y-4">
                    {settings.scenarios.map((s) => (
                        <div
                            key={s.key}
                            className="rounded-sm border border-border bg-card p-4"
                            data-testid={`scenario-card-${s.key}`}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-medium text-brand-ink">{s.label}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Active recipients:{" "}
                                        {(s.assigned_recipients || []).length
                                            ? s.assigned_recipients.map((r) => r.name).join(", ")
                                            : "None — fallback will be used"}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`scenario-enabled-${s.key}`}>Enabled</Label>
                                    <Switch
                                        id={`scenario-enabled-${s.key}`}
                                        checked={scenarioValue(s, "enabled") !== false}
                                        onCheckedChange={(enabled) => setScenarioField(s.key, "enabled", enabled)}
                                        data-testid={`scenario-enabled-${s.key}`}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                                <div className="space-y-2">
                                    <Label htmlFor={`scenario-fallback-${s.key}`}>Fallback email</Label>
                                    <Input
                                        id={`scenario-fallback-${s.key}`}
                                        type="email"
                                        placeholder={settings.fallback_admin_email || "admin@example.com"}
                                        value={scenarioValue(s, "fallback_email") || ""}
                                        onChange={(e) => setScenarioField(s.key, "fallback_email", e.target.value || null)}
                                        data-testid={`scenario-fallback-${s.key}`}
                                    />
                                </div>
                                <CtaButton
                                    variant="outline"
                                    onClick={() => saveScenario(s)}
                                    disabled={!scenarioEdits[s.key]}
                                    data-testid={`save-scenario-${s.key}`}
                                >
                                    Save
                                </CtaButton>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent data-testid="recipient-form-dialog" className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl">
                            {editId ? "Edit recipient" : "Add recipient"}
                        </DialogTitle>
                    </DialogHeader>
                    <RecipientForm form={form} setForm={setForm} scenarios={settings.scenarios} />
                    <div className="flex justify-end gap-2 pt-2">
                        <CtaButton variant="outline" onClick={() => setDialogOpen(false)}>Cancel</CtaButton>
                        <CtaButton onClick={saveRecipient} data-testid="save-recipient-btn">
                            {editId ? "Save changes" : "Add recipient"}
                        </CtaButton>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
