import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CtaButton from "@/components/shared/CtaButton";
import { buildLeadPayload, submitLead } from "@/lib/tracking";
import { formatApiError } from "@/lib/api";
import { LEAD_TYPE } from "@/lib/constants";

// The single lead capture form, reused for every lead type across the site.
export default function LeadForm({
    leadType = LEAD_TYPE.GENERAL_CONTACT,
    ctx = {},
    fields = ["name", "email", "phone", "message"],
    submitLabel = "Send Enquiry",
    messagePlaceholder = "How can we help?",
    onSuccess,
    submitFn, // optional override (e.g. gated download access)
    testIdPrefix = "lead",
}) {
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
    const [submitting, setSubmitting] = useState(false);

    const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) {
            toast.error("Please enter your name and email.");
            return;
        }
        setSubmitting(true);
        try {
            const data = fields.reduce((acc, k) => ({ ...acc, [k]: form[k] || null }), {});
            if (submitFn) {
                await submitFn(buildLeadPayload(data, leadType, ctx));
            } else {
                await submitLead(data, leadType, ctx);
            }
            toast.success("Thank you — the Grosvenor Agent will be in touch shortly.");
            setForm({ name: "", email: "", phone: "", message: "" });
            onSuccess && onSuccess();
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5" data-testid={`${testIdPrefix}-form`}>
            {fields.includes("name") && (
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-name`}>Name</Label>
                    <Input id={`${testIdPrefix}-name`} data-testid={`${testIdPrefix}-name`} value={form.name} onChange={update("name")} placeholder="Your full name" required />
                </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
                {fields.includes("email") && (
                    <div className="space-y-2">
                        <Label htmlFor={`${testIdPrefix}-email`}>Email</Label>
                        <Input id={`${testIdPrefix}-email`} data-testid={`${testIdPrefix}-email`} type="email" value={form.email} onChange={update("email")} placeholder="you@email.com" required />
                    </div>
                )}
                {fields.includes("phone") && (
                    <div className="space-y-2">
                        <Label htmlFor={`${testIdPrefix}-phone`}>Phone</Label>
                        <Input id={`${testIdPrefix}-phone`} data-testid={`${testIdPrefix}-phone`} value={form.phone} onChange={update("phone")} placeholder="+1 (876) 000-0000" />
                    </div>
                )}
            </div>
            {fields.includes("message") && (
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-message`}>Message</Label>
                    <Textarea id={`${testIdPrefix}-message`} data-testid={`${testIdPrefix}-message`} value={form.message} onChange={update("message")} placeholder={messagePlaceholder} rows={4} />
                </div>
            )}
            <CtaButton type="submit" variant="primary" data-testid={`${testIdPrefix}-submit`} className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : submitLabel}
            </CtaButton>
        </form>
    );
}
