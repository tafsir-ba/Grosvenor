import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LeadForm from "@/components/shared/LeadForm";
import { useDownloads } from "@/hooks/useData";
import { accessDownload } from "@/lib/downloads";
import { formatApiError } from "@/lib/api";
import { LEAD_TYPE } from "@/lib/constants";

// Always-visible vertical rail (like the live site) for brochure + price list.
export default function BrochureRail() {
    const downloads = useDownloads();
    const [open, setOpen] = useState(false);
    const brochure = downloads.find((d) => d.type === "brochure");
    const pricelist = downloads.find((d) => d.type === "pricelist");

    const openPricelist = async () => {
        if (!pricelist) return;
        try {
            await accessDownload(pricelist._id, null);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Unable to open.");
        }
    };

    const gatedSubmit = async (leadPayload) => {
        await accessDownload(brochure._id, leadPayload);
        setOpen(false);
    };

    const tabBase =
        "group flex items-center justify-center gap-3 px-4 py-7 text-[0.72rem] font-semibold uppercase tracking-[0.28em] transition-all duration-300";

    return (
        <>
            <div className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col md:flex" data-testid="brochure-rail">
                {brochure && (
                    <button
                        onClick={() => setOpen(true)}
                        data-testid="rail-brochure"
                        style={{ writingMode: "vertical-rl" }}
                        className={`${tabBase} rotate-180 bg-brand-gold text-white hover:bg-brand-gold/90`}
                    >
                        Download Brochure
                    </button>
                )}
                {pricelist && (
                    <button
                        onClick={openPricelist}
                        data-testid="rail-pricelist"
                        style={{ writingMode: "vertical-rl" }}
                        className={`${tabBase} rotate-180 border-t border-white/15 bg-brand-blue text-white hover:bg-brand-blue/90`}
                    >
                        Price List
                    </button>
                )}
            </div>

            {/* Mobile: bottom-left compact buttons */}
            <div className="fixed bottom-6 left-6 z-40 flex gap-3 md:hidden">
                {brochure && (
                    <button onClick={() => setOpen(true)} data-testid="rail-brochure-mobile" className="rounded-none bg-brand-gold px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white shadow-lg">Brochure</button>
                )}
                {pricelist && (
                    <button onClick={openPricelist} data-testid="rail-pricelist-mobile" className="rounded-none bg-brand-blue px-5 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white shadow-lg">Prices</button>
                )}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md" data-testid="rail-brochure-dialog">
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl text-brand-blue">Download the Brochure</DialogTitle>
                        <DialogDescription>Share your details and we'll open your brochure right away.</DialogDescription>
                    </DialogHeader>
                    {brochure && (
                        <LeadForm
                            leadType={LEAD_TYPE.DOWNLOAD_BROCHURE}
                            fields={["name", "email", "phone"]}
                            submitLabel="Get the Brochure"
                            testIdPrefix="rail-brochure-form"
                            submitFn={gatedSubmit}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
