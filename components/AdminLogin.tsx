'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Fingerprint, Lock } from 'lucide-react';
import { useShop } from '@/lib/context/ShopContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { motion } from 'framer-motion';

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
    const { adminConfig } = useShop();
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [shaking, setShaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus only on desktop to prevent keyboard-induced layout shifts on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
            inputRef.current?.focus();
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Minimal delay for "premium" feel
        await new Promise(r => setTimeout(r, 400));

        if (password === adminConfig.passwordHash) {
            sessionStorage.setItem('brox_admin_auth', 'true');
            onSuccess();
        } else {
            setError(true);
            setLoading(false);
            setShaking(true);
            setTimeout(() => setShaking(false), 500);
        }
    };

    return (
        <div
            className="fixed inset-0 w-screen h-screen flex items-center justify-center p-6 z-[99999] overflow-hidden touch-none"
            style={{
                background: isLight ? '#fdfdfd' : '#0a0a0b',
            }}
        >
            {/* Subtle Gradient Backdrop (Static) */}
            <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                    background: isLight
                        ? 'radial-gradient(circle at 50% -20%, #f0f0f0 0%, transparent 70%)'
                        : 'radial-gradient(circle at 50% -20%, #1a1a1c 0%, transparent 70%)'
                }}
            />

            {/* Minimalist Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`relative z-10 w-full max-w-[380px] ${shaking ? 'animate-[wiggle_0.2s_ease-in-out_3]' : ''}`}
            >
                <div
                    className="rounded-[32px] p-8 sm:p-10 text-center border transition-colors duration-500"
                    style={{
                        backgroundColor: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 15, 16, 0.8)',
                        borderColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: isLight ? '0 20px 50px rgba(0,0,0,0.05)' : '0 20px 80px rgba(0,0,0,0.3)'
                    }}
                >
                    {/* Minimal Icon */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-colors duration-500"
                        style={{
                            backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                            border: isLight ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)'
                        }}
                    >
                        <Lock className={`w-7 h-7 ${isLight ? 'text-black/70' : 'text-white/70'}`} strokeWidth={1.5} />
                    </div>

                    <h1 className="font-heading text-3xl mb-2 tracking-tight transition-colors duration-500"
                        style={{ color: isLight ? '#000' : '#fff' }}>
                        Protected Space
                    </h1>
                    <p className="text-sm mb-10 opacity-40 transition-colors duration-500"
                        style={{ color: isLight ? '#000' : '#fff' }}>
                        Administrative clearance required
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div className="relative group">
                            <input
                                ref={inputRef}
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(false); }}
                                placeholder="Access Key"
                                className="w-full rounded-xl py-4 px-5 pr-12 text-sm focus:outline-none transition-all duration-300 border"
                                style={{
                                    backgroundColor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                                    borderColor: error ? '#ef4444' : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'),
                                    color: isLight ? '#000' : '#fff',
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-60 transition-opacity"
                                style={{ color: isLight ? '#000' : '#fff' }}
                            >
                                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-500 disabled:opacity-30 active:scale-[0.98]"
                            style={{
                                backgroundColor: isLight ? '#000' : '#fff',
                                color: isLight ? '#fff' : '#000',
                            }}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Fingerprint size={16} />
                                    <span>Authenticate</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t opacity-10 flex flex-col items-center gap-1"
                        style={{ borderColor: isLight ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)' }}>
                        <span className="text-[9px] font-bold tracking-[0.3em] uppercase"
                            style={{ color: isLight ? '#000' : '#fff' }}>
                            BroX Force System
                        </span>
                        <span className="text-[7px] tracking-widest opacity-60"
                            style={{ color: isLight ? '#000' : '#fff' }}>
                            Version 3.0.0 Alpha
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
