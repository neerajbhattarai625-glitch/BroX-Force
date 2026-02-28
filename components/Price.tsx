"use client";

import { useState } from "react";
import { useShop } from "@/lib/context/ShopContext";
import { motion, AnimatePresence } from "framer-motion";

interface PriceProps {
    amount: string | number;
    className?: string;
    currency?: "NPR" | "USD";
}

export default function Price({ amount, className = "", currency }: PriceProps) {
    const { adminConfig } = useShop();
    const [isHovered, setIsHovered] = useState(false);

    const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

    // Default logic: 
    // If currency prop isn't provided, show NPR by default and USD on hover.
    // If currency prop is provided, show that specifically (e.g. for summaries).

    const npr = numericAmount * (currency === "USD" ? adminConfig.exchangeRate : 1);
    const usd = numericAmount / (currency === "NPR" || !currency ? adminConfig.exchangeRate : 1);

    const formattedNPR = new Intl.NumberFormat("en-NP", {
        style: "currency",
        currency: "NPR",
        minimumFractionDigits: 0,
    }).format(npr).replace("NPR", "Rs.");

    const formattedUSD = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(usd);

    return (
        <div
            className={`relative inline-block cursor-help ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence mode="wait">
                {!isHovered ? (
                    <motion.span
                        key="npr"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap"
                    >
                        {formattedNPR}
                    </motion.span>
                ) : (
                    <motion.span
                        key="usd"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="text-[var(--gold)] whitespace-nowrap"
                    >
                        {formattedUSD}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}
