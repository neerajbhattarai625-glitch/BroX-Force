"use client";

import { useEffect } from "react";

export default function SourceProtection() {
    useEffect(() => {
        if (process.env.NODE_ENV === "development") return;

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable F12
            if (e.key === "F12") {
                e.preventDefault();
            }
            // Disable Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) {
                e.preventDefault();
            }
            // Disable Ctrl+U (View Source)
            if (e.ctrlKey && e.key === "u") {
                e.preventDefault();
            }
            // Disable Cmd+Opt+I (Mac)
            if (e.metaKey && e.altKey && e.key === "i") {
                e.preventDefault();
            }
        };

        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return null;
}
