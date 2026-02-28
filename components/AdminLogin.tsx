'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { useShop } from '@/lib/context/ShopContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

function CrystalOrb({ x, y, size, color, delay, duration }: {
    x: string; y: string; size: number; color: string; delay: number; duration: number;
}) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ left: x, top: y, width: size, height: size, background: color, filter: `blur(${size * 0.55}px)` }}
            animate={{ y: [0, -30, 10, -15, 0], x: [0, 12, -8, 6, 0], scale: [1, 1.1, 0.95, 1.05, 1], opacity: [0.35, 0.65, 0.45, 0.7, 0.35] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        />
    );
}

function Sparkle({ x, y, delay }: { x: string; y: string; delay: number }) {
    return (
        <motion.div
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{ left: x, top: y }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], background: ['#c9a84c', '#a060ff', '#40c8ff', '#ff8040', '#c9a84c'] }}
            transition={{ duration: 2.5, delay, repeat: Infinity, ease: 'easeInOut' }}
        />
    );
}

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

    useEffect(() => {
        // Only auto-focus on non-touch devices to prevent keyboard-induced layout shifts on mobile
        if (window.matchMedia('(pointer: fine)').matches) {
            inputRef.current?.focus();
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        if (password === adminConfig.passwordHash) {
            sessionStorage.setItem('brox_admin_auth', '1');
            onSuccess();
        } else {
            setError(true);
            setShaking(true);
            setTimeout(() => setShaking(false), 600);
            setPassword('');
        }
        setLoading(false);
    };

    // Dark mode: subtle jewel orbs; Light mode: vivid daylight prism orbs
    const orbs = isLight ? [
        { x: '8%', y: '15%', size: 240, color: 'radial-gradient(circle, rgba(251,113,133,0.55) 0%, rgba(216,180,254,0.35) 55%, transparent 100%)', delay: 0, duration: 8 },
        { x: '68%', y: '6%', size: 190, color: 'radial-gradient(circle, rgba(56,189,248,0.55) 0%, rgba(139,92,246,0.30) 55%, transparent 100%)', delay: 1, duration: 10 },
        { x: '78%', y: '55%', size: 200, color: 'radial-gradient(circle, rgba(52,211,153,0.45) 0%, rgba(99,102,241,0.28) 55%, transparent 100%)', delay: 2, duration: 9 },
        { x: '4%', y: '65%', size: 165, color: 'radial-gradient(circle, rgba(251,191,36,0.50) 0%, rgba(244,63,94,0.28) 55%, transparent 100%)', delay: 1.5, duration: 11 },
        { x: '40%', y: '80%', size: 145, color: 'radial-gradient(circle, rgba(167,139,250,0.50) 0%, rgba(236,72,153,0.28) 55%, transparent 100%)', delay: 0.5, duration: 7 },
        { x: '85%', y: '10%', size: 180, color: 'radial-gradient(circle, rgba(20,220,255,0.40) 0%, rgba(100,255,150,0.20) 55%, transparent 100%)', delay: 3, duration: 12 },
        { x: '30%', y: '40%', size: 150, color: 'radial-gradient(circle, rgba(255,100,100,0.35) 0%, rgba(255,200,100,0.20) 55%, transparent 100%)', delay: 4, duration: 9 },
        { x: '60%', y: '85%', size: 220, color: 'radial-gradient(circle, rgba(150,100,255,0.45) 0%, rgba(255,150,255,0.25) 55%, transparent 100%)', delay: 2.5, duration: 11 },
    ] : [
        { x: '8%', y: '18%', size: 220, color: 'radial-gradient(circle, rgba(201,168,76,0.45) 0%, rgba(160,70,255,0.25) 60%, transparent 100%)', delay: 0, duration: 8 },
        { x: '68%', y: '8%', size: 170, color: 'radial-gradient(circle, rgba(64,200,255,0.45) 0%, rgba(100,50,255,0.25) 60%, transparent 100%)', delay: 1, duration: 10 },
        { x: '78%', y: '58%', size: 190, color: 'radial-gradient(circle, rgba(255,120,60,0.35) 0%, rgba(200,70,255,0.25) 60%, transparent 100%)', delay: 2, duration: 9 },
        { x: '4%', y: '68%', size: 150, color: 'radial-gradient(circle, rgba(60,255,170,0.28) 0%, rgba(50,110,255,0.25) 60%, transparent 100%)', delay: 1.5, duration: 11 },
        { x: '42%', y: '78%', size: 130, color: 'radial-gradient(circle, rgba(255,50,110,0.28) 0%, rgba(170,50,255,0.18) 60%, transparent 100%)', delay: 0.5, duration: 7 },
    ];

    const sparkles = [
        { x: '20%', y: '35%', delay: 0 }, { x: '75%', y: '22%', delay: 0.8 },
        { x: '60%', y: '68%', delay: 1.6 }, { x: '14%', y: '52%', delay: 0.4 },
        { x: '85%', y: '42%', delay: 1.2 }, { x: '38%', y: '14%', delay: 2.0 },
        { x: '28%', y: '84%', delay: 0.6 }, { x: '90%', y: '78%', delay: 1.8 },
    ];

    return (
        <div
            className="fixed inset-0 w-full flex items-center justify-center p-4 overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, var(--admin-bg-start) 0%, var(--admin-bg-mid) 50%, var(--admin-bg-end) 100%)',
                zIndex: 50
            }}
        >
            {/* Animated background */}
            <div className="absolute inset-0 pointer-events-none">
                {orbs.map((orb, i) => <CrystalOrb key={i} {...orb} />)}
                {sparkles.map((s, i) => <Sparkle key={i} {...s} />)}

                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{ backgroundImage: 'linear-gradient(rgba(200,160,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,160,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />

                {/* Atmospheric Pulse (High-end, no rotation for stability) */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: isLight
                            ? 'radial-gradient(circle at 20% 30%, rgba(251,113,133,0.1) 0%, transparent 70%), radial-gradient(circle at 80% 70%, rgba(56,189,248,0.1) 0%, transparent 70%)'
                            : 'radial-gradient(circle at 20% 30%, rgba(200,160,255,0.03) 0%, transparent 70%), radial-gradient(circle at 80% 70%, rgba(100,220,255,0.03) 0%, transparent 70%)'
                    }}
                    animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.05, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Iridescent Grain Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`, filter: 'contrast(150%) brightness(150%)' }} />
            </div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`relative z-10 w-full max-w-sm ${shaking ? 'animate-[wiggle_0.2s_ease-in-out_3]' : ''}`}
            >
                <div
                    className="crystal-card rounded-3xl p-6 sm:p-10 text-center"
                    style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(255,255,255,0.05)' }}
                >
                    {/* Icon */}
                    <div className="relative inline-block mb-8">
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)' }}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                        />
                        <div className="relative w-16 h-16 rounded-2xl crystal-card flex items-center justify-center mx-auto" style={{ boxShadow: '0 0 20px rgba(201,168,76,0.15)' }}>
                            <ShieldCheck className="w-8 h-8 text-[var(--gold)]" />
                        </div>
                    </div>

                    <h1 className="font-heading text-4xl mb-1 tracking-tight" style={{ color: 'var(--crystal-text)' }}>Admin Access</h1>
                    <p className="text-sm mb-10" style={{ color: 'var(--crystal-muted)' }}>Enter your credentials to continue</p>

                    <form onSubmit={handleSubmit} className="space-y-5 text-left">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(false); }}
                                placeholder="Admin password"
                                className="w-full crystal-card rounded-xl p-4 pr-12 text-sm focus:outline-none transition-all border-0"
                                style={{
                                    color: 'var(--crystal-text)',
                                    background: 'var(--crystal-bg)',
                                    boxShadow: error
                                        ? '0 0 0 2px rgba(239,68,68,0.5), inset 0 1px 0 var(--crystal-shine)'
                                        : 'inset 0 1px 0 var(--crystal-shine)',
                                }}
                                required
                                suppressHydrationWarning
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(v => !v)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                style={{ color: 'var(--crystal-muted)' }}
                            >
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="text-red-400 text-xs font-bold tracking-wide text-center"
                                >
                                    ✕ Incorrect password. Try again.
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 font-bold text-[11px] uppercase tracking-widest transition-all rounded-xl relative overflow-hidden disabled:opacity-70"
                            style={{ background: 'var(--gold)', color: '#000' }}
                        >
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                                        <motion.div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                                        Verifying…
                                    </motion.span>
                                ) : (
                                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2">
                                        <Fingerprint className="w-4 h-4" /> Enter Dashboard
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </form>

                    <p className="text-[10px] uppercase tracking-widest mt-8 pt-6" style={{ color: 'var(--crystal-muted)', borderTop: '1px solid var(--crystal-border)' }}>
                        BroX Force Admin · v2.0
                    </p>
                </div>

                {/* Bottom glow */}
                <div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.22) 0%, transparent 70%)', filter: 'blur(16px)' }}
                />
            </motion.div>
        </div>
    );
}
