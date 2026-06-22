import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // null = checking | false = guest | {} = user
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const check = async () => {
            if (!tokenStore.get()) {
                setUser(false);
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get("/auth/me");
                setUser(data);
            } catch {
                tokenStore.clear();
                setUser(false);
            } finally {
                setLoading(false);
            }
        };
        check();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });
        tokenStore.set(data.access_token);
        setUser(data.user);
        return data.user;
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch {
            /* ignore */
        }
        tokenStore.clear();
        setUser(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
