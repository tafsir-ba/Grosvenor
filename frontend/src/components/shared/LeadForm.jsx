import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import CtaButton from "@/components/shared/CtaButton";
import { buildLeadPayload, submitLead } from "@/lib/tracking";
import { formatApiError } from "@/lib/api";
import { LEAD_TYPE, LEGAL } from "@/lib/constants";

const INPUT_CLS =
    "rounded-xl border-brand-ink/15 bg-white/70 text-brand-ink placeholder:text-brand-ink/35 focus-visible:ring-1 focus-visible:ring-brand-gold focus-visible:border-brand-gold";

const EMPTY = { first_name: "", last_name: "", phone: "", email: "", message: "", consent: false };

// The single lead capture form, reused for every lead type across the site.
export default function LeadForm({
    leadType = LEAD_TYPE.GENERAL_CONTACT,
    ctx = {},
    fields = ["first_name", "last_name", "phone", "email", "message"],
    submitLabel = "Send Enquiry",
    messagePlaceholder = "How can we help?",
    onSuccess,
    submitFn, // optional override (e.g. gated download access)
    successMessage = "Thank you — we'll be in touch shortly.",
    testIdPrefix = "lead",
}) {
    const [form, setForm] = useState(EMPTY);
    const [submitting, setSubmitting] = useState(false);

    const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
            toast.error("Please enter your first name, last name and email.");
            return;
        }
        if (!form.consent) {
            toast.error("Please accept the data processing consent to continue.");
            return;
        }
        setSubmitting(true);
        try {
            const data = {
                first_name: form.first_name || null,
                last_name: form.last_name || null,
                phone: form.phone || null,
                email: form.email || null,
                message: fields.includes("message") ? form.message || null : null,
                consent: form.consent,
            };
            if (submitFn) {
                await submitFn(buildLeadPayload(data, leadType, ctx));
            } else {
                await submitLead(data, leadType, ctx);
            }
            toast.success(successMessage);
            setForm(EMPTY);
            onSuccess && onSuccess();
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5" data-testid={`${testIdPrefix}-form`}>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-first-name`}>First name</Label>
                    <Input id={`${testIdPrefix}-first-name`} data-testid={`${testIdPrefix}-first-name`} className={INPUT_CLS} value={form.first_name} onChange={update("first_name")} placeholder="First name" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-last-name`}>Last name</Label>
                    <Input id={`${testIdPrefix}-last-name`} data-testid={`${testIdPrefix}-last-name`} className={INPUT_CLS} value={form.last_name} onChange={update("last_name")} placeholder="Last name" required />
                </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-phone`}>Telephone</Label>
                    <Input id={`${testIdPrefix}-phone`} data-testid={`${testIdPrefix}-phone`} className={INPUT_CLS} value={form.phone} onChange={update("phone")} placeholder="+1 (876) 000-0000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-email`}>Email</Label>
                    <Input id={`${testIdPrefix}-email`} data-testid={`${testIdPrefix}-email`} className={INPUT_CLS} type="email" value={form.email} onChange={update("email")} placeholder="you@email.com" required />
                </div>
            </div>
            {fields.includes("message") && (
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-message`}>Message</Label>
                    <Textarea id={`${testIdPrefix}-message`} data-testid={`${testIdPrefix}-message`} className={INPUT_CLS} value={form.message} onChange={update("message")} placeholder={messagePlaceholder} rows={4} />
                </div>
            )}

            <label className="flex cursor-pointer items-start gap-3 pt-1" htmlFor={`${testIdPrefix}-consent`}>
                <Checkbox
                    id={`${testIdPrefix}-consent`}
                    data-testid={`${testIdPrefix}-consent`}
                    checked={form.consent}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, consent: !!v }))}
                    className="mt-0.5 h-5 w-5 rounded-[6px] border-brand-ink/30 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold data-[state=checked]:text-white"
                />
                <span className="font-sans text-xs leading-relaxed text-brand-ink/60">
                    {LEGAL.consentText}{" "}
                    <a href={LEGAL.privacyUrl} target="_blank" rel="noreferrer" className="text-brand-gold underline underline-offset-2 hover:text-brand-gold/80" data-testid={`${testIdPrefix}-privacy-link`}>Privacy Policy</a>
                    {" · "}
                    <a href={LEGAL.legalUrl} target="_blank" rel="noreferrer" className="text-brand-gold underline underline-offset-2 hover:text-brand-gold/80" data-testid={`${testIdPrefix}-legal-link`}>Legal</a>
                    <span className="text-brand-gold"> *</span>
                </span>
            </label>

            <CtaButton type="submit" variant="primary" data-testid={`${testIdPrefix}-submit`} className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : submitLabel}
            </CtaButton>
        </form>
    );
}
