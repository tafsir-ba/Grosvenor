import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsappFloatingButton from "@/components/shared/WhatsappFloatingButton";
import BrochureRail from "@/components/shared/BrochureRail";
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
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <WhatsappFloatingButton />
            <BrochureRail />
        </div>
    );
}
