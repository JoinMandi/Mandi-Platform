import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:       "#FDF6EC",
        "cream-soft":"#FFFCF6",
        "cream-deep":"#EADFD1",
        golden:      "#F2C14E",
        sun:         "#F5A623",
        coral:       "#F07B54",
        flame:       "#E8632A",
        "pink-mandi":"#E66C84",
        terra:       "#C94A2B",
        "terra-dark":"#A83A20",
        brown:       "#2C1810",
        "brown-deep":"#4A2A23",
      },
      fontFamily: {
        sans:    ["var(--font-montserrat)", "Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Carmos", "var(--font-montserrat)", "ui-serif", "serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 6vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "display":    ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.1" }],
      },
      boxShadow: {
        warm:    "0 4px 24px rgba(201, 74, 43, 0.08)",
        "warm-lg":"0 12px 40px rgba(201, 74, 43, 0.14)",
        "warm-xl":"0 24px 60px rgba(44, 24, 16, 0.22)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      keyframes: {
        pulseWarm: {
          "0%, 100%": { opacity: "0.7" },
          "50%":      { opacity: "1" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%":      { transform: "translateY(-12px) translateX(8px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        stitchIn: {
          "0%":   { opacity: "0", transform: "scale(0.55) rotate(-8deg)" },
          "60%":  { opacity: "1", transform: "scale(1.08) rotate(2deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        riseIn: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        bloom: {
          "0%":   { opacity: "0", transform: "scale(0.3) translateY(0)" },
          "30%":  { opacity: "0.9" },
          "100%": { opacity: "0", transform: "scale(1.6) translateY(-60px)" },
        },
        patchShimmer: {
          "0%, 100%": { filter: "brightness(1)", transform: "scale(1)" },
          "50%":      { filter: "brightness(1.18)", transform: "scale(1.04)" },
        },
      },
      animation: {
        "pulse-warm": "pulseWarm 2s ease-in-out infinite",
        drift:        "drift 8s ease-in-out infinite",
        shimmer:      "shimmer 3s linear infinite",
        "stitch-in":  "stitchIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "rise-in":    "riseIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in":    "fadeIn 0.4s ease-out both",
        bloom:        "bloom 2.4s ease-out forwards",
        "patch-shimmer": "patchShimmer 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
