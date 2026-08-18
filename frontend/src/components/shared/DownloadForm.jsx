import { useState } from "react";
import { toast } from "sonner";
import { FileText, Download as DownloadIcon } from "lucide-react";
import CtaButton from "@/components/shared/CtaButton";
import BrochureLeadDialog from "@/components/shared/BrochureLeadDialog";
import { formatApiError } from "@/lib/api";
import { accessDownload } from "@/lib/downloads";
import { DOWNLOAD_TYPE } from "@/lib/constants";

export default function DownloadForm({ download, dark = false, compact = false }) {
    const isBrochure = download.type === DOWNLOAD_TYPE.BROCHURE;
    const [brochureOpen, setBrochureOpen] = useState(false);
    const label = isBrochure ? "Download Brochure" : "Price List";
    const outline = !isBrochure;

    const handleOpen = async () => {
        if (isBrochure) {
            setBrochureOpen(true);
            return;
        }
        try {
            await accessDownload(download._id || download.id, null);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Unable to open file.");
        }
    };

    const button = (
        <CtaButton
            variant={dark ? (outline ? "outline-light" : "white") : (outline ? "outline" : "primary")}
            onClick={handleOpen}
            data-testid={`download-trigger-${download.type}`}
            className={compact ? undefined : "flex-shrink-0"}
        >
            <DownloadIcon className="h-4 w-4" /> {compact ? label : "Download"}
        </CtaButton>
    );

    const dialog = (
        <BrochureLeadDialog
            download={download}
            open={brochureOpen}
            onOpenChange={setBrochureOpen}
        />
    );

    if (compact) {
        return (
            <>
                {button}
                {isBrochure && dialog}
            </>
        );
    }

    return (
        <div data-testid={`download-${download.type}`} className={`flex items-center justify-between gap-6 border-b py-6 ${dark ? "border-white/20" : "border-border"}`}>
            <div className="flex items-center gap-4">
                <FileText className={`h-6 w-6 flex-shrink-0 ${dark ? "text-white" : "text-brand-gold"}`} />
                <h4 className={`font-display text-2xl ${dark ? "text-white" : "text-brand-blue"}`}>{download.title}</h4>
            </div>
            {button}
            {isBrochure && dialog}
        </div>
    );
}
