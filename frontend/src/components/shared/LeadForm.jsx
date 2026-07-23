import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import CtaButton from "@/components/shared/CtaButton";
import { buildLeadPayload, submitLead } from "@/lib/tracking";
import { formatApiError } from "@/lib/api";
import { LEAD_TYPE, LEGAL, PROJECT } from "@/lib/constants";

const INPUT_CLS =
    "rounded-xl border-brand-ink/15 bg-white/70 text-brand-ink placeholder:text-brand-ink/35 focus-visible:ring-1 focus-visible:ring-brand-gold focus-visible:border-brand-gold";

const EMPTY = { first_name: "", last_name: "", phone: "", email: "", message: "", consent: false };
const LEADS_ACTION = `${process.env.REACT_APP_BACKEND_URL || ""}/api/leads`;

function leadReference(result) {
    if (!result || typeof result !== "object") return null;
    const raw = result.crm_reference || result.id || result._id;
    if (!raw) return null;
    const id = String(raw);
    return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

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
    successNextSteps = "Our team usually responds within one business day. A confirmation email may also follow.",
    testIdPrefix = "lead",
}) {
    const [form, setForm] = useState(EMPTY);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(null);

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
            let result = null;
            if (submitFn) {
                result = await submitFn(buildLeadPayload(data, leadType, ctx));
            } else {
                result = await submitLead(data, leadType, ctx);
            }
            const reference = leadReference(result);
            toast.success(successMessage);
            setForm(EMPTY);
            setSubmitted({ message: successMessage, reference, nextSteps: successNextSteps });
            onSuccess && onSuccess(result);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Submission failed.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div
                role="status"
                aria-live="polite"
                data-testid={`${testIdPrefix}-success`}
                className="rounded-2xl border border-brand-gold/35 bg-brand-gold/10 px-6 py-8 text-center"
            >
                <CheckCircle2 className="mx-auto h-10 w-10 text-brand-gold" aria-hidden="true" />
                <p className="mt-4 lux-title text-2xl text-brand-blue">{submitted.message}</p>
                {submitted.reference && (
                    <p className="mt-3 font-sans text-sm text-brand-ink/70" data-testid={`${testIdPrefix}-reference`}>
                        Reference: <span className="font-medium tracking-wide text-brand-ink">{submitted.reference}</span>
                    </p>
                )}
                <p className="mt-3 font-sans text-sm leading-relaxed text-brand-ink/65">{submitted.nextSteps}</p>
                <p className="mt-2 font-sans text-sm text-brand-ink/55">
                    Questions sooner? Call{" "}
                    <a href={PROJECT.contact.phoneHref} className="text-brand-gold underline underline-offset-2">
                        {PROJECT.contact.phone}
                    </a>
                    .
                </p>
                <CtaButton
                    type="button"
                    variant="outline"
                    className="mt-6"
                    data-testid={`${testIdPrefix}-submit-another`}
                    onClick={() => setSubmitted(null)}
                >
                    Submit another enquiry
                </CtaButton>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            method="post"
            action={LEADS_ACTION}
            noValidate
            className="space-y-5"
            data-testid={`${testIdPrefix}-form`}
        >
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-first-name`}>First name</Label>
                    <Input
                        id={`${testIdPrefix}-first-name`}
                        name="first_name"
                        autoComplete="given-name"
                        data-testid={`${testIdPrefix}-first-name`}
                        className={INPUT_CLS}
                        value={form.first_name}
                        onChange={update("first_name")}
                        placeholder="First name"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-last-name`}>Last name</Label>
                    <Input
                        id={`${testIdPrefix}-last-name`}
                        name="last_name"
                        autoComplete="family-name"
                        data-testid={`${testIdPrefix}-last-name`}
                        className={INPUT_CLS}
                        value={form.last_name}
                        onChange={update("last_name")}
                        placeholder="Last name"
                        required
                    />
                </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-phone`}>Telephone</Label>
                    <Input
                        id={`${testIdPrefix}-phone`}
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        data-testid={`${testIdPrefix}-phone`}
                        className={INPUT_CLS}
                        value={form.phone}
                        onChange={update("phone")}
                        placeholder="+1 (876) 000-0000"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-email`}>Email</Label>
                    <Input
                        id={`${testIdPrefix}-email`}
                        name="email"
                        type="email"
                        autoComplete="email"
                        data-testid={`${testIdPrefix}-email`}
                        className={INPUT_CLS}
                        value={form.email}
                        onChange={update("email")}
                        placeholder="you@email.com"
                        required
                    />
                </div>
            </div>
            {fields.includes("message") && (
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-message`}>Message</Label>
                    <Textarea
                        id={`${testIdPrefix}-message`}
                        name="message"
                        data-testid={`${testIdPrefix}-message`}
                        className={INPUT_CLS}
                        value={form.message}
                        onChange={update("message")}
                        placeholder={messagePlaceholder}
                        rows={4}
                    />
                </div>
            )}

            <input type="hidden" name="lead_type" value={leadType} />
            <input type="hidden" name="consent" value={form.consent ? "true" : "false"} />

            <label className="flex cursor-pointer items-start gap-3 pt-1" htmlFor={`${testIdPrefix}-consent`}>
                <Checkbox
                    id={`${testIdPrefix}-consent`}
                    data-testid={`${testIdPrefix}-consent`}
                    checked={form.consent}
                    aria-required="true"
                    onCheckedChange={(v) => setForm((f) => ({ ...f, consent: !!v }))}
                    className="mt-0.5 h-5 w-5 rounded-[6px] border-brand-ink/30 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold data-[state=checked]:text-white"
                />
                <span className="font-sans text-xs leading-relaxed text-brand-ink/60">
                    {LEGAL.consentText}{" "}
                    <a
                        href={LEGAL.privacyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-gold underline underline-offset-2 hover:text-brand-gold/80"
                        data-testid={`${testIdPrefix}-privacy-link`}
                    >
                        {LEGAL.privacyLabel}
                    </a>
                    {" · "}
                    <a
                        href={LEGAL.legalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-gold underline underline-offset-2 hover:text-brand-gold/80"
                        data-testid={`${testIdPrefix}-legal-link`}
                    >
                        {LEGAL.legalLabel}
                    </a>
                    <span className="text-brand-gold"> *</span>
                </span>
            </label>

            <CtaButton type="submit" variant="primary" data-testid={`${testIdPrefix}-submit`} className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : submitLabel}
            </CtaButton>
        </form>
    );
}
