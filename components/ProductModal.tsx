import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ShoppingBag, ZoomIn } from "lucide-react";
import { Product } from "@/lib/context/ShopContext";
import { useShop } from "@/lib/context/ShopContext";
import Price from "@/components/Price";

interface Props {
    product: Product | null;
    onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
    const { addToCart } = useShop();
    const [size, setSize] = useState<string>("");
    const [color, setColor] = useState<string>("");
    const [customSize, setCustomSize] = useState<string>("");

    // Initialize selections
    useEffect(() => {
        if (product) {
            setSize(product.sizes?.[0] || "");
            setColor(product.colors?.[0] || "");
        }
    }, [product]);

    if (!product) return null;

    const isOutOfStock = product.stock <= 0 || product.status === "Out of Stock";

    return (
        <AnimatePresence>
            {product && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[var(--bg)]/80 modal-backdrop z-[80]"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.94, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 20 }}
                        transition={{ type: "spring", damping: 28, stiffness: 280 }}
                        className="fixed inset-4 md:inset-12 lg:inset-20 z-[90] bg-[var(--bg)] border border-[var(--border)] overflow-hidden flex flex-col md:flex-row"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-[100] text-[var(--muted)] hover:text-[var(--fg)] transition-colors bg-[var(--bg2)]/80 backdrop-blur-md border border-[var(--border-subtle)] p-2 md:p-2.5"
                        >
                            <X className="w-5 h-5 md:w-6 md:h-6" />
                        </button>

                        {/* Image */}
                        <div className="relative w-full md:w-1/2 bg-[var(--bg2)] flex-shrink-0 overflow-hidden" style={{ minHeight: "50vh" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-[9px] font-bold uppercase tracking-widest text-[var(--gold-hero)] px-3 py-1 border border-[var(--gold-hero)]/20">
                                {product.category}
                            </div>
                            {isOutOfStock && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                    <span className="bg-red-500 text-white px-4 py-2 font-bold uppercase tracking-[0.3em] text-[10px]">Sold Out</span>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col justify-between p-8 md:p-12 flex-grow overflow-y-auto">
                            <div>
                                <p className="text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-[var(--gold)] font-semibold mb-3 md:mb-4">
                                    BroX Force Enterprise Collection
                                </p>
                                <h2 className="font-heading text-3xl md:text-5xl text-[var(--fg)] leading-tight mb-4 tracking-tight">
                                    {product.title}
                                </h2>
                                <div className="w-10 h-px bg-[var(--gold)] mb-6" />

                                <div className="flex items-end gap-3 mb-8">
                                    <div className="font-mono text-3xl text-[var(--gold)] font-normal">
                                        <Price amount={product.price} />
                                    </div>
                                    {product.discountPrice && (
                                        <div className="font-mono text-sm text-[var(--muted)] line-through mb-1">
                                            <Price amount={product.discountPrice} />
                                        </div>
                                    )}
                                </div>

                                <p className="text-[var(--muted)] text-sm leading-relaxed mb-8">
                                    {product.description}
                                </p>

                                {/* Variant Selectors */}
                                <div className="grid grid-cols-2 gap-8 mb-10">
                                    {(product.sizes || []).length > 0 && (
                                        <div>
                                            <label className="text-[9px] uppercase tracking-widest text-[var(--muted)] font-bold mb-3 block">Select Size</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(product.sizes || []).map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => setSize(s)}
                                                        className={`w-10 h-10 text-[10px] font-bold border transition-all ${size === s ? "bg-[var(--gold)] border-[var(--gold)] text-black" : "border-[var(--border-subtle)] text-[var(--muted)] hover:border-[var(--fg)]"}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {(product.colors || []).length > 0 && (
                                        <div>
                                            <label className="text-[9px] uppercase tracking-widest text-[var(--muted)] font-bold mb-3 block">Select Color</label>
                                            <div className="flex flex-wrap gap-2">
                                                {(product.colors || []).map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setColor(c)}
                                                        className={`px-3 h-10 text-[9px] font-bold border uppercase tracking-widest transition-all ${color === c ? "bg-[var(--gold)] border-[var(--gold)] text-black" : "border-[var(--border-subtle)] text-[var(--muted)] hover:border-[var(--fg)]"}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-8 border-t border-[var(--border-subtle)]">
                                    <label className="text-[9px] uppercase tracking-widest text-[var(--muted)] font-bold mb-3 block">Personal Size (Optional)</label>
                                    <input
                                        type="text"
                                        value={customSize}
                                        onChange={(e) => setCustomSize(e.target.value)}
                                        placeholder="e.g. 42cm chest, or 'Extra Slim'"
                                        className="w-full bg-[var(--bg2)] border border-[var(--border-subtle)] p-4 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--gold)] transition-all placeholder-[var(--muted)]"
                                    />
                                    <p className="text-[9px] text-[var(--muted)] mt-2 uppercase tracking-wider">Provide your own measurements for a custom fit.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => { addToCart(product, size, color, customSize); onClose(); }}
                                    disabled={isOutOfStock}
                                    className="w-full bg-[var(--gold)] text-black font-bold text-[11px] uppercase tracking-[0.2em] py-4 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ShoppingBag className="w-4 h-4" /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full border border-[var(--border)] text-[var(--muted)] text-[11px] uppercase tracking-[0.2em] py-3 hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
