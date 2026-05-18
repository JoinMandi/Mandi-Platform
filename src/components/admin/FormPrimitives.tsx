"use client";

import React from "react";

export const inputClass =
  "w-full bg-cream border-2 border-cream-deep focus:border-terra rounded-xl px-3.5 py-2.5 text-sm text-brown";

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

export function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "col-span-2" : ""}`}>
      <span className="text-[11px] uppercase tracking-[0.18em] text-brown/55 font-semibold">{label}</span>
      {children}
    </label>
  );
}

export function TagPicker({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (t: string) => {
    onChange(selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t]);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((t) => {
        const on = selected.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
              ${on
                ? "bg-terra text-cream border-terra"
                : "bg-transparent border-cream-deep text-brown/70 hover:border-terra"}`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
