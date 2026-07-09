import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import CtaButton from "@/components/shared/CtaButton";
import { LEAD_TYPE_LABEL, LEAD_STATUSES } from "@/lib/constants";

function DetailField({ label, value, className = "" }) {
    if (value == null || value === "") return null;
    return (
        <div className={className}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm text-brand-ink break-words whitespace-pre-wrap">{String(value)}</p>
        </div>
    );
}

function DetailSection({ title, children }) {
    return (
        <section className="space-y-3 border-b border-border pb-5 last:border-0 last:pb-0">
            <h3 className="font-display text-lg text-brand-ink">{title}</h3>
            <div className="space-y-3">{children}</div>
        </section>
    );
}

export default function LeadDetailSheet({
    lead,
    open,
    onOpenChange,
    onStatusChange,
    onNotesSave,
    patchingId,
    savingNotes,
}) {
    const [notes, setNotes] = useState("");

    useEffect(() => {
        setNotes(lead?.notes || "");
    }, [lead]);

    if (!lead) return null;

    const leadId = lead._id || lead.id;
    const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Anonymous";
    const utmFields = [
        ["UTM Source", lead.utm_source],
        ["UTM Medium", lead.utm_medium],
        ["UTM Campaign", lead.utm_campaign],
        ["UTM Content", lead.utm_content],
        ["UTM Term", lead.utm_term],
    ].filter(([, v]) => v);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg" data-testid="lead-detail-sheet">
                <SheetHeader>
                    <SheetTitle className="font-display text-2xl text-brand-ink">{name}</SheetTitle>
                    <SheetDescription>{LEAD_TYPE_LABEL[lead.lead_type] || lead.lead_type}</SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-5">
                    <DetailSection title="Contact">
                        <DetailField label="Email" value={lead.email} />
                        <DetailField label="Phone" value={lead.phone} />
                        <DetailField label="Consent" value={lead.consent ? "Yes" : "No"} />
                    </DetailSection>

                    <DetailSection title="Pipeline">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
                            <Select
                                value={lead.status}
                                onValueChange={(v) => onStatusChange(leadId, v)}
                                disabled={patchingId === leadId}
                            >
                                <SelectTrigger className="mt-1 w-full" data-testid="lead-detail-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LEAD_STATUSES.map((s) => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</p>
                            <Textarea
                                className="mt-1 min-h-[100px]"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Follow-up notes for the sales team…"
                                data-testid="lead-detail-notes"
                            />
                            <CtaButton
                                type="button"
                                variant="primary"
                                className="mt-2"
                                disabled={savingNotes}
                                onClick={() => onNotesSave(leadId, notes)}
                                data-testid="lead-detail-notes-save"
                            >
                                {savingNotes ? "Saving…" : "Save Notes"}
                            </CtaButton>
                        </div>
                        <DetailField label="Created" value={(lead.created_at || "").slice(0, 19).replace("T", " ")} />
                        <DetailField label="Updated" value={(lead.updated_at || "").slice(0, 19).replace("T", " ")} />
                    </DetailSection>

                    <DetailSection title="Context">
                        <DetailField label="Project" value={lead.project} />
                        <DetailField label="Message" value={lead.message} />
                    </DetailSection>

                    <DetailSection title="Attribution">
                        <DetailField label="Source Page" value={lead.source_page} />
                        <DetailField label="Source URL" value={lead.source_url} />
                        <DetailField label="Unit" value={lead.source_unit} />
                        <DetailField label="Building" value={lead.source_building} />
                        <DetailField label="Collection" value={lead.collection} />
                        {utmFields.map(([label, value]) => (
                            <DetailField key={label} label={label} value={value} />
                        ))}
                    </DetailSection>

                    {(lead.unit_surface || lead.unit_living || lead.unit_floor || lead.unit_status || lead.residence_type) && (
                        <DetailSection title="Unit Metrics">
                            <DetailField label="Surface" value={lead.unit_surface} />
                            <DetailField label="Living Area" value={lead.unit_living} />
                            <DetailField label="Balcony" value={lead.unit_balcony} />
                            <DetailField label="Floor" value={lead.unit_floor} />
                            <DetailField label="Unit Status" value={lead.unit_status} />
                            <DetailField label="Residence Type" value={lead.residence_type} />
                        </DetailSection>
                    )}

                    <DetailSection title="CRM">
                        <DetailField label="CRM Synced" value={lead.crm_synced ? "Yes" : "No"} />
                        <DetailField label="CRM Reference" value={lead.crm_reference} />
                    </DetailSection>
                </div>
            </SheetContent>
        </Sheet>
    );
}
