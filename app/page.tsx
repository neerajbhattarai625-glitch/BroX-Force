"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useShop } from "@/lib/context/ShopContext";
import { ArrowRight, ShoppingBag } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

import Price from "@/components/Price";

export default function Home() {
  const { products, addToCart, theme } = useShop();
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const els = heroRef.current.querySelectorAll("[data-hero]");
    gsap.fromTo(els, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.16, ease: "power3.out" });
  }, []);

  useEffect(() => {
    if (!cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll("[data-card]");
    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none none" },
          delay: i * 0.08
        }
      );
    });
  }, [products]);

  const heroBg = theme.hero || "https://images.unsplash.com/photo-1620806497334-927918a096c4?auto=format&fit=crop&q=80&w=2000";

  return (
    <div style={theme.body ? { backgroundImage: `url('${theme.body}')`, backgroundSize: "cover", backgroundAttachment: "fixed" } : {}}>

      {/* ─── HERO ──────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundImage: `url('${heroBg}')`, backgroundAttachment: "fixed", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/65 via-black/40 to-[var(--bg)]" />

        <div ref={heroRef} className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <div data-hero className="inline-flex items-center gap-3 mb-10 opacity-0">
            <span className="h-px w-8 bg-[var(--gold-hero)]" />
            <span className="text-[10px] tracking-[0.35em] uppercase text-[var(--gold-hero)] font-semibold">Premium Streetwear · Est. 2024</span>
            <span className="h-px w-8 bg-[var(--gold-hero)]" />
          </div>

          <h1 data-hero className="font-heading text-[14vw] sm:text-[11vw] md:text-[9rem] leading-none tracking-tight text-[var(--fg)] opacity-0">
            BroX<span className="italic text-[var(--gold-hero)]"> Force</span>
          </h1>

          <p data-hero className="mt-8 text-base text-[var(--muted)] font-light max-w-sm mx-auto leading-relaxed opacity-0">
            Wear the vibe. Own the identity.
          </p>

          <div data-hero className="mt-12 flex justify-center gap-6 flex-wrap opacity-0">
            <Link href="/shop" className="bg-[var(--gold)] text-black px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors duration-300">
              Explore Collection
            </Link>
            <Link href="/about" className="border border-[var(--border)] text-[var(--fg)] px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors duration-300">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURED ──────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--gold)] font-semibold mb-3">New Arrivals</p>
              <h2 className="font-heading text-5xl md:text-6xl text-[var(--fg)]">Latest Drops</h2>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--fg)] transition-colors group">
              All Products <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {products.slice(0, 3).map(product => {
              const isOutOfStock = product.stock <= 0 || product.status === "Out of Stock";
              return (
                <div key={product.id} data-card className="group opacity-0">
                  <div className="relative aspect-[3/4] overflow-hidden user-frosted mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.imageUrl} alt={product.title} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? "opacity-40 grayscale" : ""}`} />

                    {/* Hover Overlay */}
                    {!isOutOfStock && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100">
                        <button onClick={() => addToCart(product)} className="bg-[var(--gold)] text-black text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-2.5 hover:bg-white transition-colors flex items-center gap-2">
                          <ShoppingBag className="w-3 h-3" /> Add to Cart
                        </button>
                      </div>
                    )}

                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-red-400 font-bold uppercase tracking-[0.3em] text-[10px] border border-red-400/30 px-4 py-2 bg-black/40 backdrop-blur-sm">Sold Out</span>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-[9px] font-bold uppercase tracking-widest text-[var(--gold)] px-3 py-1 border border-[var(--gold)]/20">
                      {product.category}
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-heading text-xl text-[var(--fg)] group-hover:text-[var(--gold)] transition-colors">{product.title}</h3>
                    <span className="font-mono text-sm text-[var(--gold)]">
                      <Price amount={product.price} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── BRAND PHILOSOPHY ──────────────── */}
      <section className="py-28 px-6 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--gold)] font-semibold mb-6">Our Vision</p>
            <h2 className="font-heading text-4xl md:text-5xl text-[var(--fg)] leading-tight mb-8">
              Not just clothing.<br />A <span className="italic text-[var(--gold)]">statement.</span>
            </h2>
            <Link href="/about" className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--gold)] transition-colors inline-flex items-center gap-2 group">
              Read Our Story <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <blockquote className="border-l-2 border-[var(--gold)] pl-8 py-4">
            <p className="font-heading text-2xl italic text-[var(--fg)] leading-relaxed">
              "BroX Force empowers self-expression, celebrates uniqueness, and delivers streetwear that's not just clothing — but an identity."
            </p>
            <footer className="mt-6 text-[10px] tracking-[0.25em] uppercase text-[var(--muted)]">— Neeraj & Abisheak, Founders</footer>
          </blockquote>
        </div>
      </section>
    </div>
  );
}
