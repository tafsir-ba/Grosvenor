import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import CtaButton from "@/components/shared/CtaButton";
import { LEGAL } from "@/lib/constants";

const STORE_KEY = "gv_cookie_consent";

export default function CookieNotice() {
    const [visible, setVisible] = useState(false);
    const [managing, setManaging] = useState(false);
    const [analytics, setAnalytics] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(STORE_KEY);
        if (!stored) setVisible(true);
    }, []);

    const persist = (prefs) => {
        localStorage.setItem(STORE_KEY, JSON.stringify({ ...prefs, ts: Date.now() }));
        setVisible(false);
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed bottom-5 left-5 z-[60] w-[calc(100%-2.5rem)] max-w-md"
                    data-testid="cookie-notice"
                >
                    <div className="rounded-3xl border border-brand-beige bg-brand-warm/95 p-7 shadow-[0_20px_60px_rgba(74,69,63,0.18)] backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gold/12 text-brand-gold">
                                <Cookie className="h-5 w-5" />
                            </span>
                            <h3 className="lux-title text-2xl text-brand-blue">A note on cookies</h3>
                        </div>
                        <p className="mt-4 font-sans text-sm leading-relaxed text-brand-ink/65">
                            We use cookies to enhance your experience and understand how our site is used. See our{" "}
                            <a href={LEGAL.privacyUrl} target="_blank" rel="noreferrer" className="text-brand-gold underline underline-offset-2" data-testid="cookie-privacy-link">Privacy Policy</a>.
                        </p>

                        <AnimatePresence initial={false}>
                            {managing && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-5 space-y-3 border-t border-brand-beige pt-5">
                                        <label className="flex items-center justify-between gap-4">
                                            <span className="font-sans text-sm text-brand-ink/70">Essential <span className="text-brand-ink/40">— always on</span></span>
                                            <Checkbox checked disabled className="h-5 w-5 rounded-[6px] border-brand-ink/20 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold" />
                                        </label>
                                        <label className="flex cursor-pointer items-center justify-between gap-4" htmlFor="cookie-analytics">
                                            <span className="font-sans text-sm text-brand-ink/70">Analytics & performance</span>
                                            <Checkbox id="cookie-analytics" data-testid="cookie-analytics-toggle" checked={analytics} onCheckedChange={(v) => setAnalytics(!!v)} className="h-5 w-5 rounded-[6px] border-brand-ink/30 data-[state=checked]:border-brand-gold data-[state=checked]:bg-brand-gold data-[state=checked]:text-white" />
                                        </label>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <CtaButton variant="primary" data-testid="cookie-accept" onClick={() => persist({ essential: true, analytics: true })} className="px-7 py-3">
                                Accept All
                            </CtaButton>
                            {managing ? (
                                <CtaButton variant="outline" data-testid="cookie-save" onClick={() => persist({ essential: true, analytics })} className="px-7 py-3">
                                    Save Preferences
                                </CtaButton>
                            ) : (
                                <button onClick={() => setManaging(true)} data-testid="cookie-manage" className="font-sans text-sm tracking-wide text-brand-ink/60 underline underline-offset-4 transition-colors hover:text-brand-gold">
                                    Manage Preferences
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
