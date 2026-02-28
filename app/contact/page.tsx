"use client";

import { Instagram, Twitter, Facebook, Mail, MapPin, Phone, Send, Sparkles, ShieldCheck, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
    const cardCls = "group relative bg-[var(--bg2)] border border-[var(--border-subtle)] p-8 overflow-hidden hover:border-[var(--gold)]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--gold)]/5";
    const inputCls = "w-full bg-[var(--bg3)] border border-[var(--border-subtle)] p-4 text-[var(--fg)] text-sm focus:outline-none focus:border-[var(--gold)] transition-all duration-300 placeholder-[var(--muted)]";
    const labelCls = "text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--muted)] mb-2 block";

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 12 }
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg)] pt-40 pb-40 px-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-24 text-center space-y-4"
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <span className="w-12 h-[1px] bg-[var(--gold)]/30"></span>
                        <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[var(--gold)]">Direct Channel</span>
                        <span className="w-12 h-[1px] bg-[var(--gold)]/30"></span>
                    </div>
                    <h1 className="font-heading text-6xl md:text-9xl text-[var(--fg)] tracking-tighter leading-none mb-6">
                        Connect<span className="text-[var(--gold)]">.</span>
                    </h1>
                    <p className="text-[var(--muted)] max-w-xl mx-auto text-sm md:text-md uppercase tracking-widest leading-relaxed font-medium">
                        Initiate correspondence regarding specialized artifacts, collaborations, or tactical support.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                >
                    {/* LEFT SIDE: INFO */}
                    <div className="lg:col-span-5 space-y-6">
                        <motion.div variants={itemVariants} className={cardCls}>
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                                <Globe className="w-24 h-24" />
                            </div>
                            <div className="flex items-start gap-6 relative z-10">
                                <div className="p-4 bg-[var(--gold-dim)] text-[var(--gold)] border border-[var(--gold)]/20">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--fg)] mb-2">Base Operations</h3>
                                    <p className="text-[var(--muted)] text-sm leading-relaxed">123 Tactical Way, Sector 7A<br />New London HQ, BK 90210</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className={cardCls}>
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                                <ShieldCheck className="w-24 h-24" />
                            </div>
                            <div className="flex items-start gap-6 relative z-10">
                                <div className="p-4 bg-[var(--gold-dim)] text-[var(--gold)] border border-[var(--gold)]/20">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--fg)] mb-2">Secure Link</h3>
                                    <p className="text-[var(--muted)] text-sm font-mono">+44 (0) 800 123 4567</p>
                                    <p className="text-[9px] text-[var(--gold)]/60 mt-1 uppercase tracking-widest">Available 09:00 - 18:00 GMT</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className={cardCls}>
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                                <Mail className="w-24 h-24" />
                            </div>
                            <div className="flex items-start gap-6 relative z-10">
                                <div className="p-4 bg-[var(--gold-dim)] text-[var(--gold)] border border-[var(--gold)]/20">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--fg)] mb-2">Digital Protocol</h3>
                                    <p className="text-[var(--muted)] text-sm">intel@broxforce.world</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-8 flex gap-4">
                            {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    href="#"
                                    whileHover={{ y: -5, color: "var(--gold)" }}
                                    className="p-3 bg-[var(--bg2)] border border-[var(--border-subtle)] text-[var(--muted)] hover:border-[var(--gold)] transition-all"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </motion.div>
                    </div>

                    {/* RIGHT SIDE: FORM */}
                    <motion.div variants={itemVariants} className="lg:col-span-7 bg-[var(--card)] border border-[var(--border-subtle)] p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent"></div>

                        <div className="flex items-center gap-4 mb-10">
                            <Send className="w-5 h-5 text-[var(--gold)]" />
                            <h2 className="text-xl font-heading text-[var(--fg)] uppercase tracking-widest">Signal Transmission</h2>
                        </div>

                        <form className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className={labelCls}>Identity</label>
                                    <input type="text" className={inputCls} placeholder="Your Name" />
                                </div>
                                <div>
                                    <label className={labelCls}>Frequency (Email)</label>
                                    <input type="email" className={inputCls} placeholder="name@domain.com" />
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Direct Subject</label>
                                <input type="text" className={inputCls} placeholder="How can we assist?" />
                            </div>

                            <div>
                                <label className={labelCls}>Briefing</label>
                                <textarea rows={6} className={inputCls + " resize-none"} placeholder="Detail your requirements..." />
                            </div>

                            <button
                                type="button"
                                className="group relative w-full bg-[var(--gold)] text-black font-black uppercase tracking-[0.4em] text-[11px] py-6 overflow-hidden transition-all duration-500 hover:bg-white active:scale-[0.98]"
                            >
                                <span className="relative z-10">Transmit Message</span>
                                <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></div>
                            </button>

                            <p className="text-center text-[8px] uppercase tracking-[0.5em] text-[var(--muted)] pt-4 font-bold">
                                Confidential Encryption Active
                            </p>
                        </form>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
