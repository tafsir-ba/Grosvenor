import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

import SiteLayout from "@/components/layout/SiteLayout";
import HomePage from "@/pages/HomePage";
import DevelopmentPage from "@/pages/DevelopmentPage";
import ResidencesPage from "@/pages/ResidencesPage";
import UnitDetailPage from "@/pages/UnitDetailPage";
import AmenitiesPage from "@/pages/AmenitiesPage";
import LocationPage from "@/pages/LocationPage";
import GalleryPage from "@/pages/GalleryPage";
import MortgagePage from "@/pages/MortgagePage";
import FaqPage from "@/pages/FaqPage";
import ContactPage from "@/pages/ContactPage";

const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUnits = lazy(() => import("@/pages/admin/AdminUnits"));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads"));
const AdminDownloads = lazy(() => import("@/pages/admin/AdminDownloads"));
const AdminNotifications = lazy(() => import("@/pages/admin/AdminNotifications"));
const ResidenceExplorer = lazy(() => import("@/pages/admin/ResidenceExplorer"));

function AdminFallback() {
    return <div className="flex min-h-screen items-center justify-center bg-brand-warm font-sans text-brand-ink/60">Loading…</div>;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-center" richColors closeButton visibleToasts={5} />
                <Routes>
                    <Route element={<SiteLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/the-development" element={<DevelopmentPage />} />
                        <Route path="/residences" element={<ResidencesPage />} />
                        <Route path="/residences/:slug" element={<UnitDetailPage />} />
                        <Route path="/amenities" element={<AmenitiesPage />} />
                        <Route path="/location" element={<LocationPage />} />
                        <Route path="/gallery" element={<GalleryPage />} />
                        <Route path="/mortgage" element={<MortgagePage />} />
                        <Route path="/faq" element={<FaqPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                    </Route>

                    <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>} />
                    <Route path="/admin" element={<Suspense fallback={<AdminFallback />}><AdminLayout /></Suspense>}>
                        <Route index element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
                        <Route path="units" element={<Suspense fallback={<AdminFallback />}><AdminUnits /></Suspense>} />
                        <Route path="residence-explorer" element={<Suspense fallback={<AdminFallback />}><ResidenceExplorer /></Suspense>} />
                        <Route path="leads" element={<Suspense fallback={<AdminFallback />}><AdminLeads /></Suspense>} />
                        <Route path="downloads" element={<Suspense fallback={<AdminFallback />}><AdminDownloads /></Suspense>} />
                        <Route path="notifications" element={<Suspense fallback={<AdminFallback />}><AdminNotifications /></Suspense>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
