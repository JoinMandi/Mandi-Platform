import localFont from "next/font/local";

const grandstander = localFont({
  src: "../../../public/fonts/Grandstander-latin.woff2",
  weight: "700 800",
  variable: "--font-grandstander",
  display: "swap",
});

export default function V4Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${grandstander.variable} min-h-screen bg-cream font-sans text-brown`}>
      {children}
    </div>
  );
}
