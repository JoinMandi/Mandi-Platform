import type { Metadata } from "next";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";

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
    <html lang="en">
      <body className="antialiased bg-cream text-brown min-h-screen font-sans">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
