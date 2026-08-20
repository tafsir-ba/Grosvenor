import LeadForm from "@/components/shared/LeadForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LEAD_TYPE } from "@/lib/constants";
import { markWhatsAppLeadCaptured, openWhatsApp } from "@/lib/whatsapp";

export default function WhatsAppLeadDialog({ open, onOpenChange, ctx = {} }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent data-testid="whatsapp-lead-dialog">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-brand-blue">Chat on WhatsApp</DialogTitle>
                    <DialogDescription>
                        Share your first name and email — WhatsApp will open right away.
                    </DialogDescription>
                </DialogHeader>
                <LeadForm
                    leadType={LEAD_TYPE.WHATSAPP_ENQUIRY}
                    ctx={ctx}
                    fields={["first_name", "email"]}
                    submitLabel="Continue to WhatsApp"
                    successMessage="Opening WhatsApp…"
                    successNextSteps="If WhatsApp did not open, allow pop-ups and try again."
                    testIdPrefix="whatsapp"
                    onSuccess={() => {
                        markWhatsAppLeadCaptured();
                        openWhatsApp();
                        onOpenChange?.(false);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
