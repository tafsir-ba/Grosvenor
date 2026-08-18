import LeadForm from "@/components/shared/LeadForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { accessDownload } from "@/lib/downloads";
import { LEAD_TYPE } from "@/lib/constants";

export default function BrochureLeadDialog({ download, open, onOpenChange }) {
    const id = download?._id || download?.id;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent data-testid="brochure-lead-dialog">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-brand-blue">Download the brochure</DialogTitle>
                    <DialogDescription>
                        Share your name and email and the brochure will open in your browser.
                    </DialogDescription>
                </DialogHeader>
                {id && (
                    <LeadForm
                        leadType={LEAD_TYPE.DOWNLOAD_BROCHURE}
                        fields={["first_name", "last_name", "phone", "email"]}
                        submitLabel="Download Brochure"
                        successMessage="Thank you — your brochure is opening now."
                        successNextSteps="If the file did not open, allow pop-ups and try again."
                        testIdPrefix="brochure"
                        submitFn={(payload) => accessDownload(id, payload)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
