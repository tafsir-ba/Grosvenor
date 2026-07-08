import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Download, CalendarCheck, MessageCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LeadForm from "@/components/shared/LeadForm";
import { useDownloads } from "@/hooks/useData";
import { accessDownload } from "@/lib/downloads";
import { formatApiError } from "@/lib/api";
import { PROJECT, LEAD_TYPE } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";

const CYCLE = [Download, CalendarCheck, MessageCircle, FileText];

// Single champagne-gold conversion hub. Replaces the brochure rail + WhatsApp button.
export default function FloatingActionButton() {
    const [open, setOpen] = useState(false);
    const [brochureOpen, setBrochureOpen] = useState(false);
    const [iconIdx, setIconIdx] = useState(0);
    const downloads = useDownloads();
    const brochure = downloads.find((d) => d.type === "brochure");
    const pricelist = downloads.find((d) => d.type === "pricelist");

    // Collapsed icon slowly rotates between actions to hint what's inside.
    useEffect(() => {
        if (open) return;
        const id = setInterval(() => setIconIdx((i) => (i + 1) % CYCLE.length), 2200);
        return () => clearInterval(id);
    }, [open]);

    const gatedSubmit = async (payload) => {
        if (!brochure) return;
        try {
            await accessDownload(brochure._id, payload);
            setBrochureOpen(false);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Unable to open file.");
        }
    };

    const openPricelist = async () => {
        if (!pricelist) return;
        try {
            await accessDownload(pricelist._id, null);
            setOpen(false);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Unable to open file.");
        }
    };

    const actions = [
        { key: "brochure", label: "Download Brochure", icon: Download, onClick: () => { setBrochureOpen(true); setOpen(false); } },
        { key: "pricelist", label: "Price List", icon: FileText, onClick: openPricelist, disabled: !pricelist },
        { key: "visit", label: "Book a Visit", icon: CalendarCheck, to: "/contact" },
        { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, href: PROJECT.contact.whatsapp, external: true, onClick: () => trackClick(LEAD_TYPE.WHATSAPP_CLICK) },
    ];

    const ActiveIcon = CYCLE[iconIdx];

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4" data-testid="fab">
                <AnimatePresence>
                    {open && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-end gap-3.5">
                            {actions.map((a, i) => {
                                const inner = (
                                    <>
                                        <span className="rounded-full border border-brand-beige bg-brand-warm/95 px-5 py-2.5 font-sans text-[0.95rem] tracking-wide text-brand-ink shadow-[0_8px_30px_rgba(74,69,63,0.12)] backdrop-blur">
                                            {a.label}
                                        </span>
                                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-ink shadow-[0_8px_24px_rgba(74,69,63,0.16)] transition-colors duration-300 group-hover:bg-brand-gold group-hover:text-white">
                                            <a.icon className="h-5 w-5" />
                                        </span>
                                    </>
                                );
                                const cls = "group flex items-center gap-3.5";
                                const mp = {
                                    initial: { opacity: 0, y: 12 },
                                    animate: { opacity: 1, y: 0 },
                                    exit: { opacity: 0, y: 12 },
                                    transition: { duration: 0.28, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
                                };
                                if (a.to) return <motion.div key={a.key} {...mp}><Link to={a.to} onClick={() => setOpen(false)} data-testid={`fab-${a.key}`} className={cls}>{inner}</Link></motion.div>;
                                if (a.href) return <motion.div key={a.key} {...mp}><a href={a.href} target="_blank" rel="noreferrer" onClick={() => { a.onClick?.(); setOpen(false); }} data-testid={`fab-${a.key}`} className={cls}>{inner}</a></motion.div>;
                                return <motion.div key={a.key} {...mp}><button type="button" onClick={a.onClick} disabled={a.disabled} data-testid={`fab-${a.key}`} className={`${cls}${a.disabled ? " opacity-50 pointer-events-none" : ""}`}>{inner}</button></motion.div>;
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setOpen((v) => !v)}
                    data-testid="fab-toggle"
                    aria-label={open ? "Close menu" : "Open contact menu"}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold text-white shadow-[0_10px_40px_rgba(198,134,43,0.45)] transition-transform duration-300 hover:scale-105"
                >
                    <AnimatePresence mode="wait">
                        {open ? (
                            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
                                <X className="h-6 w-6" />
                            </motion.span>
                        ) : (
                            <motion.span key={iconIdx} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                                <ActiveIcon className="h-6 w-6" />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            <Dialog open={brochureOpen} onOpenChange={setBrochureOpen}>
                <DialogContent className="sm:max-w-md" data-testid="fab-brochure-dialog">
                    <DialogHeader>
                        <DialogTitle className="lux-title text-3xl text-brand-blue">Download the Brochure</DialogTitle>
                        <DialogDescription>Share your details and we'll open your brochure right away.</DialogDescription>
                    </DialogHeader>
                    <LeadForm
                        leadType={LEAD_TYPE.DOWNLOAD_BROCHURE}
                        submitLabel="Get the Brochure"
                        messagePlaceholder="Anything we should know? (optional)"
                        testIdPrefix="fab-brochure"
                        submitFn={gatedSubmit}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
