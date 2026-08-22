import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import PageView from "@/components/PageView";

// Self-hosted, subsetted woff2 at build time (replaces the 688 KB variable TTF).
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Mandi — Your Menopause Companion",
  description:
    "A warm, multilingual South African women's health platform for menopause. Your health journey home starts here.",
  keywords: ["menopause", "women's health", "South Africa", "HRT", "perimenopause"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="antialiased bg-cream text-brown min-h-screen font-sans">
        <I18nProvider>
          <PageView />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
