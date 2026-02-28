"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Sun, Moon, Menu, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShop } from "@/lib/context/ShopContext";
import { useTheme } from "@/lib/context/ThemeContext";
import CartCanvas from "@/components/CartCanvas";

const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const { cartCount, theme: shopTheme } = useShop();
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            <nav className="fixed top-0 left-0 w-full z-50 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border)]">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-[68px]">

                    {/* Brand */}
                    <Link href="/" className="flex-shrink-0">
                        {shopTheme.logo ? (
                            <img src={shopTheme.logo} alt="BroX Force" className="h-[43px] w-auto object-contain" />
                        ) : (
                            <span className="font-heading text-2xl tracking-widest text-[var(--fg)]">
                                BroX<span className="text-[var(--gold)]"> Force</span>
                            </span>
                        )}
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-9">
                        {navLinks.map(link => {
                            const active = pathname === link.path;
                            return (
                                <Link key={link.name} href={link.path} className="relative group text-[11px] font-semibold uppercase tracking-[0.18em]">
                                    <span className={`transition-colors duration-200 ${active ? "text-[var(--gold)]" : "text-[var(--muted)] group-hover:text-[var(--fg)]"}`}>
                                        {link.name}
                                    </span>
                                    {active && (
                                        <motion.span layoutId="nav-pill" className="absolute -bottom-px left-0 right-0 h-px bg-[var(--gold)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-4">
                        {/* Theme toggle */}
                        <button onClick={toggleTheme} aria-label="Toggle theme" className="text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
                            <AnimatePresence mode="wait" initial={false}>
                                {theme === "dark"
                                    ? <motion.div key="sun" initial={{ opacity: 0, rotate: -30 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 30 }} transition={{ duration: 0.15 }}><Sun className="w-[17px] h-[17px]" /></motion.div>
                                    : <motion.div key="moon" initial={{ opacity: 0, rotate: 30 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -30 }} transition={{ duration: 0.15 }}><Moon className="w-[17px] h-[17px]" /></motion.div>
                                }
                            </AnimatePresence>
                        </button>

                        {/* Cart */}
                        <button onClick={() => setCartOpen(true)} aria-label="Cart" className="relative text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
                            <ShoppingBag className="w-[17px] h-[17px]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-4 h-4 bg-[var(--gold)] text-black text-[9px] font-black rounded-full flex items-center justify-center">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </button>

                        {/* Mobile hamburger */}
                        <button onClick={() => setMobileOpen(v => !v)} className="md:hidden text-[var(--muted)] hover:text-[var(--fg)] transition-colors" aria-label="Menu">
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile drawer */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-[var(--border)] bg-[var(--bg)]"
                        >
                            <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-5">
                                {navLinks.map(l => (
                                    <Link key={l.name} href={l.path} onClick={() => setMobileOpen(false)}
                                        className={`text-[11px] font-semibold uppercase tracking-[0.18em] border-b border-[var(--border-subtle)] pb-4 ${pathname === l.path ? "text-[var(--gold)]" : "text-[var(--muted)] hover:text-[var(--fg)]"}`}>
                                        {l.name}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <CartCanvas isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}
