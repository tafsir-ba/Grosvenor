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
const INPUT_ERR_CLS = "border-destructive focus-visible:ring-destructive";

const EMPTY = { first_name: "", last_name: "", phone: "", email: "", message: "", consent: false };
const PHONE_RE = /^[+\d][\d\s().-]{6,}$/;

function leadReference(result) {
    if (!result || typeof result !== "object") return null;
    const raw = result.crm_reference || result.id || result._id;
    if (!raw) return null;
    const id = String(raw);
    return id.length > 8 ? id.slice(-8).toUpperCase() : id.toUpperCase();
}

function FieldError({ id, children }) {
    if (!children) return null;
    return (
        <p id={id} role="alert" className="font-sans text-xs text-destructive" data-testid={id}>
            {children}
        </p>
    );
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
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(null);

    const update = (k) => (e) => {
        setForm((f) => ({ ...f, [k]: e.target.value }));
        setErrors((prev) => {
            if (!prev[k]) return prev;
            const next = { ...prev };
            delete next[k];
            return next;
        });
    };

    const validate = () => {
        const next = {};
        if (!form.first_name.trim()) next.first_name = "First name is required.";
        if (!form.last_name.trim()) next.last_name = "Last name is required.";
        if (!form.email.trim()) next.email = "Email is required.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
        if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) {
            next.phone = "Enter a valid telephone number (digits, spaces, +, -, or parentheses).";
        }
        if (!form.consent) next.consent = "Please accept the data processing consent to continue.";
        return next;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            const first = Object.values(nextErrors)[0];
            toast.error(first);
            return;
        }
        setSubmitting(true);
        try {
            const data = {
                first_name: form.first_name.trim() || null,
                last_name: form.last_name.trim() || null,
                phone: form.phone.trim() || null,
                email: form.email.trim() || null,
                message: fields.includes("message") ? form.message.trim() || null : null,
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
            setErrors({});
            setSubmitted({ message: successMessage, reference, nextSteps: successNextSteps });
            onSuccess && onSuccess(result);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || err.message || "Submission failed.");
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

    const consentLabelId = `${testIdPrefix}-consent-label`;

    return (
        <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
            data-testid={`${testIdPrefix}-form`}
        >
            {Object.keys(errors).length > 0 && (
                <div
                    role="alert"
                    aria-live="assertive"
                    data-testid={`${testIdPrefix}-error-summary`}
                    className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 font-sans text-sm text-destructive"
                >
                    Please correct the highlighted fields and try again.
                </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-first-name`}>First name</Label>
                    <Input
                        id={`${testIdPrefix}-first-name`}
                        name="first_name"
                        autoComplete="given-name"
                        data-testid={`${testIdPrefix}-first-name`}
                        className={`${INPUT_CLS} ${errors.first_name ? INPUT_ERR_CLS : ""}`}
                        value={form.first_name}
                        onChange={update("first_name")}
                        placeholder="First name"
                        required
                        aria-invalid={errors.first_name ? "true" : undefined}
                        aria-describedby={errors.first_name ? `${testIdPrefix}-first-name-error` : undefined}
                    />
                    <FieldError id={`${testIdPrefix}-first-name-error`}>{errors.first_name}</FieldError>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-last-name`}>Last name</Label>
                    <Input
                        id={`${testIdPrefix}-last-name`}
                        name="last_name"
                        autoComplete="family-name"
                        data-testid={`${testIdPrefix}-last-name`}
                        className={`${INPUT_CLS} ${errors.last_name ? INPUT_ERR_CLS : ""}`}
                        value={form.last_name}
                        onChange={update("last_name")}
                        placeholder="Last name"
                        required
                        aria-invalid={errors.last_name ? "true" : undefined}
                        aria-describedby={errors.last_name ? `${testIdPrefix}-last-name-error` : undefined}
                    />
                    <FieldError id={`${testIdPrefix}-last-name-error`}>{errors.last_name}</FieldError>
                </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-phone`}>Telephone</Label>
                    <Input
                        id={`${testIdPrefix}-phone`}
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        data-testid={`${testIdPrefix}-phone`}
                        className={`${INPUT_CLS} ${errors.phone ? INPUT_ERR_CLS : ""}`}
                        value={form.phone}
                        onChange={update("phone")}
                        placeholder="+1 (876) 000-0000"
                        aria-invalid={errors.phone ? "true" : undefined}
                        aria-describedby={errors.phone ? `${testIdPrefix}-phone-error` : undefined}
                    />
                    <FieldError id={`${testIdPrefix}-phone-error`}>{errors.phone}</FieldError>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`${testIdPrefix}-email`}>Email</Label>
                    <Input
                        id={`${testIdPrefix}-email`}
                        name="email"
                        type="email"
                        autoComplete="email"
                        data-testid={`${testIdPrefix}-email`}
                        className={`${INPUT_CLS} ${errors.email ? INPUT_ERR_CLS : ""}`}
                        value={form.email}
                        onChange={update("email")}
                        placeholder="you@email.com"
                        required
                        aria-invalid={errors.email ? "true" : undefined}
                        aria-describedby={errors.email ? `${testIdPrefix}-email-error` : undefined}
                    />
                    <FieldError id={`${testIdPrefix}-email-error`}>{errors.email}</FieldError>
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

            <div className="space-y-2">
                <label className="flex cursor-pointer items-start gap-3 pt-1" htmlFor={`${testIdPrefix}-consent`}>
                    <Checkbox
                        id={`${testIdPrefix}-consent`}
                        data-testid={`${testIdPrefix}-consent`}
                        checked={form.consent}
                        aria-required="true"
                        aria-invalid={errors.consent ? "true" : undefined}
                        aria-labelledby={consentLabelId}
                        aria-describedby={errors.consent ? `${testIdPrefix}-consent-error` : undefined}
                        onCheckedChange={(v) => {
                            setForm((f) => ({ ...f, consent: !!v }));
                            setErrors((prev) => {
                                if (!prev.consent) return prev;
                                const next = { ...prev };
                                delete next.consent;
                                return next;
                            });
                        }}
                        className="mt-0.5 h-5 w-5 rounded-[6px] border-brand-ink/30 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold data-[state=checked]:text-white"
                    />
                    <span id={consentLabelId} className="font-sans text-xs leading-relaxed text-brand-ink/60">
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
                <FieldError id={`${testIdPrefix}-consent-error`}>{errors.consent}</FieldError>
            </div>

            <CtaButton type="submit" variant="primary" data-testid={`${testIdPrefix}-submit`} className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : submitLabel}
            </CtaButton>
        </form>
    );
}
