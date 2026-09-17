import LeadForm from "@/components/shared/LeadForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { accessDownload } from "@/lib/downloads";
import { LEAD_TYPE } from "@/lib/constants";

export default function PriceListLeadDialog({ download, open, onOpenChange }) {
    const id = download?._id || download?.id;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent data-testid="pricelist-lead-dialog">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-brand-blue">Download the price list</DialogTitle>
                    <DialogDescription>
                        Share your name, email, and phone number and the price list will open in your browser.
                    </DialogDescription>
                </DialogHeader>
                {id && (
                    <LeadForm
                        leadType={LEAD_TYPE.DOWNLOAD_PRICE_LIST}
                        fields={["first_name", "last_name", "phone", "email", "message"]}
                        submitLabel="Download Price List"
                        successMessage="Thank you — your price list is opening now."
                        successNextSteps="If the file did not open, allow pop-ups and try again."
                        testIdPrefix="pricelist"
                        submitFn={(payload) => accessDownload(id, payload)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
