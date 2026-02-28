"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "@/lib/context/ShopContext";
import { CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Price from "@/components/Price";

function generateChallenge() {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { a, b, answer: a + b };
}

function CheckoutContent() {
    const { cartItems, cartSubtotal, clearCart, addOrder, adminConfig } = useShop();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Shipping logic
    const shipping = cartSubtotal >= adminConfig.freeShippingThreshold ? 0 : adminConfig.shippingCost;
    const discountPct = Number(searchParams.get("discount") || "0");
    const appliedVoucherCode = searchParams.get("voucher") || undefined;
    const subtotalAfterDiscount = cartSubtotal * (1 - discountPct / 100);
    const total = subtotalAfterDiscount + shipping;

    const [form, setForm] = useState({ name: "", phone: "", email: "", location: "", paymentMethod: "Cash on Delivery", paymentCurrency: "NPR" as "NPR" | "USD" });
    const [challenge, setChallenge] = useState(generateChallenge());
    const [verifyInput, setVerifyInput] = useState("");
    const [verifyError, setVerifyError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setChallenge(generateChallenge());
        // Set default payment method based on config
        const available = Object.entries(adminConfig.payments).filter(([, v]) => v);
        if (available.length > 0) {
            const labels: any = { esewa: "eSewa", khalti: "Khalti", stripe: "Stripe", cod: "Cash on Delivery" };
            setForm(prev => ({ ...prev, paymentMethod: labels[available[0][0]] }));
        }
    }, [adminConfig]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifyError(false);
        setError("");

        if (parseInt(verifyInput) !== challenge.answer) {
            setVerifyError(true);
            setChallenge(generateChallenge());
            setVerifyInput("");
            return;
        }

        setLoading(true);
        try {
            const orderItems = cartItems.map(i => ({
                title: i.product.title,
                quantity: i.quantity,
                price: i.product.price,
                size: i.selectedSize,
                color: i.selectedColor,
                customSize: i.customSize
            }));

            const payload = {
                customerName: form.name,
                customerPhone: form.phone,
                customerEmail: form.email,
                customerLocation: form.location,
                items: orderItems,
                subtotal: cartSubtotal.toFixed(2),
                discount: discountPct,
                total: total.toFixed(2),
                paymentMethod: form.paymentMethod,
                adminEmail: adminConfig.orderEmail,
            };

            // 1. Send Email (Mocked internal API)
            await fetch("/api/send-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            // 2. Save order to admin panel context
            addOrder({
                customerName: form.name,
                customerPhone: form.phone,
                customerEmail: form.email,
                customerLocation: form.location,
                items: orderItems,
                subtotal: cartSubtotal.toFixed(2),
                discount: discountPct,
                total: total.toFixed(2),
                paymentMethod: form.paymentMethod,
                paymentCurrency: form.paymentCurrency,
                appliedVoucher: appliedVoucherCode,
            });

            clearCart();
            setShowSuccess(true);
        } catch (e) {
            console.error(e);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && !showSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center px-4">
                <div>
                    <p className="text-gray-500 text-lg mb-6">No items in your cart.</p>
                    <button onClick={() => router.push("/shop")} className="bg-[#c9a84c] text-black px-8 py-3 font-bold uppercase tracking-widest hover:bg-white transition-colors">
                        Shop Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-32">
            {/* Success Popup */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/85 modal-backdrop z-[80] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 20, stiffness: 200 }}
                            className="bg-[#111] border border-[#c9a84c]/40 p-10 max-w-md w-full text-center"
                        >
                            <CheckCircle2 className="w-16 h-16 text-[#c9a84c] mx-auto mb-4 glow-pulse" />
                            <h2 className="font-heading font-bold text-3xl text-white mb-3">Order Placed!</h2>
                            <p className="text-gray-300 text-base leading-relaxed">
                                Our team will contact you soon.
                            </p>
                            <div className="w-16 h-px bg-[#c9a84c] mx-auto my-6" />
                            <button
                                onClick={() => router.push("/")}
                                className="bg-[#c9a84c] text-black font-bold uppercase tracking-widest px-8 py-3 hover:bg-white transition-colors"
                            >
                                Back to Home
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <h1 className="font-heading font-bold text-5xl md:text-6xl tracking-tight text-white mb-2">Checkout</h1>
                <div className="h-px w-20 bg-[#c9a84c] mb-12" />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#c9a84c] font-bold">Your Details</p>

                        {[
                            { label: "Full Name", name: "name", type: "text", placeholder: "Neeraj Bhattarai" },
                            { label: "Phone Number", name: "phone", type: "tel", placeholder: "+977 9800000000" },
                            { label: "Email Address", name: "email", type: "email", placeholder: "you@example.com" },
                        ].map(f => (
                            <div key={f.name} className="space-y-1.5">
                                <label className="text-xs uppercase tracking-widest text-gray-400 font-semibold block">{f.label}</label>
                                <input
                                    type={f.type}
                                    name={f.name}
                                    value={(form as any)[f.name]}
                                    onChange={handleChange}
                                    placeholder={f.placeholder}
                                    required
                                    className="w-full bg-black border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-[#c9a84c] transition-colors placeholder-gray-600"
                                />
                            </div>
                        ))}

                        <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-widest text-gray-400 font-semibold block">Delivery Address</label>
                            <textarea
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Street, City, Country"
                                required
                                rows={3}
                                className="w-full bg-black border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-[#c9a84c] transition-colors placeholder-gray-600 resize-none"
                            />
                        </div>

                        {/* Verification */}
                        <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className="w-5 h-5 text-[#c9a84c]" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-white">Human Verification</h3>
                            </div>
                            <p className="text-gray-300 text-sm">
                                Solve: <strong className="text-[#c9a84c] font-mono text-base ml-1">{challenge.a} + {challenge.b} = ?</strong>
                            </p>
                            <input
                                type="number"
                                value={verifyInput}
                                onChange={e => setVerifyInput(e.target.value)}
                                placeholder="Your answer"
                                required
                                className="w-full max-w-xs bg-black border border-white/10 p-3 text-white text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
                            />
                            {verifyError && (
                                <p className="text-red-400 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> Incorrect. A new challenge has been generated.
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5 pt-4">
                            <label className="text-xs uppercase tracking-widest text-[#c9a84c] font-bold block mb-2">Payment Currency</label>
                            <div className="grid grid-cols-2 gap-3">
                                {["NPR", "USD"].map((curr) => (
                                    <button
                                        key={curr}
                                        type="button"
                                        onClick={() => {
                                            setForm(p => {
                                                const nextCurr = curr as "NPR" | "USD";
                                                // Auto-select first valid method for the new currency if the old one is incompatible
                                                let nextMethod = p.paymentMethod;
                                                if (nextCurr === "USD") {
                                                    if (!["PayPal", "Stripe"].includes(nextMethod)) nextMethod = "PayPal";
                                                } else {
                                                    if (!["eSewa", "Khalti", "Cash on Delivery"].includes(nextMethod)) nextMethod = "Cash on Delivery";
                                                }
                                                return { ...p, paymentCurrency: nextCurr, paymentMethod: nextMethod };
                                            });
                                        }}
                                        className={`p-3 text-[10px] uppercase font-bold tracking-widest border transition-all ${form.paymentCurrency === curr ? "bg-[var(--gold)] border-[var(--gold)] text-black" : "bg-black border-white/10 text-gray-400 hover:border-white/30"}`}
                                    >
                                        Pay in {curr}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-4">
                            <label className="text-xs uppercase tracking-widest text-[#c9a84c] font-bold block mb-2">Payment Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(adminConfig.payments).filter(([id, active]) => {
                                    if (!active) return false;
                                    // Mapping: 
                                    // NPR -> esewa, khalti, cod
                                    // USD -> paypal, stripe
                                    if (form.paymentCurrency === "NPR") {
                                        return ["esewa", "khalti", "cod"].includes(id);
                                    } else {
                                        return ["paypal", "stripe"].includes(id);
                                    }
                                }).map(([id]) => {
                                    const labels: any = { esewa: "eSewa", khalti: "Khalti", stripe: "Stripe", cod: "Cash on Delivery", paypal: "PayPal" };
                                    const label = labels[id];
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => setForm(p => ({ ...p, paymentMethod: label }))}
                                            className={`p-3 text-[10px] uppercase font-bold tracking-widest border transition-all ${form.paymentMethod === label ? "bg-[var(--gold)] border-[var(--gold)] text-black" : "bg-black border-white/10 text-gray-400 hover:border-white/30"}`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#c9a84c] text-black font-bold uppercase tracking-widest py-4 hover:bg-white transition-colors disabled:opacity-50"
                        >
                            {loading ? "Placing Order…" : "Place Order"}
                        </button>
                    </form>

                    {/* Summary */}
                    <div className="lg:col-span-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#c9a84c] font-bold mb-6">Order Summary</p>
                        <div className="bg-[#0f0f0f] border border-white/5 p-6 space-y-4">
                            {cartItems.map(item => (
                                <div key={item.product.id} className="flex justify-between text-sm border-b border-white/5 pb-4">
                                    <div>
                                        <p className="text-white font-semibold truncate max-w-[160px]">{item.product.title}</p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Qty: {item.quantity} • {item.customSize || item.selectedSize}/{item.selectedColor}
                                        </p>
                                    </div>
                                    <span className="font-mono text-[#c9a84c] font-bold">
                                        <Price amount={parseFloat(item.product.price) * item.quantity} />
                                    </span>
                                </div>
                            ))}
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-mono">
                                        <Price amount={cartSubtotal} />
                                    </span>
                                </div>
                                {discountPct > 0 && (
                                    <div className="flex justify-between text-sm text-green-400">
                                        <span>Discount ({discountPct}%)</span>
                                        <span className="font-mono">
                                            -<Price amount={cartSubtotal * (discountPct / 100)} />
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Shipping</span>
                                    <span className="font-mono">
                                        {shipping === 0 ? "FREE" : <Price amount={shipping} />}
                                    </span>
                                </div>
                                <div className="flex justify-between text-white font-bold text-xl border-t border-white/10 pt-3">
                                    <span>Total</span>
                                    <span className="font-mono text-[#c9a84c]">
                                        <Price amount={total} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}
