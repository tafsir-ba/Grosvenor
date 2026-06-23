import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, X, Download, CalendarCheck, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LeadForm from "@/components/shared/LeadForm";
import { useDownloads } from "@/hooks/useData";
import { accessDownload } from "@/lib/downloads";
import { formatApiError } from "@/lib/api";
import { PROJECT, LEAD_TYPE } from "@/lib/constants";
import { trackClick } from "@/lib/tracking";

// Single champagne-gold conversion hub. Replaces the brochure rail + WhatsApp button.
export default function FloatingActionButton() {
    const [open, setOpen] = useState(false);
    const [brochureOpen, setBrochureOpen] = useState(false);
    const downloads = useDownloads();
    const brochure = downloads.find((d) => d.type === "brochure");

    const gatedSubmit = async (payload) => {
        if (!brochure) return;
        try {
            await accessDownload(brochure._id, payload);
            setBrochureOpen(false);
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Unable to open file.");
        }
    };

    const actions = [
        { key: "brochure", label: "Download Brochure", icon: Download, onClick: () => { setBrochureOpen(true); setOpen(false); } },
        { key: "visit", label: "Book a Visit", icon: CalendarCheck, to: "/contact" },
        { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, href: PROJECT.contact.whatsapp, external: true, onClick: () => trackClick(LEAD_TYPE.WHATSAPP_CLICK) },
    ];

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4" data-testid="fab">
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-end gap-3"
                        >
                            {actions.map((a, i) => {
                                const inner = (
                                    <>
                                        <span className="rounded-none bg-brand-ink/90 px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white shadow-lg backdrop-blur">
                                            {a.label}
                                        </span>
                                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-ink shadow-lg transition-colors group-hover:bg-brand-gold group-hover:text-white">
                                            <a.icon className="h-5 w-5" />
                                        </span>
                                    </>
                                );
                                const cls = "group flex items-center gap-3";
                                const motionProps = {
                                    initial: { opacity: 0, y: 12 },
                                    animate: { opacity: 1, y: 0 },
                                    exit: { opacity: 0, y: 12 },
                                    transition: { duration: 0.25, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] },
                                };
                                if (a.to) {
                                    return (
                                        <motion.div key={a.key} {...motionProps}>
                                            <Link to={a.to} onClick={() => setOpen(false)} data-testid={`fab-${a.key}`} className={cls}>{inner}</Link>
                                        </motion.div>
                                    );
                                }
                                if (a.href) {
                                    return (
                                        <motion.div key={a.key} {...motionProps}>
                                            <a href={a.href} target="_blank" rel="noreferrer" onClick={() => { a.onClick?.(); setOpen(false); }} data-testid={`fab-${a.key}`} className={cls}>{inner}</a>
                                        </motion.div>
                                    );
                                }
                                return (
                                    <motion.div key={a.key} {...motionProps}>
                                        <button onClick={a.onClick} data-testid={`fab-${a.key}`} className={cls}>{inner}</button>
                                    </motion.div>
                                );
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
                    <motion.span animate={{ rotate: open ? 135 : 0 }} transition={{ duration: 0.3 }}>
                        {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                    </motion.span>
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
                        fields={["name", "email", "phone"]}
                        submitLabel="Get the Brochure"
                        testIdPrefix="fab-brochure"
                        submitFn={gatedSubmit}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
