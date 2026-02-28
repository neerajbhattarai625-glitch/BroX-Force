"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useShop } from "@/lib/context/ShopContext";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
    const { adminConfig } = useShop();
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [shaking, setShaking] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === adminConfig.passwordHash) {
            sessionStorage.setItem("brox_admin_auth", "1");
            onSuccess();
        } else {
            setError(true);
            setShaking(true);
            setTimeout(() => setShaking(false), 600);
            setPassword("");
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
            <div
                className={`bg-[var(--card)] border border-[var(--border)] p-10 max-w-sm w-full text-center ${shaking ? "animate-[wiggle_0.2s_ease-in-out_3]" : ""}`}
                style={{ animation: shaking ? "wiggle 0.2s ease-in-out 3" : "none" }}
            >
                <ShieldCheck className="w-10 h-10 text-[#c9a84c] mx-auto mb-6" />
                <h1 className="font-heading font-bold text-3xl text-[var(--fg)] mb-2">Admin Access</h1>
                <p className="text-[var(--muted)] text-sm mb-8">Enter your password to continue.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type={showPw ? "text" : "password"}
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(false); }}
                            placeholder="Admin password"
                            className="w-full bg-transparent border border-[var(--border)] focus:border-[#c9a84c] p-3 pr-10 text-[var(--fg)] text-sm focus:outline-none transition-colors placeholder-[var(--muted)]"
                            required
                            suppressHydrationWarning
                        />
                        <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--fg)]">
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-xs">Incorrect password. Try again.</p>}
                    <button type="submit" className="w-full bg-[#c9a84c] text-black font-bold uppercase tracking-widest py-3 hover:bg-white transition-colors">
                        Enter Dashboard
                    </button>
                </form>

                <p className="text-[var(--muted)] text-xs mt-6 border-t border-[var(--border)] pt-4">
                    BroX Admin v1.0
                </p>
            </div>
        </div>
    );
}
