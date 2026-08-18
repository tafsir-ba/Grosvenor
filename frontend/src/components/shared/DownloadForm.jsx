import { toast } from "sonner";
import { FileText, Download as DownloadIcon } from "lucide-react";
import CtaButton from "@/components/shared/CtaButton";
import { formatApiError } from "@/lib/api";
import { accessDownload } from "@/lib/downloads";
import { trackGenerateLead } from "@/lib/tracking";

// Open download row — brochure and price list both open via public link.
export default function DownloadForm({ download, dark = false, compact = false }) {
    const label = download.type === "brochure" ? "Download Brochure" : "Price List";
    const outline = download.type !== "brochure";

    const handleOpen = async () => {
        try {
            await accessDownload(download._id || download.id, null);
            if (download.type === "brochure") {
                trackGenerateLead("Brochure");
            }
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

    if (compact) {
        return button;
    }

    return (
        <div data-testid={`download-${download.type}`} className={`flex items-center justify-between gap-6 border-b py-6 ${dark ? "border-white/20" : "border-border"}`}>
            <div className="flex items-center gap-4">
                <FileText className={`h-6 w-6 flex-shrink-0 ${dark ? "text-white" : "text-brand-gold"}`} />
                <h4 className={`font-display text-2xl ${dark ? "text-white" : "text-brand-blue"}`}>{download.title}</h4>
            </div>
            {button}
        </div>
    );
}
