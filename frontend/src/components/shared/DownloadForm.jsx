import { useState } from "react";
import { toast } from "sonner";
import { FileText, Download as DownloadIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import CtaButton from "@/components/shared/CtaButton";
import LeadForm from "@/components/shared/LeadForm";
import { api, formatApiError } from "@/lib/api";
import { LEAD_TYPE } from "@/lib/constants";

const BACKEND = process.env.REACT_APP_BACKEND_URL;

function openFile(fileUrl) {
    const url = fileUrl?.startsWith("http") ? fileUrl : `${BACKEND}${fileUrl}`;
    window.open(url, "_blank", "noopener");
}

// Single download component handling both gated (brochure) and open (price list).
export default function DownloadForm({ download }) {
    const [open, setOpen] = useState(false);
    const gated = download.type === "brochure";

    const accessOpen = async () => {
        try {
            const { data } = await api.post(`/downloads/${download._id}/access`, { lead: null });
            openFile(data.file_url);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Unable to open file.");
        }
    };

    const gatedSubmit = async (leadPayload) => {
        const { data } = await api.post(`/downloads/${download._id}/access`, { lead: leadPayload });
        openFile(data.file_url);
        setOpen(false);
    };

    return (
        <div data-testid={`download-${download.type}`} className="flex items-center justify-between gap-5 rounded-sm border border-border bg-card p-6">
            <div className="flex items-start gap-4">
                <FileText className="mt-1 h-6 w-6 flex-shrink-0 text-brand-gold" />
                <div>
                    <h4 className="font-display text-lg text-brand-ink">{download.title}</h4>
                    {download.description && <p className="mt-1 text-sm text-muted-foreground">{download.description}</p>}
                </div>
            </div>

            {gated ? (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <CtaButton variant="primary" data-testid={`download-trigger-${download.type}`} className="flex-shrink-0">
                            <DownloadIcon className="h-4 w-4" /> Download
                        </CtaButton>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md" data-testid="download-dialog">
                        <DialogHeader>
                            <DialogTitle className="font-display text-2xl text-brand-ink">Download the Brochure</DialogTitle>
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
                <CtaButton variant="outline" onClick={accessOpen} data-testid={`download-trigger-${download.type}`} className="flex-shrink-0">
                    <DownloadIcon className="h-4 w-4" /> Download
                </CtaButton>
            )}
        </div>
    );
}
