"use client";

import { useState } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight } from "lucide-react";
import { useShop } from "@/lib/context/ShopContext";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Price from "@/components/Price";

export default function CartCanvas({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { cartItems, removeFromCart, updateQuantity, cartSubtotal, applyVoucher } = useShop();
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherMsg, setVoucherMsg] = useState<{ text: string; success: boolean } | null>(null);
    const [discount, setDiscount] = useState(0);
    const router = useRouter();

    const handleApplyVoucher = () => {
        if (!voucherCode.trim()) return;
        const result = applyVoucher(voucherCode);
        setVoucherMsg({ text: result.message, success: result.success });
        if (result.success) setDiscount(result.discount);
    };

    const discountedTotal = cartSubtotal * (1 - discount / 100);

    const handleCheckout = () => {
        onClose();
        const vQuery = voucherMsg?.success ? `&voucher=${voucherCode.toUpperCase().trim()}` : "";
        router.push(`/checkout?discount=${discount}${vQuery}`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 modal-backdrop z-[60]"
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.aside
                        key="drawer"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#0f0f0f] z-[70] flex flex-col border-l border-[#c9a84c]/20 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-[#c9a84c]" />
                                <h2 className="font-heading font-bold text-xl tracking-wide text-white">Your Cart</h2>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                            {cartItems.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                    <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
                                    <p className="text-sm uppercase tracking-widest">Your cart is empty</p>
                                </div>
                            )}
                            {cartItems.map(item => (
                                <div key={item.product.id} className="flex gap-4 items-start border-b border-white/5 pb-5">
                                    <div className="w-16 h-20 bg-zinc-900 overflow-hidden shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.product.imageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider truncate">{item.product.title}</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <p className="text-[10px] text-gray-400">{item.product.category}</p>
                                            {(item.selectedSize || item.customSize) && (
                                                <p className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-widest">
                                                    • {item.customSize || item.selectedSize}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-[#c9a84c] font-mono text-sm font-bold mt-2">
                                            <Price amount={item.product.price} />
                                        </div>

                                        <div className="flex items-center gap-3 mt-3">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="w-7 h-7 flex items-center justify-center border border-white/20 hover:border-[#c9a84c] transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="font-mono text-sm text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                className="w-7 h-7 flex items-center justify-center border border-white/20 hover:border-[#c9a84c] transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Voucher & Total */}
                        <div className="px-6 py-5 border-t border-white/10 space-y-4">
                            {/* Voucher */}
                            <div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            value={voucherCode}
                                            onChange={e => setVoucherCode(e.target.value)}
                                            placeholder="Voucher Code"
                                            className="w-full bg-black border border-white/10 pl-9 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a84c] transition-colors placeholder-gray-600"
                                        />
                                    </div>
                                    <button
                                        onClick={handleApplyVoucher}
                                        className="px-4 py-2.5 bg-[#c9a84c] text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {voucherMsg && (
                                    <p className={`text-xs mt-2 ${voucherMsg.success ? "text-green-400" : "text-red-400"}`}>
                                        {voucherMsg.text}
                                    </p>
                                )}
                            </div>

                            {/* Subtotal */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-mono">
                                        <Price amount={cartSubtotal} />
                                    </span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-400">
                                        <span>Discount ({discount}%)</span>
                                        <span className="font-mono">
                                            -<Price amount={cartSubtotal - discountedTotal} />
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-3">
                                    <span>Total</span>
                                    <span className="font-mono text-[#c9a84c]">
                                        <Price amount={discountedTotal} />
                                    </span>
                                </div>
                            </div>

                            <button
                                disabled={cartItems.length === 0}
                                onClick={handleCheckout}
                                className="w-full bg-[#c9a84c] text-black font-bold uppercase tracking-widest py-4 text-sm hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
