"use client";

import Link from "next/link";

interface SegmentChipProps {
  label: string;
  count: number;
  /** Where to route on click — typically a filtered user list. */
  href?: string;
  /** Visual accent — maps to a palette token. */
  accent?: "terra" | "golden" | "coral" | "pink" | "sun" | "brown" | "cream";
  active?: boolean;
}

const ACCENT_BG: Record<NonNullable<SegmentChipProps["accent"]>, string> = {
  terra: "bg-terra/10 border-terra/30 text-terra hover:bg-terra/20",
  golden: "bg-golden/20 border-golden/40 text-brown hover:bg-golden/30",
  coral: "bg-coral/15 border-coral/30 text-terra hover:bg-coral/25",
  pink: "bg-pink-mandi/15 border-pink-mandi/30 text-pink-mandi hover:bg-pink-mandi/25",
  sun: "bg-sun/15 border-sun/30 text-terra hover:bg-sun/25",
  brown: "bg-brown/10 border-brown/20 text-brown hover:bg-brown/15",
  cream: "bg-cream-deep/40 border-cream-deep text-brown hover:bg-cream-deep/60",
};

export default function SegmentChip({
  label,
  count,
  href,
  accent = "cream",
  active = false,
}: SegmentChipProps) {
  const classes = `inline-flex items-baseline gap-2 rounded-full border-2 px-4 py-1.5
    text-sm font-semibold transition-all hover:-translate-y-0.5
    ${active ? "ring-2 ring-terra" : ""}
    ${ACCENT_BG[accent]}`;
  const body = (
    <>
      <span>{label}</span>
      <span className="text-xs opacity-75 font-bold">{count}</span>
    </>
  );
  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <span className={classes}>{body}</span>
  );
}
