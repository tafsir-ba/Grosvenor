import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CtaButton from "@/components/shared/CtaButton";
import Logo from "@/components/brand/Logo";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Welcome back.");
            navigate("/admin");
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-ink px-6" data-testid="admin-login-page">
            <div className="w-full max-w-sm rounded-sm bg-card p-10">
                <Logo color="blue" className="mx-auto mb-8 h-10" />
                <h1 className="text-center font-display text-2xl text-brand-ink">Admin Login</h1>
                <form onSubmit={submit} className="mt-8 space-y-5" data-testid="admin-login-form">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" data-testid="admin-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" data-testid="admin-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <CtaButton type="submit" variant="primary" className="w-full" data-testid="admin-login-submit" disabled={loading}>
                        {loading ? "Signing in…" : "Sign In"}
                    </CtaButton>
                </form>
            </div>
        </div>
    );
}
