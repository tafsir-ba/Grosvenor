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

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUnits from "@/pages/admin/AdminUnits";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminDownloads from "@/pages/admin/AdminDownloads";
import ResidenceExplorer from "@/pages/admin/ResidenceExplorer";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" richColors closeButton />
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

                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="units" element={<AdminUnits />} />
                        <Route path="residence-explorer" element={<ResidenceExplorer />} />
                        <Route path="leads" element={<AdminLeads />} />
                        <Route path="downloads" element={<AdminDownloads />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
