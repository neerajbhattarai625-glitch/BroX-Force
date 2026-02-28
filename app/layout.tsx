import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShopProvider } from "@/lib/context/ShopContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import SourceProtection from "@/components/SourceProtection";

export const metadata: Metadata = {
  title: "BroX | Premium Techwear & Streetwear",
  description: "Wear the Vibe, Own the Identity. BroX premium modern streetwear.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('brox_ui_theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (!theme && supportDarkMode) theme = 'dark';
                  if (!theme) theme = 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="antialiased min-h-screen flex flex-col transition-colors duration-300 selection:bg-[var(--gold)] selection:text-black"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <ShopProvider>
            <LenisProvider>
              <SourceProtection />
              <Navbar />
              <main className="flex-grow pt-20">
                {children}
              </main>
              <Footer />
            </LenisProvider>
          </ShopProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
