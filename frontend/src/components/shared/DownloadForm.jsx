import { useState } from "react";
import { FileText, Download as DownloadIcon } from "lucide-react";
import CtaButton from "@/components/shared/CtaButton";
import BrochureLeadDialog from "@/components/shared/BrochureLeadDialog";
import PriceListLeadDialog from "@/components/shared/PriceListLeadDialog";
import { DOWNLOAD_TYPE } from "@/lib/constants";

export default function DownloadForm({ download, dark = false, compact = false }) {
    const isBrochure = download.type === DOWNLOAD_TYPE.BROCHURE;
    const isPricelist = download.type === DOWNLOAD_TYPE.PRICELIST;
    const [brochureOpen, setBrochureOpen] = useState(false);
    const [pricelistOpen, setPricelistOpen] = useState(false);
    const label = isBrochure ? "Download Brochure" : "Price List";
    const outline = !isBrochure;

    const handleOpen = () => {
        if (isBrochure) {
            setBrochureOpen(true);
            return;
        }
        if (isPricelist) {
            setPricelistOpen(true);
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

    const dialogs = (
        <>
            {isBrochure && (
                <BrochureLeadDialog
                    download={download}
                    open={brochureOpen}
                    onOpenChange={setBrochureOpen}
                />
            )}
            {isPricelist && (
                <PriceListLeadDialog
                    download={download}
                    open={pricelistOpen}
                    onOpenChange={setPricelistOpen}
                />
            )}
        </>
    );

    if (compact) {
        return (
            <>
                {button}
                {dialogs}
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
            {dialogs}
        </div>
    );
}
