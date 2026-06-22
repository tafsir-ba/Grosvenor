import { useState } from "react";
import { toast } from "sonner";
import { FileText, Download as DownloadIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import CtaButton from "@/components/shared/CtaButton";
import LeadForm from "@/components/shared/LeadForm";
import { formatApiError } from "@/lib/api";
import { accessDownload } from "@/lib/downloads";
import { LEAD_TYPE } from "@/lib/constants";

// Single download row handling gated (brochure) and open (price list).
export default function DownloadForm({ download, dark = false }) {
    const [open, setOpen] = useState(false);
    const gated = download.type === "brochure";

    const handleOpen = async () => {
        try {
            await accessDownload(download._id, null);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Unable to open file.");
        }
    };

    const gatedSubmit = async (leadPayload) => {
        await accessDownload(download._id, leadPayload);
        setOpen(false);
    };

    return (
        <div data-testid={`download-${download.type}`} className={`flex items-center justify-between gap-6 border-b py-6 ${dark ? "border-white/20" : "border-border"}`}>
            <div className="flex items-center gap-4">
                <FileText className={`h-6 w-6 flex-shrink-0 ${dark ? "text-white" : "text-brand-gold"}`} />
                <h4 className={`font-display text-2xl ${dark ? "text-white" : "text-brand-blue"}`}>{download.title}</h4>
            </div>

            {gated ? (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <CtaButton variant={dark ? "white" : "primary"} data-testid={`download-trigger-${download.type}`} className="flex-shrink-0">
                            <DownloadIcon className="h-4 w-4" /> Download
                        </CtaButton>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md" data-testid="download-dialog">
                        <DialogHeader>
                            <DialogTitle className="font-display text-2xl text-brand-blue">Download the Brochure</DialogTitle>
                            <DialogDescription>Share your details and we'll open your brochure right away.</DialogDescription>
                        </DialogHeader>
                        <LeadForm
                            leadType={LEAD_TYPE.DOWNLOAD_BROCHURE}
                            fields={["name", "email", "phone"]}
                            submitLabel="Get the Brochure"
                            testIdPrefix="brochure"
                            submitFn={gatedSubmit}
                        />
                    </DialogContent>
                </Dialog>
            ) : (
                <CtaButton variant={dark ? "outline-light" : "outline"} onClick={handleOpen} data-testid={`download-trigger-${download.type}`} className="flex-shrink-0">
                    <DownloadIcon className="h-4 w-4" /> Download
                </CtaButton>
            )}
        </div>
    );
}
