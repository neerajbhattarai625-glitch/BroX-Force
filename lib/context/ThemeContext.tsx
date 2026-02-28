"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light";

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        // Read theme from document attribute (set by blocking script in layout.tsx)
        const currentTheme = document.documentElement.getAttribute("data-theme") as Theme | null;
        if (currentTheme) {
            setTheme(currentTheme);
        } else {
            // Fallback to localStorage or preference if script failed
            const stored = localStorage.getItem("brox_ui_theme") as Theme | null;
            const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
            const initial = stored || preferred;
            setTheme(initial);
            document.documentElement.setAttribute("data-theme", initial);
        }
    }, []);

    const toggleTheme = () => {
        setTheme(prev => {
            const next = prev === "dark" ? "light" : "dark";
            localStorage.setItem("brox_ui_theme", next);
            document.documentElement.setAttribute("data-theme", next);
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be within ThemeProvider");
    return ctx;
}
