"use client";

import Link from "next/link";
import { useShop } from "@/lib/context/ShopContext";
import { Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
    const { theme } = useShop();
    const bg = theme.footer;

    return (
        <footer
            className="border-t border-[var(--border)] relative"
            style={bg ? { backgroundImage: `url('${bg}')`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
        >
            {bg && <div className="absolute inset-0 bg-[var(--bg)]/85" />}

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-12">

                {/* Brand */}
                <div className="col-span-2 md:col-span-1">
                    <Link href="/">
                        <span className="font-heading text-2xl tracking-widest text-[var(--fg)]">
                            BroX<span className="text-[var(--gold)]"> Force</span>
                        </span>
                    </Link>
                    <p className="text-xs text-[var(--muted)] leading-relaxed mt-4 max-w-[200px]">
                        Wear the Vibe. Own the Identity.
                    </p>
                    <div className="flex gap-4 mt-6">
                        {[Instagram, Twitter, Facebook].map((Icon, i) => (
                            <a key={i} href="#" className="text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Shop */}
                <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--gold)] mb-5 font-semibold">Shop</p>
                    <ul className="space-y-3">
                        {["All Products", "T-Shirts", "Hoodies", "Trousers"].map(item => (
                            <li key={item}>
                                <Link href="/shop" className="text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors">{item}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--gold)] mb-5 font-semibold">Company</p>
                    <ul className="space-y-3">
                        {[{ label: "Home", path: "/" }, { label: "About", path: "/about" }, { label: "Contact", path: "/contact" }].map(item => (
                            <li key={item.label}>
                                <Link href={item.path} className="text-xs text-[var(--muted)] hover:text-[var(--fg)] transition-colors">{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Newsletter — suppressHydrationWarning fixes browser-extension hydration mismatch */}
                <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[var(--gold)] mb-5 font-semibold">Stay Updated</p>
                    <form className="flex flex-col gap-2" onSubmit={e => e.preventDefault()}>
                        <input
                            suppressHydrationWarning
                            type="email"
                            autoComplete="off"
                            placeholder="your@email.com"
                            className="bg-transparent border border-[var(--border)] px-3 py-2.5 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--gold)] transition-colors placeholder-[var(--muted)]"
                        />
                        <button type="submit" className="bg-[var(--gold)] text-black py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors">
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pb-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-2">
                <p className="text-[10px] text-[var(--muted)] tracking-wider">© {new Date().getFullYear()} BroX Force. All rights reserved.</p>
                <div className="flex gap-6">
                    {["Privacy", "Terms"].map(l => (
                        <Link key={l} href="#" className="text-[10px] text-[var(--muted)] hover:text-[var(--gold)] transition-colors">{l}</Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
