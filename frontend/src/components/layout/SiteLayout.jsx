import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingActionButton from "@/components/shared/FloatingActionButton";
import CookieNotice from "@/components/shared/CookieNotice";
import { captureAttribution } from "@/lib/tracking";

export default function SiteLayout() {
    const { pathname } = useLocation();

    useEffect(() => {
        captureAttribution();
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="flex min-h-screen flex-col bg-brand-warm text-brand-ink">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <FloatingActionButton />
            <CookieNotice />
        </div>
    );
}
