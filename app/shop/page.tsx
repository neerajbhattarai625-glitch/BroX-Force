"use client";

import { useState, useMemo } from "react";
import { useShop, Product } from "@/lib/context/ShopContext";
import { ShoppingBag, Search, Filter, Sparkles, SlidersHorizontal } from "lucide-react";
import ProductModal from "@/components/ProductModal";
import Price from "@/components/Price";
import { motion, AnimatePresence } from "framer-motion";

export default function ShopPage() {
    const { products, categories: dynamicCategories } = useShop();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const categories = useMemo(() => ["All", ...dynamicCategories], [dynamicCategories]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    return (
        <div className="min-h-screen bg-[var(--bg)] pt-32 pb-40 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-[var(--gold)]" />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--muted)]">Curated Collection</span>
                        </div>
                        <h1 className="font-heading text-6xl md:text-8xl text-[var(--fg)] tracking-tighter leading-none">
                            Shop<span className="text-[var(--gold)]">.</span>
                        </h1>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="relative group flex-1 sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] group-focus-within:text-[var(--gold)] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search the drop..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[var(--bg2)] border border-[var(--border-subtle)] py-4 pl-12 pr-6 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--gold)] transition-all placeholder-[var(--muted)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="p-3 bg-[var(--bg2)] border border-[var(--border-subtle)] text-[var(--muted)]">
                        <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border transition-all duration-300 whitespace-nowrap ${selectedCategory === cat
                                ? "bg-[var(--gold)] border-[var(--gold)] text-black"
                                : "bg-transparent border-[var(--border-subtle)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map(product => {
                        const isOutOfStock = product.stock <= 0 || product.status === "Out of Stock";
                        return (
                            <motion.div
                                layout
                                key={product.id}
                                className="group relative bg-[var(--card)] border border-[var(--border-subtle)] flex flex-col hover:border-[var(--gold)]/30 transition-all duration-500"
                            >
                                {/* Badges */}
                                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                    {product.isFeatured && (
                                        <span className="bg-[var(--gold)] text-black text-[8px] font-black uppercase tracking-widest px-2 py-1 shadow-xl">Featured</span>
                                    )}
                                    {product.discountPrice && (
                                        <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 shadow-xl">Sale</span>
                                    )}
                                </div>

                                {/* Image Wrapper */}
                                <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg2)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={product.imageUrl}
                                        alt={product.title}
                                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? "opacity-40 grayscale" : ""}`}
                                    />

                                    {/* Quick Hover Overlay */}
                                    {!isOutOfStock && (
                                        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-20">
                                            <button
                                                onClick={() => setSelectedProduct(product)}
                                                className="w-full bg-[var(--bg)]/90 backdrop-blur-md text-[var(--fg)] border border-[var(--border-subtle)] py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[var(--gold)] hover:text-black transition-all flex items-center justify-center gap-2"
                                            >
                                                <ShoppingBag className="w-3 h-3" /> Quick Add
                                            </button>
                                        </div>
                                    )}

                                    {isOutOfStock && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-red-400 font-bold uppercase tracking-[0.3em] text-[10px] border border-red-400/30 px-4 py-2 bg-black/40 backdrop-blur-sm">Sold Out</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--muted)] font-bold">{product.category}</p>
                                        <p className="text-[9px] uppercase tracking-widest text-[var(--gold)] font-mono">{product.stock} Units</p>
                                    </div>
                                    <h3
                                        onClick={() => setSelectedProduct(product)}
                                        className="text-lg font-heading text-[var(--fg)] mb-4 group-hover:text-[var(--gold)] transition-colors cursor-pointer"
                                    >
                                        {product.title}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xl text-[var(--fg)]">
                                            <Price amount={product.price} />
                                        </span>
                                        {product.discountPrice && (
                                            <span className="font-mono text-xs text-[var(--muted)] line-through">
                                                <Price amount={product.discountPrice} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-40 text-center border border-dashed border-[var(--border)]">
                        <p className="text-[var(--muted)] uppercase tracking-[0.4em] text-xs">No artifacts found for this selection</p>
                    </div>
                )}
            </div>

            <ProductModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}
