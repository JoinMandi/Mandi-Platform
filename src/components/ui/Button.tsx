"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-terra text-cream hover:bg-terra-dark border border-terra shadow-warm",
  secondary:
    "bg-cream text-terra border-2 border-terra hover:bg-terra hover:text-cream",
  ghost:
    "bg-transparent text-terra border-2 border-transparent hover:underline underline-offset-4",
  inverse:
    "bg-cream text-brown border-2 border-cream hover:bg-golden hover:border-golden",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-base sm:text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-semibold
        transition-colors duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        focus:outline-none focus-visible:ring-2 focus-visible:ring-terra focus-visible:ring-offset-2
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
