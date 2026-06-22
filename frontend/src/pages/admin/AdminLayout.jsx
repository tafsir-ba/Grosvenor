import { NavLink, Outlet, useNavigate, Navigate } from "react-router-dom";
import { LayoutDashboard, Building2, Users, FileDown, LogOut } from "lucide-react";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const LINKS = [
    { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/units", label: "Units", icon: Building2 },
    { to: "/admin/leads", label: "Leads", icon: Users },
    { to: "/admin/downloads", label: "Downloads", icon: FileDown },
];

export default function AdminLayout() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    if (loading) return <div className="flex min-h-screen items-center justify-center bg-muted text-muted-foreground">Loading…</div>;
    if (!user) return <Navigate to="/admin/login" replace />;

    const handleLogout = async () => {
        await logout();
        navigate("/admin/login");
    };

    return (
        <div className="flex min-h-screen bg-muted/40" data-testid="admin-layout">
            <aside className="flex w-60 flex-col border-r border-border bg-card">
                <div className="border-b border-border p-6"><Logo color="blue" className="h-8" /></div>
                <nav className="flex-1 space-y-1 p-4">
                    {LINKS.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.end}
                            data-testid={`admin-nav-${l.label.toLowerCase()}`}
                            className={({ isActive }) =>
                                cn("flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive ? "bg-brand-blue text-white" : "text-brand-ink hover:bg-muted")
                            }
                        >
                            <l.icon className="h-4 w-4" /> {l.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="border-t border-border p-4">
                    <p className="px-3 pb-2 text-xs text-muted-foreground">{user.email}</p>
                    <button onClick={handleLogout} data-testid="admin-logout" className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-brand-ink transition-colors hover:bg-muted">
                        <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                </div>
            </aside>
            <main className="flex-1 overflow-x-hidden p-8"><Outlet /></main>
        </div>
    );
}
